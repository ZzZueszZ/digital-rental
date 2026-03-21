package org.web.identity.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.web.identity.model.VerificationArtifact;

import java.util.List;

@Repository
public interface VerificationArtifactRepository extends JpaRepository<VerificationArtifact, Long> {
    List<VerificationArtifact> findByVerificationSessionId(Long sessionId);
}
