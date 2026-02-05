package dev.xbase.core.model.template;

import lombok.NonNull;

public record FieldItem(@NonNull String code, @NonNull String value) {
    public static FieldItem of(String code, String value) {
        return new FieldItem(code, value);
    }

    public static FieldItem ofEmpty() {
        return new FieldItem("", "");
    }
}
