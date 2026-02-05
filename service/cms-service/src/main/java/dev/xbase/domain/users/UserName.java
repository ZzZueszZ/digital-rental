package dev.xbase.domain.users;

import lombok.RequiredArgsConstructor;

import java.util.Objects;

@RequiredArgsConstructor
public class UserName {
    final String value;

    public boolean isEmpty() {
        return Objects.isNull(value) || value.isEmpty();
    }

    public boolean hasValue() {
        return !isEmpty();
    }

    public String value() {
        return Objects.isNull(value) ? "" : value;
    }

    public String asText() {
        return value();
    }

    public static UserName ofEmpty() {
        return new UserName("");
    }
}
