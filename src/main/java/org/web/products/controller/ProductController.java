package org.web.products.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.web.common.dto.ApiResponse;
import org.web.products.dto.request.ProductCriteria;
import org.web.products.dto.request.ProductRequest;
import org.web.products.dto.response.GalleryImageResponse;
import org.web.products.dto.response.PriceHistoryResponse;
import org.web.products.dto.response.ProductResponse;
import org.web.products.service.ProductService;

import java.util.List;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    // PUBLIC: Tìm kiếm sản phẩm (Gear Discovery)
    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductResponse>>> search(
            @Valid ProductCriteria criteria,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction
    ) {
        Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Page<ProductResponse> result = productService.search(criteria, PageRequest.of(page, size, sort));
        return ResponseEntity.ok(ApiResponse.successfulPageResponse("Lấy danh sách sản phẩm thành công", result));
    }

    // PUBLIC: Chi tiết sản phẩm
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> getById(@PathVariable Long id) {
        ProductResponse response = productService.getById(id);
        return ResponseEntity.ok(ApiResponse.successfulResponse("Lấy chi tiết sản phẩm thành công", response));
    }

    // ADMIN: Tạo sản phẩm mới
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('PRODUCT_WRITE')")
    public ResponseEntity<ApiResponse<ProductResponse>> create(
            @ModelAttribute @Valid ProductRequest request,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) {
        ProductResponse response = productService.create(request, image);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.successfulResponse(HttpStatus.CREATED.value(), "Tạo sản phẩm thành công", response));
    }

    // ADMIN: Cập nhật thông tin cơ bản sản phẩm
    @PutMapping(value = "/{id}/info", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('PRODUCT_WRITE')")
    public ResponseEntity<ApiResponse<ProductResponse>> updateInfo(
            @PathVariable Long id,
            @ModelAttribute @Valid org.web.products.dto.request.ProductInfoUpdateRequest request,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) {
        ProductResponse response = productService.updateInfo(id, request, image);
        return ResponseEntity.ok(ApiResponse.successfulResponse("Cập nhật thông tin sản phẩm thành công", response));
    }

    // ADMIN: Cập nhật giá sản phẩm
    @PutMapping(value = "/{id}/price", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('PRODUCT_WRITE')")
    public ResponseEntity<ApiResponse<ProductResponse>> updatePrice(
            @PathVariable Long id,
            @ModelAttribute @Valid org.web.products.dto.request.ProductPriceUpdateRequest request
    ) {
        ProductResponse response = productService.updatePrice(id, request);
        return ResponseEntity.ok(ApiResponse.successfulResponse("Cập nhật giá sản phẩm thành công", response));
    }

    // ADMIN: Xóa mềm
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('PRODUCT_WRITE')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        productService.softDelete(id);
        return ResponseEntity.ok(ApiResponse.successfulResponse("Xóa sản phẩm thành công"));
    }

    // ADMIN: Khôi phục
    @PutMapping("/{id}/restore")
    @PreAuthorize("hasAuthority('PRODUCT_WRITE')")
    public ResponseEntity<ApiResponse<Void>> restore(@PathVariable Long id) {
        productService.restore(id);
        return ResponseEntity.ok(ApiResponse.successfulResponse("Khôi phục sản phẩm thành công"));
    }

    // ADMIN: Xóa vĩnh viễn
    @DeleteMapping("/{id}/hard")
    @PreAuthorize("hasAuthority('PRODUCT_WRITE')")
    public ResponseEntity<ApiResponse<Void>> hardDelete(@PathVariable Long id) {
        productService.hardDelete(id);
        return ResponseEntity.ok(ApiResponse.successfulResponse("Xóa vĩnh viễn sản phẩm thành công"));
    }

    // ADMIN: Thêm ảnh vào gallery
    @PostMapping("/{id}/gallery")
    @PreAuthorize("hasAuthority('PRODUCT_WRITE')")
    public ResponseEntity<ApiResponse<List<GalleryImageResponse>>> addGallery(
            @PathVariable Long id,
            @RequestPart("images") List<MultipartFile> images
    ) {
        List<GalleryImageResponse> response = productService.addGallery(id, images);
        return ResponseEntity.ok(ApiResponse.successfulResponse("Thêm ảnh vào bộ sưu tập thành công", response));
    }

    // ADMIN: Xóa ảnh gallery
    @DeleteMapping("/{id}/gallery/{imageId}")
    @PreAuthorize("hasAuthority('PRODUCT_WRITE')")
    public ResponseEntity<ApiResponse<Void>> deleteGalleryImage(
            @PathVariable Long id,
            @PathVariable Long imageId
    ) {
        productService.deleteGalleryImage(id, imageId);
        return ResponseEntity.ok(ApiResponse.successfulResponse("Xóa ảnh thành công"));
    }

    // ADMIN/STAFF: Lấy lịch sử giá
    @GetMapping("/{id}/price-history")
    @PreAuthorize("hasAnyAuthority('PRODUCT_READ', 'PRODUCT_WRITE')")
    public ResponseEntity<ApiResponse<List<PriceHistoryResponse>>> getPriceHistory(@PathVariable Long id) {
        List<PriceHistoryResponse> response = productService.getPriceHistory(id);
        return ResponseEntity.ok(ApiResponse.successfulResponse("Lấy lịch sử giá thành công", response));
    }
}
