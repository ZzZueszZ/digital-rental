package dev.xbase.controller.api.configurations.group;

import dev.xbase.controller.api.configurations.group.models.ConfigurationGroupModelMapper;
import dev.xbase.core.model.ListResponse;
import dev.xbase.services.configurations.ConfigurationUseCaseService;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Slf4j
public class ConfigurationGroupRestController implements ConfigurationGroupAPI {
    @NonNull
    final ConfigurationUseCaseService configurationUseCaseService;
    @NonNull
    final ConfigurationGroupModelMapper configurationGroupModelMapper;

    @Override
    public ListResponse<ConfigurationGroupResponse> groups() {
        return new ListResponse<>(configurationGroupModelMapper.toModel(configurationUseCaseService.getConfigurationGroups().list()));
    }
}
