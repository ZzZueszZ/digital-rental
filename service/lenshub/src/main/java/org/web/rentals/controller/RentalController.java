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

    @PostMapping("/{id}/contract/send-otp")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> sendSigningOtp(
            Authentication authentication,
            @PathVariable Long id
    ) {
        User user = getCurrentUser(authentication);
        rentalService.sendSigningOtp(id, user);
        return ResponseEntity.ok(ApiResponse.successfulResponse("Gửi mã OTP ký hợp đồng thành công", null));
    }

    @PostMapping("/{id}/contract/sign")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<RentalOrderResponse>> signContract(
            Authentication authentication,
            @PathVariable Long id,
            @RequestBody @Valid SignContractRequest request
    ) {
        User user = getCurrentUser(authentication);
        RentalOrderResponse response = rentalService.signContract(id, user, request);
        return ResponseEntity.ok(ApiResponse.successfulResponse("Ký hợp đồng online thành công", response));
    }

    // ================= STAFF / ADMIN ENDPOINTS =================

    @GetMapping("/staff")
    @PreAuthorize("hasAuthority('ORDER_MANAGE')")
    public ResponseEntity<ApiResponse<List<RentalOrderResponse>>> getAllRentals(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) RentalOrderStatus status
    ) {
        Page<RentalOrderResponse> result = rentalService.getAllRentals(status, page, size);
        return ResponseEntity.ok(ApiResponse.successfulPageResponse("Lấy danh sách quản lý đơn thuê thành công", result));
    }

    @GetMapping("/staff/{id}")
    @PreAuthorize("hasAuthority('ORDER_MANAGE')")
    public ResponseEntity<ApiResponse<RentalOrderResponse>> getStaffRentalDetail(
            @PathVariable Long id
    ) {
        RentalOrderResponse response = rentalService.getStaffRentalDetail(id);
        return ResponseEntity.ok(ApiResponse.successfulResponse("Lấy chi tiết đơn thuê thành công", response));
    }

    @PostMapping("/staff/{id}/prepare")
    @PreAuthorize("hasAuthority('ORDER_MANAGE')")
    public ResponseEntity<ApiResponse<RentalOrderResponse>> prepareRental(
            @PathVariable Long id,
            @Valid @RequestBody PrepareRentalRequest request
    ) {
        RentalOrderResponse response = rentalService.prepareRental(id, request);
        return ResponseEntity.ok(ApiResponse.successfulResponse("Đã chuẩn bị thiết bị & tạo hợp đồng nháp", response));
    }
    @PostMapping("/staff/{id}/handover-report")
    @PreAuthorize("hasAuthority('ORDER_MANAGE')")
    public ResponseEntity<ApiResponse<RentalOrderResponse>> createHandoverReport(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody HandoverReportRequest request
    ) {
        User staff = getCurrentUser(authentication);
        RentalOrderResponse response = rentalService.createHandoverReport(id, staff, request);
        return ResponseEntity.ok(ApiResponse.successfulResponse("Đã lưu biên bản bàn giao và xác nhận cọc", response));
    }

    @PostMapping("/staff/{id}/collect-deposit")
    @PreAuthorize("hasAuthority('ORDER_MANAGE')")
    public ResponseEntity<ApiResponse<RentalOrderResponse>> collectDeposit(
            @PathVariable Long id,
            @Valid @RequestBody CollectDepositRequest request
    ) {
        RentalOrderResponse response = rentalService.collectDeposit(id, request);
        return ResponseEntity.ok(ApiResponse.successfulResponse("Đã thu tiền cọc offline", response));
    }

    @PostMapping("/staff/{id}/handover")
    @PreAuthorize("hasAuthority('ORDER_MANAGE')")
    public ResponseEntity<ApiResponse<RentalOrderResponse>> handoverDevices(
            @PathVariable Long id
    ) {
        RentalOrderResponse response = rentalService.handoverDevices(id);
        return ResponseEntity.ok(ApiResponse.successfulResponse("Đã bàn giao thiết bị thành công", response));
    }

    @PostMapping("/staff/{id}/return-report")
    @PreAuthorize("hasAuthority('ORDER_MANAGE')")
    public ResponseEntity<ApiResponse<RentalOrderResponse>> createReturnReport(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody ReturnReportRequest request
    ) {
        User staff = getCurrentUser(authentication);
        RentalOrderResponse response = rentalService.createReturnReport(id, staff, request);
        return ResponseEntity.ok(ApiResponse.successfulResponse("Đã lưu biên bản nhận lại thiết bị", response));
    }

    @PostMapping("/staff/{id}/complete")
    @PreAuthorize("hasAuthority('ORDER_MANAGE')")
    public ResponseEntity<ApiResponse<RentalOrderResponse>> completeRental(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody CompleteRentalRequest request
    ) {
        User staff = getCurrentUser(authentication);
        RentalOrderResponse response = rentalService.completeRental(id, staff, request);
        return ResponseEntity.ok(ApiResponse.successfulResponse("Đã hoàn tất đơn đặt thuê", response));
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
