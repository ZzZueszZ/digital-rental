package org.web.rentals.dto.response;

import lombok.*;
import org.web.common.enums.DeviceStatus;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeviceResponse {
    private Long id;
    private Long productId;
    private String productName;
    private String serialNumber;
    private DeviceStatus status;
    private String conditionDetails;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
