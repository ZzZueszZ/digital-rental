package org.web.rentals.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.web.common.dto.ApiResponse;
import org.web.common.enums.RentalOrderStatus;
import org.web.rentals.dto.request.*;
import org.web.rentals.dto.response.*;
import org.web.rentals.service.RentalService;
import org.web.users.model.User;
import org.web.users.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/rentals")
@RequiredArgsConstructor
public class RentalController {

    private final RentalService rentalService;
    private final UserRepository userRepository;

    private User getCurrentUser(Authentication authentication) {
        String email = (String) authentication.getPrincipal();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại"));
    }

    // ================= CUSTOMER ENDPOINTS =================

    @GetMapping("/products/{id}/availability")
    public ResponseEntity<ApiResponse<Boolean>> checkAvailability(
            @PathVariable Long id,
            @RequestParam String startDate,
            @RequestParam String endDate,
            @RequestParam(defaultValue = "1") int quantity
    ) {
        LocalDateTime start = LocalDateTime.parse(startDate);
        LocalDateTime end = LocalDateTime.parse(endDate);
        boolean available = rentalService.checkProductAvailability(id, start, end, quantity);
        return ResponseEntity.ok(ApiResponse.successfulResponse("Kiểm tra tồn kho thành công", available));
    }

    @PostMapping("/checkout")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<RentalOrderResponse>> checkout(
            Authentication authentication,
            @Valid @RequestBody RentalCheckoutRequest request
    ) {
        User user = getCurrentUser(authentication);
        RentalOrderResponse response = rentalService.createRentalOrder(user, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.successfulResponse(HttpStatus.CREATED.value(), "Yêu cầu đặt thuê thiết bị đã được tạo!", response));
    }

    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<RentalOrderResponse>>> getMyRentals(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) RentalOrderStatus status
    ) {
        User user = getCurrentUser(authentication);
        Page<RentalOrderResponse> result = rentalService.getMyRentals(user, status, page, size);
        return ResponseEntity.ok(ApiResponse.successfulPageResponse("Lấy danh sách đơn thuê của tôi thành công", result));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<RentalOrderResponse>> getRentalDetail(
            Authentication authentication,
            @PathVariable Long id
    ) {
        User user = getCurrentUser(authentication);
        RentalOrderResponse response = rentalService.getRentalDetail(id, user);
        return ResponseEntity.ok(ApiResponse.successfulResponse("Lấy chi tiết đơn thuê thành công", response));
    }

    @PostMapping("/{id}/contract/sign")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<RentalOrderResponse>> signContract(
            Authentication authentication,
            @PathVariable Long id,
            @RequestBody String signature
    ) {
        User user = getCurrentUser(authentication);
        RentalOrderResponse response = rentalService.signContract(id, user, signature);
        return ResponseEntity.ok(ApiResponse.successfulResponse("Ký hợp đồng online thành công", response));
    }

    // ================= STAFF / ADMIN ENDPOINTS =================

    @GetMapping("/admin")
    @PreAuthorize("hasAuthority('ORDER_MANAGE')")
    public ResponseEntity<ApiResponse<List<RentalOrderResponse>>> getAllRentals(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) RentalOrderStatus status
    ) {
        Page<RentalOrderResponse> result = rentalService.getAllRentals(status, page, size);
        return ResponseEntity.ok(ApiResponse.successfulPageResponse("Lấy danh sách quản lý đơn thuê thành công", result));
    }

    @PostMapping("/admin/{id}/approve")
    @PreAuthorize("hasAuthority('ORDER_MANAGE')")
    public ResponseEntity<ApiResponse<RentalOrderResponse>> approveRental(
            @PathVariable Long id,
            @Valid @RequestBody ApproveRentalRequest request
    ) {
        RentalOrderResponse response = rentalService.approveRental(id, request);
        return ResponseEntity.ok(ApiResponse.successfulResponse("Đã phê duyệt đơn thuê & gán thiết bị thành công", response));
    }

    @PostMapping("/admin/{id}/pay-deposit")
    @PreAuthorize("hasAuthority('ORDER_MANAGE')")
    public ResponseEntity<ApiResponse<RentalOrderResponse>> payDeposit(
            @PathVariable Long id
    ) {
        RentalOrderResponse response = rentalService.payDeposit(id);
        return ResponseEntity.ok(ApiResponse.successfulResponse("Đã thanh toán tiền cọc thành công", response));
    }

    @PostMapping("/admin/{id}/reject")
    @PreAuthorize("hasAuthority('ORDER_MANAGE')")
    public ResponseEntity<ApiResponse<RentalOrderResponse>> rejectRental(
            @PathVariable Long id,
            @RequestBody(required = false) String reason
    ) {
        RentalOrderResponse response = rentalService.rejectRental(id, reason != null ? reason : "Không đủ điều kiện hoặc thiết bị không sẵn sàng");
        return ResponseEntity.ok(ApiResponse.successfulResponse("Đã từ chối đơn thuê", response));
    }

    @PostMapping("/admin/{id}/handover")
    @PreAuthorize("hasAuthority('ORDER_MANAGE')")
    public ResponseEntity<ApiResponse<RentalOrderResponse>> handoverDevices(
            @PathVariable Long id,
            @Valid @RequestBody HandoverRentalRequest request
    ) {
        RentalOrderResponse response = rentalService.handoverDevices(id, request);
        return ResponseEntity.ok(ApiResponse.successfulResponse("Đã bàn giao thiết bị & lưu biên bản thành công", response));
    }

    @PostMapping("/admin/{id}/return")
    @PreAuthorize("hasAuthority('ORDER_MANAGE')")
    public ResponseEntity<ApiResponse<RentalOrderResponse>> returnDevices(
            @PathVariable Long id,
            @Valid @RequestBody ReturnRentalRequest request
    ) {
        RentalOrderResponse response = rentalService.returnDevices(id, request);
        return ResponseEntity.ok(ApiResponse.successfulResponse("Đã nhận lại thiết bị & cập nhật phí phát sinh thành công", response));
    }

    @PostMapping("/admin/{id}/settle")
    @PreAuthorize("hasAuthority('ORDER_MANAGE')")
    public ResponseEntity<ApiResponse<RentalOrderResponse>> settleAndComplete(
            @PathVariable Long id
    ) {
        RentalOrderResponse response = rentalService.settleAndComplete(id);
        return ResponseEntity.ok(ApiResponse.successfulResponse("Đã quyết toán & đóng đơn đặt thuê", response));
    }

    // ================= PHYSICAL DEVICE INVENTORY MANAGEMENT =================

    @PostMapping("/admin/devices")
    @PreAuthorize("hasAuthority('ORDER_MANAGE')")
    public ResponseEntity<ApiResponse<DeviceResponse>> createDevice(
            @Valid @RequestBody DeviceRequest request
    ) {
        DeviceResponse response = rentalService.createDevice(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.successfulResponse(HttpStatus.CREATED.value(), "Thêm thiết bị vật lý thành công", response));
    }

    @PutMapping("/admin/devices/{id}")
    @PreAuthorize("hasAuthority('ORDER_MANAGE')")
    public ResponseEntity<ApiResponse<DeviceResponse>> updateDevice(
            @PathVariable Long id,
            @Valid @RequestBody DeviceRequest request
    ) {
        DeviceResponse response = rentalService.updateDevice(id, request);
        return ResponseEntity.ok(ApiResponse.successfulResponse("Cập nhật thiết bị thành công", response));
    }

    @GetMapping("/admin/products/{productId}/devices")
    @PreAuthorize("hasAuthority('ORDER_MANAGE')")
    public ResponseEntity<ApiResponse<List<DeviceResponse>>> getDevicesByProduct(
            @PathVariable Long productId
    ) {
        List<DeviceResponse> response = rentalService.getDevicesByProduct(productId);
        return ResponseEntity.ok(ApiResponse.successfulResponse("Lấy danh sách thiết bị thành công", response));
    }

    @GetMapping("/admin/products/{productId}/devices/available")
    @PreAuthorize("hasAuthority('ORDER_MANAGE')")
    public ResponseEntity<ApiResponse<List<DeviceResponse>>> getAvailableDevices(
            @PathVariable Long productId
    ) {
        List<DeviceResponse> response = rentalService.getAvailableDevices(productId);
        return ResponseEntity.ok(ApiResponse.successfulResponse("Lấy danh sách thiết bị sẵn sàng thành công", response));
    }
}
