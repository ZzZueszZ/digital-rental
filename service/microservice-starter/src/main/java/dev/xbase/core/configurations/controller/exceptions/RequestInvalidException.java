package dev.xbase.core.configurations.controller.exceptions;

import org.springframework.http.HttpStatus;
import dev.xbase.core.constants.CoreErrorCodes;

public class RequestInvalidException extends ApplicationException {
    public RequestInvalidException() {
        super(CoreErrorCodes.REQUEST_INVALID, "RequestInvalidException", HttpStatus.BAD_REQUEST);
    }
}

