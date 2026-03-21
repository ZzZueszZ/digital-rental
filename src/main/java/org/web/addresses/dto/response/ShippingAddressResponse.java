package org.web.addresses.dto.response;

import lombok.*;
import org.web.common.enums.City;
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
    private City province;
    private String provinceDisplayName;
    private String district;
    private String ward;
    private String detailAddress;
    private boolean isDefault;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
