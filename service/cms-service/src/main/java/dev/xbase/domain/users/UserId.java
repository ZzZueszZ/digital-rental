package dev.xbase.domain.users;

public record UserId(Integer value) {
    public String asText() {
        return value.toString();
    }
}
