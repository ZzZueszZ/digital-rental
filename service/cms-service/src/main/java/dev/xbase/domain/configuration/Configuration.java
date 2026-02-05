package dev.xbase.domain.configuration;

public record Configuration(String code,
                            String name,
                            String type,
                            String value,
                            Boolean required,
                            String description,
                            String options) {
    public static Configuration ofEmpty() {
        return new Configuration("", "", "", "", false, "", "");
    }
}
