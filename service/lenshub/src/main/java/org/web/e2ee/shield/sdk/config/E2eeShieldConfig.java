package org.web.e2ee.shield.sdk.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.web.e2ee.shield.sdk.filter.E2eeShieldFilter;
import org.web.e2ee.shield.sdk.security.SessionKeyStore;

@Configuration
@ConditionalOnProperty(name = "app.e2ee.enabled", havingValue = "true")
public class E2eeShieldConfig {

    @Bean
    public FilterRegistrationBean<E2eeShieldFilter> e2eeShieldFilter(
            ObjectMapper objectMapper,
            SessionKeyStore sessionKeyStore
    ) {
        FilterRegistrationBean<E2eeShieldFilter> bean = new FilterRegistrationBean<>();
        bean.setFilter(new E2eeShieldFilter(objectMapper, sessionKeyStore));
        bean.addUrlPatterns(
                "/auth/*",
                "/ekyc/*",
                "/admin/ekyc/*",
                "/profile",
                "/addresses",
                "/addresses/*",
                "/orders/*",
                "/rentals/*",
                "/payments/*",
                "/support/*",
                "/admin/support/*",
                "/inventory/*",
                "/users",
                "/users/*",
                "/roles",
                "/roles/*",
                "/permissions",
                "/permissions/*"
        );
        bean.setOrder(1);
        return bean;
    }
}
