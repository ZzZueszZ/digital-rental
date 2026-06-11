package org.web.rentals.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.web.common.enums.PaymentStatus;
import org.web.common.enums.RentalPaymentType;
import org.web.rentals.model.RentalPayment;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RentalPaymentRepository extends JpaRepository<RentalPayment, Long> {

    @Query("SELECT new org.web.dashboard.dto.RevenueStatResponse(" +
           "CAST(FUNCTION('DATE', rp.paidAt) AS java.time.LocalDate), SUM(rp.amount)) " +
           "FROM RentalPayment rp " +
           "WHERE rp.status = :status AND rp.paymentType IN :paymentTypes " +
           "AND rp.paidAt BETWEEN :startDate AND :endDate " +
           "GROUP BY FUNCTION('DATE', rp.paidAt) " +
           "ORDER BY FUNCTION('DATE', rp.paidAt) ASC")
    List<org.web.dashboard.dto.RevenueStatResponse> getRevenueStats(
            @Param("status") PaymentStatus status,
            @Param("paymentTypes") List<RentalPaymentType> paymentTypes,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);
}
