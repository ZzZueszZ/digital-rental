package org.web.common.mails.gateway;

import java.util.List;
import java.util.Objects;

public record MailMessage(
        String from,
        String to,
        String subject,
        String html,
        String text,
        List<MailAttachment> attachments,
        MailCategory category,
        String idempotencyKey
) {
    public MailMessage {
        Objects.requireNonNull(from, "from");
        Objects.requireNonNull(to, "to");
        Objects.requireNonNull(subject, "subject");
        Objects.requireNonNull(html, "html");
        Objects.requireNonNull(category, "category");
        attachments = attachments == null ? List.of() : List.copyOf(attachments);
    }
}
