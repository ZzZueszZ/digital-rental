package org.web.vouchers.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.web.common.dto.ApiResponse;
import org.web.vouchers.dto.request.VoucherApplyRequest;
import org.web.vouchers.dto.request.VoucherCreateRequest;
import org.web.vouchers.dto.request.VoucherUpdateRequest;
import org.web.vouchers.dto.response.VoucherApplyResponse;
import org.web.vouchers.dto.response.VoucherResponse;
import org.web.vouchers.service.VoucherService;

import java.util.List;

@RestController
@RequestMapping("/vouchers")
@RequiredArgsConstructor
public class VoucherController {

    private final VoucherService voucherService;

    // ADMIN: tạo voucher (DRAFT)
    @PostMapping
    @PreAuthorize("hasAuthority('VOUCHER_WRITE')")
    public ResponseEntity<ApiResponse<VoucherResponse>> create(@Valid @RequestBody VoucherCreateRequest request) {
        VoucherResponse data = voucherService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.successfulResponse(HttpStatus.CREATED.value(), "Tạo mã giảm giá thành công!", data));
    }

    // ADMIN: cập nhật voucher
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('VOUCHER_WRITE')")
    public ResponseEntity<ApiResponse<VoucherResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody VoucherUpdateRequest request
    ) {
        VoucherResponse data = voucherService.update(id, request);
        return ResponseEntity.ok(ApiResponse.successfulResponse("Cập nhật mã giảm giá thành công!", data));
    }

    // ADMIN + STAFF: xóa mềm (INACTIVE)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('VOUCHER_STATUS_MANAGE')")
    public ResponseEntity<ApiResponse<Void>> deactivate(@PathVariable Long id) {
        voucherService.deactivate(id);
        return ResponseEntity.ok(ApiResponse.successfulResponse("Mã giảm giá đã được vô hiệu hóa thành công!"));
    }

    // ADMIN + STAFF: Kích hoạt voucher (ACTIVE)
    @PutMapping("/{id}/activate")
    @PreAuthorize("hasAuthority('VOUCHER_STATUS_MANAGE')")
    public ResponseEntity<ApiResponse<Void>> activate(@PathVariable Long id) {
        voucherService.activate(id);
        return ResponseEntity.ok(ApiResponse.successfulResponse("Mã giảm giá đã được kích hoạt thành công!"));
    }

    // ADMIN + STAFF: Xem chi tiết voucher
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('VOUCHER_READ')")
    public ResponseEntity<ApiResponse<VoucherResponse>> getById(@PathVariable Long id) {
        VoucherResponse data = voucherService.getById(id);
        return ResponseEntity.ok(ApiResponse.successfulResponse("Lấy thông tin mã giảm giá thành công!", data));
    }

    // ADMIN + STAFF: Xem tất cả voucher
    @GetMapping
    @PreAuthorize("hasAuthority('VOUCHER_READ')")
    public ResponseEntity<ApiResponse<List<VoucherResponse>>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<VoucherResponse> data = voucherService.list(page, size);
        return ResponseEntity.ok(ApiResponse.successfulPageResponse("Lấy danh sách mã giảm giá thành công!", data));
    }

    // CUSTOMER: Xem các voucher đang áp dụng
    @GetMapping("/active")
    @PreAuthorize("hasAuthority('CART_WRITE')")
    public ResponseEntity<ApiResponse<List<VoucherResponse>>> listActiveForUser(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<VoucherResponse> data = voucherService.listActive(page, size);
        return ResponseEntity.ok(ApiResponse.successfulPageResponse("Lấy danh sách mã giảm giá hoạt động thành công!", data));
    }

    // CUSTOMER: Apply voucher code -> Calculate discount amounts and send the new Total Price
    @PostMapping("/apply")
    @PreAuthorize("hasAuthority('CART_WRITE')")
    public ResponseEntity<ApiResponse<VoucherApplyResponse>> apply(@Valid @RequestBody VoucherApplyRequest request) {
        VoucherApplyResponse response = voucherService.apply(request);
        if (response.isValid()) {
            return ResponseEntity.ok(ApiResponse.successfulResponse(response.getMessage(), response));
        } else {
            return ResponseEntity.badRequest().body(ApiResponse.failedResponse(HttpStatus.BAD_REQUEST.value(), response.getMessage()));
        }
    }
}
