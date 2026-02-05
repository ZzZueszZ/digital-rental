package dev.xbase.controller.api.auth.model;

import dev.xbase.domain.JwtToken;

import java.util.List;

public record JwtResponse(
        String accessToken,
        String refreshToken,
        String id,
        String userName,
        String email,
        List<String> roles
) {
    public static JwtResponse of(JwtToken jwtToken) {
        return new JwtResponse(jwtToken.accessToken(),
                jwtToken.refreshToken(),
                jwtToken.userId().toString(),
                jwtToken.userName(),
                jwtToken.email(),
                List.of());
    }
}
