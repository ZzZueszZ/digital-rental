package org.web.dashboard.dto;

import java.util.Locale;

public enum RevenueReportType {
    TOTAL,
    PURCHASE,
    RENTAL;

    public static RevenueReportType from(String value) {
        if (value == null || value.isBlank()) {
            return TOTAL;
        }
        return RevenueReportType.valueOf(value.trim().toUpperCase(Locale.ROOT));
    }

    public String fileSuffix() {
        return name().toLowerCase(Locale.ROOT);
    }
}
