package org.web.identity.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.web.identity.model.VerificationArtifact;
import org.web.common.enums.VerificationArtifactType;

import java.util.List;
import java.util.Optional;

@Repository
public interface VerificationArtifactRepository extends JpaRepository<VerificationArtifact, Long> {
    List<VerificationArtifact> findByVerificationSessionId(Long sessionId);
    Optional<VerificationArtifact> findByVerificationSessionIdAndArtifactType(Long sessionId, VerificationArtifactType artifactType);
}
