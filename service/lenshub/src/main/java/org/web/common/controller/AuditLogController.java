package org.web.common.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.web.common.dto.ApiResponse;
import org.web.common.dto.AuditLogResponse;
import org.web.common.service.AuditLogService;

import java.util.List;

@RestController
@RequestMapping("/audit-logs")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping
    @PreAuthorize("hasAuthority('USER_READ')")
    public ResponseEntity<ApiResponse<List<AuditLogResponse>>> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String targetType) {

        Page<AuditLogResponse> logs;
        if (targetType != null && !targetType.isBlank()) {
            logs = auditLogService.getAuditLogsByTargetType(targetType, page, size);
        } else {
            logs = auditLogService.getAllAuditLogs(page, size);
        }

        return ResponseEntity.ok(ApiResponse.successfulPageResponse("Audit logs retrieved successfully", logs));
    }
}
