package dev.xbase.core.starter.autoconfigure.email.domain;

import java.io.Serializable;
import java.util.Objects;

public record EmailSubject(String value) implements Serializable {
    public static EmailSubject ofEmpty() {
        return new EmailSubject("");
    }

    public boolean isEmpty() {
        return Objects.isNull(value) || value.isEmpty();
    }

    public boolean hasValue() {
        return !isEmpty();
    }

    public String value() {
        return isEmpty() ? "" : value;
    }

    public String asText() {
        return value();
    }
}
