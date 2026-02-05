package dev.xbase.controller.api.auth;

import dev.xbase.configurations.security.UserAuthentication;
import dev.xbase.controller.api.auth.model.JwtResponse;
import dev.xbase.controller.api.auth.model.LoginRequest;
import dev.xbase.controller.api.auth.model.TokenRefreshRequest;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RestController;
import dev.xbase.core.configurations.controller.exceptions.UnauthorizedException;
import dev.xbase.domain.JwtToken;
import dev.xbase.domain.users.UserId;
import dev.xbase.services.auth.TokenAuthenticationUseCaseService;
import dev.xbase.services.users.UserUseCaseService;

import java.util.Optional;

@RestController
@RequiredArgsConstructor
public class AuthController implements AuthAPI {
    @NonNull
    final UserUseCaseService userUseCaseService;
    @NonNull
    final TokenAuthenticationUseCaseService tokenAuthenticationUseCaseService;

    @Override
    public JwtResponse auth(LoginRequest loginRequest) {
        Optional<UserAuthentication> userOptional = tokenAuthenticationUseCaseService.login(loginRequest.userName(), loginRequest.password());
        if (userOptional.isEmpty()) {
            throw new UnauthorizedException();
        }
        return JwtResponse.of(userUseCaseService.auth(new UserId(userOptional.get()
                .user()
                .userId())));
    }

    @Override
    public JwtResponse refreshToken(TokenRefreshRequest request) {
        String requestRefreshToken = request.refreshToken();
        Integer userId = tokenAuthenticationUseCaseService.findRefreshToken(requestRefreshToken);
        JwtToken jwtToken = userUseCaseService.auth(new UserId(userId));
        return JwtResponse.of(jwtToken);
    }
}
