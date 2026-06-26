package org.web.files.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.web.common.dto.ApiResponse;
import org.web.files.dto.request.PresignUploadRequest;
import org.web.files.dto.response.FileAssetResponse;
import org.web.files.dto.response.PresignedDownloadResponse;
import org.web.files.dto.response.PresignedUploadResponse;
import org.web.files.service.FileAssetService;
import org.web.users.model.User;
import org.web.users.repository.UserRepository;

import java.util.UUID;

@RestController
@RequestMapping("/files")
@RequiredArgsConstructor
public class FileAssetController {
    private final FileAssetService fileAssetService;
    private final UserRepository userRepository;

    @PostMapping("/presign-upload")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PresignedUploadResponse>> presignUpload(
            Authentication authentication,
            @Valid @RequestBody PresignUploadRequest request
    ) {
        PresignedUploadResponse response = fileAssetService.createUpload(currentUser(authentication), request);
        return ResponseEntity.ok(ApiResponse.successfulResponse("Upload URL created", response));
    }

    @PostMapping("/{assetId}/complete")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<FileAssetResponse>> complete(
            Authentication authentication,
            @PathVariable UUID assetId
    ) {
        FileAssetResponse response = fileAssetService.complete(currentUser(authentication), assetId, canManageAll(authentication));
        return ResponseEntity.ok(ApiResponse.successfulResponse("File upload completed", response));
    }

    @GetMapping("/{assetId}/download-url")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PresignedDownloadResponse>> downloadUrl(
            Authentication authentication,
            @PathVariable UUID assetId
    ) {
        PresignedDownloadResponse response = fileAssetService.createDownload(currentUser(authentication), assetId, canManageAll(authentication));
        return ResponseEntity.ok(ApiResponse.successfulResponse("Download URL created", response));
    }

    @DeleteMapping("/{assetId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> delete(Authentication authentication, @PathVariable UUID assetId) {
        fileAssetService.delete(currentUser(authentication), assetId, canManageAll(authentication));
        return ResponseEntity.ok(ApiResponse.successfulResponse("File deleted"));
    }

    private User currentUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalStateException("Authenticated user no longer exists"));
    }

    private boolean canManageAll(Authentication authentication) {
        return authentication.getAuthorities().stream().anyMatch(authority ->
                authority.getAuthority().equals("ROLE_ADMIN") || authority.getAuthority().equals("ROLE_SUPER_ADMIN"));
    }
}
