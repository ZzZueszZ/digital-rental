package dev.xbase.domain.users;

import lombok.NonNull;
import lombok.RequiredArgsConstructor;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

@RequiredArgsConstructor
public class Statuses {
    final @NonNull List<Status> list;

    public static Statuses of(String[] status) {
        if (Objects.isNull(status)) return Statuses.ofEmpty();
        return new Statuses(Arrays.stream(status).map(s -> new Status(StatusType.valueOf(s), "")).toList());
    }

    public List<Status> list() {
        return Collections.unmodifiableList(list);
    }

    public static Statuses ofEmpty() {
        return new Statuses(Collections.emptyList());
    }

    public boolean hasValue() {
        return !list.isEmpty();
    }
}
