package dev.xbase.core.configurations.controller.exceptions;

import org.springframework.http.HttpStatus;
import dev.xbase.core.constants.CoreErrorCodes;

public class TokenRefreshException extends ApplicationException {
    public TokenRefreshException() {
        super(CoreErrorCodes.TOKEN_INVALID, CoreErrorCodes.TOKEN_INVALID.getMessage(), HttpStatus.UNAUTHORIZED);
    }
}