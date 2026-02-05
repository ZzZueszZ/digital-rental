package dev.xbase.core.starter.database;

import org.springframework.jdbc.datasource.lookup.AbstractRoutingDataSource;

import javax.sql.DataSource;
import java.util.Map;

//TODO: add attributes of Hikari CP to be injected its parameters
public class RoutingDataSource extends AbstractRoutingDataSource {
    private static final ThreadLocal<DataBaseType> type = new ThreadLocal<>();

    public RoutingDataSource(DataSource master, DataSource readReplica) {
        Map<Object, Object> targetDataSources = Map.of(
                DataBaseType.MASTER, master,
                DataBaseType.READ_REPLICA, readReplica
        );
        setTargetDataSources(targetDataSources);
        setDefaultTargetDataSource(readReplica);
    }

    static void switchRouteToReadReplica() {
        type.set(DataBaseType.READ_REPLICA);
    }

    static void switchRouteToMaster() {
        type.set(DataBaseType.MASTER);
    }

    static void clearRoute() {
        type.remove();
    }

    @Override
    protected Object determineCurrentLookupKey() {
        return type.get();
    }

    enum DataBaseType {
        MASTER,
        READ_REPLICA
    }
}
