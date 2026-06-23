package org.web.e2ee.shield.sdk.security;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Base64;
import java.util.UUID;
import java.time.Duration;

@Service
@RequiredArgsConstructor
public class SessionKeyStore {

    private static final Base64.Encoder B64_ENCODER = Base64.getUrlEncoder().withoutPadding();
    private static final Base64.Decoder B64_DECODER = Base64.getUrlDecoder();
    private static final String SESSION_KEY_PREFIX = "e2ee:session:";
    private static final String NONCE_KEY_SEPARATOR = ":nonce:";

    private final StringRedisTemplate redisTemplate;

    @Value("${app.e2ee.session-ttl-minutes:30}")
    private long sessionTtlMinutes;

    @Value("${app.e2ee.nonce-ttl-minutes:2}")
    private long nonceTtlMinutes;

    public String put(byte[] key) {
        if (key == null || key.length != 32) {
            throw new IllegalArgumentException("E2EE session key must be 32 bytes");
        }

        String sessionId = UUID.randomUUID().toString();
        byte[] keyCopy = Arrays.copyOf(key, key.length);
        try {
            redisTemplate.opsForValue().set(
                    sessionKey(sessionId),
                    B64_ENCODER.encodeToString(keyCopy),
                    Duration.ofMinutes(sessionTtlMinutes)
            );
        } finally {
            Arrays.fill(keyCopy, (byte) 0);
        }
        return sessionId;
    }

    public byte[] get(String sessionId) {
        if (sessionId == null || sessionId.isBlank()) {
            return null;
        }

        String encodedKey = redisTemplate.opsForValue().get(sessionKey(sessionId));
        if (encodedKey == null || encodedKey.isBlank()) {
            return null;
        }

        try {
            byte[] key = B64_DECODER.decode(encodedKey);
            return key.length == 32 ? key : null;
        } catch (IllegalArgumentException exception) {
            revoke(sessionId);
            return null;
        }
    }

    public boolean markNonce(String sessionId, String nonce) {
        if (sessionId == null || sessionId.isBlank() || nonce == null || nonce.isBlank()) {
            return false;
        }

        if (!Boolean.TRUE.equals(redisTemplate.hasKey(sessionKey(sessionId)))) {
            return false;
        }

        Boolean stored = redisTemplate.opsForValue().setIfAbsent(
                nonceKey(sessionId, nonce),
                "1",
                Duration.ofMinutes(nonceTtlMinutes)
        );
        return Boolean.TRUE.equals(stored);
    }

    public void revoke(String sessionId) {
        if (sessionId == null || sessionId.isBlank()) {
            return;
        }
        redisTemplate.delete(sessionKey(sessionId));
    }

    private static String sessionKey(String sessionId) {
        return SESSION_KEY_PREFIX + sessionId;
    }

    private static String nonceKey(String sessionId, String nonce) {
        return SESSION_KEY_PREFIX + sessionId + NONCE_KEY_SEPARATOR + nonce;
    }
}
