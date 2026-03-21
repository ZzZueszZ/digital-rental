package org.web.support.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SupportTicketReplyRequest {

    @NotBlank(message = "Replay message is required")
    private String replyMessage;

    private String internalNote;

    private boolean markAsResolved = true;
}
