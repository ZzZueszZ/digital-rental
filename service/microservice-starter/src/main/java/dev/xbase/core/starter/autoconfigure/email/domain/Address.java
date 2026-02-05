package dev.xbase.core.starter.autoconfigure.email.domain;

import lombok.NonNull;
import java.io.Serializable;

public record Address(@NonNull String name, @NonNull String email) implements Serializable {
    public static Address ofEmpty() {
        return new Address("", "");
    }
}
