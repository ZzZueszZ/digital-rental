package org.web.e2ee.shield.sdk.filter;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.util.StreamUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingResponseWrapper;
import org.web.e2ee.shield.sdk.dto.EncryptedPayload;
import org.web.e2ee.shield.sdk.dto.EncryptedResult;
import org.web.e2ee.shield.sdk.policy.E2eeRoutePolicy;
import org.web.e2ee.shield.sdk.security.SessionKeyStore;
import org.web.e2ee.shield.sdk.util.CryptoUtil;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;

public class E2eeShieldFilter extends OncePerRequestFilter {

    private static final Duration MAX_CLOCK_SKEW = Duration.ofMinutes(2);
    private static final TypeReference<Map<String, Object>> MAP_TYPE = new TypeReference<>() {};
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final String E2EE_SESSION_HEADER = "X-E2EE-Session-Id";
    private static final String E2EE_AAD_HEADER = "X-E2EE-AAD";

    private final ObjectMapper objectMapper;

    public E2eeShieldFilter(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return E2eeRoutePolicy.resolve(request.getMethod(), request.getServletPath()).isEmpty();
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        String rawBody = StreamUtils.copyToString(request.getInputStream(), StandardCharsets.UTF_8);
        if (rawBody.isBlank()) {
            if (isResponseOnlyRequest(request)) {
                handleResponseOnlyRequest(request, response, filterChain);
                return;
            }
            writeError(response, HttpServletResponse.SC_BAD_REQUEST, "e2ee_payload_required");
            return;
        }

        EncryptedPayload encryptedPayload;
        try {
            encryptedPayload = objectMapper.readValue(rawBody, EncryptedPayload.class);
            validateEnvelope(encryptedPayload);
        } catch (Exception exception) {
            writeError(response, HttpServletResponse.SC_BAD_REQUEST, "invalid_e2ee_payload");
            return;
        }

        byte[] sessionKey = SessionKeyStore.get(encryptedPayload.getSessionId());
        if (sessionKey == null) {
            writeError(response, HttpServletResponse.SC_UNAUTHORIZED, "invalid_or_expired_e2ee_session");
            return;
        }

        try {
            byte[] aad = b64uDecode(encryptedPayload.getAad());
            String nonce = validateAad(request, encryptedPayload.getSessionId(), aad);

            byte[] plainBytes = CryptoUtil.decrypt(
                    sessionKey,
                    aad,
                    b64uDecode(encryptedPayload.getIv()),
                    b64uDecode(encryptedPayload.getCipherText()),
                    b64uDecode(encryptedPayload.getTag())
            );
            if (!SessionKeyStore.markNonce(encryptedPayload.getSessionId(), nonce)) {
                throw new SecurityException("e2ee_replay_detected");
            }

            DecryptedRequestWrapper decryptedRequest = new DecryptedRequestWrapper(request, plainBytes);
            doFilterAndEncryptResponse(decryptedRequest, response, filterChain, encryptedPayload.getSessionId(), sessionKey);
        } catch (SecurityException exception) {
            writeError(response, HttpServletResponse.SC_BAD_REQUEST, exception.getMessage());
        } catch (Exception exception) {
            writeError(response, HttpServletResponse.SC_BAD_REQUEST, "e2ee_processing_failed");
        }
    }

    private void handleResponseOnlyRequest(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        String sessionId = request.getHeader(E2EE_SESSION_HEADER);
        String encodedAad = request.getHeader(E2EE_AAD_HEADER);
        if (isBlank(sessionId) || isBlank(encodedAad)) {
            writeError(response, HttpServletResponse.SC_BAD_REQUEST, "e2ee_response_aad_required");
            return;
        }

        byte[] sessionKey = SessionKeyStore.get(sessionId);
        if (sessionKey == null) {
            writeError(response, HttpServletResponse.SC_UNAUTHORIZED, "invalid_or_expired_e2ee_session");
            return;
        }

        try {
            String nonce = validateAad(request, sessionId, b64uDecode(encodedAad));
            if (!SessionKeyStore.markNonce(sessionId, nonce)) {
                throw new SecurityException("e2ee_replay_detected");
            }
            doFilterAndEncryptResponse(request, response, filterChain, sessionId, sessionKey);
        } catch (SecurityException exception) {
            writeError(response, HttpServletResponse.SC_BAD_REQUEST, exception.getMessage());
        } catch (Exception exception) {
            writeError(response, HttpServletResponse.SC_BAD_REQUEST, "e2ee_processing_failed");
        }
    }

