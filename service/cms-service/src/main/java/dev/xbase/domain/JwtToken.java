package dev.xbase.domain;

public record JwtToken(String accessToken,
                       String refreshToken,
                       Integer userId,
                       String userName,
                       String email
) {
}
