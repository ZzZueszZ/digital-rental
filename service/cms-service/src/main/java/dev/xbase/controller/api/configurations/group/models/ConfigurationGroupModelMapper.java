package dev.xbase.controller.api.configurations.group.models;

import dev.xbase.controller.api.configurations.group.ConfigurationGroupResponse;
import dev.xbase.domain.configuration.ConfigurationGroup;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ConfigurationGroupModelMapper {

    ConfigurationGroupResponse toModel(ConfigurationGroup entity);

    List<ConfigurationGroupResponse> toModel(List<ConfigurationGroup> entityList);
}
