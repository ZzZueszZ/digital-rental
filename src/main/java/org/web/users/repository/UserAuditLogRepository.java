package org.web.users.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.web.users.model.UserAuditLog;

@Repository
public interface UserAuditLogRepository extends JpaRepository<UserAuditLog, Long> {
}
