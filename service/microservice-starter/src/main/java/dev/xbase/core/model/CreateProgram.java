package dev.xbase.core.model;


import lombok.NonNull;

public record CreateProgram(@NonNull String value) {
    public static CreateProgram ofEmpty() {
        return new CreateProgram("");
    }

    public boolean isEmpty() {
        return value.equals("");
    }

    public String asText() {
        return value;
    }

    public static CreateProgram getDefault() {
        try {
            StackTraceElement[] stackTraceElement = Thread.currentThread().getStackTrace();
            return new CreateProgram(String.format("%s.%s", Class.forName(stackTraceElement[2].getClassName()).getSimpleName(), stackTraceElement[2].getMethodName()));
        } catch (Exception ex) {
            return new CreateProgram("UNKNOWN");
        }
    }
}
