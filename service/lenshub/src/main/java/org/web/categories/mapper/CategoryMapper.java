package org.web.categories.mapper;

import org.springframework.stereotype.Component;
import org.web.categories.dto.request.CategoryCreateRequest;
import org.web.categories.dto.request.CategoryUpdateRequest;
import org.web.categories.dto.response.CategoryResponse;
import org.web.categories.model.Category;

@Component
public class CategoryMapper {

    public Category toEntity(CategoryCreateRequest request) {
        return Category.builder()
                .code(request.getCode().toUpperCase().trim())
                .name(request.getName().trim())
                .description(request.getDescription())
                .isActive(true)
                .build();
    }

    public CategoryResponse toResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .code(category.getCode())
                .name(category.getName())
                .description(category.getDescription())
                .isActive(category.getIsActive())
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .build();
    }

    public void applyUpdate(Category category, CategoryUpdateRequest request) {
        if (request.getName() != null) {
            category.setName(request.getName().trim());
        }
        if (request.getDescription() != null) {
            category.setDescription(request.getDescription());
        }
        if (request.getIsActive() != null) {
            category.setIsActive(request.getIsActive());
        }
    }
}
