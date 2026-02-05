package dev.xbase.domain.configuration;

public record ConfigurationGroup(String code,
                                 String name,
                                 Integer displayOrder) {
    public static ConfigurationGroup ofEmpty() {
        return new ConfigurationGroup("", "", 0);
    }
}
