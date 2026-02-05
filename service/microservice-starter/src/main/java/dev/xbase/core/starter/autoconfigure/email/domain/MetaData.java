package dev.xbase.core.starter.autoconfigure.email.domain;

import lombok.NonNull;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public record MetaData(@NonNull List<MetaValue> list) {
    public static MetaData ofEmpty() {
        return new MetaData(new ArrayList<>());
    }

    public Optional<MetaValue> get(MetaType metaType) {
        return list.stream()
                .filter(metaValue -> metaValue.key() == metaType)
                .findFirst();
    }
}
