package dev.xbase.core.model.upload;

import java.util.Objects;

public record Url(String value) {

    public static Url ofEmpty() {
        return new Url("");
    }

    public boolean isEmpty() {
        return Objects.isNull(value) || value.isEmpty();
    }
}
