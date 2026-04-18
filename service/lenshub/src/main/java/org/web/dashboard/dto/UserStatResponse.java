package org.web.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserStatResponse {
    private long totalUsers;
    private long activeUsers;
    private long pendingUsers;
    private long disabledUsers;
    private long newUsersToday;
}
