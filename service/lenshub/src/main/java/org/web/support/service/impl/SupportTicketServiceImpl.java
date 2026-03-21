package org.web.support.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.web.common.enums.SupportStatus;
import org.web.common.enums.SupportSubject;
import org.web.common.exceptions.ApplicationException;
import org.web.common.mails.MailService;
import org.web.support.dto.request.SupportTicketReplyRequest;
import org.web.support.dto.request.SupportTicketRequest;
import org.web.support.dto.response.SupportTicketResponse;
import org.web.support.model.SupportTicket;
import org.web.support.repository.SupportTicketRepository;
import org.web.support.service.SupportTicketService;
import org.web.users.model.User;
import org.web.users.repository.UserRepository;
import org.web.users.repository.UserProfileRepository;
import org.web.users.model.UserProfile;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class SupportTicketServiceImpl implements SupportTicketService {

    private final SupportTicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final MailService mailService;

    @Override
    @Transactional
    public void submitTicket(SupportTicketRequest request) {
        SupportTicket ticket = SupportTicket.builder()
                .name(request.getName())
                .phone(request.getPhone())
                .email(request.getEmail())
                .subject(request.getSubject())
                .message(request.getMessage())
                .status(SupportStatus.PENDING)
                .build();
        ticketRepository.save(ticket);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SupportTicketResponse> getAllTickets(SupportSubject subject, SupportStatus status, Long processedById, String keyword, Pageable pageable) {
        return ticketRepository.findAllWithFilters(subject, status, processedById, keyword, pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public SupportTicketResponse getTicketById(Long id) {
        SupportTicket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Không tìm thấy yêu cầu hỗ trợ"));
        return mapToResponse(ticket);
    }

    @Override
    @Transactional
    public void updateTicketStatus(Long id, SupportStatus status) {
        SupportTicket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Không tìm thấy yêu cầu hỗ trợ"));

        ticket.setStatus(status);
        if (status == SupportStatus.RESOLVED) {
            ticket.setResolvedAt(LocalDateTime.now());
        }

        setProcessor(ticket);

        ticketRepository.save(ticket);
    }

    @Override
    @Transactional
    public void replyTicket(Long ticketId, SupportTicketReplyRequest request) {
        SupportTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Support ticket not found"));

        ticket.setReplyMessage(request.getReplyMessage());
        ticket.setInternalNote(request.getInternalNote());

        if (request.isMarkAsResolved()) {
            ticket.setStatus(SupportStatus.RESOLVED);
            ticket.setResolvedAt(LocalDateTime.now());
        }

        setProcessor(ticket);

        ticketRepository.save(ticket);

        if (request.getReplyMessage() != null && !request.getReplyMessage().isBlank()) {
            mailService.sendSupportReplyEmail(ticket, request.getReplyMessage());
        }
    }

    private void setProcessor(SupportTicket ticket) {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String email = principal instanceof String ? (String) principal : null;
        if (email != null) {
            userRepository.findByEmail(email).ifPresent(ticket::setProcessedBy);
        }
    }

    private SupportTicketResponse mapToResponse(SupportTicket ticket) {
        SupportTicketResponse response = SupportTicketResponse.builder()
                .id(ticket.getId())
                .name(ticket.getName())
                .phone(ticket.getPhone())
                .email(ticket.getEmail())
                .subject(ticket.getSubject())
                .message(ticket.getMessage())
                .status(ticket.getStatus())
                .internalNote(ticket.getInternalNote())
                .replyMessage(ticket.getReplyMessage())
                .resolvedAt(ticket.getResolvedAt())
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .build();

        if (ticket.getProcessedBy() != null) {
            response.setProcessedById(ticket.getProcessedBy().getId());
            
            UserProfile profile = userProfileRepository.findById(ticket.getProcessedBy().getId()).orElse(null);
            if (profile != null) {
                response.setProcessedByName(profile.getFullName());
            } else {
                response.setProcessedByName(ticket.getProcessedBy().getEmail());
            }
        }

        return response;
    }
}
