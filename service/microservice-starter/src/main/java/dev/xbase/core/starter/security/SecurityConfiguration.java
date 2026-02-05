package dev.xbase.core.starter.security;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.header.writers.XXssProtectionHeaderWriter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.web.cors.CorsConfigurationSource;

import java.util.List;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
@Slf4j
public class SecurityConfiguration {
    private final CustomAuthenticationEntryPoint authEntryPoint;
    private final CustomAccessDeniedHandler customAccessDeniedHandler;

    @Autowired(required = false)
    private CorsConfigurationSource corsConfigurationSource;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, @Value("${permit-all:[]}") List<String> permitAll) throws Exception {

        permitAll.add("/pub/**");
        permitAll.add("/demo/{demo}");
        permitAll.add("/swagger-ui/**");
        permitAll.add("/api-docs.yaml");
        permitAll.add("/api-docs/**");
        permitAll.add("/error/**");
        permitAll.add("/actuator/**");
        permitAll.add("/favicon.ico");

        // Configure a resource server with JWT decoder (the customized jwtAuthenticationConverter is picked by Spring Boot)
        http.oauth2ResourceServer((oauth2) -> oauth2.jwt(withDefaults()));

        // State-less session (state in access-token only)
        http.sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        // Enable CORS - use custom bean if available, otherwise use default
        if (corsConfigurationSource != null) {
            http.cors(cors -> cors.configurationSource(corsConfigurationSource));
        } else {
            http.cors(withDefaults());
        }

        // Disable CSRF because of state-less session-management
        http.csrf(AbstractHttpConfigurer::disable);

        // Return 401 (unauthorized) instead of 302 (redirect to login) when
        // authorization is missing or invalid
        http.exceptionHandling(eh -> eh.authenticationEntryPoint(authEntryPoint)
                .accessDeniedHandler(customAccessDeniedHandler));

        // @formatter:off
        http.authorizeHttpRequests(requests -> requests
                // Allow CORS preflight requests
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers(permitAll.stream()
                        .map(AntPathRequestMatcher::new)
                        .toArray(AntPathRequestMatcher[]::new))
                .permitAll()
                .anyRequest().authenticated());
        // @formatter:on
        http.headers(headers ->
                headers.xssProtection(
                        xss -> xss.headerValue(XXssProtectionHeaderWriter.HeaderValue.ENABLED_MODE_BLOCK)
                ).contentSecurityPolicy(
                        cps -> cps.policyDirectives("script-src 'self'")
                ));
        return http.build();
    }
}
