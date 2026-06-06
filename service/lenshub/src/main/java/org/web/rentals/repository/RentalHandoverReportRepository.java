package org.web.rentals.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.web.rentals.model.RentalHandoverReport;

@Repository
public interface RentalHandoverReportRepository extends JpaRepository<RentalHandoverReport, Long> {
}
