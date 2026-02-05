package dev.xbase.repository.database.configurations;

import org.mapstruct.Mapper;
import dev.xbase.core.model.mapper.EntityMapper;
import dev.xbase.domain.configuration.ConfigurationGroup;

@Mapper(componentModel = "spring")
public interface ConfigurationGroupMapper extends EntityMapper<ConfigurationGroup, ConfigurationGroupEntity> {
}
