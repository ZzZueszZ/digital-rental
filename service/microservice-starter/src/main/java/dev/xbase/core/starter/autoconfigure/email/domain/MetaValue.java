package dev.xbase.core.starter.autoconfigure.email.domain;

import lombok.NonNull;

public record MetaValue(@NonNull MetaType key, @NonNull String value) {
}
