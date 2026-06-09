package org.web.e2ee.shield.sdk.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.KeyPair;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

@Configuration
@ConditionalOnProperty(name = "app.e2ee.enabled", havingValue = "true")
public class ServerKeyConfig {

    @Value("${SERVER_IDENTITY_PRIV_B64}")
    private String privPemB64;

    @Value("${SERVER_IDENTITY_PUB_B64}")
    private String pubPemB64;

    @Bean
    public KeyPair serverIdentityKeyPair() throws Exception {
        try {
            byte[] privBytes = decodeKeyMaterial(privPemB64, "PRIVATE KEY");
            byte[] pubBytes = decodeKeyMaterial(pubPemB64, "PUBLIC KEY");

            KeyFactory keyFactory = KeyFactory.getInstance("EC");
            PrivateKey privateKey = keyFactory.generatePrivate(new PKCS8EncodedKeySpec(privBytes));
            PublicKey publicKey = keyFactory.generatePublic(new X509EncodedKeySpec(pubBytes));
            return new KeyPair(publicKey, privateKey);
        } catch (Exception exception) {
            throw new IllegalArgumentException("Error loading E2EE server identity keypair", exception);
        }
    }

    private byte[] decodeKeyMaterial(String value, String type) {
        String normalized = normalizeKeyValue(value);
        if (isPem(normalized, type)) {
            return extractKey(normalized, type);
        }

        byte[] decoded = Base64.getDecoder().decode(normalized.replaceAll("\\s", ""));
        String decodedText = new String(decoded, StandardCharsets.UTF_8);
        if (isPem(decodedText, type)) {
            return extractKey(decodedText, type);
        }

        return decoded;
    }

    private String normalizeKeyValue(String value) {
        return value == null ? "" : value.replace("\\n", "\n").trim();
    }

    private boolean isPem(String value, String type) {
        return value.contains("-----BEGIN " + type + "-----");
    }

    private byte[] extractKey(String pem, String type) {
        String cleaned = normalizeKeyValue(pem)
                .replace("-----BEGIN " + type + "-----", "")
                .replace("-----END " + type + "-----", "")
                .replaceAll("\\s", "");
        return Base64.getDecoder().decode(cleaned);
    }
}
