package dev.xbase.controller.api.configurations.configuration;

import dev.xbase.core.model.ListResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

@Tag(name = "Configurations")
@RequestMapping("/v1/api/configuration")
public interface ConfigurationAPI {
    @GetMapping("{code}")
    ListResponse<ConfigurationResponse> getSettingInfo(@PathVariable("code") String code);

    @PostMapping("{code}/update")
    void update(@Valid @RequestBody ConfigurationsRequest settingInfos, @PathVariable("code") String code);
}
