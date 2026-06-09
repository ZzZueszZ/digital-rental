package org.web.products.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;
import org.web.products.dto.request.ProductCriteria;
import org.web.products.dto.request.ProductInfoUpdateRequest;
import org.web.products.dto.request.ProductPriceUpdateRequest;
import org.web.products.dto.request.ProductRequest;
import org.web.products.dto.response.GalleryImageResponse;
import org.web.products.dto.response.PriceHistoryResponse;
import org.web.products.dto.response.ProductResponse;

import java.util.List;

public interface ProductService {

    Page<ProductResponse> search(ProductCriteria criteria, Pageable pageable);

    ProductResponse getById(Long id);

    ProductResponse create(ProductRequest request, MultipartFile image);

    ProductResponse updateInfo(Long id, ProductInfoUpdateRequest request, MultipartFile image);

    ProductResponse updatePrice(Long id, ProductPriceUpdateRequest request);

    void softDelete(Long id);
    
    Page<ProductResponse> getTrashedProducts(Pageable pageable);

    void restore(Long id);

    void hardDelete(Long id);

    // Gallery
    List<GalleryImageResponse> addGallery(Long productId, List<MultipartFile> images);
    
    void deleteGalleryImage(Long productId, Long imageId);

    // Pricing
    Page<PriceHistoryResponse> getPriceHistory(Long productId, int page, int size);
}
