package dev.xbase.core.model.template;

import java.util.List;
import java.util.Objects;

public interface TemplateData {
    List<FieldItem> list();

    default boolean isEmpty() {
        return Objects.isNull(list());
    }
}
