package org.web.rentals.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.web.common.enums.DeviceStatus;

@Getter
@Setter
public class DeviceRequest {

    @NotNull(message = "Product ID is required")
    private Long productId;

    @NotBlank(message = "Serial number is required")
    private String serialNumber;

    private DeviceStatus status;

    private String conditionDetails;
}
