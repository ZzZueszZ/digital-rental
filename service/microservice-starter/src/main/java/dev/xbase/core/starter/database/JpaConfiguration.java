package dev.xbase.core.starter.database;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@Configuration
@EnableJpaRepositories(value = "dev.xbase.repository.database")
@EnableJpaAuditing(auditorAwareRef = "auditorAware")
public class JpaConfiguration {
    @Bean
    public AuditorAware<Integer> auditorAware() {
        return new AuditorAwareImpl();
    }
}
