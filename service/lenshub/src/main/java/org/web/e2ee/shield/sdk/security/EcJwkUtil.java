package org.web.e2ee.shield.sdk.security;

import java.math.BigInteger;
import java.security.AlgorithmParameters;
import java.security.KeyFactory;
import java.security.interfaces.ECPublicKey;
import java.security.spec.ECGenParameterSpec;
import java.security.spec.ECParameterSpec;
import java.security.spec.ECPoint;
import java.security.spec.ECPublicKeySpec;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

public final class EcJwkUtil {

    private static final String KEY_TYPE = "EC";
    private static final String CURVE = "P-256";
    private static final int COORDINATE_SIZE_BYTES = 32;

    private EcJwkUtil() {
    }

    private static ECParameterSpec p256Params() throws Exception {
        AlgorithmParameters params = AlgorithmParameters.getInstance("EC");
        params.init(new ECGenParameterSpec("secp256r1"));
        return params.getParameterSpec(ECParameterSpec.class);
    }

    public static Map<String, Object> exportPublicJwk(ECPublicKey publicKey) {
        ECPoint point = publicKey.getW();
        Map<String, Object> jwk = new HashMap<>();
        jwk.put("kty", KEY_TYPE);
        jwk.put("crv", CURVE);
        jwk.put("x", b64u(point.getAffineX()));
        jwk.put("y", b64u(point.getAffineY()));
        return jwk;
    }

    public static ECPublicKey importPublicJwk(Map<String, Object> jwk) throws Exception {
        if (jwk == null
                || !KEY_TYPE.equals(jwk.get("kty"))
                || !CURVE.equals(jwk.get("crv"))
                || !(jwk.get("x") instanceof String xValue)
                || !(jwk.get("y") instanceof String yValue)) {
            throw new IllegalArgumentException("Invalid EC P-256 public JWK");
        }

        byte[] x = decodeCoordinate(xValue);
        byte[] y = decodeCoordinate(yValue);
        ECPoint point = new ECPoint(new BigInteger(1, x), new BigInteger(1, y));
        ECPublicKeySpec spec = new ECPublicKeySpec(point, p256Params());
        return (ECPublicKey) KeyFactory.getInstance("EC").generatePublic(spec);
    }

    private static byte[] decodeCoordinate(String value) {
        byte[] coordinate;
        try {
            coordinate = Base64.getUrlDecoder().decode(value);
        } catch (IllegalArgumentException exception) {
            throw new IllegalArgumentException("Invalid EC public JWK coordinate", exception);
        }
        if (coordinate.length != COORDINATE_SIZE_BYTES) {
            throw new IllegalArgumentException("Invalid EC public JWK coordinate size");
        }
        return coordinate;
    }

    private static String b64u(BigInteger value) {
        byte[] bytes = value.toByteArray();
        if (bytes.length == COORDINATE_SIZE_BYTES + 1 && bytes[0] == 0) {
            byte[] normalized = new byte[COORDINATE_SIZE_BYTES];
            System.arraycopy(bytes, 1, normalized, 0, COORDINATE_SIZE_BYTES);
            bytes = normalized;
        } else if (bytes.length < COORDINATE_SIZE_BYTES) {
            byte[] normalized = new byte[COORDINATE_SIZE_BYTES];
            System.arraycopy(bytes, 0, normalized, COORDINATE_SIZE_BYTES - bytes.length, bytes.length);
            bytes = normalized;
        } else if (bytes.length > COORDINATE_SIZE_BYTES) {
            byte[] normalized = new byte[COORDINATE_SIZE_BYTES];
            System.arraycopy(bytes, bytes.length - COORDINATE_SIZE_BYTES, normalized, 0, COORDINATE_SIZE_BYTES);
            bytes = normalized;
        }
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
