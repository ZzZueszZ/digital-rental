package org.web.identity.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.web.common.dto.ApiResponse;
import org.web.common.utils.FileUploadUtil;
import org.web.identity.dto.request.SubmitKycRequest;
import org.web.identity.dto.response.KycSessionResponse;
import org.web.identity.service.IdentityService;
import org.web.users.model.User;
import org.web.users.repository.UserRepository;

import java.util.Map;

@RestController
@RequestMapping("/ekyc")
@RequiredArgsConstructor
public class EkycController {

    private final IdentityService identityService;
    private final UserRepository userRepository;

    private User getCurrentUser(Authentication authentication) {
        String email = (String) authentication.getPrincipal();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại"));
    }

    @GetMapping("/status")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<KycSessionResponse>> getKycStatus(Authentication authentication) {
        User user = getCurrentUser(authentication);
        KycSessionResponse response = identityService.getKycStatus(user);
        return ResponseEntity.ok(ApiResponse.successfulResponse("Lấy trạng thái eKYC thành công", response));
    }

    @PostMapping("/initiate")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<KycSessionResponse>> initiateKyc(Authentication authentication) {
        User user = getCurrentUser(authentication);
        KycSessionResponse response = identityService.initiateKyc(user);
        return ResponseEntity.ok(ApiResponse.successfulResponse("Khởi tạo eKYC thành công", response));
    }

    @PostMapping("/submit")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<KycSessionResponse>> submitKyc(
            Authentication authentication,
            @Valid @RequestBody SubmitKycRequest request
    ) {
        User user = getCurrentUser(authentication);
        KycSessionResponse response = identityService.submitKyc(user, request);
        return ResponseEntity.ok(ApiResponse.successfulResponse("Gửi thông tin eKYC thành công", response));
    }

    @PostMapping(value = "/upload-front", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadFront(@RequestParam("file") MultipartFile file) {
        String imageUrl = FileUploadUtil.saveImage(file);
        return ResponseEntity.ok(ApiResponse.successfulResponse("Tải lên mặt trước CCCD thành công", Map.of("url", imageUrl)));
    }

    @PostMapping(value = "/upload-back", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadBack(@RequestParam("file") MultipartFile file) {
        String imageUrl = FileUploadUtil.saveImage(file);
        return ResponseEntity.ok(ApiResponse.successfulResponse("Tải lên mặt sau CCCD thành công", Map.of("url", imageUrl)));
    }

    @PostMapping(value = "/upload-selfie", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadSelfie(@RequestParam("file") MultipartFile file) {
        String imageUrl = FileUploadUtil.saveImage(file);
        return ResponseEntity.ok(ApiResponse.successfulResponse("Tải lên ảnh khuôn mặt thành công", Map.of("url", imageUrl)));
    }
}
