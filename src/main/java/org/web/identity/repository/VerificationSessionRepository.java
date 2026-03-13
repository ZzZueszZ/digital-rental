package org.web.identity.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.web.identity.model.VerificationSession;

import java.util.List;

@Repository
public interface VerificationSessionRepository extends JpaRepository<VerificationSession, Long> {
    List<VerificationSession> findByUserId(Long userId);
}
