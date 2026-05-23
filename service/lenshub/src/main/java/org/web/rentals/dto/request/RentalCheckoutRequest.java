package org.web.rentals.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.web.common.enums.PaymentMethod;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class RentalCheckoutRequest {

    @NotEmpty(message = "Items list cannot be empty")
    @Valid
    private List<RentalCheckoutItemRequest> items;

    @NotNull(message = "Start date is required")
    private LocalDateTime startDate;

    @NotNull(message = "End date is required")
    private LocalDateTime endDate;

    private String shippingName;
    private String shippingPhone;
    private String shippingAddress;

    private Long shippingAddressId;

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;
}
