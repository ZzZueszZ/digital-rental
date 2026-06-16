package org.web.rentals.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.web.common.enums.RentalOrderStatus;
import org.springframework.stereotype.Repository;
import org.web.rentals.model.RentalOrderItem;

import java.util.List;

@Repository
public interface RentalOrderItemRepository extends JpaRepository<RentalOrderItem, Long> {
    @Query("SELECT p.id, p.name, p.brand, p.mainImageUrl, COUNT(ri), SUM(ri.pricePerDay) " +
            "FROM RentalOrderItem ri JOIN ri.product p JOIN ri.rentalOrder ro " +
            "WHERE ro.status IN :statuses " +
            "GROUP BY p.id, p.name, p.brand, p.mainImageUrl " +
            "ORDER BY COUNT(ri) DESC")
    List<Object[]> findTopRentedProductStats(@Param("statuses") List<RentalOrderStatus> statuses);
}
