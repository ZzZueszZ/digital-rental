package org.web.rentals.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.web.common.enums.DeviceStatus;
import org.web.products.model.Product;
import org.web.rentals.model.Device;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeviceRepository extends JpaRepository<Device, Long> {
    Optional<Device> findBySerialNumber(String serialNumber);
    List<Device> findByProductAndStatus(Product product, DeviceStatus status);
    List<Device> findByProduct(Product product);
}
