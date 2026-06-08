package org.web.orders.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.web.common.enums.OrderStatus;
import org.web.common.enums.PaymentStatus;
import org.web.orders.model.Order;
import org.web.users.model.User;

import java.util.Optional;
import jakarta.persistence.LockModeType;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    Optional<Order> findByCode(String code);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT o FROM Order o WHERE o.code = :code")
    Optional<Order> findByCodeForUpdate(@Param("code") String code);

    @Query("SELECT o FROM Order o WHERE o.user = :user " +
           "AND (:status IS NULL OR o.status = :status) " +
           "AND (:paymentStatus IS NULL OR o.paymentStatus = :paymentStatus)")
    Page<Order> findMyOrders(User user, OrderStatus status, PaymentStatus paymentStatus, Pageable pageable);

    @Query("SELECT new org.web.dashboard.dto.RevenueStatResponse(" +
           "CAST(FUNCTION('DATE', o.createdAt) AS java.time.LocalDate), SUM(o.totalPrice)) " +
           "FROM Order o " +
           "WHERE o.status IN :statuses AND o.createdAt BETWEEN :startDate AND :endDate " +
           "GROUP BY FUNCTION('DATE', o.createdAt) " +
           "ORDER BY FUNCTION('DATE', o.createdAt) ASC")
    java.util.List<org.web.dashboard.dto.RevenueStatResponse> getRevenueStats(
            @org.springframework.data.repository.query.Param("statuses") java.util.List<org.web.common.enums.OrderStatus> statuses,
            @org.springframework.data.repository.query.Param("startDate") java.time.LocalDateTime startDate,
            @org.springframework.data.repository.query.Param("endDate") java.time.LocalDateTime endDate);

    @Query("SELECT o.status, COUNT(o) FROM Order o GROUP BY o.status")
    java.util.List<Object[]> countOrdersByStatus();

    @Query("SELECT new org.web.dashboard.dto.DailyOrderStatResponse(" +
           "CAST(FUNCTION('DATE', o.createdAt) AS java.time.LocalDate), COUNT(o)) " +
           "FROM Order o " +
           "WHERE o.status IN :statuses AND o.createdAt BETWEEN :startDate AND :endDate " +
           "GROUP BY FUNCTION('DATE', o.createdAt) " +
           "ORDER BY FUNCTION('DATE', o.createdAt) ASC")
    java.util.List<org.web.dashboard.dto.DailyOrderStatResponse> getDailyOrderStats(
            @org.springframework.data.repository.query.Param("statuses") java.util.List<org.web.common.enums.OrderStatus> statuses,
            @org.springframework.data.repository.query.Param("startDate") java.time.LocalDateTime startDate,
            @org.springframework.data.repository.query.Param("endDate") java.time.LocalDateTime endDate);
}
