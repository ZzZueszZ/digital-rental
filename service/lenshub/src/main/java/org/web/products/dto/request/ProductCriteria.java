package org.web.products.dto.request;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductCriteria {
    private String name;
    private List<String> categories; // IDs or Codes
    private String brand;
    
    private BigDecimal minRentPrice;
    private BigDecimal maxRentPrice;
    
    private BigDecimal minSalePrice;
    private BigDecimal maxSalePrice;
    
    private Boolean isForRent;
    private Boolean isForSale;
    private Boolean isActive;
}
