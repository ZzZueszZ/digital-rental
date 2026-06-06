package org.web.rentals.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.web.rentals.model.RentalReturnReport;

@Repository
public interface RentalReturnReportRepository extends JpaRepository<RentalReturnReport, Long> {
}
