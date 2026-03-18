package org.web.users.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.web.common.dto.ApiResponse;
import org.web.users.dto.response.UserAuditLogResponse;
import org.web.users.service.UserAuditLogService;

@RestController
@RequestMapping("/users/audit-logs")
@RequiredArgsConstructor
public class UserAuditLogController {

    private final UserAuditLogService userAuditLogService;

    @GetMapping
    @PreAuthorize("hasAuthority('USER_READ')") // Admin only
    public ResponseEntity<ApiResponse<Page<UserAuditLogResponse>>> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Page<UserAuditLogResponse> logs = userAuditLogService.getAllAuditLogs(page, size);
        return ResponseEntity.ok(ApiResponse.successfulResponse("Audit logs retrieved successfully", logs));
    }
}
