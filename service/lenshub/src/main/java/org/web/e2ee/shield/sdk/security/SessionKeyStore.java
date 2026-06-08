package org.web.e2ee.shield.sdk.security;

import java.time.Instant;
import java.util.Arrays;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

public final class SessionKeyStore {

    private static final long TTL_SECONDS = 30 * 60;
    private static final long NONCE_TTL_SECONDS = 2 * 60;
    private static final int MAX_SESSIONS = 10_000;
    private static final int MAX_NONCES_PER_SESSION = 4_096;
    private static final Map<String, Entry> STORE = new ConcurrentHashMap<>();

    private SessionKeyStore() {
    }

    private static final class Entry {
        private final byte[] key;
        private final Instant expiresAt;
        private final Map<String, Instant> usedNonces = new ConcurrentHashMap<>();

        private Entry(byte[] key, Instant expiresAt) {
            this.key = key;
            this.expiresAt = expiresAt;
        }
    }

    public static String put(byte[] key) {
        if (key == null || key.length != 32) {
            throw new IllegalArgumentException("E2EE session key must be 32 bytes");
        }

        cleanupExpiredSessions();
        if (STORE.size() >= MAX_SESSIONS) {
            throw new IllegalStateException("E2EE session capacity reached");
        }

        String sessionId = UUID.randomUUID().toString();
        STORE.put(sessionId, new Entry(
                Arrays.copyOf(key, key.length),
                Instant.now().plusSeconds(TTL_SECONDS)
        ));
        return sessionId;
    }

    public static byte[] get(String sessionId) {
        Entry entry = STORE.get(sessionId);
        if (entry == null) {
            return null;
        }
        if (Instant.now().isAfter(entry.expiresAt)) {
            removeAndClear(sessionId, entry);
            return null;
        }
        return Arrays.copyOf(entry.key, entry.key.length);
    }

    public static boolean markNonce(String sessionId, String nonce) {
        if (nonce == null || nonce.isBlank()) {
            return false;
        }

        Entry entry = STORE.get(sessionId);
        if (entry == null || Instant.now().isAfter(entry.expiresAt)) {
            if (entry != null) {
                removeAndClear(sessionId, entry);
            }
            return false;
        }

        cleanupNonces(entry);
        if (entry.usedNonces.size() >= MAX_NONCES_PER_SESSION) {
            return false;
        }
        return entry.usedNonces.putIfAbsent(nonce, Instant.now()) == null;
    }

    public static void revoke(String sessionId) {
        Entry entry = STORE.remove(sessionId);
        if (entry != null) {
            clear(entry);
        }
    }

    private static void cleanupNonces(Entry entry) {
        Instant cutoff = Instant.now().minusSeconds(NONCE_TTL_SECONDS);
        entry.usedNonces.entrySet().removeIf(item -> item.getValue().isBefore(cutoff));
    }

    private static void cleanupExpiredSessions() {
        Instant now = Instant.now();
        STORE.forEach((sessionId, entry) -> {
            if (now.isAfter(entry.expiresAt)) {
                removeAndClear(sessionId, entry);
            }
        });
    }

    private static void removeAndClear(String sessionId, Entry entry) {
        if (STORE.remove(sessionId, entry)) {
            clear(entry);
        }
    }

    private static void clear(Entry entry) {
        Arrays.fill(entry.key, (byte) 0);
        entry.usedNonces.clear();
    }
}
