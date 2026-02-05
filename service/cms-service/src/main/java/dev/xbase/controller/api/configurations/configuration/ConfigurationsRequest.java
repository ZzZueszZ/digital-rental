package dev.xbase.controller.api.configurations.configuration;

import dev.xbase.domain.configuration.Configuration;
import dev.xbase.domain.configuration.Configurations;

import java.util.List;
import java.util.stream.Collectors;

public record ConfigurationsRequest(List<ConfigurationRequest> settingInfos) {

    public Configurations to() {
        return new Configurations(settingInfos.stream()
                .map(configurationRequest -> new Configuration(configurationRequest.code(),
                        "",
                        "",
                        configurationRequest.value(),
                        false,
                        "",
                        ""))
                .collect(Collectors.toList()));
    }
}
