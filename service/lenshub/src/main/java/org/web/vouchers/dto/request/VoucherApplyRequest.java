package org.web.vouchers.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VoucherApplyRequest {

    @NotBlank(message = "Voucher code is required")
    private String code;

    @NotNull(message = "Cart total cannot be null")
    @DecimalMin(value = "0.0", message = "Cart total cannot be negative")
    private BigDecimal cartTotal;

}
