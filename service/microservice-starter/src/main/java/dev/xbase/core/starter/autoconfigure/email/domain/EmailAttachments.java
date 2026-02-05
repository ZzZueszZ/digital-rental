package dev.xbase.core.starter.autoconfigure.email.domain;

import java.io.Serializable;

public class EmailAttachments implements Serializable {
    public static EmailAttachments ofEmpty() {
        return new EmailAttachments();
    }
}
