package dev.xbase.core.starter.database;

import dev.xbase.core.constants.RequestAttributeConfig;
import dev.xbase.core.model.CurrentRequest;
import jakarta.persistence.PostLoad;
import jakarta.persistence.PostPersist;
import jakarta.persistence.PostRemove;
import jakarta.persistence.PostUpdate;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreRemove;
import jakarta.persistence.PreUpdate;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;

import java.util.Objects;

@Slf4j
public class BaseEntityListener<T> {
    @PrePersist
    @PreUpdate
    @PreRemove
    private void beforeAnyUpdate(Auditable auditable) {
        log.info("[USER AUDIT] add/update/delete update");
        CurrentRequest currentRequest = (CurrentRequest) RequestContextHolder.currentRequestAttributes()
                .getAttribute(RequestAttributeConfig.CurrentRequest.name(), RequestAttributes.SCOPE_REQUEST);
        auditable.setCreatedProgram(Objects.requireNonNull(currentRequest).createProgram().asText());
    }
    @PostPersist
    @PostUpdate
    @PostRemove
    private void afterAnyUpdate(Auditable auditable) {
        log.info("[USER AUDIT] add/update/delete complete");
    }
    @PostLoad
    private void afterLoad(Auditable auditable) {
        log.info("[USER AUDIT] user loaded from database: ");
    }
}
