package dev.xbase.controller.api.configurations.group;

import dev.xbase.core.model.ListResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Tag(name = "Configurations")
@RequestMapping("/v1/api/configuration")
public interface ConfigurationGroupAPI {
    @GetMapping("groups")
    ListResponse<ConfigurationGroupResponse> groups();
}
