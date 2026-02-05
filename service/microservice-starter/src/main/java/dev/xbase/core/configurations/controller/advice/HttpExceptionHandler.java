package dev.xbase.core.configurations.controller.advice;

import dev.xbase.core.configurations.controller.ApiErrorResponse;
import dev.xbase.core.configurations.controller.exceptions.ApplicationException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.ConversionNotSupportedException;
import org.springframework.beans.TypeMismatchException;
import org.springframework.beans.propertyeditors.StringTrimmerEditor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.http.converter.HttpMessageNotWritableException;
import org.springframework.validation.BindException;
import org.springframework.web.ErrorResponseException;
import org.springframework.web.HttpMediaTypeNotAcceptableException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingPathVariableException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.ServletRequestBindingException;
import org.springframework.web.bind.WebDataBinder;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.InitBinder;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.async.AsyncRequestTimeoutException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;
import org.springframework.web.servlet.NoHandlerFoundException;
import dev.xbase.core.constants.CoreErrorCodes;
import dev.xbase.core.constants.RequestHeader;
import dev.xbase.core.model.RequestId;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

@RestControllerAdvice(basePackages = "dev.xbase")
@Slf4j
public class HttpExceptionHandler {

    @InitBinder
    public void initBinder(WebDataBinder binder) {
        StringTrimmerEditor stringtrimmer = new StringTrimmerEditor(false);
        binder.registerCustomEditor(String.class, stringtrimmer);
    }

    public RequestId requestUID(HttpServletRequest request) {
        String headerRequestId = request.getHeader(RequestHeader.REQUEST_ID.getValue());
        if (Objects.nonNull(headerRequestId)) {
            return new RequestId(headerRequestId);
        }
        return new RequestId(UUID.randomUUID().toString());
    }

    @ExceptionHandler(ApplicationException.class)
    public ResponseEntity<?> handleApplicationException(final ApplicationException exception,
                                                        final HttpServletRequest request
    ) {
        ApiErrorResponse response = new ApiErrorResponse(
                requestUID(request).value(),
                exception.getErrorCode().getCode(),
                exception.getMessage(),
                request.getRequestURI(),
                request.getMethod(),
                LocalDateTime.now()
        );
        return new ResponseEntity<>(response, exception.getHttpStatus());
    }

    @ExceptionHandler({
            HttpRequestMethodNotSupportedException.class,
            HttpMediaTypeNotSupportedException.class,
            HttpMediaTypeNotAcceptableException.class,
            MissingPathVariableException.class,
            MissingServletRequestParameterException.class,
            MissingServletRequestPartException.class,
            ServletRequestBindingException.class,
            MethodArgumentNotValidException.class,
            NoHandlerFoundException.class,
            AsyncRequestTimeoutException.class,
            ErrorResponseException.class,
            ConversionNotSupportedException.class,
            TypeMismatchException.class,
            HttpMessageNotReadableException.class,
            HttpMessageNotWritableException.class,
            BindException.class
    })
    public ResponseEntity<?> handleBindException(final BindException exception,
                                                 final HttpServletRequest request
    ) {
        ApiErrorResponse response = new ApiErrorResponse(
                requestUID(request).value(),
                CoreErrorCodes.BAD_REQUEST.getCode(),
                CoreErrorCodes.BAD_REQUEST.getMessage(),
                request.getRequestURI(),
                request.getMethod(),
                LocalDateTime.now()
        );
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleException(final Exception exception,
                                             final HttpServletRequest request
    ) {
        log.error(exception.getMessage(), exception);
        ApiErrorResponse response = new ApiErrorResponse(
                requestUID(request).value(),
                CoreErrorCodes.SYSTEM_ERROR.getCode(),
                CoreErrorCodes.SYSTEM_ERROR.getMessage(),
                request.getRequestURI(),
                request.getMethod(),
                LocalDateTime.now()
        );
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
