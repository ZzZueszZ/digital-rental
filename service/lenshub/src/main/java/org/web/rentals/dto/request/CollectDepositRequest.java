package org.web.rentals.dto.request;

import lombok.Getter;
import lombok.Setter;
import org.web.common.enums.PaymentMethod;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

@Getter
@Setter
public class CollectDepositRequest {

    @NotNull(message = "Amount is required")
    private BigDecimal amount;

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;
}
