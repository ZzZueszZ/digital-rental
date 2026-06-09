package org.web.rentals.model;

import jakarta.persistence.*;
import lombok.*;
import org.web.products.model.Product;

import java.math.BigDecimal;

@Entity
@Table(name = "rental_order_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RentalOrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rental_order_id", nullable = false)
    private RentalOrder rentalOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_id")
    private Device device;

    @Column(name = "price_per_day", nullable = false, precision = 12, scale = 2)
    private BigDecimal pricePerDay;

    @Column(name = "condition_before_handover", columnDefinition = "TEXT")
    private String conditionBeforeHandover;

    @Column(name = "condition_after_return", columnDefinition = "TEXT")
    private String conditionAfterReturn;
}
