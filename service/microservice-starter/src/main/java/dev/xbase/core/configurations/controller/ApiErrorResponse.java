package dev.xbase.core.configurations.controller;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(example = """
        {
         "guid": "b05f236e-952c-4bc1-b43a-f484afc2677b",
         "code": "SYS008",
         "message": "SYSTEM_AUTHORIZATION",
         "path": "/api/auth",
         "method": "POST",
         "timestamp": "2023-11-08T11:00:58Z"
        }
        """, requiredMode = Schema.RequiredMode.REQUIRED)
public record ApiErrorResponse(String guid,
                               String code,
                               String message,
                               String path,
                               String method,
                               @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'")
                               LocalDateTime timestamp) {
    public static ApiErrorResponse ofEmpty() {
        return new ApiErrorResponse("",
                "",
                "",
                "",
                "",
                LocalDateTime.MIN);
    }
}