package org.web.rentals.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.web.rentals.model.RentalRefund;

@Repository
public interface RentalRefundRepository extends JpaRepository<RentalRefund, Long> {
}
