package org.web.e2ee.shield.sdk.util;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.security.SecureRandom;
import java.util.Arrays;

public class CryptoUtil {

    private static final SecureRandom RNG = new SecureRandom();
    private static final int AES_256_KEY_BYTES = 32;
    private static final int GCM_IV_BYTES = 12;
    private static final int GCM_TAG_BYTES = 16;

    public static class AesSeal {
        public final byte[] iv, ct, tag;
        public AesSeal(byte[] iv, byte[] ct, byte[] tag) {
            this.iv = iv;
            this.ct = ct;
            this.tag = tag;
        }
    }

    public static AesSeal encrypt(byte[] key, byte[] aad, byte[] plaintext) throws Exception {
        validateKey(key);
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        byte[] iv = new byte[GCM_IV_BYTES];
        RNG.nextBytes(iv);
        GCMParameterSpec spec = new GCMParameterSpec(128, iv);
        SecretKey k = new SecretKeySpec(key, "AES");
        cipher.init(Cipher.ENCRYPT_MODE, k, spec);
        if (aad != null) {
            cipher.updateAAD(aad);
        }
        byte[] out = cipher.doFinal(plaintext);
        byte[] tag = Arrays.copyOfRange(out, out.length - GCM_TAG_BYTES, out.length);
        byte[] ct = Arrays.copyOf(out, out.length - GCM_TAG_BYTES);
        return new AesSeal(iv, ct, tag);
    }

    public static byte[] decrypt(byte[] key, byte[] aad,
                                 byte[] iv, byte[] ct, byte[] tag) throws Exception {
        validateKey(key);
        if (iv == null || iv.length != GCM_IV_BYTES || tag == null || tag.length != GCM_TAG_BYTES || ct == null) {
            throw new IllegalArgumentException("Invalid AES-GCM payload");
        }
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        GCMParameterSpec spec = new GCMParameterSpec(128, iv);
        SecretKey k = new SecretKeySpec(key, "AES");
        cipher.init(Cipher.DECRYPT_MODE, k, spec);
        if (aad != null) {
            cipher.updateAAD(aad);
        }
        byte[] sealed = new byte[ct.length + tag.length];
        System.arraycopy(ct, 0, sealed, 0, ct.length);
        System.arraycopy(tag, 0, sealed, ct.length, tag.length);
        return cipher.doFinal(sealed);
    }

    private static void validateKey(byte[] key) {
        if (key == null || key.length != AES_256_KEY_BYTES) {
            throw new IllegalArgumentException("AES-256 key must be 32 bytes");
        }
    }
}


