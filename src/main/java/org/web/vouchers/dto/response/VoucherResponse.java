package org.web.vouchers.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.web.common.enums.VoucherScope;
import org.web.common.enums.VoucherStatus;
import org.web.common.enums.VoucherType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VoucherResponse {
    private Long id;
    private String code;
    private String name;
    private String description;
    private VoucherType type;
    private VoucherScope scope;
    private BigDecimal discountValue;
    private BigDecimal maxDiscountAmount;
    private BigDecimal minOrderValue;
    private Integer maxUsagePerUser;
    private Integer maxUsage;
    private Integer usedCount;
    private VoucherStatus status;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
}
