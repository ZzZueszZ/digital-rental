package dev.xbase.core;

import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import org.springframework.context.annotation.PropertySources;
import org.springframework.core.env.Environment;

import java.util.Arrays;

@Configuration
@RequiredArgsConstructor
@PropertySources({
    @PropertySource("classpath:microservice-starter-init.properties")
})
@ComponentScan(basePackages = {"dev.xbase.core"})
public class AppConfiguration {
    @NonNull
    final Environment env;

    @Bean
    public String appEnvironment() {
        if (Arrays.asList(env.getActiveProfiles()).contains("production")) {
            return "";
        }
        if (env.getActiveProfiles().length == 0) return "[develop]";
        return String.format("[%s]", String.join(",", env.getActiveProfiles()));
    }
}

