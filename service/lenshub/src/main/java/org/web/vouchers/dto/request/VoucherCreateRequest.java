package org.web.vouchers.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.web.common.enums.VoucherScope;
import org.web.common.enums.VoucherType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class VoucherCreateRequest {

    @NotBlank(message = "Voucher code cannot be blank")
    private String code;

    @NotBlank(message = "Voucher name cannot be blank")
    private String name;

    private String description;

    @NotNull(message = "Voucher type cannot be null")
    private VoucherType type;

    private VoucherScope scope = VoucherScope.GLOBAL;

    @NotNull(message = "Discount value cannot be null")
    @DecimalMin(value = "0.0", inclusive = false, message = "Discount value must be greater than 0")
    private BigDecimal discountValue;

    private BigDecimal maxDiscountAmount;

    private BigDecimal minOrderValue;

    private Integer maxUsagePerUser;

    private Integer maxUsage;

    private LocalDateTime startDate;
    
    private LocalDateTime endDate;
}
