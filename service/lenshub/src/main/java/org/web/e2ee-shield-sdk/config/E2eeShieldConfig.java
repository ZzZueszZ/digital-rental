package com.shield.spring_server.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.shield.spring_server.filter.E2eeShieldFilter;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class E2eeShieldConfig {

    @Bean
    public FilterRegistrationBean<E2eeShieldFilter> e2eeShieldFilter(ObjectMapper objectMapper) {
        FilterRegistrationBean<E2eeShieldFilter> bean =
                new FilterRegistrationBean<>();
        bean.setFilter(new E2eeShieldFilter(objectMapper));
        bean.addUrlPatterns("/api/*"); // áp dụng cho toàn bộ /api/**
        bean.setOrder(1); // chạy sớm
        return bean;
    }
}
