package org.web.rentals.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.web.rentals.model.RentalPayment;

@Repository
public interface RentalPaymentRepository extends JpaRepository<RentalPayment, Long> {
}
