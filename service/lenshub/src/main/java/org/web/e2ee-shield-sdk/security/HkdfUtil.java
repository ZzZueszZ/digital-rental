package com.shield.spring_server.security;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

public class HkdfUtil {

    private static byte[] hmacSha256(byte[] key, byte[] data) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(key, "HmacSHA256"));
        return mac.doFinal(data);
    }

    public static byte[] deriveKey(byte[] ikm, byte[] salt, String info, int length) throws Exception {
        // extract
        byte[] prk = hmacSha256(salt, ikm);
        // expand
        byte[] t = new byte[0];
        byte[] okm = new byte[length];
        int pos = 0;
        byte counter = 1;
        byte[] infoBytes = info.getBytes(StandardCharsets.UTF_8);

        while (pos < length) {
            byte[] input = new byte[t.length + infoBytes.length + 1];
            System.arraycopy(t, 0, input, 0, t.length);
            System.arraycopy(infoBytes, 0, input, t.length, infoBytes.length);
            input[input.length - 1] = counter;

            t = hmacSha256(prk, input);
            int copyLen = Math.min(t.length, length - pos);
            System.arraycopy(t, 0, okm, pos, copyLen);
            pos += copyLen;
            counter++;
        }

        return okm;
    }
}
