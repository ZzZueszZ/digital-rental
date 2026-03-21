package org.web.payments.vnpay;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.web.common.dto.ApiResponse;
import org.web.payments.vnpay.dto.VnPayReturnResponse;

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

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<String>> createPayment(
            @RequestParam Long orderId,
            HttpServletRequest request
    ) {
        String url = vnPayService.createPaymentUrl(orderId, request);
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
            String frontendUrl = "http://localhost:3000/checkout/vnpay-return";
            String redirectUrl = frontendUrl + 
                "?status=" + (data.getMessage().contains("thành công") ? "success" : "error") +
                "&message=" + URLEncoder.encode(data.getMessage(), StandardCharsets.UTF_8) +
                "&orderCode=" + data.getOrderCode();
                
            response.sendRedirect(redirectUrl);

        } catch (Exception e) {
            String feUrl = "http://localhost:3000/checkout/vnpay-return";
            String redirectUrl = feUrl + "?status=error&message=" + URLEncoder.encode(e.getMessage() != null ? e.getMessage() : "Unknown error", StandardCharsets.UTF_8);
            response.sendRedirect(redirectUrl);
        }
    }
}
