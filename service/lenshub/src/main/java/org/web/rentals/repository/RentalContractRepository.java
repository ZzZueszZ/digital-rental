package org.web.rentals.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.web.rentals.model.RentalContract;

import java.util.Optional;

@Repository
public interface RentalContractRepository extends JpaRepository<RentalContract, Long> {
    Optional<RentalContract> findByContractNumber(String contractNumber);
}
