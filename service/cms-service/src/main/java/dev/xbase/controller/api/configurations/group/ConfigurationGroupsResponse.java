package dev.xbase.controller.api.configurations.group;

import lombok.NonNull;
import dev.xbase.domain.configuration.ConfigurationGroups;

import java.util.List;
import java.util.stream.Collectors;

public record ConfigurationGroupsResponse(@NonNull List<ConfigurationGroupResponse> data) {
    public static ConfigurationGroupsResponse of(ConfigurationGroups configurationGroups) {
        return new ConfigurationGroupsResponse(configurationGroups.list()
                .stream()
                .map(ConfigurationGroupResponse::of)
                .collect(Collectors.toList()));
    }
}
