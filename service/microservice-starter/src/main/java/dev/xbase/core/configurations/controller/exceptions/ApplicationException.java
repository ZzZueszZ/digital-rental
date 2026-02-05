package dev.xbase.core.configurations.controller.exceptions;

import dev.xbase.core.constants.ErrorCodes;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.util.StringUtils;

@Getter
@RequiredArgsConstructor
public class ApplicationException extends RuntimeException {
    final ErrorCodes errorCode;
    final String message;
    final HttpStatus httpStatus;

    public String asMessage() {
        return StringUtils.hasText(message) ? message : errorCode.getMessage();
    }
}
