package org.web.e2ee.shield.sdk.security;

import org.junit.jupiter.api.Test;

import java.security.SecureRandom;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SessionKeyStoreTest {

    @Test
    void storesDefensiveCopyAndRejectsReplay() {
        byte[] key = new byte[32];
        new SecureRandom().nextBytes(key);

        String sessionId = SessionKeyStore.put(key);
        byte[] storedKey = SessionKeyStore.get(sessionId);

        assertArrayEquals(key, storedKey);
        storedKey[0] ^= 1;
        assertArrayEquals(key, SessionKeyStore.get(sessionId));
        assertTrue(SessionKeyStore.markNonce(sessionId, "nonce-1"));
        assertFalse(SessionKeyStore.markNonce(sessionId, "nonce-1"));

        SessionKeyStore.revoke(sessionId);
        assertNull(SessionKeyStore.get(sessionId));
    }

    @Test
    void invalidKeySizeIsRejected() {
        assertThrows(IllegalArgumentException.class, () -> SessionKeyStore.put(new byte[16]));
    }
}
