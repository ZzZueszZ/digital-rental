package dev.xbase.core.configurations.controller.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Enumeration;
import java.util.Objects;
import java.util.UUID;

@Slf4j
@Component
public class RequestLoggingFilter extends OncePerRequestFilter {
    private static final AntPathRequestMatcher EXCLUDE_PATHS = new AntPathRequestMatcher("/actuator/**");

    private static final String REQUEST_ID = "request_id";

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        if (EXCLUDE_PATHS.matches(request)) {
            filterChain.doFilter(request, response);
            return;
        }
        if (Objects.isNull(request.getAttribute(REQUEST_ID))) {
            String requestId = UUID.randomUUID().toString();
            request.setAttribute(REQUEST_ID, requestId);
            logRequest(request, requestId);
        }
        filterChain.doFilter(request, response);
    }

    private void logRequest(HttpServletRequest request, String requestId) {
        if (!Objects.isNull(request)) {
            StringBuilder data = new StringBuilder();
            data.append("\nBEGIN LOGGING REQUEST-----------------------------------\n")
                    .append("[REQUEST-ID]: ").append(requestId).append("\n")
                    .append("[PATH]: ").append(request.getRequestURI()).append("\n")
                    .append("[QUERIES]: ").append(request.getQueryString()).append("\n")
                    .append("[HEADERS]: ").append("\n");

            Enumeration<String> headerNames = request.getHeaderNames();
            while (headerNames.hasMoreElements()) {
                String key = headerNames.nextElement();
                String value = request.getHeader(key);
                data.append("---").append(key).append(" : ").append(value).append("\n");
            }
            data.append("END LOGGING REQUEST-----------------------------------\n");

            log.info(data.toString());
        }
    }
}
