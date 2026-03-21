package org.web.orders.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.web.common.enums.PaymentMethod;

import java.util.List;

@Getter
@Setter
public class CheckoutFromCartRequest {

    private String shippingName;
    private String shippingPhone;
    private String shippingAddress;

    private Long shippingAddressId;

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;

    private List<Long> cartItemIds;

    private String voucherCode;
}
