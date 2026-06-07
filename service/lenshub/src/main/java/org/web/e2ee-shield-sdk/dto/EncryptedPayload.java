package com.shield.spring_server.dto;

import lombok.Data;

@Data
public class EncryptedPayload {
    private String sessionId;
    private String aad;
    private String iv;
    private String cipherText;
    private String tag;
}
