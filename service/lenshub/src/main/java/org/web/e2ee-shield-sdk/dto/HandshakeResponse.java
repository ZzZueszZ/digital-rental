package com.shield.spring_server.dto;

import lombok.Data;

import java.util.Map;

@Data
public class HandshakeResponse {
    private String sessionId;
    private Map<String, Object> serverPubJwk;
    private String serverNonceB64u;
    private String signatureB64u;

    public HandshakeResponse(String sessionId,
                             Map<String, Object> serverPubJwk,
                             String serverNonceB64u,
                             String signatureB64u) {
        this.sessionId = sessionId;
        this.serverPubJwk = serverPubJwk;
        this.serverNonceB64u = serverNonceB64u;
        this.signatureB64u = signatureB64u;
    }
}