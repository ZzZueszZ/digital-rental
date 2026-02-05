package dev.xbase.core.configurations.controller.exceptions;

import org.springframework.http.HttpStatus;
import dev.xbase.core.constants.CoreErrorCodes;

public class ServerErrorException extends ApplicationException {
    public ServerErrorException() {
        super(CoreErrorCodes.SERVER_ERROR, CoreErrorCodes.SERVER_ERROR.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
