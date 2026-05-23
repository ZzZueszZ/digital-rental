package org.web.identity.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.web.common.enums.VerificationSessionStatus;
import org.web.identity.model.VerificationSession;

import java.util.List;

@Repository
public interface VerificationSessionRepository extends JpaRepository<VerificationSession, Long> {
    List<VerificationSession> findByUserId(Long userId);
    Page<VerificationSession> findByStatus(VerificationSessionStatus status, Pageable pageable);
}

