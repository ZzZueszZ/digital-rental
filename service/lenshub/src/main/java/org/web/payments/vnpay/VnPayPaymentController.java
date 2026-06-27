package org.web.payments.vnpay;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.web.common.dto.ApiResponse;
import org.web.payments.vnpay.dto.VnPayReturnResponse;
import org.web.users.repository.UserRepository;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/payments/vnpay")
@RequiredArgsConstructor
public class VnPayPaymentController {

    private final VnPayService vnPayService;
    private final UserRepository userRepository;

    @Value("${app.frontend.base-url:https://www.lenshub.shop}")
    private String frontendBaseUrl;

    private Long getCurrentUserId(Authentication authentication) {
        String email = (String) authentication.getPrincipal();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("Tài khoản không tồn tại"))
                .getId();
    }

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<String>> createPayment(
            Authentication authentication,
            @RequestParam Long orderId,
            HttpServletRequest request
    ) {
        String url = vnPayService.createPaymentUrl(orderId, getCurrentUserId(authentication), request);
        return ResponseEntity.ok(ApiResponse.successfulResponse("Tạo URL thanh toán VNPay thành công!", url));
    }

    @GetMapping("/return")
    public void handleReturn(HttpServletRequest req, HttpServletResponse response) throws IOException {

        Map<String, String[]> raw = req.getParameterMap();
        Map<String, String> vnpParams = new HashMap<>();
        raw.forEach((k, v) -> {
            if (k.startsWith("vnp_") && v.length > 0) {
                vnpParams.put(k, v[0]);
            }
        });

        try {
            VnPayReturnResponse data = vnPayService.handleReturn(vnpParams);
            
            // Redirect về Frontend
            String frontendUrl = frontendUrl("/checkout/vnpay-return");
            String redirectUrl = frontendUrl + 
                "?status=" + (data.getMessage().contains("thành công") ? "success" : "error") +
                "&message=" + URLEncoder.encode(data.getMessage(), StandardCharsets.UTF_8) +
                "&orderCode=" + data.getOrderCode();
                
            response.sendRedirect(redirectUrl);

        } catch (Exception e) {
            String feUrl = frontendUrl("/checkout/vnpay-return");
            String redirectUrl = feUrl + "?status=error&message=" + URLEncoder.encode(e.getMessage() != null ? e.getMessage() : "Unknown error", StandardCharsets.UTF_8);
            response.sendRedirect(redirectUrl);
        }
    }

    @GetMapping("/ipn")
    public ResponseEntity<Map<String, String>> handleIpn(HttpServletRequest request) {
        String transactionRef = request.getParameter("vnp_TxnRef");
        boolean rentalPayment = transactionRef != null && transactionRef.startsWith("RNT-");
        return handleIpnRequest(request, rentalPayment);
    }

    @PostMapping("/rental-fee/create")
    public ResponseEntity<ApiResponse<String>> createRentalPayment(
            Authentication authentication,
            @RequestParam Long rentalOrderId,
            HttpServletRequest request
    ) {
        String url = vnPayService.createRentalPaymentUrl(
                rentalOrderId,
                getCurrentUserId(authentication),
                request
        );
        return ResponseEntity.ok(ApiResponse.successfulResponse("Tạo URL thanh toán phí thuê VNPay thành công!", url));
    }

    @GetMapping("/rental-fee/return")
    public void handleRentalReturn(HttpServletRequest req, HttpServletResponse response) throws IOException {
        Map<String, String[]> raw = req.getParameterMap();
        Map<String, String> vnpParams = new HashMap<>();
        raw.forEach((k, v) -> {
            if (k.startsWith("vnp_") && v.length > 0) {
                vnpParams.put(k, v[0]);
            }
        });

        try {
            VnPayReturnResponse data = vnPayService.handleRentalReturn(vnpParams);
            
            // Redirect về Frontend page cho Rental Payment Return
            String frontendUrl = frontendUrl("/rentals/payment-return");
            String redirectUrl = frontendUrl + 
                "?status=" + (data.getMessage().contains("thành công") ? "success" : "error") +
                "&message=" + URLEncoder.encode(data.getMessage(), StandardCharsets.UTF_8) +
                "&orderCode=" + data.getOrderCode();
                
            response.sendRedirect(redirectUrl);

        } catch (Exception e) {
            String feUrl = frontendUrl("/rentals/payment-return");
            String redirectUrl = feUrl + "?status=error&message=" + URLEncoder.encode(e.getMessage() != null ? e.getMessage() : "Unknown error", StandardCharsets.UTF_8);
            response.sendRedirect(redirectUrl);
        }
    }

    @GetMapping("/rental-fee/ipn")
    public ResponseEntity<Map<String, String>> handleRentalIpn(HttpServletRequest request) {
        return handleIpnRequest(request, true);
    }

    private ResponseEntity<Map<String, String>> handleIpnRequest(
            HttpServletRequest request,
            boolean rentalPayment
    ) {
        Map<String, String> vnpParams = new HashMap<>();
        request.getParameterMap().forEach((key, values) -> {
            if (key.startsWith("vnp_") && values.length > 0) {
                vnpParams.put(key, values[0]);
            }
        });

        try {
            if (rentalPayment) {
                vnPayService.handleRentalReturn(vnpParams);
            } else {
                vnPayService.handleReturn(vnpParams);
            }
            return ResponseEntity.ok(Map.of("RspCode", "00", "Message", "Confirm Success"));
        } catch (Exception exception) {
            return ResponseEntity.ok(Map.of(
                    "RspCode",
                    "99",
                    "Message",
                    exception.getMessage() != null ? exception.getMessage() : "Unknown error"
            ));
        }
    }

    private String frontendUrl(String path) {
        String baseUrl = frontendBaseUrl == null || frontendBaseUrl.isBlank()
                ? "https://www.lenshub.shop"
                : frontendBaseUrl.trim();
        if (baseUrl.endsWith("/")) {
            baseUrl = baseUrl.substring(0, baseUrl.length() - 1);
        }
        return path.startsWith("/") ? baseUrl + path : baseUrl + "/" + path;
    }
}
