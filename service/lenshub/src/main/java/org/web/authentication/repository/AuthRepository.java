package org.web.authentication.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.web.common.enums.AccountStatus;
import org.web.users.model.User;

import java.util.Optional;

@Repository
public interface AuthRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    default Optional<User> findActiveByEmail(String email) {
        return findByEmail(email)
                .filter(u -> u.getAccountStatus() != AccountStatus.DELETED);
    }
}
