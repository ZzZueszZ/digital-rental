package dev.xbase.core.starter.autoconfigure.email;

import dev.xbase.core.starter.autoconfigure.email.domain.MailStatus;
import dev.xbase.core.starter.autoconfigure.email.domain.PrepareEmail;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(value = "app.module.email.enabled", havingValue = "true")
public class EmailSendUseCaseListener {

    @NonNull
    final MailTransfer mailTransfer;
    @NonNull
    final EmailModuleProperties emailModuleProperties;

    @Async
    @EventListener
    public void on(PrepareEmail mail) {
        MailStatus mailStatus = mailTransfer.send(mail, emailModuleProperties);
        log.info("Send mail: {}", mailStatus.name());
    }
}

