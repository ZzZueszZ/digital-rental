package org.web.categories.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.web.categories.dto.request.CategoryCreateRequest;
import org.web.categories.dto.request.CategoryUpdateRequest;
import org.web.categories.dto.response.CategoryResponse;
import org.web.categories.mapper.CategoryMapper;
import org.web.categories.model.Category;
import org.web.categories.repository.CategoryRepository;
import org.web.categories.service.CategoryService;
import org.web.common.exceptions.ApplicationException;
import org.web.common.service.AuditLogService;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;
    private final AuditLogService auditLogService;

    @Override
    @Transactional(readOnly = true)
    public Page<CategoryResponse> list(int page, int size, boolean activeOnly, String keyword) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "name"));

        Page<Category> pageData;
        if (keyword != null && !keyword.trim().isEmpty()) {
            pageData = categoryRepository.search(keyword.trim(), activeOnly, pageable);
        } else if (activeOnly) {
            pageData = categoryRepository.findAllByIsActiveTrue(pageable);
        } else {
            pageData = categoryRepository.findAll(pageable);
        }

        return pageData.map(categoryMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponse getById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Không tìm thấy danh mục"));
        return categoryMapper.toResponse(category);
    }

    @Override
    @Transactional
    public CategoryResponse create(CategoryCreateRequest request) {
        if (categoryRepository.existsByCode(request.getCode().toUpperCase().trim())) {
            throw new ApplicationException(HttpStatus.CONFLICT, "Mã danh mục đã tồn tại: " + request.getCode());
        }

        Category category = categoryMapper.toEntity(request);
        Category saved = categoryRepository.save(category);

        auditLogService.logAction("CATEGORY", saved.getId(), "CREATE_CATEGORY",
                "Created category: " + saved.getCode() + " - " + saved.getName(),
                null,
                "{\"code\":\"" + saved.getCode() + "\",\"name\":\"" + saved.getName() + "\"}");

        return categoryMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public CategoryResponse update(Long id, CategoryUpdateRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Không tìm thấy danh mục"));

        String oldName = category.getName();
        Boolean oldActive = category.getIsActive();

        categoryMapper.applyUpdate(category, request);
        Category saved = categoryRepository.save(category);

        auditLogService.logAction("CATEGORY", saved.getId(), "UPDATE_CATEGORY",
                "Updated category: " + saved.getCode(),
                "{\"name\":\"" + oldName + "\",\"isActive\":" + oldActive + "}",
                "{\"name\":\"" + saved.getName() + "\",\"isActive\":" + saved.getIsActive() + "}");

        return categoryMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Không tìm thấy danh mục"));

        if (!category.getIsActive()) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Danh mục đã bị vô hiệu hóa");
        }

        category.setIsActive(false);
        categoryRepository.save(category);

        auditLogService.logAction("CATEGORY", category.getId(), "DELETE_CATEGORY",
                "Soft deleted category: " + category.getCode(),
                "{\"isActive\":true}",
                "{\"isActive\":false}");
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CategoryResponse> listDeleted(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "name"));
        return categoryRepository.findAllByIsActiveFalse(pageable).map(categoryMapper::toResponse);
    }

    @Override
    @Transactional
    public void restore(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Không tìm thấy danh mục"));

        if (category.getIsActive()) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Danh mục hiện đang hoạt động");
        }

        category.setIsActive(true);
        categoryRepository.save(category);

        auditLogService.logAction("CATEGORY", category.getId(), "RESTORE_CATEGORY",
                "Restored category: " + category.getCode(),
                "{\"isActive\":false}",
                "{\"isActive\":true}");
    }
}
