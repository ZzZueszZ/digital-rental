package org.web.products.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductInfoUpdateRequest {

    @NotBlank(message = "Product name cannot be empty")
    private String name;

    private String description;
    
    private String brand;
    
    private List<ProductSpecificationDto> specifications;
    
    private Long categoryId;
}
