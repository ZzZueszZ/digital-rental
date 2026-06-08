package org.web.e2ee.shield.sdk.util;

import org.junit.jupiter.api.Test;

import javax.crypto.AEADBadTagException;
import java.security.SecureRandom;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class CryptoUtilTest {

    private static final SecureRandom RANDOM = new SecureRandom();

    @Test
    void encryptAndDecryptRoundTrip() throws Exception {
        byte[] key = randomBytes(32);
        byte[] aad = "POST:/auth/login".getBytes();
        byte[] plaintext = "{\"email\":\"user@example.com\"}".getBytes();

        CryptoUtil.AesSeal seal = CryptoUtil.encrypt(key, aad, plaintext);
        byte[] decrypted = CryptoUtil.decrypt(key, aad, seal.iv, seal.ct, seal.tag);

        assertArrayEquals(plaintext, decrypted);
    }

    @Test
    void modifiedCipherTextIsRejected() throws Exception {
        byte[] key = randomBytes(32);
        byte[] aad = "POST:/auth/login".getBytes();
        CryptoUtil.AesSeal seal = CryptoUtil.encrypt(key, aad, "payload".getBytes());
        seal.ct[0] ^= 1;

        assertThrows(
                AEADBadTagException.class,
                () -> CryptoUtil.decrypt(key, aad, seal.iv, seal.ct, seal.tag)
        );
    }

    @Test
    void invalidKeySizeIsRejected() {
        assertThrows(
                IllegalArgumentException.class,
                () -> CryptoUtil.encrypt(new byte[16], new byte[0], new byte[0])
        );
    }

    private static byte[] randomBytes(int size) {
        byte[] value = new byte[size];
        RANDOM.nextBytes(value);
        return value;
    }
}
