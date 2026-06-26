package org.web.products.service.impl;

import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.web.categories.model.Category;
import org.web.categories.repository.CategoryRepository;
import org.web.common.exceptions.ApplicationException;
import org.web.common.service.AuditLogService;
import org.web.common.utils.FileUploadUtil;
import org.web.files.model.FileAsset;
import org.web.files.model.FileAssetPurpose;
import org.web.files.model.FileAssetStatus;
import org.web.files.repository.FileAssetRepository;
import org.web.products.dto.request.ProductCriteria;
import org.web.products.dto.request.ProductInfoUpdateRequest;
import org.web.products.dto.request.ProductPriceUpdateRequest;
import org.web.products.dto.request.ProductRequest;
import org.web.products.dto.response.GalleryImageResponse;
import org.web.products.dto.response.PriceHistoryResponse;
import org.web.products.dto.response.ProductResponse;
import org.web.products.mapper.ProductMapper;
import org.web.products.model.Product;
import org.web.products.model.ProductImage;
import org.web.products.model.ProductPriceHistory;
import org.web.products.repository.ProductImageRepository;
import org.web.products.repository.ProductPriceHistoryRepository;
import org.web.products.repository.ProductRepository;
import org.web.products.service.ProductService;
import org.web.storage.MinioStorageProperties;
import org.web.storage.StorageService;
import org.web.users.model.User;
import org.web.users.repository.UserRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import java.time.Duration;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final ProductPriceHistoryRepository priceHistoryRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;
    private final FileAssetRepository fileAssetRepository;
    private final StorageService storageService;
    private final MinioStorageProperties minioProperties;

    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponse> search(ProductCriteria criteria, Pageable pageable) {
        Specification<Product> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Active status filter
            boolean isActive = criteria.getIsActive() != null ? criteria.getIsActive() : true;
            predicates.add(cb.equal(root.get("isActive"), isActive));

            // Search by name
            if (criteria.getName() != null && !criteria.getName().isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("name")), "%" + criteria.getName().toLowerCase() + "%"));
            }

            // Search by brand
            if (criteria.getBrand() != null && !criteria.getBrand().isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("brand")), criteria.getBrand().toLowerCase()));
            }

            // Categories filter (support multiple)
            if (criteria.getCategories() != null && !criteria.getCategories().isEmpty()) {
                List<Predicate> catPredicates = new ArrayList<>();
                for (String catInput : criteria.getCategories()) {
                    try {
                        Long catId = Long.parseLong(catInput);
                        catPredicates.add(cb.equal(root.get("category").get("id"), catId));
                    } catch (NumberFormatException e) {
                        catPredicates.add(cb.equal(cb.lower(root.get("category").get("code")), catInput.toLowerCase()));
                    }
                }
                predicates.add(cb.or(catPredicates.toArray(new Predicate[0])));
            }

            // Rent Price Range
            if (criteria.getMinRentPrice() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("rentPricePerDay"), criteria.getMinRentPrice()));
            }
            if (criteria.getMaxRentPrice() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("rentPricePerDay"), criteria.getMaxRentPrice()));
            }

            // Sale Price Range
            if (criteria.getMinSalePrice() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("salePrice"), criteria.getMinSalePrice()));
            }
            if (criteria.getMaxSalePrice() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("salePrice"), criteria.getMaxSalePrice()));
            }

            // Flags
            if (criteria.getIsForRent() != null) {
                predicates.add(cb.equal(root.get("isForRent"), criteria.getIsForRent()));
            }
            if (criteria.getIsForSale() != null) {
                predicates.add(cb.equal(root.get("isForSale"), criteria.getIsForSale()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return productRepository.findAll(spec, pageable).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Product not found"));
        return toResponse(product);
    }

    @Override
    @Transactional
    public ProductResponse create(ProductRequest request, MultipartFile image) {
        if (productRepository.existsByName(request.getName())) {
            throw new ApplicationException(HttpStatus.CONFLICT, "Product name already exists");
        }

        String mainImageUrl = FileUploadUtil.saveImage(image);
        FileAsset mainImageAsset = request.getMainImageAssetId() == null ? null : resolveProductAsset(request.getMainImageAssetId());

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ApplicationException(HttpStatus.BAD_REQUEST, "Category Id Invalid"));
        }

        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .rentPricePerDay(request.getRentPricePerDay())
                .salePrice(request.getSalePrice())
                .isForRent(request.getIsForRent() != null ? request.getIsForRent() : true)
                .isForSale(request.getIsForSale() != null ? request.getIsForSale() : false)
                .brand(request.getBrand())
                .quantity(0)
                .rentalQuantity(0)
                .mainImageUrl(mainImageUrl)
                .mainImageAsset(mainImageAsset)
                .category(category)
                .isActive(true)
                .build();

        if (request.getSpecifications() != null) {
            java.util.List<org.web.products.model.ProductSpecification> specs = request.getSpecifications().stream()
                    .map(dto -> org.web.products.model.ProductSpecification.builder()
                            .product(product)
                            .specKey(dto.getSpecKey())
                            .specValue(dto.getSpecValue())
                            .build())
                    .collect(Collectors.toList());
            product.setSpecifications(specs);
        }

        Product saved = productRepository.save(product);

        // Save Price History (initial)
        User actor = getCurrentUser();
        if (saved.getRentPricePerDay() != null) {
            savePriceHistory(saved, "RENT", null, saved.getRentPricePerDay(), actor);
        }
        if (saved.getSalePrice() != null) {
            savePriceHistory(saved, "SALE", null, saved.getSalePrice(), actor);
        }

        auditLogService.logAction("PRODUCT", saved.getId(), "CREATE_PRODUCT",
                "Created product: " + saved.getName(), null, "{\"name\":\"" + saved.getName() + "\"}");

        return toResponse(saved);
    }

    @Override
    @Transactional
    public ProductResponse updateInfo(Long id, ProductInfoUpdateRequest request, MultipartFile image) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Product not found"));

        String oldDetails = "{\"name\":\"" + product.getName() + "\"}";

        if (request.getName() != null && !request.getName().isBlank()) product.setName(request.getName());
        if (request.getDescription() != null) product.setDescription(request.getDescription());
        if (request.getBrand() != null && !request.getBrand().isBlank()) product.setBrand(request.getBrand());

        if (request.getSpecifications() != null) {
            product.getSpecifications().clear();
            java.util.List<org.web.products.model.ProductSpecification> specs = request.getSpecifications().stream()
                    .map(dto -> org.web.products.model.ProductSpecification.builder()
                            .product(product)
                            .specKey(dto.getSpecKey())
                            .specValue(dto.getSpecValue())
                            .build())
                    .collect(Collectors.toList());
            product.getSpecifications().addAll(specs);
        }

        if (request.getCategoryId() != null) {
            Category cat = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ApplicationException(HttpStatus.BAD_REQUEST, "Category ID invalid"));
            product.setCategory(cat);
        }

        if (image != null && !image.isEmpty()) {
            product.setMainImageUrl(FileUploadUtil.replaceImage(product.getMainImageUrl(), image));
            product.setMainImageAsset(null);
        } else if (request.getMainImageAssetId() != null) {
            product.setMainImageAsset(resolveProductAsset(request.getMainImageAssetId()));
        }

        Product saved = productRepository.save(product);

        auditLogService.logAction("PRODUCT", id, "UPDATE_PRODUCT_INFO",
                "Updated product info: " + id, oldDetails, "{\"name\":\"" + saved.getName() + "\"}");

        return toResponse(saved);
    }

    @Override
    @Transactional
    public ProductResponse updatePrice(Long id, ProductPriceUpdateRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Product not found"));

        String oldDetails = "{\"rent\":" + product.getRentPricePerDay() + ",\"sale\":" + product.getSalePrice() + "}";
        User actor = getCurrentUser();

        // Check Rent Price Change
        if (request.getRentPricePerDay() != null && comparePrices(product.getRentPricePerDay(), request.getRentPricePerDay())) {
            savePriceHistory(product, "RENT", product.getRentPricePerDay(), request.getRentPricePerDay(), actor);
            product.setRentPricePerDay(request.getRentPricePerDay());
        }

        // Check Sale Price Change
        if (request.getSalePrice() != null && comparePrices(product.getSalePrice(), request.getSalePrice())) {
            savePriceHistory(product, "SALE", product.getSalePrice(), request.getSalePrice(), actor);
            product.setSalePrice(request.getSalePrice());
        }

        if (request.getIsForRent() != null) product.setForRent(request.getIsForRent());
        if (request.getIsForSale() != null) product.setForSale(request.getIsForSale());

        Product saved = productRepository.save(product);

        auditLogService.logAction("PRODUCT", id, "UPDATE_PRODUCT_PRICE",
                "Updated product pricing: " + id, oldDetails, "{\"rent\":" + saved.getRentPricePerDay() + ",\"sale\":" + saved.getSalePrice() + "}");

        return toResponse(saved);
    }

    @Override
    @Transactional
    public void softDelete(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Product not found"));
        
        if (product.getDeletedAt() != null) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Sản phẩm đã bị xóa");
        }

        product.setActive(false);
        product.setDeletedAt(LocalDateTime.now());
        productRepository.save(product);
        
        auditLogService.logAction("PRODUCT", id, "SOFT_DELETE_PRODUCT", "Soft deleted product", null, null);
    }

    @Override
    @Transactional
    public void restore(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Product not found"));

        if (product.getDeletedAt() == null) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Sản phẩm chưa bị xóa, không thể khôi phục");
        }

        product.setActive(true);
        product.setDeletedAt(null);
        productRepository.save(product);

        auditLogService.logAction("PRODUCT", id, "RESTORE_PRODUCT", "Restored product", null, null);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponse> getTrashedProducts(Pageable pageable) {
        Specification<Product> spec = (root, query, cb) -> cb.isNotNull(root.get("deletedAt"));
        return productRepository.findAll(spec, pageable).map(this::toResponse);
    }

    @Override
    @Transactional
    public void hardDelete(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Product not found"));

        // Delete images from disk
        FileUploadUtil.deleteImage(product.getMainImageUrl());
        deleteAsset(product.getMainImageAsset());
        product.getGallery().forEach(img -> {
            FileUploadUtil.deleteImage(img.getImageUrl());
            deleteAsset(img.getAsset());
        });

        productRepository.delete(product);
        auditLogService.logAction("PRODUCT", id, "HARD_DELETE_PRODUCT", "Permanently deleted product", null, null);
    }

    @Override
    @Transactional
    public List<GalleryImageResponse> addGallery(Long productId, List<MultipartFile> images) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Product not found"));

        List<String> urls = FileUploadUtil.saveImages(images);
        
        List<ProductImage> gallery = urls.stream()
                .map(url -> ProductImage.builder().product(product).imageUrl(url).build())
                .collect(Collectors.toList());

        List<ProductImage> saved = productImageRepository.saveAll(gallery);
        
        auditLogService.logAction("PRODUCT", productId, "ADD_GALLERY", 
                "Added " + saved.size() + " images to gallery", null, null);

        return ProductMapper.toGalleryResponses(saved);
    }

    @Override
    @Transactional
    public List<GalleryImageResponse> addGalleryAssets(Long productId, List<UUID> assetIds) {
        if (assetIds == null || assetIds.isEmpty()) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "At least one image asset is required");
        }
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Product not found"));
        List<ProductImage> images = assetIds.stream()
                .map(this::resolveProductAsset)
                .map(asset -> ProductImage.builder().product(product).asset(asset).imageUrl("").build())
                .toList();
        List<ProductImage> saved = productImageRepository.saveAll(images);
        auditLogService.logAction("PRODUCT", productId, "ADD_GALLERY", "Added " + saved.size() + " gallery assets", null, null);
        return saved.stream().map(this::toGalleryResponse).toList();
    }

    @Override
    @Transactional
    public void deleteGalleryImage(Long productId, Long imageId) {
        ProductImage image = productImageRepository.findById(imageId)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Image not found"));

        if (!image.getProduct().getId().equals(productId)) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Image does not belong to this product");
        }

        FileUploadUtil.deleteImage(image.getImageUrl());
        deleteAsset(image.getAsset());
        productImageRepository.delete(image);
        
        auditLogService.logAction("PRODUCT", productId, "DELETE_GALLERY_IMAGE", 
                "Deleted gallery image: " + imageId, null, null);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PriceHistoryResponse> getPriceHistory(Long productId, int page, int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        Page<ProductPriceHistory> logsPage = priceHistoryRepository.findByProductIdOrderByCreatedAtDesc(productId, pageable);

        List<PriceHistoryResponse> content = logsPage.getContent().stream().map(h -> {
            double percent = 0.0;
            String type = "NONE";
            if (h.getOldPrice() != null && h.getOldPrice().compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal diff = h.getNewPrice().subtract(h.getOldPrice());
                percent = Math.abs(diff.divide(h.getOldPrice(), 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100)).doubleValue());

                if (diff.compareTo(BigDecimal.ZERO) > 0) type = "INCREASE";
                else if (diff.compareTo(BigDecimal.ZERO) < 0) type = "DECREASE";
            }

            String actorName = "Unknown";
            if (h.getChangedBy() != null) {
                actorName = h.getChangedBy().getEmail();
            }

            return PriceHistoryResponse.builder()
                    .id(h.getId())
                    .priceType(h.getPriceType())
                    .oldPrice(h.getOldPrice())
                    .newPrice(h.getNewPrice())
                    .percentChange(percent)
                    .changeType(type)
                    .changedBy(actorName)
                    .createdAt(h.getCreatedAt())
                    .build();
        }).collect(Collectors.toList());

        return new org.springframework.data.domain.PageImpl<>(content, pageable, logsPage.getTotalElements());
    }

    private void savePriceHistory(Product product, String type, BigDecimal oldPrice, BigDecimal newPrice, User actor) {
        ProductPriceHistory history = ProductPriceHistory.builder()
                .product(product)
                .priceType(type)
                .oldPrice(oldPrice)
                .newPrice(newPrice)
                .changedBy(actor)
                .build();
        priceHistoryRepository.save(history);
    }

    private boolean comparePrices(BigDecimal p1, BigDecimal p2) {
        if (p1 == null || p2 == null) return p1 != p2;
        return p1.compareTo(p2) != 0;
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return null;
        return userRepository.findByEmail(auth.getName()).orElse(null);
    }

    private FileAsset resolveProductAsset(UUID assetId) {
        FileAsset asset = fileAssetRepository.findById(assetId)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Product image asset not found"));
        User actor = getCurrentUser();
        if (asset.getPurpose() != FileAssetPurpose.PRODUCT_IMAGE || asset.getStatus() != FileAssetStatus.READY
                || actor == null || !asset.getOwner().getId().equals(actor.getId())) {
            throw new ApplicationException(HttpStatus.FORBIDDEN, "Product image asset is not available");
        }
        return asset;
    }

    private ProductResponse toResponse(Product product) {
        return ProductMapper.toResponse(product, this::signedUrl);
    }

    private GalleryImageResponse toGalleryResponse(ProductImage image) {
        return ProductMapper.toGalleryResponse(image, this::signedUrl);
    }

    private String signedUrl(FileAsset asset) {
        if (asset.getStatus() != FileAssetStatus.READY) {
            return null;
        }
        return storageService.presignGet(asset.getObjectKey(), Duration.ofMinutes(minioProperties.getDownloadExpiryMinutes()));
    }

    private void deleteAsset(FileAsset asset) {
        if (asset == null || asset.getStatus() == FileAssetStatus.DELETED) return;
        storageService.delete(asset.getObjectKey());
        asset.setStatus(FileAssetStatus.DELETED);
        asset.setDeletedAt(LocalDateTime.now());
        fileAssetRepository.save(asset);
    }
}
