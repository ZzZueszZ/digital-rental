package org.web.e2ee.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.web.e2ee.dto.HandshakeRequest;
import org.web.e2ee.dto.HandshakeResponse;
import org.web.e2ee.security.EcJwkUtil;
import org.web.e2ee.security.HkdfUtil;
import org.web.e2ee.security.SessionKeyStore;

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
import java.util.Map;

@RestController
@RequestMapping("/shield")
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.e2ee.enabled", havingValue = "true")
public class HandshakeController {

    private final KeyPair serverIdentityKeyPair;

    @PostMapping("/handshake")
    public ResponseEntity<HandshakeResponse> handshake(@RequestBody HandshakeRequest request) throws Exception {
        KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("EC");
        keyPairGenerator.initialize(new ECGenParameterSpec("secp256r1"));
        KeyPair serverEphemeral = keyPairGenerator.generateKeyPair();

        ECPublicKey clientPublicKey = EcJwkUtil.importPublicJwk(request.getClientPubJwk());
        KeyAgreement keyAgreement = KeyAgreement.getInstance("ECDH");
        keyAgreement.init(serverEphemeral.getPrivate());
        keyAgreement.doPhase(clientPublicKey, true);
        byte[] sharedSecret = keyAgreement.generateSecret();

        byte[] clientNonce = Base64.getUrlDecoder().decode(request.getClientNonce());
        byte[] serverNonce = SecureRandom.getInstanceStrong().generateSeed(16);
        byte[] salt = new byte[clientNonce.length + serverNonce.length];
        System.arraycopy(clientNonce, 0, salt, 0, clientNonce.length);
        System.arraycopy(serverNonce, 0, salt, clientNonce.length, serverNonce.length);

        byte[] sessionKey = HkdfUtil.deriveKey(sharedSecret, salt, "E2EE-SHIELD/v1", 32);
        String sessionId = SessionKeyStore.put(sessionKey);

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
