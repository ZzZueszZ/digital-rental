package org.web.addresses.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.web.addresses.model.ShippingAddress;
import org.web.users.model.User;

import java.util.List;
import java.util.Optional;

@Repository
public interface ShippingAddressRepository extends JpaRepository<ShippingAddress, Long> {
    List<ShippingAddress> findByUserOrderByIsDefaultDescCreatedAtDesc(User user);
    Optional<ShippingAddress> findByUserAndIsDefaultTrue(User user);
    Optional<ShippingAddress> findByIdAndUser(Long id, User user);
    long countByUser(User user);
}
