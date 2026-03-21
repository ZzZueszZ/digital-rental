package org.web.orders.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.web.common.enums.OrderStatus;
import org.web.orders.model.OrderItem;
import org.web.products.model.Product;
import org.web.users.model.User;

import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByProductAndOrder_UserAndOrder_StatusOrderByOrder_CreatedAtDesc(Product product, User user, OrderStatus status);
}
