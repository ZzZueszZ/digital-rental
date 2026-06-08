package org.web.e2ee.shield.sdk.dto;

import lombok.Data;

import java.util.Map;

@Data
public class HandshakeRequest {
    private Map<String, Object> clientPubJwk;
    private String clientNonce;
}

