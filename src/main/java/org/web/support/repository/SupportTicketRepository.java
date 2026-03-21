package org.web.support.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.web.common.enums.SupportStatus;
import org.web.common.enums.SupportSubject;
import org.web.support.model.SupportTicket;

@Repository
public interface SupportTicketRepository extends JpaRepository<SupportTicket, Long> {

    @Query("SELECT s FROM SupportTicket s WHERE " +
            "(:subject IS NULL OR s.subject = :subject) AND " +
            "(:status IS NULL OR s.status = :status) AND " +
            "(:processedById IS NULL OR s.processedBy.id = :processedById) AND " +
            "(:keyword IS NULL OR :keyword = '' OR " +
            "   LOWER(s.name) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')) OR " +
            "   LOWER(s.email) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')) OR " +
            "   LOWER(s.phone) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')) " +
            ")")
    Page<SupportTicket> findAllWithFilters(
            @Param("subject") SupportSubject subject,
            @Param("status") SupportStatus status,
            @Param("processedById") Long processedById,
            @Param("keyword") String keyword,
            Pageable pageable
    );
}
