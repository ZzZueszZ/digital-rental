package dev.xbase.services.configurations;

import dev.xbase.domain.configuration.CONFIGURATION_GROUP;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import dev.xbase.domain.configuration.Configurations;

@Service
@RequiredArgsConstructor
public class ConfigurationCommandService {
    public void update(Configurations settings, CONFIGURATION_GROUP code) {
    }
}
