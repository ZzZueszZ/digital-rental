package org.web.orders.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.web.orders.model.OrderItem;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
}
