package org.web.inventory.model;

import jakarta.persistence.*;
import lombok.*;
import org.web.common.model.BaseAuditEntity;
import org.web.products.model.Product;
import org.web.users.model.User;

@Entity
@Table(name = "inventory_audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryAuditLog extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "changed_by")
    private User changedBy;

    @Column(name = "old_stock", nullable = false)
    private int oldStock;

    @Column(name = "new_stock", nullable = false)
    private int newStock;

    @Column(columnDefinition = "TEXT")
    private String reason;
}
