package org.web.vouchers.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VoucherApplyResponse {

    private boolean valid;
    
    private String message;
    
    private BigDecimal cartTotal;
    
    private BigDecimal discountAmount;
    
    private BigDecimal finalPayable;
}
