package org.web.products.model;

import jakarta.persistence.*;
import lombok.*;
import org.web.categories.model.Category;
import org.web.common.model.BaseAuditEntity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "rent_price_per_day")
    private BigDecimal rentPricePerDay;

    @Column(name = "sale_price")
    private BigDecimal salePrice;

    @Column(name = "is_for_rent", nullable = false)
    @Builder.Default
    private boolean isForRent = true;

    @Column(name = "is_for_sale", nullable = false)
    @Builder.Default
    private boolean isForSale = false;

    @Column(name = "main_image_url")
    private String mainImageUrl;

    private String brand;

    @Column(nullable = false)
    @Builder.Default
    private boolean isActive = true;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(nullable = false)
    @Builder.Default
    private int quantity = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ProductImage> gallery = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ProductSpecification> specifications = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ProductPriceHistory> priceHistories = new ArrayList<>();
}
