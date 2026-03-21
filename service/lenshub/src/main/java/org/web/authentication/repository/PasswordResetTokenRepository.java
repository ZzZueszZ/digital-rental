package org.web.authentication.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.web.authentication.model.PasswordResetToken;
import org.web.users.model.User;

import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findTopByUserAndUsedFalseOrderByCreatedAtDesc(User user);
}
