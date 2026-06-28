package org.web.authentication.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.web.authentication.dto.request.*;
import org.web.authentication.dto.response.IntrospectResponse;
import org.web.authentication.dto.response.LoginResponse;
import org.web.authentication.dto.response.RefreshTokenResponse;
import org.web.authentication.service.AuthService;
import org.web.common.dto.ApiResponse;
import org.web.users.dto.UserResponse;

import java.net.URI;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthService authService;

    @Value("${app.frontend.base-url:https://www.lenshub.shop}")
    private String frontendBaseUrl;

    @PostMapping("/login")
    @ResponseStatus(HttpStatus.OK)
    public ApiResponse<LoginResponse> login(@RequestBody @Valid LoginRequest loginRequest) {
        LoginResponse loginResponse = authService.login(loginRequest);
        return ApiResponse.successfulResponse(
                HttpStatus.OK.value(),
                "Login successfully!",
                loginResponse
        );
    }

    @PostMapping("/google")
    @ResponseStatus(HttpStatus.OK)
    public ApiResponse<LoginResponse> googleLogin(@RequestBody @Valid GoogleAuthRequest request) {
        LoginResponse loginResponse = authService.loginWithGoogle(request);
        return ApiResponse.successfulResponse(
                HttpStatus.OK.value(),
                "Google login successfully!",
                loginResponse
        );
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<UserResponse> register(@RequestBody @Valid RegisterRequest registerRequest) {
        UserResponse userResponse = authService.register(registerRequest);
        return ApiResponse.successfulResponse(
                HttpStatus.CREATED.value(),
                "Register successfully! Please check your email to activate your account.",
                userResponse
        );
    }

    @PostMapping("/introspect")
    @ResponseStatus(HttpStatus.OK)
    public ApiResponse<IntrospectResponse> introspect(
            @RequestBody @Valid IntrospectRequest introspectRequest
    ) {
        IntrospectResponse introspectResponse = authService.introspect(introspectRequest);
        return ApiResponse.successfulResponse(
                HttpStatus.OK.value(),
                "Token introspection successful!",
                introspectResponse
        );
    }

    @PostMapping("/refresh")
    @ResponseStatus(HttpStatus.OK)
    public ApiResponse<RefreshTokenResponse> refresh(
            HttpServletRequest httpRequest,
            @RequestBody(required = false) RefreshTokenRequest request
    ) {
        String refreshToken = null;

        if (request != null && request.getRefreshToken() != null && !request.getRefreshToken().isBlank()) {
            refreshToken = request.getRefreshToken();
        } else if (httpRequest.getCookies() != null) {
            for (jakarta.servlet.http.Cookie cookie : httpRequest.getCookies()) {
                if ("refreshToken".equals(cookie.getName())) {
                    refreshToken = cookie.getValue();
                    break;
                }
            }
        }

        if (refreshToken == null || refreshToken.isBlank()) {
            return ApiResponse.failedResponse(
                    HttpStatus.BAD_REQUEST.value(),
                    "Refresh token not provided"
            );
        }

        RefreshTokenResponse response = authService.refreshToken(new RefreshTokenRequest(refreshToken));
        return ApiResponse.successfulResponse(
                HttpStatus.OK.value(),
                "Token refreshed successfully!",
                response
        );
    }

    @GetMapping("/activate")
    public ResponseEntity<Void> activate(@RequestParam String token) {
        String status = "success";
        try {
            authService.activateAccount(token);
        } catch (RuntimeException exception) {
            status = "failed";
        }

        String base = frontendBaseUrl.endsWith("/")
                ? frontendBaseUrl.substring(0, frontendBaseUrl.length() - 1)
                : frontendBaseUrl;
        URI redirectUri = URI.create(base + "/auth/login?activation=" + status);

        return ResponseEntity.status(HttpStatus.FOUND)
                .header(HttpHeaders.LOCATION, redirectUri.toString())
                .build();
    }

    @PostMapping("/activate/resend")
    @ResponseStatus(HttpStatus.OK)
    public ApiResponse<String> resendActivation(@RequestBody @Valid ResendActivationRequest request) {
        authService.resendActivationEmail(request.getEmail());
        return ApiResponse.successfulResponse(
                HttpStatus.OK.value(),
                "Activation email re-sent successfully!",
                null
        );
    }

    @PostMapping("/change-email")
    @ResponseStatus(HttpStatus.OK)
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<UserResponse> changeEmail(@RequestBody @Valid ChangeEmailRequest request) {
        UserResponse response = authService.changeEmail(request);
        return ApiResponse.successfulResponse(
                HttpStatus.OK.value(),
                "Email updated. Please check the new inbox to activate your account.",
                response
        );
    }

    @PostMapping("/change-password")
    @ResponseStatus(HttpStatus.OK)
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<String> changePassword(@RequestBody @Valid ChangePasswordRequest request) {
        authService.changePassword(request);
        return ApiResponse.successfulResponse(
                HttpStatus.OK.value(),
                "Password changed successfully!",
                null
        );
    }

    @PostMapping("/forgot-password")
    @ResponseStatus(HttpStatus.OK)
    public ApiResponse<String> forgotPassword(@RequestBody @Valid ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ApiResponse.successfulResponse(
                HttpStatus.OK.value(),
                "OTP has been sent to your email.",
                null
        );
    }

    @PostMapping("/reset-password")
    @ResponseStatus(HttpStatus.OK)
    public ApiResponse<String> resetPassword(@RequestBody @Valid ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ApiResponse.successfulResponse(
                HttpStatus.OK.value(),
                "Password has been reset successfully!",
                null
        );
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.OK)
    public ApiResponse<String> logout(
            HttpServletRequest request,
            @RequestBody(required = false) RefreshTokenRequest refreshReq
    ) {
        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            authService.logout(token, refreshReq != null ? refreshReq.getRefreshToken() : null);
        }

        return ApiResponse.successfulResponse(
                HttpStatus.OK.value(),
                "Logout successfully!",
                null
        );
    }
}
