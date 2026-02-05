package dev.xbase.core.model;

import lombok.NonNull;

import java.time.ZonedDateTime;

public record ClientTimeZone(@NonNull ZonedDateTime value) {
}
