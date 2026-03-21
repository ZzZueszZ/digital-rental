package org.web.orders.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.web.common.enums.OrderStatus;
import org.web.common.enums.PaymentStatus;
import org.web.orders.model.Order;
import org.web.users.model.User;

import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    Optional<Order> findByCode(String code);

    @Query("SELECT o FROM Order o WHERE o.user = :user " +
           "AND (:status IS NULL OR o.status = :status) " +
           "AND (:paymentStatus IS NULL OR o.paymentStatus = :paymentStatus)")
    Page<Order> findMyOrders(User user, OrderStatus status, PaymentStatus paymentStatus, Pageable pageable);
}
