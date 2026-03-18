package org.web.users.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserAuditLogResponse {
    private Long id;
    private Long userId;
    private String userEmail;
    private String action;
    private String actorEmail;
    private String detail;
    private LocalDateTime createdAt;
}
