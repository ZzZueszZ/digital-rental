package org.web.products.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.math.BigDecimal;

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
    private java.util.List<ProductSpecificationDto> specifications;
    
    private Integer quantity;
    private Long categoryId;
}
