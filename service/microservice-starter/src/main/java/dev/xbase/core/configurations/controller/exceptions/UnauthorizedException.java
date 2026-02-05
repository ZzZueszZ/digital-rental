package dev.xbase.core.configurations.controller.exceptions;

import org.springframework.http.HttpStatus;
import dev.xbase.core.constants.CoreErrorCodes;

public class UnauthorizedException extends ApplicationException {
    public UnauthorizedException() {
        super(CoreErrorCodes.SYSTEM_AUTHORIZATION, CoreErrorCodes.SYSTEM_AUTHORIZATION.getMessage(), HttpStatus.UNAUTHORIZED);
    }
}
