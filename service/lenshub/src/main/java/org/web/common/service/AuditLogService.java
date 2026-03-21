package org.web.common.service;

import org.springframework.data.domain.Page;
import org.web.common.dto.AuditLogResponse;

public interface AuditLogService {

    Page<AuditLogResponse> getAllAuditLogs(int page, int size);

    Page<AuditLogResponse> getAuditLogsByTargetType(String targetType, int page, int size);

    void logAction(String targetType, Long targetId, String action, String description,
                   String oldValue, String newValue);
}
