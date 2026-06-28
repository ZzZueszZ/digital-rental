package org.web.rentals.dto.response;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RentalOrderItemResponse {
    private Long id;
    private Long productId;
    private String productName;
    private String productMainImage;
    private String mainImageUrl;
    private String productMainImageUrl;
    private Long deviceId;
    private String deviceSerialNumber;
    private String deviceConditionDetails;
    private BigDecimal assetValue;
    private BigDecimal pricePerDay;
    private String conditionBeforeHandover;
    private String conditionAfterReturn;
}
