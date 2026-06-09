package org.web.rentals.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.web.common.enums.DeviceStatus;

@Getter
@Setter
public class DeviceStatusRequest {

    @NotNull(message = "Trạng thái thiết bị không được để trống")
    private DeviceStatus status;

    private String conditionDetails;
}
