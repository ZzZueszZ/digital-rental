package dev.xbase.controller.api.auth;

import dev.xbase.controller.api.auth.model.JwtResponse;
import dev.xbase.controller.api.auth.model.LoginRequest;
import dev.xbase.controller.api.auth.model.TokenRefreshRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

@RequestMapping("/pub/authenticate")
public interface AuthAPI {
    @PostMapping
    JwtResponse auth(@Valid @RequestBody LoginRequest loginRequest);

    @PostMapping("/refresh-token")
    JwtResponse refreshToken(@Valid @RequestBody TokenRefreshRequest request);
}
