package org.web.reviews.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.web.orders.model.Order;
import org.web.products.model.Product;
import org.web.reviews.model.Review;
import org.web.users.model.User;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    boolean existsByOrderId(Long orderId);


    @Query("SELECT CASE WHEN COUNT(r) > 0 THEN true ELSE false END FROM Review r WHERE r.user = :user AND r.product = :product AND r.order = :order")
    boolean existsByUserAndProductAndOrder(@Param("user") User user, @Param("product") Product product, @Param("order") Order order);

    Page<Review> findByProductAndHiddenFalse(Product product, Pageable pageable);

    Page<Review> findByUserAndProductAndHiddenFalse(User user, Product product, Pageable pageable);

    @Query("SELECT r FROM Review r WHERE SIZE(r.reporters) > 0")
    Page<Review> findReported(Pageable pageable);

    Page<Review> findByHiddenTrue(Pageable pageable);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.product.id = :productId AND r.hidden = false")
    Double findAverageRating(@Param("productId") Long productId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.product.id = :productId AND r.hidden = false")
    Long countActiveReviews(@Param("productId") Long productId);
}
