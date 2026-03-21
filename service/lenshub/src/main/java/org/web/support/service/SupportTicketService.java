package org.web.support.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.web.common.enums.SupportStatus;
import org.web.common.enums.SupportSubject;
import org.web.support.dto.request.SupportTicketReplyRequest;
import org.web.support.dto.request.SupportTicketRequest;
import org.web.support.dto.response.SupportTicketResponse;

public interface SupportTicketService {

    void submitTicket(SupportTicketRequest request);

    Page<SupportTicketResponse> getAllTickets(SupportSubject subject, SupportStatus status, Long processedById, String keyword, Pageable pageable);

    SupportTicketResponse getTicketById(Long id);

    void updateTicketStatus(Long id, SupportStatus status);

    void replyTicket(Long ticketId, SupportTicketReplyRequest request);
}
