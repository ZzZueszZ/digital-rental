package dev.xbase.core.configurations.controller.exceptions;

import dev.xbase.core.constants.CoreErrorCodes;
import org.springframework.http.HttpStatus;

public class ConflictsException extends ApplicationException {
    public ConflictsException() {
        super(CoreErrorCodes.CONFLICT, CoreErrorCodes.CONFLICT.getMessage(), HttpStatus.CONFLICT);
    }
}
