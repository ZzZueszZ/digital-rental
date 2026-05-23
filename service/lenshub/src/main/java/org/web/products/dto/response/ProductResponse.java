package org.web.products.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {
    private Long id;
    private String name;
    private String description;
    
    private BigDecimal rentPricePerDay;
    private BigDecimal salePrice;
    
    private boolean isForRent;
    private boolean isForSale;
    
    private String mainImageUrl;
    private String brand;
    private List<ProductSpecificationResponse> specifications;
    
    private int quantity;
    private int rentalQuantity;
    private boolean isActive;
    
    private Long categoryId;
    private String categoryName;
    
    private List<GalleryImageResponse> gallery;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
