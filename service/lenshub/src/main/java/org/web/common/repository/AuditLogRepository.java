package org.web.common.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.web.common.model.AuditLog;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    Page<AuditLog> findByTargetType(String targetType, Pageable pageable);
    Page<AuditLog> findByTargetId(Long targetId, Pageable pageable);
    Page<AuditLog> findByActorUserId(Long actorUserId, Pageable pageable);
}
