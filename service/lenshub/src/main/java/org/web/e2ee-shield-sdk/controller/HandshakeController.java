package com.shield.spring_server.controller;

import com.shield.spring_server.dto.HandshakeRequest;
import com.shield.spring_server.dto.HandshakeResponse;
import com.shield.spring_server.security.EcJwkUtil;
import com.shield.spring_server.security.HkdfUtil;
import com.shield.spring_server.security.SessionKeyStore;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.crypto.KeyAgreement;
import java.nio.charset.StandardCharsets;
import java.security.*;
import java.security.interfaces.ECPublicKey;
import java.security.spec.ECGenParameterSpec;
import java.util.Base64;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/shield")
@RequiredArgsConstructor
public class HandshakeController {

    private final KeyPair serverIdentityKeyPair; // Inject từ ServerKeyConfig

    @PostMapping("/handshake")
    public ResponseEntity<HandshakeResponse> handshake(@RequestBody HandshakeRequest req) throws Exception {
        log.info("🤝 [HANDSHAKE] From FE crv={}, x.len={}, y.len={}",
                req.getClientPubJwk().get("crv"),
                ((String) req.getClientPubJwk().get("x")).length(),
                ((String) req.getClientPubJwk().get("y")).length()
        );

        // Sinh cặp khóa ECDH tạm
        KeyPairGenerator kpg = KeyPairGenerator.getInstance("EC");
        kpg.initialize(new ECGenParameterSpec("secp256r1"));
        KeyPair serverEphemeral = kpg.generateKeyPair();

        // Parse public key client
        ECPublicKey clientPub = EcJwkUtil.importPublicJwk(req.getClientPubJwk());

        // Derive shared secret
        KeyAgreement ka = KeyAgreement.getInstance("ECDH");
        ka.init(serverEphemeral.getPrivate());
        ka.doPhase(clientPub, true);
        byte[] shared = ka.generateSecret();

        // Nonce + salt
        byte[] clientNonce = Base64.getUrlDecoder().decode(req.getClientNonce());
        byte[] serverNonce = SecureRandom.getInstanceStrong().generateSeed(16);
        byte[] salt = new byte[clientNonce.length + serverNonce.length];
        System.arraycopy(clientNonce, 0, salt, 0, clientNonce.length);
        System.arraycopy(serverNonce, 0, salt, clientNonce.length, serverNonce.length);

        // HKDF derive AES key
        byte[] sessionKey = HkdfUtil.deriveKey(shared, salt, "E2EE-SHIELD/v1", 32);
        String sessionId = SessionKeyStore.put(sessionKey);

        // Xuất public JWK + nonce
        Map<String, Object> serverJwk = EcJwkUtil.exportPublicJwk((ECPublicKey) serverEphemeral.getPublic());
        String serverNonceB64u = Base64.getUrlEncoder().withoutPadding().encodeToString(serverNonce);

        // Tạo payload cần ký
        String payload = sessionId + "." + serverNonceB64u + "." +
                serverJwk.get("x") + "." + serverJwk.get("y");
        log.info("📝 Signing payload = {}", payload);

        // Ký payload bằng private key (ECDSA)
        Signature ecdsa = Signature.getInstance("SHA256withECDSA");
        ecdsa.initSign(serverIdentityKeyPair.getPrivate());
        ecdsa.update(payload.getBytes(StandardCharsets.UTF_8));
        byte[] derSig = ecdsa.sign();
        byte[] rawSig = derToConcat(derSig, 32); // convert DER → raw (r||s)
        String signatureB64u = Base64.getUrlEncoder().withoutPadding().encodeToString(rawSig);

        log.info("✅ [HANDSHAKE] Done → sessionId={}, signature.len={}, derivedKey.len={}",
                sessionId, rawSig.length, sessionKey.length
        );

        HandshakeResponse resp = new HandshakeResponse(
                sessionId, serverJwk, serverNonceB64u, signatureB64u
        );
        return ResponseEntity.ok(resp);
    }

    /**
     * Chuyển chữ ký DER (ASN.1) sang raw (r||s) 64 bytes để FE verify được
     */
    private static byte[] derToConcat(byte[] derSig, int size) throws Exception {
        java.io.ByteArrayInputStream in = new java.io.ByteArrayInputStream(derSig);
        if (in.read() != 0x30) throw new IllegalArgumentException("Invalid DER signature");
        in.read(); // tổng độ dài
        if (in.read() != 0x02) throw new IllegalArgumentException("Invalid DER format (r)");
        int rLen = in.read();
        byte[] r = in.readNBytes(rLen);
        if (in.read() != 0x02) throw new IllegalArgumentException("Invalid DER format (s)");
        int sLen = in.read();
        byte[] s = in.readNBytes(sLen);

        byte[] out = new byte[size * 2];
        System.arraycopy(r, Math.max(0, r.length - size), out, size - Math.min(size, r.length), Math.min(size, r.length));
        System.arraycopy(s, Math.max(0, s.length - size), out, 2 * size - Math.min(size, s.length), Math.min(size, s.length));
        return out;
    }
}
