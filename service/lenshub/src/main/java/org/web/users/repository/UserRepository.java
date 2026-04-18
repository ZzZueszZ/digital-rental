package org.web.users.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import org.web.common.enums.AccountStatus;
import org.web.users.model.User;

import java.time.LocalDateTime;

@Repository
public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {
    boolean existsByEmail(String email);

    @EntityGraph(attributePaths = {"roles", "roles.permissions"})
    java.util.Optional<User> findByEmail(String email);

    @EntityGraph(attributePaths = {"roles", "roles.permissions"})
    java.util.Optional<User> findWithRolesById(Long id);

    long countByAccountStatus(AccountStatus status);

    long countByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
}
