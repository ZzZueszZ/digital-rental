package org.web.e2ee.shield.sdk.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.web.e2ee.shield.sdk.dto.HandshakeRequest;
import org.web.e2ee.shield.sdk.dto.HandshakeResponse;
import org.web.e2ee.shield.sdk.security.EcJwkUtil;
import org.web.e2ee.shield.sdk.security.HkdfUtil;
import org.web.e2ee.shield.sdk.security.SessionKeyStore;

import javax.crypto.KeyAgreement;
import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.SecureRandom;
import java.security.Signature;
import java.security.interfaces.ECPublicKey;
import java.security.spec.ECGenParameterSpec;
import java.util.Base64;
import java.util.Arrays;
import java.util.Map;

@RestController
@RequestMapping("/shield")
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.e2ee.enabled", havingValue = "true")
public class HandshakeController {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final int NONCE_SIZE_BYTES = 16;

    private final KeyPair serverIdentityKeyPair;

    @PostMapping("/handshake")
    public ResponseEntity<HandshakeResponse> handshake(@RequestBody HandshakeRequest request) throws Exception {
        validateRequest(request);

        KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("EC");
        keyPairGenerator.initialize(new ECGenParameterSpec("secp256r1"), SECURE_RANDOM);
        KeyPair serverEphemeral = keyPairGenerator.generateKeyPair();

        ECPublicKey clientPublicKey = importClientPublicKey(request);
        KeyAgreement keyAgreement = KeyAgreement.getInstance("ECDH");
        keyAgreement.init(serverEphemeral.getPrivate());
        keyAgreement.doPhase(clientPublicKey, true);
        byte[] sharedSecret = keyAgreement.generateSecret();

        byte[] clientNonce = Base64.getUrlDecoder().decode(request.getClientNonce());
        byte[] serverNonce = new byte[NONCE_SIZE_BYTES];
        SECURE_RANDOM.nextBytes(serverNonce);
        byte[] salt = new byte[clientNonce.length + serverNonce.length];
        System.arraycopy(clientNonce, 0, salt, 0, clientNonce.length);
        System.arraycopy(serverNonce, 0, salt, clientNonce.length, serverNonce.length);

        byte[] sessionKey = HkdfUtil.deriveKey(sharedSecret, salt, "E2EE-SHIELD/v1", 32);
        String sessionId;
        try {
            sessionId = SessionKeyStore.put(sessionKey);
        } catch (IllegalStateException exception) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "E2EE session capacity reached",
                    exception
            );
        } finally {
            Arrays.fill(sharedSecret, (byte) 0);
            Arrays.fill(sessionKey, (byte) 0);
        }

        Map<String, Object> serverJwk = EcJwkUtil.exportPublicJwk((ECPublicKey) serverEphemeral.getPublic());
        String serverNonceB64u = Base64.getUrlEncoder().withoutPadding().encodeToString(serverNonce);
        String payload = sessionId + "." + serverNonceB64u + "." + serverJwk.get("x") + "." + serverJwk.get("y");

        Signature ecdsa = Signature.getInstance("SHA256withECDSA");
        ecdsa.initSign(serverIdentityKeyPair.getPrivate());
        ecdsa.update(payload.getBytes(StandardCharsets.UTF_8));
        byte[] rawSignature = derToConcat(ecdsa.sign(), 32);
        String signatureB64u = Base64.getUrlEncoder().withoutPadding().encodeToString(rawSignature);

        return ResponseEntity.ok(new HandshakeResponse(
                sessionId,
                serverJwk,
                serverNonceB64u,
                signatureB64u
        ));
    }

    private static void validateRequest(HandshakeRequest request) {
        if (request == null || request.getClientPubJwk() == null || request.getClientNonce() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid E2EE handshake request");
        }

        byte[] nonce;
        try {
            nonce = Base64.getUrlDecoder().decode(request.getClientNonce());
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid E2EE client nonce", exception);
        }
        if (nonce.length != NONCE_SIZE_BYTES) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "E2EE client nonce must be 16 bytes");
        }
    }

    private static ECPublicKey importClientPublicKey(HandshakeRequest request) {
        try {
            return EcJwkUtil.importPublicJwk(request.getClientPubJwk());
        } catch (Exception exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid E2EE client public key",
                    exception
            );
        }
    }

    private static byte[] derToConcat(byte[] derSignature, int size) throws Exception {
        ByteArrayInputStream input = new ByteArrayInputStream(derSignature);
        if (input.read() != 0x30) throw new IllegalArgumentException("Invalid DER signature");
        input.read();
        if (input.read() != 0x02) throw new IllegalArgumentException("Invalid DER format (r)");
        int rLength = input.read();
        byte[] r = input.readNBytes(rLength);
        if (input.read() != 0x02) throw new IllegalArgumentException("Invalid DER format (s)");
        int sLength = input.read();
        byte[] s = input.readNBytes(sLength);

        byte[] output = new byte[size * 2];
        System.arraycopy(r, Math.max(0, r.length - size), output, size - Math.min(size, r.length), Math.min(size, r.length));
        System.arraycopy(s, Math.max(0, s.length - size), output, 2 * size - Math.min(size, s.length), Math.min(size, s.length));
        return output;
    }
}
