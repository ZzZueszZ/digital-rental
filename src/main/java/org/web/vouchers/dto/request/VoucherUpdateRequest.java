package org.web.vouchers.dto.request;

import lombok.Getter;
import lombok.Setter;
import org.web.common.enums.VoucherScope;
import org.web.common.enums.VoucherType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class VoucherUpdateRequest {

    private String name;
    
    private String description;
    
    private VoucherType type;
    
    private VoucherScope scope;
    
    private BigDecimal discountValue;
    
    private BigDecimal maxDiscountAmount;
    
    private BigDecimal minOrderValue;
    
    private Integer maxUsagePerUser;
    
    private Integer maxUsage;
    
    private LocalDateTime startDate;
    
    private LocalDateTime endDate;
}
