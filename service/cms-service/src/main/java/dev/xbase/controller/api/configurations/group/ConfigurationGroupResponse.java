package dev.xbase.controller.api.configurations.group;

import lombok.NonNull;
import dev.xbase.domain.configuration.ConfigurationGroup;

public record ConfigurationGroupResponse(@NonNull String code,
                                         @NonNull String name,
                                         @NonNull Integer displayOrder) {
    public static ConfigurationGroupResponse of(ConfigurationGroup configGroup) {
        return new ConfigurationGroupResponse(configGroup.code(), configGroup.name(), configGroup.displayOrder());
    }
}
