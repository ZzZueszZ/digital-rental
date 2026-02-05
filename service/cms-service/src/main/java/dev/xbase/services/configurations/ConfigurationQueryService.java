package dev.xbase.services.configurations;

import dev.xbase.domain.configuration.CONFIGURATION_GROUP;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import dev.xbase.domain.configuration.ConfigurationGroups;
import dev.xbase.domain.configuration.Configurations;
import dev.xbase.repository.database.configurations.ConfigurationEntity;
import dev.xbase.repository.database.configurations.ConfigurationGroupEntity;
import dev.xbase.repository.database.configurations.ConfigurationGroupMapper;
import dev.xbase.repository.database.configurations.ConfigurationGroupRepository;
import dev.xbase.repository.database.configurations.ConfigurationMapper;
import dev.xbase.repository.database.configurations.ConfigurationRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ConfigurationQueryService {
    @NonNull
    final ConfigurationRepository configurationRepository;
    @NonNull
    final ConfigurationGroupRepository configurationGroupRepository;
    @NonNull
    final ConfigurationMapper configurationMapper;
    @NonNull
    final ConfigurationGroupMapper configurationGroupMapper;

    public Configurations getConfigurations(CONFIGURATION_GROUP configurationGroup) {
        List<ConfigurationEntity> configurationList = configurationRepository.findAllByGroup(configurationGroup.getCode());
        return new Configurations(configurationMapper.toDto(configurationList));
    }

    public ConfigurationGroups getConfigurationGroups() {
        List<ConfigurationGroupEntity> configurationGroupList =
                configurationGroupRepository.findAll(Sort.by(Sort.Direction.ASC, "displayOrder"));

        return new ConfigurationGroups(configurationGroupMapper.toDto(configurationGroupList));
    }
}
