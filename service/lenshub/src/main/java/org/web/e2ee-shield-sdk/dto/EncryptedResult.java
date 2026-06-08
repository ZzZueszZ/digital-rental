package org.web.e2ee.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class EncryptedResult {
    private String aad;
    private String iv;
    private String cipherText;
    private String tag;
}


