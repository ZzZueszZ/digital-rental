package dev.xbase.core.configurations.controller.exceptions;

import org.springframework.http.HttpStatus;
import dev.xbase.core.constants.CoreErrorCodes;

public class UnavailableException extends ApplicationException {
    public UnavailableException() {
        super(CoreErrorCodes.SERVICE_UNAVAILABLE, CoreErrorCodes.SERVICE_UNAVAILABLE.getMessage(), HttpStatus.SERVICE_UNAVAILABLE);
    }
}
