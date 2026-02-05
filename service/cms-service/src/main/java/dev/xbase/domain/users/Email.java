package dev.xbase.domain.users;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.Objects;

@Data
@AllArgsConstructor
public class Email {
    String value;

    private Email() {
        this("");
    }

    public boolean isEmpty() {
        return Objects.isNull(value) || value.isEmpty();
    }

    public boolean hasValue() {
        return !isEmpty();
    }

    public String value() {
        return isEmpty() ? "" : value;
    }

    public String asText() {
        return value();
    }

    public static Email ofEmpty() {
        return new Email("");
    }
}
