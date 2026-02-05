package dev.xbase.controller.api.configurations.configuration;

import dev.xbase.controller.api.configurations.configuration.models.ConfigurationModelMapper;
import dev.xbase.core.model.ListResponse;
import dev.xbase.domain.configuration.CONFIGURATION_GROUP;
import dev.xbase.services.configurations.ConfigurationUseCaseService;
import jakarta.validation.Valid;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Slf4j
public class ConfigurationRestController implements ConfigurationAPI {
    @NonNull
    final ConfigurationUseCaseService configurationUseCaseService;
    @NonNull
    final ConfigurationModelMapper configurationModelMapper;

    @Override
    public ListResponse<ConfigurationResponse> getSettingInfo(@PathVariable("code") String code) {
        return new ListResponse<>(configurationModelMapper.toModel(
                configurationUseCaseService.getConfigurations(CONFIGURATION_GROUP.valueCodeOf(code)).list()));
    }

    @Override
    public void update(@Valid @RequestBody ConfigurationsRequest settingInfos, @PathVariable("code") String code) {
        configurationUseCaseService.update(settingInfos.to(), CONFIGURATION_GROUP.valueCodeOf(code));
    }
}
