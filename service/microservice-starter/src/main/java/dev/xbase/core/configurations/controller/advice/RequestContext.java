package dev.xbase.core.configurations.controller.advice;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import dev.xbase.core.constants.RequestAttributeConfig;
import dev.xbase.core.constants.RequestHeader;
import dev.xbase.core.model.CreateProgram;
import dev.xbase.core.model.CurrentRequest;
import dev.xbase.core.model.PropertyId;
import dev.xbase.core.model.RequestId;

import java.time.OffsetDateTime;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Objects;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class RequestContext {

    private HttpServletRequest getCurrentRequest() {
        RequestAttributes requestAttributes = RequestContextHolder.getRequestAttributes();
        assert requestAttributes != null;
        return ((ServletRequestAttributes) requestAttributes).getRequest();
    }

    public CreateProgram createProgram() {
        CurrentRequest currentRequest = (CurrentRequest) RequestContextHolder.currentRequestAttributes()
                .getAttribute(RequestAttributeConfig.CurrentRequest.name(), RequestAttributes.SCOPE_REQUEST);
        return currentRequest.createProgram();
    }

    public PropertyId propertyId() {
        return new PropertyId(getCurrentRequest().getHeader(RequestHeader.PROPERTY_ID.getValue()));
    }

    public ZonedDateTime clientTime() {
        String clientTime = getCurrentRequest().getHeader(RequestHeader.CLIENT_TIME.getValue());
        ZonedDateTime zonedDateTime = ZonedDateTime.now();
        try {
            if (Objects.nonNull(clientTime)) {
                DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter
                        .ofPattern("uuuu-MM-dd'T'HH:mm:ssXXXXX");
                OffsetDateTime odtInstanceAtOffset = OffsetDateTime.parse(clientTime, DATE_TIME_FORMATTER);
                zonedDateTime = odtInstanceAtOffset.toZonedDateTime();
            }
        } catch (Exception ex) {
        }
        return zonedDateTime;
    }

    public RequestId requestId() {
        String headerRequestId = getCurrentRequest().getHeader(RequestHeader.REQUEST_ID.getValue());
        if (Objects.nonNull(headerRequestId)) {
            return new RequestId(headerRequestId);
        }
        return new RequestId(UUID.randomUUID().toString());
    }
}
