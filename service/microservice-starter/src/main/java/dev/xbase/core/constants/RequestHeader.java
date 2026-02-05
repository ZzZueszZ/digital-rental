package dev.xbase.core.constants;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Getter
public enum RequestHeader {
    PROPERTY_ID("property-id"),
    CLIENT_TIME("client-time"),
    REQUEST_ID("request-id");
    final String value;
}
