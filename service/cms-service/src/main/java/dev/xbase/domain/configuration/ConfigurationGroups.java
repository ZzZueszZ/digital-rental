package dev.xbase.domain.configuration;

import java.util.Collections;
import java.util.List;

public record ConfigurationGroups(List<ConfigurationGroup> list) {
    @Override
    public List<ConfigurationGroup> list() {
        return Collections.unmodifiableList(list);
    }
}
