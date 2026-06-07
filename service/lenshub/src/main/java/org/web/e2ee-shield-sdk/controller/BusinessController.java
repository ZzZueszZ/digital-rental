package com.shield.spring_server.controller;

import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class BusinessController {

    @PostMapping("/data")
    public Map<String, Object> handleData(@RequestBody Map<String, Object> body) {
        // body ở đây ĐÃ LÀ PLAINTEXT do filter E2EE giải mã
        return Map.of(
                "echo", body,
                "serverTs", System.currentTimeMillis()
        );
    }
}
