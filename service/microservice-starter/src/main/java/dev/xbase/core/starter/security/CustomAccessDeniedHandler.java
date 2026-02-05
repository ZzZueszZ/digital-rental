package dev.xbase.core.starter.security;

import dev.xbase.core.configurations.controller.ApiErrorResponse;
import dev.xbase.core.constants.CoreErrorCodes;
import dev.xbase.core.constants.RequestHeader;
import dev.xbase.core.model.RequestId;
import dev.xbase.core.util.json.Json;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.SystemUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.PrintWriter;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class CustomAccessDeniedHandler implements AccessDeniedHandler {
    @NonNull
    final Json json;

    public RequestId requestUID(HttpServletRequest request) {
        String headerRequestId = request.getHeader(RequestHeader.REQUEST_ID.getValue());
        if (Objects.nonNull(headerRequestId)) {
            return new RequestId(headerRequestId);
        }
        return new RequestId(UUID.randomUUID().toString());
    }

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, AccessDeniedException e) throws IOException {
        response.setStatus(HttpStatus.FORBIDDEN.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        PrintWriter writer = response.getWriter();

        ApiErrorResponse apiResponse = new ApiErrorResponse(
                requestUID(request).value(),
                CoreErrorCodes.FORBIDDEN.getCode(),
                CoreErrorCodes.FORBIDDEN.getMessage(),
                request.getRequestURI(),
                request.getMethod(),
                LocalDateTime.now()
        );

        response.setHeader("X-SERVICE-ID", Objects.isNull(SystemUtils.getHostName()) ? "DEV" : SystemUtils.getHostName());

        writer.println(json.toValue(apiResponse));
    }
}
