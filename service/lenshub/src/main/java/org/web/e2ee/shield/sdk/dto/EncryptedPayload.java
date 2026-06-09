package org.web.e2ee.shield.sdk.dto;

import lombok.Data;

@Data
public class EncryptedPayload {
    private String sessionId;
    private String aad;
    private String iv;
    private String cipherText;
    private String tag;
}

