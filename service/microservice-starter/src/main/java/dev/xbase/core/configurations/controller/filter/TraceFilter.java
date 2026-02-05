package dev.xbase.core.configurations.controller.filter;

import dev.xbase.core.starter.autoconfigure.AppProperties;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.SystemUtils;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Objects;

@Component
@RequiredArgsConstructor
public class TraceFilter extends OncePerRequestFilter {
    private final String X_REQUEST_URI = "X-Request-Uri";
    private final String X_REMOTE_USER = "X-Remote-User";

    @NonNull
    final AppProperties appProperties;

    @Override
    protected void doFilterInternal(HttpServletRequest httpServletRequest,
                                    HttpServletResponse httpServletResponse,
                                    FilterChain filterChain)
            throws ServletException, IOException {
        MDC.put(X_REQUEST_URI, httpServletRequest.getRequestURI());
        MDC.put(X_REMOTE_USER, httpServletRequest.getRemoteUser());

        httpServletResponse.setHeader("X-Service", Objects.isNull(SystemUtils.getHostName()) ? "DEV" : SystemUtils.getHostName());
        httpServletResponse.setHeader("Api-Version", appProperties.getVersion());
        filterChain.doFilter(httpServletRequest, httpServletResponse);
    }
}
