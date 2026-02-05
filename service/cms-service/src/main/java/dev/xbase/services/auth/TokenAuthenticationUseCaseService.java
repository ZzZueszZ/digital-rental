package dev.xbase.services.auth;

import dev.xbase.configurations.security.UserAuthentication;
import dev.xbase.core.starter.security.JWTTokenService;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.NonNull;
import lombok.experimental.FieldDefaults;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtValidationException;
import org.springframework.stereotype.Service;
import dev.xbase.core.configurations.controller.exceptions.TokenRefreshException;

import java.util.Optional;

@Service
@AllArgsConstructor(access = AccessLevel.PACKAGE)
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public final class TokenAuthenticationUseCaseService {
    @NonNull
    UserAuthQueryService userAuthQueryService;
    @NonNull
    PasswordEncoder passwordEncoder;
    @NonNull
    final JWTTokenService jwtTokenService;

    public Optional<UserAuthentication> login(final String username, final String password) {
        return Optional.ofNullable(userAuthQueryService
                        .loadUserByUsername(username))
                .filter(user -> passwordEncoder.matches(password, user.getPassword()));
    }

    public void logout(final UserAuthentication user) {
        // Nothing to doy
    }

    public Integer findRefreshToken(String requestRefreshToken) {
        try {
            Jwt jwt = jwtTokenService.getJwt(requestRefreshToken);
            return Optional.ofNullable(jwt.getSubject())
                    .map(Integer::valueOf)
                    .orElseThrow(TokenRefreshException::new);
        } catch (JwtValidationException ex) {
            throw new TokenRefreshException();
        }
    }
}
