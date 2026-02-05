package dev.xbase.core.configurations.controller.exceptions;

import org.springframework.http.HttpStatus;
import dev.xbase.core.constants.CoreErrorCodes;

public class ResourceNotFoundException extends ApplicationException {
    public ResourceNotFoundException() {
        super(CoreErrorCodes.RESOURCE_NOT_FOUND, CoreErrorCodes.RESOURCE_NOT_FOUND.getMessage(), HttpStatus.NOT_FOUND);
    }
}
