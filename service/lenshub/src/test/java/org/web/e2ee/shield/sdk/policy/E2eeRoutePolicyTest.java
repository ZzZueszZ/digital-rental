package org.web.e2ee.shield.sdk.policy;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class E2eeRoutePolicyTest {

    @Test
    void resolvesCriticalAndSensitiveRoutes() {
        assertEquals(
                E2eeLevel.CRITICAL,
                E2eeRoutePolicy.resolve("POST", "/auth/login").orElseThrow()
        );
        assertEquals(
                E2eeLevel.SENSITIVE,
                E2eeRoutePolicy.resolve("POST", "/rentals/checkout").orElseThrow()
        );
        assertEquals(
                E2eeLevel.SENSITIVE,
                E2eeRoutePolicy.resolve("POST", "/payments/vnpay/create").orElseThrow()
        );
    }

    @Test
    void leavesPublicAndMultipartRoutesUnprotected() {
        assertTrue(E2eeRoutePolicy.resolve("GET", "/products/1").isEmpty());
        assertTrue(E2eeRoutePolicy.resolve("POST", "/ekyc/upload-front").isEmpty());
        assertTrue(E2eeRoutePolicy.resolve("GET", "/payments/vnpay/return").isEmpty());
    }
}
