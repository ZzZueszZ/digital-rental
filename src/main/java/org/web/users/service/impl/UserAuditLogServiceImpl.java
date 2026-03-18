package org.web.users.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.web.users.dto.response.UserAuditLogResponse;
import org.web.users.model.User;
import org.web.users.model.UserAuditLog;
import org.web.users.repository.UserAuditLogRepository;
import org.web.users.service.UserAuditLogService;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserAuditLogServiceImpl implements UserAuditLogService {

    private final UserAuditLogRepository userAuditLogRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<UserAuditLogResponse> getAllAuditLogs(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<UserAuditLog> logs = userAuditLogRepository.findAll(pageable);
        return logs.map(this::mapToResponse);
    }

    @Override
    @Transactional
    public void logAction(User user, String action, String detail) {
        try {
            String actorEmail = getCurrentActorEmail();
            UserAuditLog auditLog = UserAuditLog.builder()
                    .user(user)
                    .action(action)
                    .actorEmail(actorEmail)
                    .detail(detail)
                    .build();
            userAuditLogRepository.save(auditLog);
            log.info("Audit Logged: {} performed {} on target {} ({})", actorEmail, action, user.getId(), user.getEmail());
        } catch (Exception e) {
            log.error("Failed to write audit log for user id: " + user.getId(), e);
            // Non-blocking for the main transaction if we strictly want, 
            // but typical Spring @Transactional will rollback. It is acceptable here.
        }
    }

    private String getCurrentActorEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            return authentication.getName();
        }
        return "system";
    }

    private UserAuditLogResponse mapToResponse(UserAuditLog log) {
        return UserAuditLogResponse.builder()
                .id(log.getId())
                .userId(log.getUser().getId())
                .userEmail(log.getUser().getEmail())
                .action(log.getAction())
                .actorEmail(log.getActorEmail())
                .detail(log.getDetail())
                .createdAt(log.getCreatedAt())
                .build();
    }
}
