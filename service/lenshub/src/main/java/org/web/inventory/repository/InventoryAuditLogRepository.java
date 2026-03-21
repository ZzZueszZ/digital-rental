package org.web.inventory.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.web.inventory.model.InventoryAuditLog;
import org.web.products.model.Product;

import java.time.LocalDateTime;

@Repository
public interface InventoryAuditLogRepository extends JpaRepository<InventoryAuditLog, Long> {

    Page<InventoryAuditLog> findByProductAndCreatedAtBetweenOrderByCreatedAtDesc(Product product, LocalDateTime from, LocalDateTime to, Pageable pageable);

    Page<InventoryAuditLog> findByCreatedAtBetweenOrderByCreatedAtDesc(LocalDateTime from, LocalDateTime to, Pageable pageable);
}
