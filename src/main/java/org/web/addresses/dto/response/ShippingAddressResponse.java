package org.web.addresses.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShippingAddressResponse {
    private Long id;
    private String receiverName;
    private String receiverPhone;
    private String fullAddress;
    private String province;
    private String district;
    private String ward;
    private String detailAddress;
    private boolean isDefault;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
