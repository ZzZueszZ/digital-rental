package org.web.e2ee.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.web.e2ee.filter.E2eeShieldFilter;

@Configuration
@ConditionalOnProperty(name = "app.e2ee.enabled", havingValue = "true")
public class E2eeShieldConfig {

    @Bean
    public FilterRegistrationBean<E2eeShieldFilter> e2eeShieldFilter(ObjectMapper objectMapper) {
        FilterRegistrationBean<E2eeShieldFilter> bean = new FilterRegistrationBean<>();
        bean.setFilter(new E2eeShieldFilter(objectMapper));
        bean.addUrlPatterns(
                "/auth/*",
                "/ekyc/*",
                "/profile",
                "/addresses",
                "/addresses/*",
                "/orders/*",
                "/rentals/*",
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
