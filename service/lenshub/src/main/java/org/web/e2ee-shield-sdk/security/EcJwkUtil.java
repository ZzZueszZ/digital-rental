package org.web.e2ee.security;

import java.math.BigInteger;
import java.security.*;
import java.security.interfaces.ECPublicKey;
import java.security.spec.*;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

public class EcJwkUtil {

    private static ECParameterSpec p256Params() throws Exception {
        AlgorithmParameters params = AlgorithmParameters.getInstance("EC");
        params.init(new ECGenParameterSpec("secp256r1"));
        return params.getParameterSpec(ECParameterSpec.class);
    }

    public static Map<String, Object> exportPublicJwk(ECPublicKey pub) {
        var point = pub.getW();
        String x = b64u(point.getAffineX());
        String y = b64u(point.getAffineY());
        Map<String, Object> jwk = new HashMap<>();
        jwk.put("kty", "EC");
        jwk.put("crv", "P-256");
        jwk.put("x", x);
        jwk.put("y", y);
        return jwk;
    }

    public static ECPublicKey importPublicJwk(Map<String, Object> jwk) throws Exception {
        byte[] x = Base64.getUrlDecoder().decode((String) jwk.get("x"));
        byte[] y = Base64.getUrlDecoder().decode((String) jwk.get("y"));
        ECParameterSpec params = p256Params();
        ECPoint w = new ECPoint(new BigInteger(1, x), new BigInteger(1, y));
        ECPublicKeySpec spec = new ECPublicKeySpec(w, params);
        return (ECPublicKey) KeyFactory.getInstance("EC").generatePublic(spec);
    }

    private static String b64u(BigInteger v) {
        byte[] b = v.toByteArray();
        // chuáº©n hÃ³a 32 byte
        if (b.length == 33 && b[0] == 0) {
            byte[] t = new byte[32];
            System.arraycopy(b, 1, t, 0, 32);
            b = t;
        } else if (b.length < 32) {
            byte[] t = new byte[32];
            System.arraycopy(b, 0, t, 32 - b.length, b.length);
            b = t;
        } else if (b.length > 32) {
            byte[] t = new byte[32];
            System.arraycopy(b, b.length - 32, t, 0, 32);
            b = t;
        }
        return Base64.getUrlEncoder().withoutPadding().encodeToString(b);
    }
}

