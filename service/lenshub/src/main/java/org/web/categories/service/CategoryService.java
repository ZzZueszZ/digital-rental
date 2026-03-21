package org.web.categories.service;

import org.springframework.data.domain.Page;
import org.web.categories.dto.request.CategoryCreateRequest;
import org.web.categories.dto.request.CategoryUpdateRequest;
import org.web.categories.dto.response.CategoryResponse;

public interface CategoryService {
    Page<CategoryResponse> list(int page, int size, boolean activeOnly, String keyword);
    CategoryResponse getById(Long id);
    CategoryResponse create(CategoryCreateRequest request);
    CategoryResponse update(Long id, CategoryUpdateRequest request);
    Page<CategoryResponse> listDeleted(int page, int size);
    void restore(Long id);
    void delete(Long id);
}
