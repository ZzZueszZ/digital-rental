package org.web.orders.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.web.common.dto.ApiResponse;
import org.web.common.enums.OrderStatus;
import org.web.common.enums.PaymentStatus;
import org.web.orders.dto.request.CheckoutFromCartRequest;
import org.web.orders.dto.request.CheckoutRequest;
import org.web.orders.dto.request.UpdateOrderStatusRequest;
import org.web.orders.dto.response.OrderResponse;
import org.web.orders.service.OrderService;
import org.web.users.repository.UserRepository;

import java.util.List;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final UserRepository userRepository;

    private Long getCurrentUserId(Authentication authentication) {
        String email = (String) authentication.getPrincipal();
        return userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại")).getId();
    }

    // USER CHECKOUT TỪ LIST ITEMS
    @PostMapping("/checkout")
    @PreAuthorize("hasAuthority('ORDER_WRITE')")
    public ResponseEntity<ApiResponse<OrderResponse>> checkout(
            Authentication authentication,
            @Valid @RequestBody CheckoutRequest request
    ) {
        Long userId = getCurrentUserId(authentication);
        OrderResponse response = orderService.checkout(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.successfulResponse(HttpStatus.CREATED.value(), "Đơn hàng " + response.getCode() + " đã được tạo thành công!", response));
    }

    // USER CHECKOUT TỪ GIỎ HÀNG
    @PostMapping("/checkout/carts")
    @PreAuthorize("hasAuthority('ORDER_WRITE')")
    public ResponseEntity<ApiResponse<OrderResponse>> checkoutFromCart(
            Authentication authentication,
            @Valid @RequestBody CheckoutFromCartRequest request
    ) {
        Long userId = getCurrentUserId(authentication);
        OrderResponse response = orderService.checkoutFromCart(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.successfulResponse(HttpStatus.CREATED.value(), "Đơn hàng " + response.getCode() + " đã được tạo thành công!", response));
    }

    // LỊCH SỬ ĐƠN HÀNG CỦA CHÍNH MÌNH (user)
    @GetMapping("/my")
    @PreAuthorize("hasAuthority('ORDER_READ')")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getMyOrders(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) PaymentStatus paymentStatus
    ) {
        Long userId = getCurrentUserId(authentication);
        Page<OrderResponse> result = orderService.getMyOrders(userId, page, size, status, paymentStatus);
        return ResponseEntity.ok(ApiResponse.successfulPageResponse("Lấy danh sách đơn hàng thành công", result));
    }

    // XEM CHI TIẾT 1 ĐƠN HÀNG CỦA CHÍNH MÌNH
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ORDER_READ')")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrder(
            Authentication authentication,
            @PathVariable Long id
    ) {
        Long userId = getCurrentUserId(authentication);
        OrderResponse response = orderService.getOrderByIdForUser(userId, id);
        return ResponseEntity.ok(ApiResponse.successfulResponse("Lấy chi tiết đơn hàng thành công", response));
    }

    // USER XÁC NHẬN ĐÃ NHẬN HÀNG
    @PostMapping("/my/{id}/confirm-received")
    @PreAuthorize("hasAuthority('ORDER_READ')")
    public ResponseEntity<ApiResponse<OrderResponse>> confirmReceived(
            Authentication authentication,
            @PathVariable Long id
    ) {
        Long userId = getCurrentUserId(authentication);
        OrderResponse response = orderService.confirmReceived(userId, id);
        return ResponseEntity.ok(ApiResponse.successfulResponse("Đã xác nhận nhận hàng thành công", response));
    }

    // ================== STAFF / ADMIN – QUẢN LÝ ĐƠN ==================

    @GetMapping("/admin")
    @PreAuthorize("hasAuthority('ORDER_MANAGE')")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<OrderResponse> result = orderService.getAllOrders(page, size);
        return ResponseEntity.ok(ApiResponse.successfulPageResponse("Lấy danh sách tất cả đơn hàng thành công", result));
    }

    @GetMapping("/admin/{id}")
    @PreAuthorize("hasAuthority('ORDER_MANAGE')")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderForAdmin(
            @PathVariable Long id
    ) {
        OrderResponse response = orderService.getOrderByIdForAdmin(id);
        return ResponseEntity.ok(ApiResponse.successfulResponse("Lấy chi tiết đơn hàng thành công", response));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('ORDER_MANAGE')")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusRequest request
    ) {
        OrderResponse response = orderService.updateOrderStatus(id, request.getStatus());
        return ResponseEntity.ok(ApiResponse.successfulResponse("Cập nhật trạng thái đơn hàng thành công", response));
    }
}
