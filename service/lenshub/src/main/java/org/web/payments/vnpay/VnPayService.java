package org.web.payments.vnpay;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.web.common.enums.PaymentMethod;
import org.web.common.enums.PaymentStatus;
import org.web.common.enums.OrderStatus;
import org.web.common.enums.RentalOrderStatus;
import org.web.common.exceptions.ApplicationException;
import org.web.orders.model.Order;
import org.web.orders.repository.OrderRepository;
import org.web.payments.model.PaymentTransactionLog;
import org.web.payments.repository.PaymentTransactionLogRepository;
import org.web.payments.vnpay.dto.VnPayReturnResponse;
import org.web.rentals.service.RentalService;

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
    private final RentalService rentalService;

    public String createPaymentUrl(Long orderId, Long userId, HttpServletRequest request) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng"));

        if (!order.getUser().getId().equals(userId)) {
            throw new ApplicationException(HttpStatus.FORBIDDEN, "Bạn không có quyền thanh toán đơn hàng này");
        }

        if (order.getPaymentStatus() == PaymentStatus.SUCCESS) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Đơn hàng đã được thanh toán");
        }

        if (order.getStatus() == OrderStatus.CANCELED) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Không thể thanh toán đơn hàng đã hủy");
        }

        if (order.getPaymentMethod() != PaymentMethod.ONLINE) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Phương thức thanh toán khoản này không phải ONLINE (VNPay)");
        }

        long amount = order.getTotalPrice()
                .multiply(BigDecimal.valueOf(100))
                .longValue();

        Map<String, String> params = config.baseParams();

        params.put("vnp_Amount", String.valueOf(amount));
        params.put("vnp_TxnRef", createRetryTransactionRef(order.getCode()));
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

    @Transactional
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

        Order order = orderRepository.findByCodeForUpdate(extractOrderCode(txnRef))
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Order not found with VNPAY transaction code"));

        BigDecimal paidAmount = null;
        if (amountStr != null) {
            paidAmount = BigDecimal.valueOf(Long.parseLong(amountStr)).divide(BigDecimal.valueOf(100));
        }

        boolean success = "00".equals(rspCode) && "00".equals(transactionStatus);

        if (order.getPaymentStatus() == PaymentStatus.SUCCESS) {
            return buildReturnResponse(
                    order.getCode(),
                    PaymentStatus.SUCCESS,
                    rspCode,
                    transactionStatus,
                    transactionNo,
                    bankCode,
                    amountStr,
                    payDateStr,
                    "Giao dịch đã được xử lý trước đó"
            );
        }

        if (success && order.getStatus() == OrderStatus.CANCELED) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Đơn hàng đã hủy, không thể ghi nhận thanh toán");
        }

        if (success && (paidAmount == null || paidAmount.compareTo(order.getTotalPrice()) != 0)) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Số tiền thanh toán không khớp với đơn hàng");
        }

        if (success) {
            order.markPaidByVnPay(transactionNo, rspCode, paidAmount, vnpParams.toString());
        } else {
            order.markPaymentFailed("VNPAY", rspCode, vnpParams.toString());
        }

        orderRepository.save(order);
        savePaymentLog(order, success ? PaymentStatus.SUCCESS : PaymentStatus.FAILED, paidAmount, transactionNo, rspCode, vnpParams.toString());

        return buildReturnResponse(
                order.getCode(),
                order.getPaymentStatus(),
                rspCode,
                transactionStatus,
                transactionNo,
                bankCode,
                amountStr,
                payDateStr,
                success ? "Thanh toán thành công" : "Thanh toán thất bại"
        );
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

    public String createRentalPaymentUrl(Long rentalOrderId, Long userId, HttpServletRequest request) {
        org.web.rentals.model.RentalOrder order = rentalOrderRepository.findById(rentalOrderId)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn thuê"));

        if (!order.getUser().getId().equals(userId)) {
            throw new ApplicationException(HttpStatus.FORBIDDEN, "Bạn không có quyền thanh toán đơn thuê này");
        }

        if (order.getPaymentStatus() == PaymentStatus.SUCCESS) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Phí thuê đã được thanh toán");
        }

        if (order.getStatus() != RentalOrderStatus.PENDING_PAYMENT) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Đơn thuê không còn ở trạng thái chờ thanh toán");
        }

        if (order.getPaymentMethod() != PaymentMethod.ONLINE) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Phương thức thanh toán khoản này không phải ONLINE (VNPay)");
        }

        long amount = order.getRentalFee()
                .multiply(BigDecimal.valueOf(100))
                .longValue();

        Map<String, String> params = config.baseParams();
        params.put("vnp_Amount", String.valueOf(amount));
        params.put("vnp_TxnRef", createRetryTransactionRef(order.getCode()));
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

    @Transactional
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

        org.web.rentals.model.RentalOrder order = rentalOrderRepository.findByCodeForUpdate(extractOrderCode(txnRef))
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Order not found with VNPAY transaction code"));

        BigDecimal paidAmount = null;
        if (amountStr != null) {
            paidAmount = BigDecimal.valueOf(Long.parseLong(amountStr)).divide(BigDecimal.valueOf(100));
        }

        boolean success = "00".equals(rspCode) && "00".equals(transactionStatus);

        if (order.getPaymentStatus() == PaymentStatus.SUCCESS) {
            return buildReturnResponse(
                    order.getCode(),
                    PaymentStatus.SUCCESS,
                    rspCode,
                    transactionStatus,
                    transactionNo,
                    bankCode,
                    amountStr,
                    payDateStr,
                    "Giao dịch phí thuê đã được xử lý trước đó"
            );
        }

        if (success && order.getStatus() != RentalOrderStatus.PENDING_PAYMENT) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Đơn thuê không còn ở trạng thái chờ thanh toán");
        }

        if (success && (paidAmount == null || paidAmount.compareTo(order.getRentalFee()) != 0)) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Số tiền thanh toán không khớp với phí thuê");
        }

        if (success) {
            rentalService.payDeposit(order.getId());
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

        return buildReturnResponse(
                order.getCode(),
                order.getPaymentStatus(),
                rspCode,
                transactionStatus,
                transactionNo,
                bankCode,
                amountStr,
                payDateStr,
                success ? "Thanh toán phí thuê thành công" : "Thanh toán phí thuê thất bại"
        );
    }

    private String createRetryTransactionRef(String orderCode) {
        return orderCode + "_" + System.currentTimeMillis();
    }

    private String extractOrderCode(String transactionRef) {
        int retrySuffixIndex = transactionRef.lastIndexOf('_');
        if (retrySuffixIndex <= 0) {
            return transactionRef;
        }

        String retrySuffix = transactionRef.substring(retrySuffixIndex + 1);
        return retrySuffix.matches("\\d{13}")
                ? transactionRef.substring(0, retrySuffixIndex)
                : transactionRef;
    }

    private VnPayReturnResponse buildReturnResponse(
            String orderCode,
            PaymentStatus paymentStatus,
            String responseCode,
            String transactionStatus,
            String transactionNo,
            String bankCode,
            String amount,
            String payDate,
            String message
    ) {
        return VnPayReturnResponse.builder()
                .orderCode(orderCode)
                .paymentStatus(paymentStatus)
                .vnpResponseCode(responseCode)
                .vnpTransactionStatus(transactionStatus)
                .vnpTransactionNo(transactionNo)
                .vnpBankCode(bankCode)
                .vnpAmount(amount)
                .vnpPayDate(payDate)
                .message(message)
                .build();
    }
}
