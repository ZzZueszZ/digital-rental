package dev.xbase.domain.configuration;

import java.util.Collections;
import java.util.List;

public record Configurations(List<Configuration> list) {
    @Override
    public List<Configuration> list() {
        return Collections.unmodifiableList(list);
    }

    public String getSettingValue(String code, String defaultMessage) {
        return list.stream()
                .filter(configuration -> configuration.code().equals(code))
                .map(Configuration::value)
                .findAny()
                .orElse(defaultMessage);
    }
}
