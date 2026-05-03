package org.web.products.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.web.products.model.ProductPriceHistory;

@Repository
public interface ProductPriceHistoryRepository extends JpaRepository<ProductPriceHistory, Long> {
    Page<ProductPriceHistory> findByProductIdOrderByCreatedAtDesc(Long productId, Pageable pageable);
}
