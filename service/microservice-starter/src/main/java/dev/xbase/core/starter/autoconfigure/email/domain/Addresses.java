package dev.xbase.core.starter.autoconfigure.email.domain;

import lombok.NonNull;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public record Addresses(@NonNull List<Address> list) implements Serializable {
    public static Addresses ofEmpty() {
        return new Addresses(new ArrayList<>());
    }

    @Override
    public List<Address> list() {
        return Collections.unmodifiableList(list);
    }

    public String[] toArray() {
        return this.list().stream()
                .map(email -> email.email())
                .toArray(String[]::new);
    }

    public boolean hasValue() {
        return list != null && !list.isEmpty();
    }

    public boolean isEmpty() {
        return list == null || list.isEmpty();
    }
}
