package dev.xbase.core.starter.autoconfigure.redis;

import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;
import org.springframework.boot.autoconfigure.cache.RedisCacheManagerBuilderCustomizer;
import org.springframework.boot.autoconfigure.data.redis.RedisProperties;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.repository.configuration.EnableRedisRepositories;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;

import java.time.Duration;
import java.time.format.DateTimeFormatter;

@Configuration
@EnableCaching
@EnableRedisRepositories(basePackages = {"dev.xbase.core.repository.redis",
        "dev.xbase.app.repository.redis",
        "dev.xbase.features.**.repository.redis",
})
public class RedisConfiguration {
    final String DATETIME_FORMAT = "yyyy-MM-dd'T'HH:mm:ss'Z'";
    final LocalDateTimeSerializer LOCAL_DATETIME_SERIALIZER =
            new LocalDateTimeSerializer(DateTimeFormatter.ofPattern(DATETIME_FORMAT));

    @Bean
    public LettuceConnectionFactory redisConnectionFactory() {
        RedisProperties properties = redisProperties();
        RedisStandaloneConfiguration configuration = new RedisStandaloneConfiguration();

        configuration.setHostName(properties.getHost());
        configuration.setPort(properties.getPort());

        return new LettuceConnectionFactory(configuration);
    }

    @Bean
    public RedisTemplate<byte[], byte[]> redisTemplate() {
        RedisTemplate<byte[], byte[]> template = new RedisTemplate<>();

        template.setConnectionFactory(redisConnectionFactory());

        return template;
    }

    @Bean
    @Primary
    public RedisProperties redisProperties() {
        return new RedisProperties();
    }

    @Bean
    public RedisCacheManagerBuilderCustomizer redisCacheManagerBuilderCustomizer() {
        RedisSerializationContext.SerializationPair<Object> jsonSerializer =
                RedisSerializationContext.SerializationPair.fromSerializer(new GenericJackson2JsonRedisSerializer());

        return (builder) -> builder
                .cacheDefaults(
                        RedisCacheConfiguration.defaultCacheConfig()
                                .entryTtl(Duration.ofMinutes(30))
                )
                .withCacheConfiguration("serialCache30s",
                        RedisCacheConfiguration.defaultCacheConfig()
                                .entryTtl(Duration.ofSeconds(30)))
                .withCacheConfiguration("serialCacheOneMinutes",
                        RedisCacheConfiguration.defaultCacheConfig()
                                .entryTtl(Duration.ofMinutes(1)))
                .withCacheConfiguration("serialCacheFiveMinutes",
                        RedisCacheConfiguration.defaultCacheConfig()
                                .entryTtl(Duration.ofMinutes(5)))
                .withCacheConfiguration("serialCacheTenMinutes",
                        RedisCacheConfiguration.defaultCacheConfig()
                                .entryTtl(Duration.ofMinutes(10)))
                .withCacheConfiguration("jsonCacheTenMinutes",
                        RedisCacheConfiguration.defaultCacheConfig()
                                .serializeValuesWith(jsonSerializer)
                                .entryTtl(Duration.ofMinutes(10)))
                .withCacheConfiguration("jsonCacheFiveMinutes",
                        RedisCacheConfiguration.defaultCacheConfig()
                                .serializeValuesWith(jsonSerializer)
                                .entryTtl(Duration.ofMinutes(5)))
                .withCacheConfiguration("jsonCacheTwoMinutes",
                        RedisCacheConfiguration.defaultCacheConfig()
                                .serializeValuesWith(jsonSerializer)
                                .entryTtl(Duration.ofMinutes(2)))
                .withCacheConfiguration("jsonCacheOneMinutes",
                        RedisCacheConfiguration.defaultCacheConfig()
                                .serializeValuesWith(jsonSerializer)
                                .entryTtl(Duration.ofMinutes(1)))
                .withCacheConfiguration("jsonCache30s",
                        RedisCacheConfiguration.defaultCacheConfig()
                                .serializeValuesWith(jsonSerializer)
                                .entryTtl(Duration.ofSeconds(30)));
    }
}
