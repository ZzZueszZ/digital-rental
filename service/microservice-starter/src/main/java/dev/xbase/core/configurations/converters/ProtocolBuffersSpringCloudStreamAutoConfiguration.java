package dev.xbase.core.configurations.converters;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.converter.MessageConverter;

@Configuration
public class ProtocolBuffersSpringCloudStreamAutoConfiguration {
    @Bean
    public MessageConverter protobufMessageConverter() {
        return new EventProtobufMessageConverter();
    }
}
