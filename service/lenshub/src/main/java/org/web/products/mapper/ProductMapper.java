package org.web.products.mapper;

import org.web.products.dto.response.GalleryImageResponse;
import org.web.products.dto.response.ProductResponse;
import org.web.products.dto.response.ProductSpecificationResponse;
import org.web.products.model.Product;
import org.web.products.model.ProductImage;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import java.util.function.Function;
import org.web.files.model.FileAsset;

public class ProductMapper {

    public static ProductResponse toResponse(Product product) {
        return toResponse(product, asset -> null);
    }

    public static ProductResponse toResponse(Product product, Function<FileAsset, String> assetUrl) {
        if (product == null) return null;
        String mainImageUrl = null;
        if (product.getMainImageAsset() != null) {
            mainImageUrl = assetUrl.apply(product.getMainImageAsset());
        }

        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .rentPricePerDay(product.getRentPricePerDay())
                .salePrice(product.getSalePrice())
                .isForRent(product.isForRent())
                .isForSale(product.isForSale())
                .mainImageUrl(mainImageUrl != null ? mainImageUrl : product.getMainImageUrl())
                .brand(product.getBrand())
                .quantity(product.getQuantity())
                .rentalQuantity(product.getRentalQuantity())
                .isActive(product.isActive())
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .specifications(toSpecResponses(product.getSpecifications()))
                .gallery(toGalleryResponses(product.getGallery(), assetUrl))
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }

    public static List<ProductResponse> toResponses(List<Product> products) {
        if (products == null) return Collections.emptyList();
        return products.stream().map(ProductMapper::toResponse).collect(Collectors.toList());
    }

    public static ProductSpecificationResponse toSpecResponse(org.web.products.model.ProductSpecification spec) {
        if (spec == null) return null;
        return ProductSpecificationResponse.builder()
                .id(spec.getId())
                .specKey(spec.getSpecKey())
                .specValue(spec.getSpecValue())
                .build();
    }

    public static List<ProductSpecificationResponse> toSpecResponses(List<org.web.products.model.ProductSpecification> specs) {
        if (specs == null) return Collections.emptyList();
        return specs.stream().map(ProductMapper::toSpecResponse).collect(Collectors.toList());
    }

    public static GalleryImageResponse toGalleryResponse(ProductImage image) {
        return toGalleryResponse(image, asset -> null);
    }

    public static GalleryImageResponse toGalleryResponse(ProductImage image, Function<FileAsset, String> assetUrl) {

        if (image == null) return null;
        String imageUrl = null;
        if (image.getAsset() != null) {
            imageUrl = assetUrl.apply(image.getAsset());
        }
        return GalleryImageResponse.builder()
                .id(image.getId())
                .url(imageUrl != null ? imageUrl : image.getImageUrl())
                .build();
    }

    public static List<GalleryImageResponse> toGalleryResponses(List<ProductImage> gallery) {
        return toGalleryResponses(gallery, asset -> null);
    }

    public static List<GalleryImageResponse> toGalleryResponses(List<ProductImage> gallery, Function<FileAsset, String> assetUrl) {
        if (gallery == null) return Collections.emptyList();
        return gallery.stream().map(image -> toGalleryResponse(image, assetUrl)).collect(Collectors.toList());
    }
}
