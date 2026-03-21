package org.web.support.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.web.common.enums.SupportStatus;
import org.web.common.enums.SupportSubject;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class SupportTicketResponse {

    private Long id;
    private String name;
    private String phone;
    private String email;
    private SupportSubject subject;
    private String message;
    private SupportStatus status;
    private String internalNote;
    private String replyMessage;
    private LocalDateTime resolvedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Processor Info
    private Long processedById;
    private String processedByName;
}
