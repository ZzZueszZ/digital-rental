package org.web.e2ee.dto;

import lombok.Data;

@Data
public class EncryptedPayload {
    private String sessionId;
    private String aad;
    private String iv;
    private String cipherText;
    private String tag;
}

