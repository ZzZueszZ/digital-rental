package org.web.rentals.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.Map;

@Getter
@Setter
public class ReturnRentalRequest {

    @NotBlank(message = "Inspector name is required")
    private String inspectorName;

    // Map of RentalOrderItem ID to return condition notes
    private Map<Long, String> itemConditions;

    private BigDecimal damageFee;
}
