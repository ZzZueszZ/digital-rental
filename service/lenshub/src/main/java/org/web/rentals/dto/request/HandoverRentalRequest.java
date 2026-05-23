package org.web.rentals.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
public class HandoverRentalRequest {

    @NotBlank(message = "Inspector name is required")
    private String inspectorName;

    // Map of RentalOrderItem ID to initial condition notes
    private Map<Long, String> itemConditions;
}
