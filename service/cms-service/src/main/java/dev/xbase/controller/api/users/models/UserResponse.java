package dev.xbase.controller.api.users.models;

public record UserResponse (Integer userId,
        String avatar,
        String code,
        String username,
        String firstName,
        String lastName,
        String email,
        String roles,
        String status,
        String lastConnect,
        String createdAt){
}
