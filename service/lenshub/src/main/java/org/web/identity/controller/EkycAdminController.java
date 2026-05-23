package org.web.identity.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.web.common.dto.ApiResponse;
import org.web.identity.dto.request.ResolveKycRequest;
import org.web.identity.dto.response.KycSessionResponse;
import org.web.identity.service.IdentityService;

import java.util.List;

@RestController
@RequestMapping("/admin/ekyc")
@RequiredArgsConstructor
public class EkycAdminController {

    private final IdentityService identityService;

    @GetMapping("/pending")
    @PreAuthorize("hasAuthority('ORDER_MANAGE')")
    public ResponseEntity<ApiResponse<List<KycSessionResponse>>> getPendingKyc(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        org.springframework.data.domain.Page<KycSessionResponse> result = identityService.getPendingKycSessions(page, size);
        return ResponseEntity.ok(ApiResponse.successfulPageResponse("Lấy danh sách hồ sơ eKYC chờ duyệt thành công", result));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAuthority('ORDER_MANAGE')")
    public ResponseEntity<ApiResponse<KycSessionResponse>> approveKyc(
            @PathVariable("id") Long id,
            @RequestBody(required = false) ResolveKycRequest request
    ) {
        ResolveKycRequest resolveRequest = request != null ? request : new ResolveKycRequest();
        resolveRequest.setApproved(true);
        if (resolveRequest.getNote() == null) {
            resolveRequest.setNote("Đã duyệt định danh");
        }
        KycSessionResponse response = identityService.resolveKycSession(id, resolveRequest);
        return ResponseEntity.ok(ApiResponse.successfulResponse("Duyệt hồ sơ eKYC thành công", response));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAuthority('ORDER_MANAGE')")
    public ResponseEntity<ApiResponse<KycSessionResponse>> rejectKyc(
            @PathVariable("id") Long id,
            @RequestBody(required = false) ResolveKycRequest request
    ) {
        ResolveKycRequest resolveRequest = request != null ? request : new ResolveKycRequest();
        resolveRequest.setApproved(false);
        if (resolveRequest.getNote() == null) {
            resolveRequest.setNote("Từ chối định danh");
        }
        KycSessionResponse response = identityService.resolveKycSession(id, resolveRequest);
        return ResponseEntity.ok(ApiResponse.successfulResponse("Từ chối hồ sơ eKYC thành công", response));
    }
}
