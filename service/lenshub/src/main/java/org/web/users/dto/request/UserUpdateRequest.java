package org.web.users.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.web.common.enums.AccountStatus;
import org.web.common.enums.KycStatus;
import org.web.common.enums.RoleName;
import org.web.common.enums.TrustLevel;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserUpdateRequest {
    private String phone;
    private AccountStatus accountStatus;
    private KycStatus kycStatus;
    private TrustLevel trustLevel;
    private Boolean enabled;
    private Boolean accountNonLocked;
    private Set<RoleName> roles;
}
