package org.web.payments.vnpay.dto;

import lombok.Builder;
import lombok.Data;
import org.web.common.enums.PaymentStatus;

@Data
@Builder
public class VnPayReturnResponse {

    private String orderCode;
    private PaymentStatus paymentStatus;

    private String vnpResponseCode;
    private String vnpTransactionStatus;
    private String vnpTransactionNo;
    private String vnpBankCode;
    private String vnpAmount;
    private String vnpPayDate;

    private String message;
}
