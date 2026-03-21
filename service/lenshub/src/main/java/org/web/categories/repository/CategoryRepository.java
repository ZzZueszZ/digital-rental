package org.web.categories.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.web.categories.model.Category;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    boolean existsByCode(String code);

    Page<Category> findAllByIsActiveTrue(Pageable pageable);

    Page<Category> findAllByIsActiveFalse(Pageable pageable);

    @Query("SELECT c FROM Category c WHERE " +
           "(LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           " LOWER(c.code) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:activeOnly = false OR c.isActive = true)")
    Page<Category> search(@Param("keyword") String keyword,
                          @Param("activeOnly") boolean activeOnly,
                          Pageable pageable);
}
