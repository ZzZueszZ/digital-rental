package dev.xbase.core.configurations;

import org.springframework.util.Assert;

public class AppContextHolder {
    private static final ThreadLocal<Object> appContext = new ThreadLocal<>();

    public static void clearContext() {
        appContext.remove();
    }

    public static Object getContext() {
        Object context = appContext.get();
        if (context == null) {
            context = createEmptyContext();
            appContext.set(context);
        }
        return context;
    }

    public static void setContext(Object context) {
        Assert.notNull(context, "Only not-null RequestHeadersContext instances are permitted");
        appContext.set(context);
    }

    public static Object createEmptyContext() {
        return new Object();
    }
}
