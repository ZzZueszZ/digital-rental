package dev.xbase.core.starter.database;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;

@Configuration
public class DataSourceConfig {
    @Bean
    @ConfigurationProperties("database.writer")
    @Primary
    public DataSourceProperties writerProperties() {
        return new DataSourceProperties();
    }

    @Bean
    @ConfigurationProperties("database.reader")
    public DataSourceProperties readerProperties() {
        return new DataSourceProperties();
    }

    private DataSource writer(DataSourceProperties writerProperties) {
        return writerProperties
                .initializeDataSourceBuilder()
                .type(HikariDataSource.class)
                .build();
    }

    private DataSource reader(DataSourceProperties readerProperties) {
        return readerProperties
                .initializeDataSourceBuilder()
                .type(HikariDataSource.class)
                .build();
    }

    @Bean
    @ConfigurationProperties("database.cp.hikari")
    public RoutingDataSource dataSource(
            @Qualifier("readerProperties") DataSourceProperties readerProperties,
            @Qualifier("writerProperties") DataSourceProperties writerProperties) {
        DataSource master = writer(writerProperties);
        DataSource readReplica = reader(readerProperties);
        return new RoutingDataSource(master, readReplica);
    }

    @Bean
    public RoutingDataSourceInterceptor routingDataSourceInterceptor() {
        return new RoutingDataSourceInterceptor();
    }
}

