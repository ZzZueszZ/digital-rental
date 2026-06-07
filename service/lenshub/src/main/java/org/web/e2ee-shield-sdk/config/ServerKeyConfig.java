package com.shield.spring_server.config;

import com.shield.spring_server.security.EcJwkUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.security.*;
import java.security.interfaces.ECPublicKey;
import java.security.spec.*;
import java.util.Base64;
import java.util.Map;

@Slf4j
@Configuration
public class ServerKeyConfig {

    @Value("${SERVER_IDENTITY_PRIV_B64}")
    private String privPemB64;

    @Value("${SERVER_IDENTITY_PUB_B64}")
    private String pubPemB64;

    @Bean
    public KeyPair serverIdentityKeyPair() throws Exception {
        try {
            // 🧩 Giải mã PEM (đã Base64 hóa và có BEGIN/END)
            String privPem = new String(Base64.getDecoder().decode(privPemB64));
            String pubPem = new String(Base64.getDecoder().decode(pubPemB64));

            byte[] privBytes = extractKey(privPem, "PRIVATE KEY");
            byte[] pubBytes = extractKey(pubPem, "PUBLIC KEY");

            KeyFactory kf = KeyFactory.getInstance("EC");
            PrivateKey priv = kf.generatePrivate(new PKCS8EncodedKeySpec(privBytes));
            PublicKey pub = kf.generatePublic(new X509EncodedKeySpec(pubBytes));

            // 🟢 Log JWK public key để FE dễ copy
            Map<String, Object> jwk = EcJwkUtil.exportPublicJwk((ECPublicKey) pub);
            log.info("✅ [SERVER] Identity keypair loaded successfully.");
            log.info("🔑 [SERVER] Public JWK for FE: x={}, y={}", jwk.get("x"), jwk.get("y"));
            return new KeyPair(pub, priv);
        } catch (Exception e) {
            throw new IllegalArgumentException("⚠️ Error loading identity keypair: " + e.getMessage(), e);
        }
    }

    private byte[] extractKey(String pem, String type) {
        String cleaned = pem
                .replace("-----BEGIN " + type + "-----", "")
                .replace("-----END " + type + "-----", "")
                .replaceAll("\\s", "");
        return Base64.getDecoder().decode(cleaned);
    }
}
