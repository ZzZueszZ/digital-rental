package org.web.rentals.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
public class PrepareRentalRequest {

    // Map of RentalOrderItem ID to assigned Device ID
    @NotNull(message = "Device assignments map is required")
    private Map<Long, Long> itemDeviceAssignments;
}
