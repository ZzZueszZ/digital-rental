package dev.xbase.core.constants;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Getter
public enum CoreErrorCodes implements ErrorCodes {
    SYSTEM_ERROR("SYS001", "SYSTEM_ERROR"),
    CONFLICT("SYS002", "CONFLICT"),
    FORBIDDEN("SYS003", "FORBIDDEN"),
    REQUEST_INVALID("SYS004", "REQUEST_INVALID"),
    RESOURCE_NOT_FOUND("SYS005", "RESOURCE_NOT_FOUND"),
    SERVER_ERROR("SYS006", "SERVER_ERROR"),
    TOKEN_INVALID("SYS007", "TOKEN_INVALID"),
    SYSTEM_AUTHORIZATION("SYS008", "SYSTEM_AUTHORIZATION"),
    SERVICE_UNAVAILABLE("SYS009", "SERVICE_UNAVAILABLE"),
    BAD_REQUEST("SYS010", "BAD_REQUEST");
    final String code;
    final String message;

    public static CoreErrorCodes getCoreErrorCodes(String value) {
        for (CoreErrorCodes a : values()) {
            if (a.code.equalsIgnoreCase(value)) {
                return a;
            }
        }
        return null;
    }
}
