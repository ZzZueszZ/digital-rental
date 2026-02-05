package dev.xbase.core.model.upload;

import lombok.NonNull;

public record Path(@NonNull String value) {
    public static Path ofEmpty() {
        return new Path("");
    }
}
