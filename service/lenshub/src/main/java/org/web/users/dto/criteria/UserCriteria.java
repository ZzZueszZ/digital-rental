package org.web.users.dto.criteria;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.web.common.enums.AccountStatus;
import org.web.common.enums.KycStatus;
import org.web.common.enums.RoleName;
import org.web.common.enums.TrustLevel;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserCriteria {
    private String keyword; // For searching across text fields like email/phone
    private String email;
    private String phone;
    private AccountStatus accountStatus;
    private KycStatus kycStatus;
    private TrustLevel trustLevel;
    private RoleName role; // E.g., filtering for only CUSTOMERs
}
