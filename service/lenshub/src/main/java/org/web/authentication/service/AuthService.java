package org.web.authentication.service;

import org.web.authentication.dto.request.*;
import org.web.authentication.dto.response.*;
import org.web.users.dto.UserResponse;

public interface AuthService {
    LoginResponse login(LoginRequest loginRequest);
    LoginResponse loginWithGoogle(GoogleAuthRequest request);
    UserResponse register(RegisterRequest registerRequest);
    IntrospectResponse introspect(IntrospectRequest introspectRequest);
    RefreshTokenResponse refreshToken(RefreshTokenRequest request);
    void logout(String accessToken, String refreshTokenStr);
    UserResponse activateAccount(String token);
    void resendActivationEmail(String email);
    UserResponse changeEmail(ChangeEmailRequest request);
    void changePassword(ChangePasswordRequest request);
    void forgotPassword(ForgotPasswordRequest request);
    void resetPassword(ResetPasswordRequest request);
}
