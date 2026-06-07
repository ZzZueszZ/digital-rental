package com.shield.spring_server.security;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

public class SessionKeyStore {

    public static class Entry {
        public final byte[] key;       // 32 bytes AES-256
        public final Instant expiresAt;

        public Entry(byte[] key, Instant expiresAt) {
            this.key = key;
            this.expiresAt = expiresAt;
        }
    }

    private static final Map<String, Entry> STORE = new ConcurrentHashMap<>();
    // TTL tạm: 30 phút
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

    public static void revoke(String sessionId) {
        STORE.remove(sessionId);
    }
}

