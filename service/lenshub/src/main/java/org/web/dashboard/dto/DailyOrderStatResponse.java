package org.web.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyOrderStatResponse {
    private LocalDate date;
    private Long count;
    private Long purchaseCount;
    private Long rentalCount;

    public DailyOrderStatResponse(LocalDate date, Long count) {
        this.date = date;
        this.count = count;
        this.purchaseCount = count;
        this.rentalCount = 0L;
    }
}
