package com.shield.spring_server.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.shield.spring_server.dto.EncryptedPayload;
import com.shield.spring_server.dto.EncryptedResult;
import com.shield.spring_server.security.SessionKeyStore;
import com.shield.spring_server.util.CryptoUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.util.StreamUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;

@Slf4j
public class E2eeShieldFilter extends OncePerRequestFilter {

    private final ObjectMapper objectMapper;

    public E2eeShieldFilter(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();

        // Bỏ qua handshake và các route không cần mã hóa
        if (path.startsWith("/shield/handshake")) return true;

        // Ở bản demo: chỉ áp dụng cho /api/**
        return !path.startsWith("/api/");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        // 1. Đọc raw body (EncryptedPayload) từ request
        String rawBody = StreamUtils.copyToString(
                request.getInputStream(), StandardCharsets.UTF_8
        );

        if (rawBody == null || rawBody.isBlank()) {
            // Không có body, cho qua luôn
            filterChain.doFilter(request, response);
            return;
        }

        EncryptedPayload encPayload;
        try {
            encPayload = objectMapper.readValue(rawBody, EncryptedPayload.class);
        } catch (Exception e) {
            log.warn("❌ [E2EE] Request không đúng format EncryptedPayload, bỏ qua filter");
            filterChain.doFilter(request, response);
            return;
        }

        // 2. Lấy sessionKey từ SessionKeyStore
        byte[] sessionKey = SessionKeyStore.get(encPayload.getSessionId());
        if (sessionKey == null) {
            log.warn("⚠️ [E2EE] Invalid/expired sessionId={}", encPayload.getSessionId());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            objectMapper.writeValue(response.getOutputStream(),
                    Map.of("error", "invalid_or_expired_session"));
            return;
        }

        try {
            // 3. Decode Base64URL các trường
            byte[] aad = b64uDecode(encPayload.getAad());
            byte[] iv  = b64uDecode(encPayload.getIv());
            byte[] ct  = b64uDecode(encPayload.getCipherText());
            byte[] tag = b64uDecode(encPayload.getTag());

            // 4. Giải mã payload → plaintext JSON bytes
            byte[] plainBytes = CryptoUtil.decrypt(sessionKey, aad, iv, ct, tag);

            log.info("🔓 [E2EE-REQ] Decrypted plaintext: {}",
                    new String(plainBytes, StandardCharsets.UTF_8));

            // 5. Bọc request lại để controller thấy body = plaintext
            DecryptedRequestWrapper decryptedRequest =
                    new DecryptedRequestWrapper(request, plainBytes);

            // 6. Bọc response để bắt plaintext mà controller trả về
            ContentCachingResponseWrapper cachingResponse =
                    new ContentCachingResponseWrapper(response);

            // 7. Cho request đi tiếp vào chain (controller, service, ...)
            filterChain.doFilter(decryptedRequest, cachingResponse);

            // 8. Lấy body plaintext mà controller đã ghi ra
            byte[] respPlain = cachingResponse.getContentAsByteArray();
            if (respPlain.length == 0) {
                // Không có body, copy lại y như cũ
                cachingResponse.copyBodyToResponse();
                return;
            }

            // 9. Tạo AAD response (ví dụ: "resp:<sessionId>")
            byte[] respAad = ("resp:" + encPayload.getSessionId())
                    .getBytes(StandardCharsets.UTF_8);

            CryptoUtil.AesSeal seal = CryptoUtil.encrypt(sessionKey, respAad, respPlain);

            EncryptedResult encResult = new EncryptedResult(
                    b64uEncode(respAad),
                    b64uEncode(seal.iv),
                    b64uEncode(seal.ct),
                    b64uEncode(seal.tag)
            );

            log.info("📤 [E2EE-RESP] Encrypted → iv={}, tag={}",
                    encResult.getIv(), encResult.getTag());

            // 10. Ghi EncryptedResult ra response thật
            response.setStatus(cachingResponse.getStatus());
            response.setContentType("application/json;charset=UTF-8");
            byte[] jsonOut = objectMapper.writeValueAsBytes(encResult);
            response.getOutputStream().write(jsonOut);

        } catch (Exception e) {
            log.error("❌ [E2EE] Lỗi decrypt/encrypt: {}", e.getMessage(), e);
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            objectMapper.writeValue(response.getOutputStream(),
                    Map.of("error", "e2ee_processing_failed"));
        }
    }

    private static String b64uEncode(byte[] data) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(data);
    }

    private static byte[] b64uDecode(String s) {
        return Base64.getUrlDecoder().decode(s);
    }
}
