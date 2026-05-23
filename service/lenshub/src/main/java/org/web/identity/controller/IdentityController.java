package org.web.identity.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.web.common.dto.ApiResponse;
import org.web.identity.dto.request.ResolveKycRequest;
import org.web.identity.dto.request.SubmitKycRequest;
import org.web.identity.dto.response.KycSessionResponse;
import org.web.identity.service.IdentityService;
import org.web.users.model.User;
import org.web.users.repository.UserRepository;

import java.util.List;

@RestController
@RequestMapping("/identity")
@RequiredArgsConstructor
public class IdentityController {

    private final IdentityService identityService;
    private final UserRepository userRepository;

    private User getCurrentUser(Authentication authentication) {
        String email = (String) authentication.getPrincipal();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại"));
    }

    @PostMapping("/ekyc/initiate")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<KycSessionResponse>> initiateKyc(Authentication authentication) {
        User user = getCurrentUser(authentication);
        KycSessionResponse response = identityService.initiateKyc(user);
        return ResponseEntity.ok(ApiResponse.successfulResponse("Khởi tạo phiên eKYC thành công", response));
    }

    @PostMapping("/ekyc/submit")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<KycSessionResponse>> submitKyc(
            Authentication authentication,
            @Valid @RequestBody SubmitKycRequest request
    ) {
        User user = getCurrentUser(authentication);
        KycSessionResponse response = identityService.submitKyc(user, request);
        return ResponseEntity.ok(ApiResponse.successfulResponse("Gửi thông tin eKYC và chấm điểm AI thành công", response));
    }

    @GetMapping("/ekyc/status")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<KycSessionResponse>> getKycStatus(Authentication authentication) {
        User user = getCurrentUser(authentication);
        KycSessionResponse response = identityService.getKycStatus(user);
        return ResponseEntity.ok(ApiResponse.successfulResponse("Lấy trạng thái eKYC thành công", response));
    }

    @GetMapping("/admin/ekyc/pending")
    @PreAuthorize("hasAuthority('ORDER_MANAGE')")
    public ResponseEntity<ApiResponse<List<KycSessionResponse>>> getPendingKycSessions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<KycSessionResponse> result = identityService.getPendingKycSessions(page, size);
        return ResponseEntity.ok(ApiResponse.successfulPageResponse("Lấy danh sách hồ sơ eKYC chờ duyệt thành công", result));
    }

    @PostMapping("/admin/ekyc/{sessionId}/resolve")
    @PreAuthorize("hasAuthority('ORDER_MANAGE')")
    public ResponseEntity<ApiResponse<KycSessionResponse>> resolveKycSession(
            @PathVariable Long sessionId,
            @Valid @RequestBody ResolveKycRequest request
    ) {
        KycSessionResponse response = identityService.resolveKycSession(sessionId, request);
        return ResponseEntity.ok(ApiResponse.successfulResponse("Đã phản hồi kết quả duyệt eKYC thành công", response));
    }
}
