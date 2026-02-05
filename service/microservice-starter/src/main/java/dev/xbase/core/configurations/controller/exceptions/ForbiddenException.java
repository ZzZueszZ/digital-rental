package dev.xbase.core.configurations.controller.exceptions;

import org.springframework.http.HttpStatus;
import dev.xbase.core.constants.CoreErrorCodes;

public class ForbiddenException extends ApplicationException {
    public ForbiddenException() {
        super(CoreErrorCodes.FORBIDDEN, CoreErrorCodes.FORBIDDEN.getMessage(), HttpStatus.FORBIDDEN);
    }
}
