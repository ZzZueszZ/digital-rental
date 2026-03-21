package org.web.authentication.service.impl;

import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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
import org.web.users.model.User;
import org.web.users.model.UserProfile;
import org.web.users.repository.UserRepository;
import org.web.users.repository.UserProfileRepository;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HashSet;
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

    @Value("${app.activation.base-url:http://localhost:3000/activate}")
    private String activationBaseUrl;

    @Override
    @Transactional
    public LoginResponse login(LoginRequest loginRequest) {
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new ApplicationException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPasswordHash())) {
            throw new ApplicationException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        if (user.getAccountStatus() == AccountStatus.PENDING) {
            throw new ApplicationException(HttpStatus.UNAUTHORIZED, "Please verify your email to activate account");
        }
        if (user.getAccountStatus() == AccountStatus.BANNED) {
            throw new ApplicationException(HttpStatus.UNAUTHORIZED, "Account is banned");
        }
        if (user.getAccountStatus() != AccountStatus.ACTIVE) {
            throw new ApplicationException(HttpStatus.UNAUTHORIZED, "Account is not active");
        }

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
