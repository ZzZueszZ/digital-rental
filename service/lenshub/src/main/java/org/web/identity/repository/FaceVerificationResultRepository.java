package org.web.identity.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.web.identity.model.FaceVerificationResult;

import java.util.Optional;

@Repository
public interface FaceVerificationResultRepository extends JpaRepository<FaceVerificationResult, Long> {
    Optional<FaceVerificationResult> findByVerificationSessionId(Long sessionId);
}
