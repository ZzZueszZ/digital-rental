package org.web.payments.vnpay;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.web.common.enums.PaymentMethod;
import org.web.common.enums.PaymentStatus;
import org.web.common.exceptions.ApplicationException;
import org.web.orders.model.Order;
import org.web.orders.repository.OrderRepository;
import org.web.payments.model.PaymentTransactionLog;
import org.web.payments.repository.PaymentTransactionLogRepository;
import org.web.payments.vnpay.dto.VnPayReturnResponse;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class VnPayService {

    private final VnPayConfig config;
    private final OrderRepository orderRepository;
    private final PaymentTransactionLogRepository paymentTransactionLogRepository;
    private final org.web.rentals.repository.RentalOrderRepository rentalOrderRepository;

    public String createPaymentUrl(Long orderId, HttpServletRequest request) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng"));

        if (order.getPaymentStatus() == PaymentStatus.SUCCESS) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Đơn hàng đã được thanh toán");
        }

        if (order.getPaymentMethod() != PaymentMethod.ONLINE) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Phương thức thanh toán khoản này không phải ONLINE (VNPay)");
        }

        long amount = order.getTotalPrice()
                .multiply(BigDecimal.valueOf(100))
                .longValue();

        Map<String, String> params = config.baseParams();

        params.put("vnp_Amount", String.valueOf(amount));
        params.put("vnp_TxnRef", order.getCode());
        params.put("vnp_OrderInfo", "Thanh toan don hang " + order.getCode());
        params.put("vnp_IpAddr", request.getRemoteAddr());

        String hashData = VnPayUtil.generateQuery(params, false);
        String secureHash = VnPayUtil.hmacSHA512(config.getHashSecret(), hashData);

        String queryUrl = VnPayUtil.generateQuery(params, true) + "&vnp_SecureHash=" + secureHash;

        log.info("VnPay Query URL: {}", queryUrl);
        return config.getPayUrl() + "?" + queryUrl;
    }

    public boolean validateSignature(Map<String, String> vnpParams) {
        String receivedHash = vnpParams.get("vnp_SecureHash");
        if (receivedHash == null || receivedHash.isBlank()) {
            return false;
        }

        Map<String, String> params = new HashMap<>();
        vnpParams.forEach((k, v) -> {
            if (k.startsWith("vnp_") && !"vnp_SecureHash".equals(k) && !"vnp_SecureHashType".equals(k)) {
                params.put(k, v);
            }
        });

        String hashData = VnPayUtil.generateQuery(params, false);
        String expectedHash = VnPayUtil.hmacSHA512(config.getHashSecret(), hashData);

        return expectedHash.equalsIgnoreCase(receivedHash);
    }

    public VnPayReturnResponse handleReturn(Map<String, String> vnpParams) {

        boolean valid = validateSignature(new HashMap<>(vnpParams));
        if (!valid) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Chữ ký VNPAY không hợp lệ");
        }

        String txnRef = vnpParams.get("vnp_TxnRef");
        String rspCode = vnpParams.get("vnp_ResponseCode");
        String transactionStatus = vnpParams.get("vnp_TransactionStatus");
        String transactionNo = vnpParams.get("vnp_TransactionNo");
        String bankCode = vnpParams.get("vnp_BankCode");
        String amountStr = vnpParams.get("vnp_Amount");
        String payDateStr = vnpParams.get("vnp_PayDate");

        Order order = orderRepository.findByCode(txnRef)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Order not found with VNPAY transaction code"));

        BigDecimal paidAmount = null;
        if (amountStr != null) {
            paidAmount = BigDecimal.valueOf(Long.parseLong(amountStr)).divide(BigDecimal.valueOf(100));
        }

        boolean success = "00".equals(rspCode) && "00".equals(transactionStatus);

        if (success) {
            order.markPaidByVnPay(transactionNo, rspCode, paidAmount != null ? paidAmount : order.getTotalPrice(), vnpParams.toString());
        } else {
            order.markPaymentFailed("VNPAY", rspCode, vnpParams.toString());
        }

        orderRepository.save(order);
        savePaymentLog(order, success ? PaymentStatus.SUCCESS : PaymentStatus.FAILED, paidAmount, transactionNo, rspCode, vnpParams.toString());

        return VnPayReturnResponse.builder()
                .orderCode(order.getCode())
                .paymentStatus(order.getPaymentStatus())
                .vnpResponseCode(rspCode)
                .vnpTransactionStatus(transactionStatus)
                .vnpTransactionNo(transactionNo)
                .vnpBankCode(bankCode)
                .vnpAmount(amountStr)
                .vnpPayDate(payDateStr)
                .message(success ? "Thanh toán thành công" : "Thanh toán thất bại")
                .build();
    }

    private void savePaymentLog(Order order, PaymentStatus status, BigDecimal amount, String transactionId, String responseCode, String rawPayload) {
        PaymentTransactionLog logEntry = PaymentTransactionLog.builder()
                .order(order)
                .provider("VNPAY")
                .status(status)
                .amount(amount != null ? amount : order.getTotalPrice())
                .currency("VND")
                .transactionId(transactionId)
                .orderCode(order.getCode())
                .responseCode(responseCode)
                .rawPayload(rawPayload)
                .note(status == PaymentStatus.SUCCESS ? "Success recorded" : "Payment processing failed")
                .build();

        paymentTransactionLogRepository.save(logEntry);
    }

    public String createRentalPaymentUrl(Long rentalOrderId, HttpServletRequest request) {
        org.web.rentals.model.RentalOrder order = rentalOrderRepository.findById(rentalOrderId)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn thuê"));

        if (order.getPaymentStatus() == PaymentStatus.SUCCESS) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Phí thuê đã được thanh toán");
        }

        if (order.getPaymentMethod() != PaymentMethod.ONLINE) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Phương thức thanh toán khoản này không phải ONLINE (VNPay)");
        }

        long amount = order.getRentalFee()
                .multiply(BigDecimal.valueOf(100))
                .longValue();

        Map<String, String> params = config.baseParams();
        params.put("vnp_Amount", String.valueOf(amount));
        params.put("vnp_TxnRef", order.getCode());
        params.put("vnp_OrderInfo", "Thanh toan don thue " + order.getCode());
        params.put("vnp_IpAddr", request.getRemoteAddr());
        // Use a different return URL for rentals to differentiate
        params.put("vnp_ReturnUrl", "http://localhost:8080/api/payments/vnpay/rental-fee/return");

        String hashData = VnPayUtil.generateQuery(params, false);
        String secureHash = VnPayUtil.hmacSHA512(config.getHashSecret(), hashData);
        String queryUrl = VnPayUtil.generateQuery(params, true) + "&vnp_SecureHash=" + secureHash;
        log.info("VnPay Rental Query URL: {}", queryUrl);
        return config.getPayUrl() + "?" + queryUrl;
    }

    public VnPayReturnResponse handleRentalReturn(Map<String, String> vnpParams) {
        boolean valid = validateSignature(new HashMap<>(vnpParams));
        if (!valid) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Chữ ký VNPAY không hợp lệ");
        }

        String txnRef = vnpParams.get("vnp_TxnRef");
        String rspCode = vnpParams.get("vnp_ResponseCode");
        String transactionStatus = vnpParams.get("vnp_TransactionStatus");
        String transactionNo = vnpParams.get("vnp_TransactionNo");
        String bankCode = vnpParams.get("vnp_BankCode");
        String amountStr = vnpParams.get("vnp_Amount");
        String payDateStr = vnpParams.get("vnp_PayDate");

        org.web.rentals.model.RentalOrder order = rentalOrderRepository.findByCode(txnRef)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Order not found with VNPAY transaction code"));

        BigDecimal paidAmount = null;
        if (amountStr != null) {
            paidAmount = BigDecimal.valueOf(Long.parseLong(amountStr)).divide(BigDecimal.valueOf(100));
        }

        boolean success = "00".equals(rspCode) && "00".equals(transactionStatus);

        if (success) {
            order.setPaymentStatus(PaymentStatus.SUCCESS);
            order.setStatus(org.web.common.enums.RentalOrderStatus.PAID_RENTAL_FEE);
            order.setPaymentTransactionNo(transactionNo);
            order.setPaymentResponseCode(rspCode);
            order.setPaymentRawPayload(vnpParams.toString());
            rentalOrderRepository.save(order);
        } else {
            order.setPaymentStatus(PaymentStatus.FAILED);
            order.setPaymentResponseCode(rspCode);
            order.setPaymentRawPayload(vnpParams.toString());
            rentalOrderRepository.save(order);
        }

        return VnPayReturnResponse.builder()
                .orderCode(order.getCode())
                .paymentStatus(order.getPaymentStatus())
                .vnpResponseCode(rspCode)
                .vnpTransactionStatus(transactionStatus)
                .vnpTransactionNo(transactionNo)
                .vnpBankCode(bankCode)
                .vnpAmount(amountStr)
                .vnpPayDate(payDateStr)
                .message(success ? "Thanh toán phí thuê thành công" : "Thanh toán phí thuê thất bại")
                .build();
    }
}