    private void doFilterAndEncryptResponse(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain,
            String sessionId,
            byte[] sessionKey
    ) throws ServletException, IOException {
        ContentCachingResponseWrapper cachingResponse = new ContentCachingResponseWrapper(response);
        filterChain.doFilter(request, cachingResponse);

        byte[] responseBody = cachingResponse.getContentAsByteArray();
        if (responseBody.length == 0) {
            cachingResponse.copyBodyToResponse();
            return;
        }

        try {
            byte[] responseAad = objectMapper.writeValueAsBytes(Map.of(
                    "sessionId", sessionId,
                    "method", request.getMethod(),
                    "path", request.getRequestURI(),
                    "timestamp", Instant.now().toEpochMilli(),
                    "nonce", randomNonce(),
                    "direction", "response"
            ));
            CryptoUtil.AesSeal seal = CryptoUtil.encrypt(sessionKey, responseAad, responseBody);
            EncryptedResult encryptedResult = new EncryptedResult(
                    sessionId,
                    b64uEncode(responseAad),
                    b64uEncode(seal.iv),
                    b64uEncode(seal.ct),
                    b64uEncode(seal.tag)
            );

            response.setStatus(cachingResponse.getStatus());
            response.setContentType("application/json;charset=UTF-8");
            byte[] encryptedBody = objectMapper.writeValueAsBytes(encryptedResult);
            response.setContentLength(encryptedBody.length);
            response.getOutputStream().write(encryptedBody);
        } catch (Exception exception) {
            throw new IOException("e2ee_response_encryption_failed", exception);
        }
    }

    private void validateEnvelope(EncryptedPayload payload) {
        if (isBlank(payload.getSessionId())
                || isBlank(payload.getAad())
                || isBlank(payload.getIv())
                || isBlank(payload.getCipherText())
                || isBlank(payload.getTag())) {
            throw new IllegalArgumentException("Missing encrypted payload field");
        }
    }

    private boolean isResponseOnlyRequest(HttpServletRequest request) {
        return "GET".equalsIgnoreCase(request.getMethod()) || "HEAD".equalsIgnoreCase(request.getMethod());
    }

    private String validateAad(HttpServletRequest request, String sessionId, byte[] aadBytes) throws IOException {
        Map<String, Object> aad = objectMapper.readValue(aadBytes, MAP_TYPE);
        String aadSessionId = asString(aad.get("sessionId"));
        String aadMethod = asString(aad.get("method"));
        String aadPath = asString(aad.get("path"));
        String nonce = asString(aad.get("nonce"));
        String direction = asString(aad.get("direction"));
        long timestamp = asLong(aad.get("timestamp"));

        if (!sessionId.equals(aadSessionId)) {
            throw new SecurityException("e2ee_session_mismatch");
        }
        if (!request.getMethod().equalsIgnoreCase(aadMethod)) {
            throw new SecurityException("e2ee_method_mismatch");
        }
        if (!request.getRequestURI().equals(aadPath)) {
            throw new SecurityException("e2ee_path_mismatch");
        }
        if (!"request".equals(direction)) {
            throw new SecurityException("e2ee_direction_mismatch");
        }
        if (b64uDecode(nonce).length != 16) {
            throw new SecurityException("invalid_e2ee_nonce");
        }

        long age = Math.abs(Instant.now().toEpochMilli() - timestamp);
        if (age > MAX_CLOCK_SKEW.toMillis()) {
            throw new SecurityException("e2ee_timestamp_expired");
        }
        return nonce;
    }

    private void writeError(HttpServletResponse response, int status, String error) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json;charset=UTF-8");
        objectMapper.writeValue(response.getOutputStream(), Map.of("error", error));
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private static String asString(Object value) {
        if (!(value instanceof String stringValue) || stringValue.isBlank()) {
            throw new SecurityException("invalid_e2ee_aad");
        }
        return stringValue;
    }

    private static long asLong(Object value) {
        if (value instanceof Number number) {
            return number.longValue();
        }
        throw new SecurityException("invalid_e2ee_aad");
    }

    private static String b64uEncode(byte[] data) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(data);
    }

    private static String randomNonce() {
        byte[] nonce = new byte[16];
        SECURE_RANDOM.nextBytes(nonce);
        return b64uEncode(nonce);
    }

    private static byte[] b64uDecode(String value) {
        return Base64.getUrlDecoder().decode(value);
    }
}
