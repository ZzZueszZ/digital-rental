package dev.xbase.core.starter.autoconfigure.async;

import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.aop.interceptor.AsyncUncaughtExceptionHandler;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.task.TaskExecutor;
import org.springframework.scheduling.annotation.AsyncConfigurer;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

@Configuration
@EnableAsync
@RequiredArgsConstructor
@EnableConfigurationProperties(AppAsyncProperties.class)
public class AsyncModuleConfiguration implements AsyncConfigurer {
    @NonNull
    final AppAsyncProperties appAsyncProperties;

    @Bean
    TaskExecutor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(appAsyncProperties.getPoolSize());
        executor.setMaxPoolSize(appAsyncProperties.getMaxPoolSize());
        executor.setQueueCapacity(appAsyncProperties.getQueueCapacity());
        executor.setThreadNamePrefix(appAsyncProperties.getThreadNamePrefix());
        executor.initialize();
        return executor;
    }

    @Override
    public AsyncUncaughtExceptionHandler getAsyncUncaughtExceptionHandler() {
        return new AsyncExceptionHandler();
    }
}
