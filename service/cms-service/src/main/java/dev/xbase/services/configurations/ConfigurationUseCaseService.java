package dev.xbase.services.configurations;

import dev.xbase.domain.configuration.CONFIGURATION_GROUP;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import dev.xbase.domain.configuration.ConfigurationGroups;
import dev.xbase.domain.configuration.Configurations;

@Service
@RequiredArgsConstructor
public class ConfigurationUseCaseService {

    @NonNull final ConfigurationQueryService queryService;
    @NonNull final ConfigurationCommandService commandService;

    public Configurations getConfigurations(CONFIGURATION_GROUP code) {
        return queryService.getConfigurations(code);
    }

    public void update(Configurations configurations, CONFIGURATION_GROUP code) {
        commandService.update(configurations, code);
    }

    public ConfigurationGroups getConfigurationGroups() {
        return queryService.getConfigurationGroups();
    }
}
