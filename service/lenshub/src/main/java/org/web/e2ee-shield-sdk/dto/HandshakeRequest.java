package com.shield.spring_server.dto;

import lombok.Data;

import java.util.Map;

@Data
public class HandshakeRequest {
    private Map<String, Object> clientPubJwk;
    private String clientNonce;
}
