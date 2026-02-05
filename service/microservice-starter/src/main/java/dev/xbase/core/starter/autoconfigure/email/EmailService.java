package dev.xbase.core.starter.autoconfigure.email;

import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import dev.xbase.core.starter.autoconfigure.email.domain.PrepareEmail;

@Service
@Slf4j
@RequiredArgsConstructor
@ConditionalOnProperty(value = "app.module.email.enabled", havingValue = "true")
public class EmailService {
    @NonNull
    final ApplicationEventPublisher publisher;

    public void send(PrepareEmail prepareEmail) {
        publisher.publishEvent(prepareEmail);
    }
}
