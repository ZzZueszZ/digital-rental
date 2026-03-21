package org.web.orders.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.web.common.enums.OrderStatus;

@Getter
@Setter
public class UpdateOrderStatusRequest {

    @NotNull(message = "Status cannot be null")
    private OrderStatus status;
}
