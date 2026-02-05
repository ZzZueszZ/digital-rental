package dev.xbase.controller.api.logout;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/api/logout")
@RequiredArgsConstructor
public class LogoutController {

    @PostMapping
    void logout() {

    }
}
