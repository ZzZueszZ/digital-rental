package org.web.e2ee.shield.sdk.security;

import org.junit.jupiter.api.Test;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.test.util.ReflectionTestUtils;

import java.security.SecureRandom;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class SessionKeyStoreTest {

    @Test
    void storesDefensiveCopyAndRejectsReplay() {
        SessionKeyStore store = newStore();
        byte[] key = new byte[32];
        new SecureRandom().nextBytes(key);

        String sessionId = store.put(key);
        byte[] storedKey = store.get(sessionId);

        assertArrayEquals(key, storedKey);
        storedKey[0] ^= 1;
        assertArrayEquals(key, store.get(sessionId));
        assertTrue(store.markNonce(sessionId, "nonce-1"));
        assertFalse(store.markNonce(sessionId, "nonce-1"));

        store.revoke(sessionId);
        assertNull(store.get(sessionId));
    }

    @Test
    void invalidKeySizeIsRejected() {
        assertThrows(IllegalArgumentException.class, () -> newStore().put(new byte[16]));
    }

    @SuppressWarnings("unchecked")
    private SessionKeyStore newStore() {
        Map<String, String> values = new HashMap<>();
        StringRedisTemplate redisTemplate = mock(StringRedisTemplate.class);
        ValueOperations<String, String> valueOperations = mock(ValueOperations.class);
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(redisTemplate.hasKey(anyString())).thenAnswer(invocation -> values.containsKey(invocation.getArgument(0)));
        when(valueOperations.get(anyString())).thenAnswer(invocation -> values.get(invocation.getArgument(0)));
        doAnswer(invocation -> {
            values.put(invocation.getArgument(0), invocation.getArgument(1));
            return null;
        }).when(valueOperations).set(anyString(), anyString(), any(Duration.class));
        when(valueOperations.setIfAbsent(anyString(), anyString(), any(Duration.class))).thenAnswer(invocation -> {
            String key = invocation.getArgument(0);
            if (values.containsKey(key)) {
                return false;
            }
            values.put(key, invocation.getArgument(1));
            return true;
        });
        when(redisTemplate.delete(anyString())).thenAnswer(invocation -> values.remove(invocation.getArgument(0)) != null);

        SessionKeyStore store = new SessionKeyStore(redisTemplate);
        ReflectionTestUtils.setField(store, "sessionTtlMinutes", 30L);
        ReflectionTestUtils.setField(store, "nonceTtlMinutes", 2L);
        return store;
    }
}
