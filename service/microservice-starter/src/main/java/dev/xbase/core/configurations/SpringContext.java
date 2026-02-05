package dev.xbase.core.configurations;

import jakarta.validation.constraints.NotNull;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.BeanNameAware;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.stereotype.Component;

@Component
public class SpringContext implements ApplicationContextAware, BeanNameAware {
    String name;

    private static ApplicationContext applicationContext;

    @Override
    public void setApplicationContext(@NotNull ApplicationContext context) throws BeansException {
        applicationContext = context;
    }

    public static <T> T getBean(String bean, Class<T> clazz) {
        return (T) applicationContext.getBean(bean, clazz);
    }

    public static <T> T getBean(Class<T> clazz) {
        return (T) applicationContext.getBean(clazz);
    }

    public static Object getBean(String bean) {
        return applicationContext.getBean(bean);
    }

    @Override
    public void setBeanName(String name) {
        this.name = name;
    }
}
