package org.web.orders.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.web.common.enums.PaymentMethod;

import java.util.List;

@Getter
@Setter
public class CheckoutRequest {

    @NotEmpty(message = "Items list cannot be empty")
    @Valid
    private List<CheckoutItemRequest> items;

    private String shippingName;
    private String shippingPhone;
    private String shippingAddress;

    private Long shippingAddressId;

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;

    private String voucherCode;
}
