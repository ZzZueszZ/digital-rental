package dev.xbase.core.starter.autoconfigure.email;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.mail.javamail.MimeMessagePreparator;
import org.springframework.stereotype.Service;
import dev.xbase.core.starter.autoconfigure.email.domain.MailStatus;
import dev.xbase.core.starter.autoconfigure.email.domain.PrepareEmail;

import java.util.Properties;

@Service
@Slf4j
@ConditionalOnProperty(value = "app.module.email.enabled", havingValue = "true")
public class MailTransfer {
    public MailStatus send(PrepareEmail mail, EmailModuleProperties emailModuleProperties) {
        try {
           return sendEmail(mail, emailModuleProperties);
        } catch (Exception ex) {
            log.error(ex.getMessage(), ex);
        }
        return MailStatus.SENT_FAIL;
    }

    public MailStatus sendEmail(PrepareEmail prepareEmail, EmailModuleProperties emailModuleProperties) throws MailException {
        JavaMailSender mailSender = getJavaMailSender(emailModuleProperties);
        MimeMessagePreparator messagePrepare = mimeMessage -> {
            MimeMessageHelper messageHelper = new MimeMessageHelper(mimeMessage, "UTF-8");

            messageHelper.setFrom(emailModuleProperties.getMailFrom(), emailModuleProperties.getMailFromName());
            messageHelper.setTo(prepareEmail.tos().toArray());
            messageHelper.setSubject(prepareEmail.subject().asText());
            messageHelper.setText(prepareEmail.body().asText(), prepareEmail.type().isHtml());
        };
        mailSender.send(messagePrepare);
        return MailStatus.SENT_OK;
    }

    private JavaMailSender getJavaMailSender(EmailModuleProperties emailModuleProperties) {
        log.debug(emailModuleProperties.toString());
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost(emailModuleProperties.getSmtpHost());
        mailSender.setPort(emailModuleProperties.getSmtpPort());

        mailSender.setUsername(emailModuleProperties.getSmtpUsername());
        mailSender.setPassword(emailModuleProperties.getSmtpPassword());

        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", emailModuleProperties.getSmtpAuth());
        props.put("mail.smtp.starttls.enable", emailModuleProperties.getSmtpStarttls());
        props.put("mail.smtp.starttls.trust", emailModuleProperties.getSmtpHost());
        props.put("mail.smtp.ssl.trust", emailModuleProperties.getSmtpHost());
        if(!emailModuleProperties.getSmtpProtocols().equals("No")){
            props.put("mail.smtp.ssl.protocols", emailModuleProperties.getSmtpProtocols());
        }
        props.put("mail.smtp.ssl.enable", "false");
        props.put("mail.debug", emailModuleProperties.isDebug() ? "true" : "false");

        return mailSender;
    }
}
