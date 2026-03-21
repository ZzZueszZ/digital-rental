package org.web.authentication.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.web.authentication.model.AccountActivationToken;
import org.web.users.model.User;

import java.util.Optional;

public interface AccountActivationTokenRepository extends JpaRepository<AccountActivationToken, Long> {
    Optional<AccountActivationToken> findByToken(String token);
    void deleteAllByUser(User user);
}
