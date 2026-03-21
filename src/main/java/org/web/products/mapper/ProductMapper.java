package org.web.products.mapper;

import org.web.products.dto.response.GalleryImageResponse;
import org.web.products.dto.response.ProductResponse;
import org.web.products.model.Product;
import org.web.products.model.ProductImage;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class ProductMapper {

    public static ProductResponse toResponse(Product product) {
        if (product == null) return null;

        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .rentPricePerDay(product.getRentPricePerDay())
                .salePrice(product.getSalePrice())
                .isForRent(product.isForRent())
                .isForSale(product.isForSale())
                .mainImageUrl(product.getMainImageUrl())
                .brand(product.getBrand())
                .specifications(product.getSpecifications())
                .quantity(product.getQuantity())
                .isActive(product.isActive())
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .gallery(toGalleryResponses(product.getGallery()))
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }

    public static List<ProductResponse> toResponses(List<Product> products) {
        if (products == null) return Collections.emptyList();
        return products.stream().map(ProductMapper::toResponse).collect(Collectors.toList());
    }

    public static GalleryImageResponse toGalleryResponse(ProductImage image) {
        if (image == null) return null;
        return GalleryImageResponse.builder()
                .id(image.getId())
                .url(image.getImageUrl())
                .build();
    }

    public static List<GalleryImageResponse> toGalleryResponses(List<ProductImage> gallery) {
        if (gallery == null) return Collections.emptyList();
        return gallery.stream().map(ProductMapper::toGalleryResponse).collect(Collectors.toList());
    }
}
