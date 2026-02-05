package dev.xbase.repository.database.configurations;

import dev.xbase.domain.configuration.Configuration;
import org.mapstruct.Mapper;
import dev.xbase.core.model.mapper.EntityMapper;

@Mapper(componentModel = "spring")
public interface ConfigurationMapper extends EntityMapper<Configuration, ConfigurationEntity> {
}
