package org.web.carts.dto.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class RemoveCartItemsRequest {

    @NotEmpty(message = "Cart item IDs cannot be empty")
    private List<Long> cartItemIds;
}
