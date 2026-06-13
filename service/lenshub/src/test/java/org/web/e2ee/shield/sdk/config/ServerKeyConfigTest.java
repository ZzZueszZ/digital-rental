package org.web.e2ee.shield.sdk.config;

import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.nio.charset.StandardCharsets;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.spec.ECGenParameterSpec;
import java.util.Base64;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;

class ServerKeyConfigTest {

    @Test
    void loadsRawPemIdentityKeyPair() throws Exception {
        KeyPair source = generateEcKeyPair();

        KeyPair loaded = loadKeyPair(toPem(source.getPrivate().getEncoded(), "PRIVATE KEY"),
                toPem(source.getPublic().getEncoded(), "PUBLIC KEY"));

        assertKeyPair(source, loaded);
    }

    @Test
    void loadsBase64EncodedPemIdentityKeyPair() throws Exception {
        KeyPair source = generateEcKeyPair();
        String privatePemB64 = Base64.getEncoder()
                .encodeToString(toPem(source.getPrivate().getEncoded(), "PRIVATE KEY")
                        .getBytes(StandardCharsets.UTF_8));
        String publicPemB64 = Base64.getEncoder()
                .encodeToString(toPem(source.getPublic().getEncoded(), "PUBLIC KEY")
                        .getBytes(StandardCharsets.UTF_8));

        KeyPair loaded = loadKeyPair(privatePemB64, publicPemB64);

        assertKeyPair(source, loaded);
    }

    @Test
    void loadsBase64EncodedDerIdentityKeyPair() throws Exception {
        KeyPair source = generateEcKeyPair();
        String privateDerB64 = Base64.getEncoder().encodeToString(source.getPrivate().getEncoded());
        String publicDerB64 = Base64.getEncoder().encodeToString(source.getPublic().getEncoded());

        KeyPair loaded = loadKeyPair(privateDerB64, publicDerB64);

        assertKeyPair(source, loaded);
    }

    @Test
    void loadsPemWithEscapedNewlines() throws Exception {
        KeyPair source = generateEcKeyPair();
        String privatePem = toPem(source.getPrivate().getEncoded(), "PRIVATE KEY").replace("\n", "\\n");
        String publicPem = toPem(source.getPublic().getEncoded(), "PUBLIC KEY").replace("\n", "\\n");

        KeyPair loaded = loadKeyPair(privatePem, publicPem);

        assertKeyPair(source, loaded);
    }

    private KeyPair loadKeyPair(String privateValue, String publicValue) throws Exception {
        ServerKeyConfig config = new ServerKeyConfig();
        ReflectionTestUtils.setField(config, "privPemB64", privateValue);
        ReflectionTestUtils.setField(config, "pubPemB64", publicValue);
        return config.serverIdentityKeyPair();
    }

    private static KeyPair generateEcKeyPair() throws Exception {
        KeyPairGenerator generator = KeyPairGenerator.getInstance("EC");
        generator.initialize(new ECGenParameterSpec("secp256r1"));
        return generator.generateKeyPair();
    }

    private static String toPem(byte[] der, String type) {
        return "-----BEGIN " + type + "-----\n"
                + Base64.getMimeEncoder(64, "\n".getBytes(StandardCharsets.UTF_8)).encodeToString(der)
                + "\n-----END " + type + "-----";
    }

    private static void assertKeyPair(KeyPair expected, KeyPair actual) {
        assertArrayEquals(expected.getPrivate().getEncoded(), actual.getPrivate().getEncoded());
        assertArrayEquals(expected.getPublic().getEncoded(), actual.getPublic().getEncoded());
    }
}
