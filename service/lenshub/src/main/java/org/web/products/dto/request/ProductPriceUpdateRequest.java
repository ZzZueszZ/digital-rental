package org.web.products.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductPriceUpdateRequest {

    private BigDecimal rentPricePerDay;
    
    private BigDecimal salePrice;
    
    private Boolean isForRent;
    
    private Boolean isForSale;
}
