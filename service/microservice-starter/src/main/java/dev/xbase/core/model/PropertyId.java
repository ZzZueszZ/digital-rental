package dev.xbase.core.model;

import lombok.NonNull;

public record PropertyId(@NonNull String value) {
    public Integer castToInt() {
        try {
            return Integer.valueOf(value);
        } catch (NumberFormatException ex) {
            return Integer.MIN_VALUE;
        }
    }

    public Long castToLong() {
        try {
            return Long.valueOf(value);
        } catch (NumberFormatException ex) {
            return Long.MIN_VALUE;
        }
    }
}
