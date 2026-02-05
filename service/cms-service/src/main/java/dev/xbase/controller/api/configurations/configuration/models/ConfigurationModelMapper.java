package dev.xbase.controller.api.configurations.configuration.models;

import dev.xbase.controller.api.configurations.configuration.ConfigurationResponse;
import dev.xbase.domain.configuration.Configuration;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ConfigurationModelMapper {

    ConfigurationResponse toModel(Configuration entity);

    List<ConfigurationResponse> toModel(List<Configuration> entityList);
}
