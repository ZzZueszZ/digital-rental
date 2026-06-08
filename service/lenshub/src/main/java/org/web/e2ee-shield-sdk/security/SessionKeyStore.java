package org.web.e2ee.security;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

public class SessionKeyStore {

    public static class Entry {
        public final byte[] key;       // 32 bytes AES-256
        public final Instant expiresAt;
        private final Map<String, Instant> usedNonces = new ConcurrentHashMap<>();

        public Entry(byte[] key, Instant expiresAt) {
            this.key = key;
            this.expiresAt = expiresAt;
        }
    }

    private static final Map<String, Entry> STORE = new ConcurrentHashMap<>();
    // TTL táº¡m: 30 phÃºt
    private static final long TTL_SECONDS = 30 * 60;

    public static String put(byte[] key) {
        String sessionId = UUID.randomUUID().toString();
        STORE.put(sessionId, new Entry(key, Instant.now().plusSeconds(TTL_SECONDS)));
        return sessionId;
    }

    public static byte[] get(String sessionId) {
        Entry e = STORE.get(sessionId);
        if (e == null) return null;
        if (Instant.now().isAfter(e.expiresAt)) {
            STORE.remove(sessionId);
            return null;
        }
        return e.key;
    }

    public static boolean markNonce(String sessionId, String nonce) {
        if (nonce == null || nonce.isBlank()) return false;
        Entry e = STORE.get(sessionId);
        if (e == null || Instant.now().isAfter(e.expiresAt)) {
            STORE.remove(sessionId);
            return false;
        }
        cleanupNonces(e);
        return e.usedNonces.putIfAbsent(nonce, Instant.now()) == null;
    }

    public static void revoke(String sessionId) {
        STORE.remove(sessionId);
    }

    private static void cleanupNonces(Entry e) {
        Instant cutoff = Instant.now().minusSeconds(TTL_SECONDS);
        e.usedNonces.entrySet().removeIf(entry -> entry.getValue().isBefore(cutoff));
    }
}


