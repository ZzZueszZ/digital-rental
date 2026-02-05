package dev.xbase.controller.api.configurations.configuration;

import dev.xbase.domain.configuration.Configuration;

public record ConfigurationResponse(String code,
                                    String name,
                                    String type,
                                    String value,
                                    Boolean required,
                                    String description,
                                    String options) {
    public static ConfigurationResponse of(Configuration configuration) {
        return new ConfigurationResponse(configuration.code(),
                configuration.name(),
                configuration.type(),
                configuration.value(),
                configuration.required(),
                configuration.description(),
                configuration.options());
    }
}
