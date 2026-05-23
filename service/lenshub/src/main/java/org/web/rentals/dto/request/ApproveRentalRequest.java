package org.web.rentals.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.Map;

@Getter
@Setter
public class ApproveRentalRequest {

    @NotNull(message = "Deposit amount is required")
    private BigDecimal depositAmount;

    // Map of RentalOrderItem ID to assigned Device ID
    @NotNull(message = "Device assignments map is required")
    private Map<Long, Long> itemDeviceAssignments;
}
