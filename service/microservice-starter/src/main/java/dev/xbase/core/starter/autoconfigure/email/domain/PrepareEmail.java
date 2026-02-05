package dev.xbase.core.starter.autoconfigure.email.domain;

import lombok.Builder;
import lombok.NonNull;

import java.io.Serializable;

@Builder
public record PrepareEmail(@NonNull Address from,
                           @NonNull Addresses tos,
                           @NonNull Addresses ccs,
                           @NonNull Addresses bccs,
                           @NonNull EmailSubject subject,
                           @NonNull EmailBody body,
                           @NonNull EmailBodyType type,
                           @NonNull EmailAttachments attachments,
                           @NonNull MetaData metaData) implements Serializable {
    public static PrepareEmail ofEmpty() {
        return PrepareEmail.builder()
                .from(Address.ofEmpty())
                .tos(Addresses.ofEmpty())
                .ccs(Addresses.ofEmpty())
                .bccs(Addresses.ofEmpty())
                .subject(EmailSubject.ofEmpty())
                .body(EmailBody.ofEmpty())
                .type(EmailBodyType.Text)
                .attachments(EmailAttachments.ofEmpty())
                .metaData(MetaData.ofEmpty())
                .build();
    }
}
