package dev.xbase.core.configurations.controller;

import dev.xbase.core.util.json.Json;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import dev.xbase.core.constants.CoreErrorCodes;
import dev.xbase.core.constants.RequestHeader;
import dev.xbase.core.model.RequestId;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class DefaultController {
    @NonNull
    final Json json;

    public RequestId requestUID(HttpServletRequest request) {
        String headerRequestId = request.getHeader(RequestHeader.REQUEST_ID.getValue());
        if (Objects.nonNull(headerRequestId)) {
            return new RequestId(headerRequestId);
        }
        return new RequestId(UUID.randomUUID().toString());
    }

    @RequestMapping
    @ResponseStatus(HttpStatus.SERVICE_UNAVAILABLE)
    public void handleUnmappedRequest(final HttpServletResponse response, final HttpServletRequest request) throws IOException {
        ApiErrorResponse apiResponse = new ApiErrorResponse(
                requestUID(request).value(),
                CoreErrorCodes.SERVICE_UNAVAILABLE.getCode(),
                CoreErrorCodes.SERVICE_UNAVAILABLE.getMessage(),
                request.getRequestURI(),
                request.getMethod(),
                LocalDateTime.now()
        );
        response.getWriter().println(json.toValue(apiResponse));
    }
}
