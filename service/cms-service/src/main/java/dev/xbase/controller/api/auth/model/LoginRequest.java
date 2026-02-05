package dev.xbase.controller.api.auth.model;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record LoginRequest(
        @NotNull(message = "error.userName.notNull")
        @Size(min = 3, max = 256, message = "error.userName.size")
        String userName,
        @NotNull(message = "error.password.notNull")
        @Size(min = 3, max = 100, message = "error.password.size")
        String password) {

}
