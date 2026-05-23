package org.web.rentals.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.web.rentals.model.Device;
import org.web.rentals.model.DeviceConditionReport;

import java.util.List;

@Repository
public interface DeviceConditionReportRepository extends JpaRepository<DeviceConditionReport, Long> {
    List<DeviceConditionReport> findByDevice(Device device);
}
