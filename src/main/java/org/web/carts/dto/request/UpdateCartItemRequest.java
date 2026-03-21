package org.web.carts.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateCartItemRequest {

    @NotNull(message = "Quantity cannot be null")
    @Min(value = 0, message = "Quantity cannot be less than 0")
    private Integer quantity;
}
