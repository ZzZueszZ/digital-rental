package org.web.categories.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.web.categories.dto.request.CategoryCreateRequest;
import org.web.categories.dto.request.CategoryUpdateRequest;
import org.web.categories.dto.response.CategoryResponse;
import org.web.categories.service.CategoryService;
import org.web.common.dto.ApiResponse;

import java.util.List;

@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    // PUBLIC: lấy danh sách category (activeOnly=true mặc định cho customer)
    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "true") boolean activeOnly,
            @RequestParam(required = false) String keyword) {

        Page<CategoryResponse> data = categoryService.list(page, size, activeOnly, keyword);
        return ResponseEntity.ok(ApiResponse.successfulPageResponse("Lấy danh sách danh mục thành công", data));
    }

    // PUBLIC: chi tiết 1 category
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> getById(@PathVariable Long id) {
        CategoryResponse data = categoryService.getById(id);
        return ResponseEntity.ok(ApiResponse.successfulResponse("Lấy thông tin danh mục thành công", data));
    }

    // ADMIN: tạo category
    @PostMapping
    @PreAuthorize("hasAuthority('CATEGORY_WRITE')")
    public ResponseEntity<ApiResponse<CategoryResponse>> create(
            @Valid @RequestBody CategoryCreateRequest request) {
        CategoryResponse data = categoryService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.successfulResponse("Tạo danh mục thành công", data));
    }

    // ADMIN: update category
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('CATEGORY_WRITE')")
    public ResponseEntity<ApiResponse<CategoryResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody CategoryUpdateRequest request) {
        CategoryResponse data = categoryService.update(id, request);
        return ResponseEntity.ok(ApiResponse.successfulResponse("Cập nhật danh mục thành công", data));
    }

    // ADMIN: lấy danh sách category đã bị xóa
    @GetMapping("/deleted")
    @PreAuthorize("hasAuthority('CATEGORY_READ')")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> listDeleted(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<CategoryResponse> data = categoryService.listDeleted(page, size);
        return ResponseEntity.ok(ApiResponse.successfulPageResponse("Lấy danh sách danh mục đã xóa thành công", data));
    }

    // ADMIN: khôi phục category
    @PutMapping("/{id}/restore")
    @PreAuthorize("hasAuthority('CATEGORY_WRITE')")
    public ResponseEntity<ApiResponse<Void>> restore(@PathVariable Long id) {
        categoryService.restore(id);
        return ResponseEntity.ok(ApiResponse.successfulResponse("Khôi phục danh mục thành công"));
    }

    // ADMIN: soft delete category
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('CATEGORY_WRITE')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        categoryService.delete(id);
        return ResponseEntity.ok(ApiResponse.successfulResponse("Xóa danh mục thành công"));
    }
}
