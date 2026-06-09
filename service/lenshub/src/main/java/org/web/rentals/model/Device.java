package org.web.rentals.model;

import jakarta.persistence.*;
import lombok.*;
import org.web.common.enums.DeviceStatus;
import org.web.common.model.BaseAuditEntity;
import org.web.products.model.Product;

@Entity
@Table(name = "devices",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_devices_serial_number", columnNames = "serial_number")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Device extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "serial_number", nullable = false, length = 100)
    private String serialNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private DeviceStatus status = DeviceStatus.AVAILABLE;

    @Column(name = "condition_details", columnDefinition = "TEXT")
    private String conditionDetails;
}
