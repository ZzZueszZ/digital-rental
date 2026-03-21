package org.web.vouchers.model;

import jakarta.persistence.*;
import lombok.*;
import org.web.common.enums.VoucherScope;
import org.web.common.enums.VoucherStatus;
import org.web.common.enums.VoucherType;
import org.web.common.model.BaseAuditEntity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "vouchers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Voucher extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VoucherType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VoucherScope scope;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal discountValue;

    @Column(precision = 12, scale = 2)
    private BigDecimal maxDiscountAmount;

    @Column(precision = 12, scale = 2)
    private BigDecimal minOrderValue;

    private Integer maxUsagePerUser;

    private Integer maxUsage;

    @Builder.Default
    @Column(nullable = false)
    private Integer usedCount = 0;

    private LocalDateTime startDate;

    private LocalDateTime endDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VoucherStatus status;
}
