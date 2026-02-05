package dev.xbase.domain.common;

import lombok.RequiredArgsConstructor;

import java.util.Objects;

@RequiredArgsConstructor
public class PageSize {
    final Integer value;

    public PageSize(String value) {
        this.value = Objects.isNull(value) ? null : Integer.valueOf(value);
    }

    public boolean isEmpty() {
        return Objects.isNull(value) || value == 0;
    }

    public boolean hasValue() {
        return !isEmpty();
    }
    public Integer value() {
        return Objects.isNull(value) ? 1 : value;
    }

    public String asText() {
        return Objects.isNull(value) ? "" : value.toString();
    }

    public static PageSize ofEmpty() {
        return new PageSize(0);
    }
}
