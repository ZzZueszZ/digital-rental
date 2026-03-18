package org.web.users.service;

import org.springframework.data.domain.Page;
import org.web.users.dto.response.UserAuditLogResponse;
import org.web.users.model.User;

public interface UserAuditLogService {
    Page<UserAuditLogResponse> getAllAuditLogs(int page, int size);
    void logAction(User user, String action, String detail);
}
