package org.web.users.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.web.common.enums.AccountStatus;
import org.web.common.enums.KycStatus;
import org.web.common.enums.TrustLevel;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {
    private Long id;
    private String email;
    private String phone;
    private AccountStatus accountStatus;
    private KycStatus kycStatus;
    private TrustLevel trustLevel;
    private boolean emailVerified;
    private boolean phoneVerified;
    private boolean enabled;
    private boolean accountNonLocked;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Set<String> roles; // We map the Role codes here for simplicity
}
