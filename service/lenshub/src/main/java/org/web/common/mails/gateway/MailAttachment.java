package org.web.common.mails.gateway;

import java.nio.file.Path;
import java.util.Objects;

public record MailAttachment(
        String filename,
        String contentType,
        String contentId,
        Path path
) {
    public MailAttachment {
        Objects.requireNonNull(filename, "filename");
        Objects.requireNonNull(path, "path");
        if (contentId != null && !contentId.isBlank()
                && (contentType == null || contentType.isBlank())) {
            throw new IllegalArgumentException(
                    "contentType is required for inline attachments"
            );
        }
    }
}
