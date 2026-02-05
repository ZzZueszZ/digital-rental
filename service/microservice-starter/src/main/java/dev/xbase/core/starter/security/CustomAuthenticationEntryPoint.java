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
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.web.authentication.www.BasicAuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.PrintWriter;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

import static org.springframework.http.HttpHeaders.AUTHORIZATION;

@Component
@RequiredArgsConstructor
public class CustomAuthenticationEntryPoint extends BasicAuthenticationEntryPoint {
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
    public void commence(
            HttpServletRequest request, HttpServletResponse response, AuthenticationException authEx)
            throws IOException {

        response.addHeader("WWW-Authenticate", "");
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        PrintWriter writer = response.getWriter();
        String errorMsg = CoreErrorCodes.SYSTEM_AUTHORIZATION.getMessage();
        if (authEx instanceof OAuth2AuthenticationException) {
            OAuth2Error error = ((OAuth2AuthenticationException) authEx).getError();
            String authorization = request.getHeader(AUTHORIZATION);
            authorization = Objects.isNull(authorization) ? "" : authorization;

            errorMsg = error.getDescription() + " " + authorization;
        }

        ApiErrorResponse apiResponse = new ApiErrorResponse(
                requestUID(request).value(),
                CoreErrorCodes.SYSTEM_AUTHORIZATION.getCode(),
                errorMsg,
                request.getRequestURI(),
                request.getMethod(),
                LocalDateTime.now()
        );
        response.setHeader("X-SERVICE", Objects.isNull(SystemUtils.getHostName()) ? "DEV" : SystemUtils.getHostName());

        writer.println(json.toValue(apiResponse));
    }

    @Override
    public void afterPropertiesSet() {
        setRealmName("xBase");
        super.afterPropertiesSet();
    }
}
