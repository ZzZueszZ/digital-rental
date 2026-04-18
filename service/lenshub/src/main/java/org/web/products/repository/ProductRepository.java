package org.web.products.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import org.web.products.model.Product;

import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
    
    Optional<Product> findByIdAndIsActiveTrue(Long id);
    
    boolean existsByName(String name);

    java.util.List<Product> findByQuantityLessThan(int threshold);
}
