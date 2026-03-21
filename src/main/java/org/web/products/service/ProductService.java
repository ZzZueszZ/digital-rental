package org.web.products.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;
import org.web.products.dto.request.ProductCriteria;
import org.web.products.dto.request.ProductRequest;
import org.web.products.dto.response.GalleryImageResponse;
import org.web.products.dto.response.PriceHistoryResponse;
import org.web.products.dto.response.ProductResponse;

import java.util.List;

public interface ProductService {

    Page<ProductResponse> search(ProductCriteria criteria, Pageable pageable);

    ProductResponse getById(Long id);

    ProductResponse create(ProductRequest request, MultipartFile image);

    ProductResponse update(Long id, ProductRequest request, MultipartFile image);

    void softDelete(Long id);

    void restore(Long id);

    void hardDelete(Long id);

    // Gallery
    List<GalleryImageResponse> addGallery(Long productId, List<MultipartFile> images);
    
    void deleteGalleryImage(Long productId, Long imageId);

    // Pricing
    List<PriceHistoryResponse> getPriceHistory(Long productId);
}
