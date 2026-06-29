package org.web.payments.vnpay;

import org.junit.jupiter.api.Test;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.TimeZone;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

class VnPayConfigTest {

    private static final DateTimeFormatter VNPAY_DATE_FORMAT =
            DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
    private static final ZoneId VIETNAM_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    @Test
    void createsPaymentWindowInVietnamTimeWhenJvmUsesUtc() {
        TimeZone originalTimeZone = TimeZone.getDefault();
        try {
            TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
            Instant before = Instant.now();

            Map<String, String> params = new VnPayConfig().baseParams();

            Instant after = Instant.now();
            LocalDateTime createdAt = LocalDateTime.parse(
                    params.get("vnp_CreateDate"),
                    VNPAY_DATE_FORMAT
            );
            LocalDateTime expiresAt = LocalDateTime.parse(
                    params.get("vnp_ExpireDate"),
                    VNPAY_DATE_FORMAT
            );
            Instant createdInstant = createdAt.atZone(VIETNAM_ZONE).toInstant();

            assertFalse(createdInstant.isBefore(before.minusSeconds(1)));
            assertFalse(createdInstant.isAfter(after.plusSeconds(1)));
            assertEquals(Duration.ofMinutes(15), Duration.between(createdAt, expiresAt));
        } finally {
            TimeZone.setDefault(originalTimeZone);
        }
    }
}
