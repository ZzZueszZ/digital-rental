package dev.xbase.controller.api.configurations.configuration;

import dev.xbase.domain.configuration.Configurations;

import java.util.List;
import java.util.stream.Collectors;

public record ConfigurationsResponse(List<ConfigurationResponse> data) {
    public static ConfigurationsResponse of(Configurations configurations) {
        return new ConfigurationsResponse(configurations.list()
                .stream()
                .map(ConfigurationResponse::of)
                .collect(Collectors.toList()));
    }
}
