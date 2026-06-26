package org.web.products.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductRequest {

    @NotBlank(message = "Product name cannot be empty")
    private String name;

    private String description;
    
    private BigDecimal rentPricePerDay;
    private BigDecimal salePrice;
    
    private Boolean isForRent;
    private Boolean isForSale;
    
    private String brand;
    
    @Setter(AccessLevel.NONE)
    private java.util.List<ProductSpecificationDto> specifications;

    private Long categoryId;

    private UUID mainImageAssetId;

    // This method handles the JSON string sent as "specificationsData" from the frontend
    public void setSpecificationsData(String json) {
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            this.specifications = mapper.readValue(json, 
                new com.fasterxml.jackson.core.type.TypeReference<java.util.List<ProductSpecificationDto>>() {});
        } catch (Exception e) {
            this.specifications = new java.util.ArrayList<>();
        }
    }
}
