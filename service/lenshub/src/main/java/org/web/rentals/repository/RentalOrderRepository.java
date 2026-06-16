package org.web.rentals.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.web.common.enums.RentalOrderStatus;
import org.web.common.enums.PaymentStatus;
import org.web.rentals.model.RentalOrder;
import org.web.users.model.User;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import jakarta.persistence.LockModeType;

@Repository
public interface RentalOrderRepository extends JpaRepository<RentalOrder, Long> {
    Optional<RentalOrder> findByCode(String code);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT r FROM RentalOrder r WHERE r.code = :code")
    Optional<RentalOrder> findByCodeForUpdate(@Param("code") String code);

    @Query("SELECT r FROM RentalOrder r WHERE r.user = :user " +
           "AND (:status IS NULL OR r.status = :status)")
    Page<RentalOrder> findMyRentals(@Param("user") User user, @Param("status") RentalOrderStatus status, Pageable pageable);

    // Overlapping query to check availability of a product
    @Query("SELECT COUNT(ri) FROM RentalOrderItem ri " +
           "JOIN ri.rentalOrder ro " +
           "WHERE ri.product.id = :productId " +
           "AND ro.status NOT IN ('REJECTED', 'CANCELED', 'COMPLETED') " +
           "AND ro.startDate <= :endDate AND ro.endDate >= :startDate")
    long countRentedUnitsInPeriod(@Param("productId") Long productId, 
                                  @Param("startDate") LocalDateTime startDate, 
                                  @Param("endDate") LocalDateTime endDate);

    @Query("SELECT new org.web.dashboard.dto.RevenueStatResponse(" +
           "CAST(FUNCTION('DATE', COALESCE(r.rentalFeePaidAt, r.createdAt)) AS java.time.LocalDate), SUM(r.rentalFee)) " +
           "FROM RentalOrder r " +
           "WHERE r.paymentStatus = :paymentStatus " +
           "AND COALESCE(r.rentalFeePaidAt, r.createdAt) BETWEEN :startDate AND :endDate " +
           "GROUP BY FUNCTION('DATE', COALESCE(r.rentalFeePaidAt, r.createdAt)) " +
           "ORDER BY FUNCTION('DATE', COALESCE(r.rentalFeePaidAt, r.createdAt)) ASC")
    List<org.web.dashboard.dto.RevenueStatResponse> getRentalFeeRevenueStats(
            @Param("paymentStatus") PaymentStatus paymentStatus,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    @Query("SELECT FUNCTION('DATE', r.createdAt), COUNT(r) " +
           "FROM RentalOrder r " +
           "WHERE r.status IN :statuses AND r.createdAt BETWEEN :startDate AND :endDate " +
           "GROUP BY FUNCTION('DATE', r.createdAt) " +
           "ORDER BY FUNCTION('DATE', r.createdAt) ASC")
    List<Object[]> getDailyRentalOrderStats(
            @Param("statuses") List<RentalOrderStatus> statuses,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);
}
