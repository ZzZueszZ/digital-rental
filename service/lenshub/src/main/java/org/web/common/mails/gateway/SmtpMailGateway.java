package org.web.common.mails.gateway;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.FileSystemResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@ConditionalOnProperty(
        name = "app.mail.provider",
        havingValue = "smtp",
        matchIfMissing = true
)
public class SmtpMailGateway implements MailGateway {

    private final JavaMailSender mailSender;

    @Override
    public MailDeliveryResult send(MailMessage message) {
        try {
            var mimeMessage = mailSender.createMimeMessage();
            var helper = new MimeMessageHelper(
                    mimeMessage,
                    !message.attachments().isEmpty(),
                    "UTF-8"
            );
            helper.setFrom(message.from());
            helper.setTo(message.to());
            helper.setSubject(message.subject());

            if (message.text() == null || message.text().isBlank()) {
                helper.setText(message.html(), true);
            } else {
                helper.setText(message.text(), message.html());
            }

            for (MailAttachment attachment : message.attachments()) {
                var resource = new FileSystemResource(attachment.path());
                if (attachment.contentId() == null || attachment.contentId().isBlank()) {
                    helper.addAttachment(attachment.filename(), resource);
                } else {
                    helper.addInline(
                            attachment.contentId(),
                            resource,
                            attachment.contentType()
                    );
                }
            }

            mailSender.send(mimeMessage);
            return new MailDeliveryResult("smtp", null);
        } catch (Exception exception) {
            throw new MailDeliveryException("smtp", true, exception);
        }
    }
}
