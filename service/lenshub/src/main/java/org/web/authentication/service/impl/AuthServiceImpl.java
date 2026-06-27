package org.web.authentication.service.impl;

import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.web.authentication.dto.request.*;
import org.web.authentication.dto.response.*;
import org.web.authentication.model.AppRole;
import org.web.authentication.model.PasswordResetToken;
import org.web.authentication.model.RefreshToken;
import org.web.authentication.repository.AppRoleRepository;
import org.web.authentication.repository.PasswordResetTokenRepository;
import org.web.authentication.repository.RefreshTokenRepository;
import org.web.authentication.service.ActivationTokenProvider;
import org.web.authentication.service.AuthService;
import org.web.common.exceptions.ApplicationException;
import org.web.common.mails.MailService;
import org.web.security.JwtUtil;
import org.web.users.dto.UserResponse;
import org.web.users.mapper.UserMapper;
import org.web.common.enums.AccountStatus;
import org.web.common.enums.AuthProvider;
import org.web.users.model.User;
import org.web.users.model.UserProfile;
import org.web.users.repository.UserRepository;
import org.web.users.repository.UserProfileRepository;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final AppRoleRepository appRoleRepository;
    
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final ActivationTokenProvider activationTokenProvider;
    private final MailService mailService;
    private final UserMapper userMapper;
    private final RestClient restClient = RestClient.create();

    @Value("${app.activation.base-url:https://www.lenshub.shop/activate}")
    private String activationBaseUrl;

    @Value("${app.oauth.google.client-id:}")
    private String googleClientId;

    @Value("${app.oauth.google.client-secret:}")
    private String googleClientSecret;

    @Value("${app.oauth.google.redirect-uri:}")
    private String googleRedirectUri;

    @Override
    @Transactional
    public LoginResponse login(LoginRequest loginRequest) {
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new ApplicationException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPasswordHash())) {
            throw new ApplicationException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        ensureCanLogin(user);
        return issueLoginResponse(user);
    }

    @Override
    @Transactional
    public LoginResponse loginWithGoogle(GoogleAuthRequest request) {
        GoogleUserInfo googleUser = verifyGoogleAuthorizationCode(request);

        User user = userRepository.findByGoogleProviderId(googleUser.sub())
                .or(() -> userRepository.findByEmail(googleUser.email()))
                .map(existing -> linkGoogleAccount(existing, googleUser))
                .orElseGet(() -> createGoogleCustomer(googleUser));

        ensureCanLogin(user);
        return issueLoginResponse(user);
    }

    @Override
    @Transactional
    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ApplicationException(HttpStatus.CONFLICT, "Email is already in use");
        }

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .accountStatus(AccountStatus.PENDING)
                .enabled(true)
                .accountNonLocked(true)
                .roles(new HashSet<>())
                .build();

        AppRole customerRole = appRoleRepository.findByCode("CUSTOMER")
                .orElseThrow(() -> new ApplicationException(HttpStatus.INTERNAL_SERVER_ERROR, "CUSTOMER role not found"));
        user.getRoles().add(customerRole);

        User savedUser = userRepository.save(user);

        userProfileRepository.save(UserProfile.builder()
                .user(savedUser)
                .fullName(request.getFullName())
                .build());

        String activationToken = activationTokenProvider.generate(savedUser);
        mailService.sendActivationEmail(savedUser, buildActivationLink(activationToken));

        return userMapper.toUserResponse(savedUser);
    }

    private String buildActivationLink(String token) {
        String base = activationBaseUrl.endsWith("/")
                ? activationBaseUrl.substring(0, activationBaseUrl.length() - 1)
                : activationBaseUrl;
        return base.contains("?") ? base + "&token=" + token : base + "?token=" + token;
    }

    private LoginResponse issueLoginResponse(User user) {
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        String accessToken = jwtUtil.generateToken(user);
        String refreshToken = UUID.randomUUID().toString();

        RefreshToken rt = RefreshToken.builder()
                .user(user)
                .token(refreshToken)
                .expiresAt(LocalDateTime.now().plusDays(7))
                .build();
        refreshTokenRepository.save(rt);

        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(userMapper.toUserResponse(user))
                .build();
    }

    private void ensureCanLogin(User user) {
        switch (user.getAccountStatus()) {
            case ACTIVE -> {
            }
            case PENDING -> throw new ApplicationException(HttpStatus.UNAUTHORIZED, "Please verify your email to activate account");
            case SUSPENDED -> throw new ApplicationException(HttpStatus.UNAUTHORIZED, "Account is temporarily suspended");
            case BANNED -> throw new ApplicationException(HttpStatus.UNAUTHORIZED, "Account is permanently banned");
            case DISABLED -> throw new ApplicationException(HttpStatus.UNAUTHORIZED, "Account is disabled");
            case DELETED -> throw new ApplicationException(HttpStatus.UNAUTHORIZED, "Account has been deleted");
        }
    }

    private GoogleUserInfo verifyGoogleAuthorizationCode(GoogleAuthRequest request) {
        if (googleClientId == null || googleClientId.isBlank() ||
                googleClientSecret == null || googleClientSecret.isBlank() ||
                googleRedirectUri == null || googleRedirectUri.isBlank()) {
            throw new ApplicationException(HttpStatus.INTERNAL_SERVER_ERROR, "Google OAuth is not configured");
        }
        if (!googleRedirectUri.equals(request.getRedirectUri())) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Google redirect URI is invalid");
        }

        try {
            var form = new LinkedMultiValueMap<String, String>();
            form.add("code", request.getCode());
            form.add("client_id", googleClientId);
            form.add("client_secret", googleClientSecret);
            form.add("redirect_uri", googleRedirectUri);
            form.add("grant_type", "authorization_code");

            @SuppressWarnings("unchecked")
            Map<String, Object> tokenResponse = restClient.post()
                    .uri("https://oauth2.googleapis.com/token")
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(form)
                    .retrieve()
                    .body(Map.class);

            Object idToken = tokenResponse != null ? tokenResponse.get("id_token") : null;
            if (!(idToken instanceof String token) || token.isBlank()) {
                throw new ApplicationException(HttpStatus.UNAUTHORIZED, "Google did not return an ID token");
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> tokenInfo = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .scheme("https")
                            .host("oauth2.googleapis.com")
                            .path("/tokeninfo")
                            .queryParam("id_token", token)
                            .build())
                    .retrieve()
                    .body(Map.class);

            return mapAndValidateGoogleTokenInfo(tokenInfo);
        } catch (ApplicationException ex) {
            throw ex;
        } catch (RestClientException ex) {
            throw new ApplicationException(HttpStatus.UNAUTHORIZED, "Google authentication failed");
        }
    }

    private GoogleUserInfo mapAndValidateGoogleTokenInfo(Map<String, Object> tokenInfo) {
        if (tokenInfo == null || tokenInfo.isEmpty()) {
            throw new ApplicationException(HttpStatus.UNAUTHORIZED, "Invalid Google token");
        }

        String audience = asString(tokenInfo.get("aud"));
        String issuer = asString(tokenInfo.get("iss"));
        String subject = asString(tokenInfo.get("sub"));
        String email = asString(tokenInfo.get("email"));
        String emailVerified = asString(tokenInfo.get("email_verified"));
        String name = asString(tokenInfo.get("name"));
        String picture = asString(tokenInfo.get("picture"));

        if (!googleClientId.equals(audience)) {
            throw new ApplicationException(HttpStatus.UNAUTHORIZED, "Google token audience is invalid");
        }
        if (!"accounts.google.com".equals(issuer) && !"https://accounts.google.com".equals(issuer)) {
            throw new ApplicationException(HttpStatus.UNAUTHORIZED, "Google token issuer is invalid");
        }
        if (subject == null || subject.isBlank() || email == null || email.isBlank()) {
            throw new ApplicationException(HttpStatus.UNAUTHORIZED, "Google token is missing required identity fields");
        }
        if (!"true".equalsIgnoreCase(emailVerified)) {
            throw new ApplicationException(HttpStatus.UNAUTHORIZED, "Google email is not verified");
        }

        return new GoogleUserInfo(subject, email.toLowerCase(), name, picture);
    }

    private User linkGoogleAccount(User user, GoogleUserInfo googleUser) {
        if (user.getGoogleProviderId() != null && !user.getGoogleProviderId().equals(googleUser.sub())) {
            throw new ApplicationException(HttpStatus.CONFLICT, "This email is linked to another Google account");
        }

        user.setGoogleProviderId(googleUser.sub());
        user.setAuthProvider(AuthProvider.GOOGLE);
        user.setEmailVerified(true);
        if (user.getAccountStatus() == AccountStatus.PENDING) {
            user.setAccountStatus(AccountStatus.ACTIVE);
        }

        userProfileRepository.findById(user.getId()).ifPresentOrElse(profile -> {
            if ((profile.getFullName() == null || profile.getFullName().isBlank()) && googleUser.name() != null) {
                profile.setFullName(googleUser.name());
            }
            if ((profile.getAvatarUrl() == null || profile.getAvatarUrl().isBlank()) && googleUser.picture() != null) {
                profile.setAvatarUrl(googleUser.picture());
            }
            userProfileRepository.save(profile);
        }, () -> userProfileRepository.save(UserProfile.builder()
                .user(user)
                .fullName(googleUser.name())
                .avatarUrl(googleUser.picture())
                .build()));

        return userRepository.save(user);
    }

    private User createGoogleCustomer(GoogleUserInfo googleUser) {
        AppRole customerRole = appRoleRepository.findByCode("CUSTOMER")
                .orElseThrow(() -> new ApplicationException(HttpStatus.INTERNAL_SERVER_ERROR, "CUSTOMER role not found"));

        User user = User.builder()
                .email(googleUser.email())
                .passwordHash(passwordEncoder.encode(UUID.randomUUID().toString()))
                .authProvider(AuthProvider.GOOGLE)
                .googleProviderId(googleUser.sub())
                .accountStatus(AccountStatus.ACTIVE)
                .emailVerified(true)
                .enabled(true)
                .accountNonLocked(true)
                .roles(new HashSet<>())
                .build();
        user.getRoles().add(customerRole);

        User savedUser = userRepository.save(user);
        userProfileRepository.save(UserProfile.builder()
                .user(savedUser)
                .fullName(googleUser.name())
                .avatarUrl(googleUser.picture())
                .build());

        return savedUser;
    }

    private String asString(Object value) {
        return value == null ? null : String.valueOf(value);
    }

    private record GoogleUserInfo(String sub, String email, String name, String picture) {
    }

    @Override
    public IntrospectResponse introspect(IntrospectRequest request) {
        boolean valid = jwtUtil.validateToken(request.getToken());
        String email = valid ? jwtUtil.extractUsername(request.getToken()) : null;
        if (!valid) {
            throw new ApplicationException(HttpStatus.UNAUTHORIZED, "Token is invalid or expired");
        }
        return new IntrospectResponse(true, email);
    }

    @Override
    @Transactional
    public RefreshTokenResponse refreshToken(RefreshTokenRequest request) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new ApplicationException(HttpStatus.UNAUTHORIZED, "Invalid refresh token"));

        if (refreshToken.isRevoked() || refreshToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ApplicationException(HttpStatus.UNAUTHORIZED, "Refresh token expired or revoked");
        }

        User user = refreshToken.getUser();
        String newAccessToken = jwtUtil.generateToken(user);
        String newRefreshToken = UUID.randomUUID().toString();

        refreshToken.setRevoked(true);
        refreshToken.setRevokedAt(LocalDateTime.now());
        refreshTokenRepository.save(refreshToken);

        RefreshToken newRt = RefreshToken.builder()
                .user(user)
                .token(newRefreshToken)
                .expiresAt(LocalDateTime.now().plusDays(7))
                .build();
        refreshTokenRepository.save(newRt);

        return RefreshTokenResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .build();
    }

    @Override
    @Transactional
    public void logout(String accessToken, String refreshTokenStr) {
        if (refreshTokenStr != null) {
            refreshTokenRepository.findByToken(refreshTokenStr).ifPresent(rt -> {
                rt.setRevoked(true);
                rt.setRevokedAt(LocalDateTime.now());
                refreshTokenRepository.save(rt);
            });
        }
    }

    @Override
    @Transactional
    public UserResponse activateAccount(String token) {
        if (token == null || token.isEmpty()) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Activation token is required");
        }

        Claims claims;
        try {
            claims = activationTokenProvider.parse(token);
        } catch (Exception e) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Invalid or expired activation token");
        }

        if (!activationTokenProvider.isActivationType(claims)) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Invalid token type");
        }

        Long userId = Long.parseLong(claims.getSubject());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApplicationException(HttpStatus.BAD_REQUEST, "User not found"));

        if (user.getAccountStatus() == AccountStatus.ACTIVE) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Account is already active");
        }

        user.setAccountStatus(AccountStatus.ACTIVE);
        return userMapper.toUserResponse(userRepository.save(user));
    }

    @Override
    public void resendActivationEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "User not found"));

        if (user.getAccountStatus() == AccountStatus.ACTIVE) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Account already activated");
        }

        String token = activationTokenProvider.generate(user);
        mailService.sendActivationEmail(user, buildActivationLink(token));
    }

    @Override
    @Transactional
    public UserResponse changeEmail(ChangeEmailRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new ApplicationException(HttpStatus.UNAUTHORIZED, "Unauthenticated");
        }

        String currentEmail = auth.getName();
        User user = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "User not found"));

        if (userRepository.existsByEmail(request.getNewEmail())) {
            throw new ApplicationException(HttpStatus.CONFLICT, "Email is already in use");
        }

        user.setEmail(request.getNewEmail());
        user.setAccountStatus(AccountStatus.PENDING);
        User saved = userRepository.save(user);

        String token = activationTokenProvider.generate(saved);
        mailService.sendActivationEmail(saved, buildActivationLink(token));
        
        return userMapper.toUserResponse(saved);
    }

    @Override
    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new ApplicationException(HttpStatus.UNAUTHORIZED, "Unauthenticated");
        }

        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Current password is incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "User not found"));

        String otp = String.valueOf(100000 + new SecureRandom().nextInt(900000));
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .user(user)
                .otpCode(otp)
                .expiresAt(LocalDateTime.now().plusMinutes(10))
                .build();
        
        passwordResetTokenRepository.save(resetToken);
        mailService.sendPasswordResetOtp(user, otp);
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "User not found"));

        PasswordResetToken token = passwordResetTokenRepository
                .findTopByUserAndUsedFalseOrderByCreatedAtDesc(user)
                .orElseThrow(() -> new ApplicationException(HttpStatus.BAD_REQUEST, "No active OTP found. Please request a new one."));

        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "OTP expired. Please request a new one.");
        }

        if (!token.getOtpCode().equals(request.getOtpCode())) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "OTP is invalid.");
        }

        token.setUsed(true);
        token.setUsedAt(LocalDateTime.now());
        passwordResetTokenRepository.save(token);

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}
