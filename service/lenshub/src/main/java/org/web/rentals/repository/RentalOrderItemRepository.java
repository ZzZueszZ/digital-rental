package org.web.rentals.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.web.rentals.model.RentalOrderItem;

@Repository
public interface RentalOrderItemRepository extends JpaRepository<RentalOrderItem, Long> {
}
