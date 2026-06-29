package org.web.common.mails.gateway;

import java.io.IOException;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

final class ResendPayloadFactory {

    private final long maxAttachmentBytes;

    ResendPayloadFactory(long maxAttachmentBytes) {
        this.maxAttachmentBytes = maxAttachmentBytes;
    }

    Map<String, Object> create(MailMessage message) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("from", message.from());
        payload.put("to", List.of(message.to()));
        payload.put("subject", message.subject());
        payload.put("html", message.html());
        if (message.text() != null && !message.text().isBlank()) {
            payload.put("text", message.text());
        }
        if (!message.attachments().isEmpty()) {
            payload.put("attachments", attachments(message.attachments()));
        }
        return payload;
    }

    private List<Map<String, Object>> attachments(List<MailAttachment> attachments) {
        long totalBytes = 0;
        List<Map<String, Object>> payload = new ArrayList<>();
        try {
            for (MailAttachment attachment : attachments) {
                totalBytes = Math.addExact(totalBytes, Files.size(attachment.path()));
                if (totalBytes > maxAttachmentBytes) {
                    throw failure("Email attachments exceed configured size limit");
                }

                Map<String, Object> item = new LinkedHashMap<>();
                item.put("filename", attachment.filename());
                item.put(
                        "content",
                        Base64.getEncoder().encodeToString(Files.readAllBytes(attachment.path()))
                );
                if (attachment.contentId() != null && !attachment.contentId().isBlank()) {
                    item.put("content_id", attachment.contentId());
                }
                payload.add(item);
            }
            return payload;
        } catch (IOException | ArithmeticException exception) {
            throw failure("Email attachment could not be prepared");
        }
    }

    private MailDeliveryException failure(String reason) {
        return new MailDeliveryException(
                "resend",
                false,
                new IllegalStateException(reason)
        );
    }
}
