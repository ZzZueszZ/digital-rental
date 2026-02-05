package dev.xbase.domain.common;

import lombok.NonNull;

public record Offset(@NonNull Integer value) {
    @Override
    public Integer value() {
        return value;
    }

    public boolean isEmpty() {
        return value == Integer.MIN_VALUE;
    }

    public boolean hasValue() {
        return !isEmpty();
    }

    public String asText() {
        return isEmpty() ? "" : value.toString();
    }

    public static Offset ofEmpty() {
        return new Offset(Integer.MIN_VALUE);
    }
}
