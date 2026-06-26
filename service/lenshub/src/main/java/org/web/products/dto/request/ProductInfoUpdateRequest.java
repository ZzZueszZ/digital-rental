package org.web.products.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductInfoUpdateRequest {

    private String name;

    private String description;
    
    private String brand;
    
    private List<ProductSpecificationDto> specifications;
    
    private Long categoryId;

    private UUID mainImageAssetId;
}
