package org.web.orders.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.web.common.enums.OrderStatus;
import org.web.orders.model.OrderItem;
import org.web.products.model.Product;
import org.web.users.model.User;

import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByProductAndOrder_UserAndOrder_StatusOrderByOrder_CreatedAtDesc(Product product, User user, OrderStatus status);

    @org.springframework.data.jpa.repository.Query("SELECT new org.web.dashboard.dto.TopProductResponse(" +
           "p.id, p.name, p.brand, p.mainImageUrl, SUM(oi.quantity), SUM(oi.subtotal)) " +
           "FROM OrderItem oi JOIN oi.product p JOIN oi.order o " +
           "WHERE o.status IN :statuses " +
           "GROUP BY p.id, p.name, p.brand, p.mainImageUrl " +
           "ORDER BY SUM(oi.quantity) DESC")
    List<org.web.dashboard.dto.TopProductResponse> findTopSellingProducts(
            @org.springframework.data.repository.query.Param("statuses") java.util.List<org.web.common.enums.OrderStatus> statuses,
            org.springframework.data.domain.Pageable pageable);
}
