package dev.xbase.domain.users;

import lombok.Builder;

@Builder
public record User(
        Integer userId,
        String email,
        String password,
        String username,
        String firstName,
        String lastName
) {
}
