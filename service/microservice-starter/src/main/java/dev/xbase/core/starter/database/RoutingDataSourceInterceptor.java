package dev.xbase.core.starter.database;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.core.annotation.Order;
import org.springframework.transaction.annotation.Transactional;

@Aspect
@Order(0)
public class RoutingDataSourceInterceptor {
    @Around("@within(transactional)")
    public Object proceedByClassAnnotation(ProceedingJoinPoint joinPoint, Transactional transactional) throws Throwable {
        return proceed(joinPoint, transactional);
    }

    @Around("@annotation(transactional)")
    public Object proceedByMethodAnnotation(ProceedingJoinPoint joinPoint, Transactional transactional) throws Throwable {
        return proceed(joinPoint, transactional);
    }

    private Object proceed(ProceedingJoinPoint joinPoint, Transactional transactional) throws Throwable {
        try {
            if (transactional.readOnly()) {
                RoutingDataSource.switchRouteToReadReplica();
            } else {
                RoutingDataSource.switchRouteToMaster();
            }
            return joinPoint.proceed();
        } finally {
            RoutingDataSource.clearRoute();
        }
    }
}
