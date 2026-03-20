package org.web.addresses.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.web.addresses.dto.request.ShippingAddressRequest;
import org.web.addresses.dto.response.ShippingAddressResponse;
import org.web.addresses.service.ShippingAddressService;
import org.web.common.dto.ApiResponse;

import java.util.List;

@RestController
@RequestMapping("/addresses")
@RequiredArgsConstructor
public class ShippingAddressController {

    private final ShippingAddressService addressService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<ShippingAddressResponse>>> getMyAddresses() {
        List<ShippingAddressResponse> response = addressService.getMyAddresses();
        return ResponseEntity.ok(ApiResponse.successfulResponse("Lấy danh sách địa chỉ thành công", response));
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ShippingAddressResponse>> createAddress(
            @Valid @RequestBody ShippingAddressRequest request) {
        ShippingAddressResponse response = addressService.createAddress(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.successfulResponse("Tạo địa chỉ thành công", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ShippingAddressResponse>> updateAddress(
            @PathVariable Long id,
            @Valid @RequestBody ShippingAddressRequest request) {
        ShippingAddressResponse response = addressService.updateAddress(id, request);
        return ResponseEntity.ok(ApiResponse.successfulResponse("Cập nhật địa chỉ thành công", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(@PathVariable Long id) {
        addressService.deleteAddress(id);
        return ResponseEntity.ok(ApiResponse.successfulResponse("Xóa địa chỉ thành công"));
    }

    @PatchMapping("/{id}/default")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ShippingAddressResponse>> setDefaultAddress(@PathVariable Long id) {
        ShippingAddressResponse response = addressService.setDefaultAddress(id);
        return ResponseEntity.ok(ApiResponse.successfulResponse("Đặt địa chỉ mặc định thành công", response));
    }
}
