package org.web.users.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.web.common.dto.ApiResponse;
import org.web.users.dto.response.UserProfileResponse;
import org.web.users.dto.request.UserProfileUpdateRequest;
import org.web.users.service.UserProfileService;

@RestController
@RequestMapping("/profile")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserProfileService userProfileService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getMyProfile() {
        UserProfileResponse response = userProfileService.getMyProfile();
        return ResponseEntity.ok(ApiResponse.successfulResponse("User profile retrieved successfully", response));
    }

    @PutMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateMyProfile(
            @Valid @RequestBody UserProfileUpdateRequest request) {
        UserProfileResponse response = userProfileService.updateMyProfile(request);
        return ResponseEntity.ok(ApiResponse.successfulResponse("User profile updated successfully", response));
    }

    @PostMapping(value = "/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<UserProfileResponse>> uploadMyAvatar(
            @RequestParam("file") MultipartFile file) {
        UserProfileResponse response = userProfileService.uploadMyAvatar(file);
        return ResponseEntity.ok(ApiResponse.successfulResponse("Avatar uploaded successfully", response));
    }

    @DeleteMapping("/avatar")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> deleteMyAvatar() {
        userProfileService.deleteMyAvatar();
        return ResponseEntity.ok(ApiResponse.successfulResponse("Avatar deleted successfully"));
    }
}
