package org.web.users.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.web.common.dto.ApiResponse;
import org.web.users.dto.criteria.UserCriteria;
import org.web.users.dto.request.UserCreateRequest;
import org.web.users.dto.UserResponse;
import org.web.users.dto.request.UserUpdateRequest;
import org.web.users.service.UserService;
import org.web.users.service.UserProfileService;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserProfileService userProfileService;

    @GetMapping
    @PreAuthorize("hasAuthority('USER_READ')")
    public ResponseEntity<ApiResponse<java.util.List<UserResponse>>> getUsers(
            UserCriteria criteria,
            Pageable pageable) {

        Page<UserResponse> users = userService.getUsers(criteria, pageable);
        return ResponseEntity.ok(ApiResponse.successfulPageResponse("Users retrieved successfully", users));
    }

    @GetMapping("/deleted")
    @PreAuthorize("hasAuthority('USER_READ')")
    public ResponseEntity<ApiResponse<java.util.List<UserResponse>>> getDeletedUsers(
            UserCriteria criteria,
            Pageable pageable) {

        Page<UserResponse> users = userService.getDeletedUsers(criteria, pageable);
        return ResponseEntity.ok(ApiResponse.successfulPageResponse("Deleted users retrieved successfully", users));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('USER_READ')")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long id) {
        UserResponse response = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.successfulResponse("User retrieved successfully", response));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('USER_CREATE')")
    public ResponseEntity<ApiResponse<UserResponse>> createUser(@Valid @RequestBody UserCreateRequest request) {
        UserResponse response = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                             .body(ApiResponse.successfulResponse("User created successfully", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('USER_UPDATE')")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserUpdateRequest request) {
        UserResponse response = userService.updateUser(id, request);
        return ResponseEntity.ok(ApiResponse.successfulResponse("User updated successfully", response));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('USER_UPDATE')")
    public ResponseEntity<ApiResponse<UserResponse>> updateUserStatus(
            @PathVariable Long id,
            @Valid @RequestBody org.web.users.dto.request.UserStatusUpdateRequest request) {
        UserResponse response = userService.updateStatus(id, request.getStatus());
        return ResponseEntity.ok(ApiResponse.successfulResponse("User status updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('USER_DELETE')")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.successfulResponse("User deleted successfully"));
    }

    @PutMapping("/{id}/restore")
    @PreAuthorize("hasAuthority('USER_UPDATE')")
    public ResponseEntity<ApiResponse<Void>> restoreUser(@PathVariable Long id) {
        userService.restoreUser(id);
        return ResponseEntity.ok(ApiResponse.successfulResponse("User restored successfully"));
    }

    @DeleteMapping
    @PreAuthorize("hasAuthority('USER_DELETE')")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> deleteUsers(@RequestBody java.util.List<Long> ids) {
        java.util.Map<String, Object> result = userService.deleteUsers(ids);
        return ResponseEntity.ok(ApiResponse.successfulResponse("Users deleted successfully", result));
    }

    @PutMapping("/restore")
    @PreAuthorize("hasAuthority('USER_UPDATE')")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> restoreUsers(@RequestBody java.util.List<Long> ids) {
        java.util.Map<String, Object> result = userService.restoreUsers(ids);
        return ResponseEntity.ok(ApiResponse.successfulResponse("Users restored successfully", result));
    }

    // --- LOCK / UNLOCK ---

    @PutMapping("/{id}/lock")
    @PreAuthorize("hasAuthority('USER_UPDATE')")
    public ResponseEntity<ApiResponse<UserResponse>> lockUser(@PathVariable Long id) {
        UserResponse response = userService.lockUser(id);
        return ResponseEntity.ok(ApiResponse.successfulResponse("User locked successfully", response));
    }

    @PutMapping("/{id}/unlock")
    @PreAuthorize("hasAuthority('USER_UPDATE')")
    public ResponseEntity<ApiResponse<UserResponse>> unlockUser(@PathVariable Long id) {
        UserResponse response = userService.unlockUser(id);
        return ResponseEntity.ok(ApiResponse.successfulResponse("User unlocked successfully", response));
    }

    // --- RESET PASSWORD ---

    @PutMapping("/{id}/reset-password")
    @PreAuthorize("hasAuthority('USER_UPDATE')")
    public ResponseEntity<ApiResponse<Void>> resetPasswordByAdmin(@PathVariable Long id) {
        userService.resetPasswordByAdmin(id);
        return ResponseEntity.ok(ApiResponse.successfulResponse("Password reset successfully. New password sent to user email."));
    }

    // --- ADMIN PROFILE ENDPOINTS ---
    
    @GetMapping("/{id}/profile")
    @PreAuthorize("hasAuthority('USER_READ')")
    public ResponseEntity<ApiResponse<org.web.users.dto.response.UserProfileResponse>> getProfileByAdmin(
            @PathVariable Long id) {
        org.web.users.dto.response.UserProfileResponse response = userProfileService.getProfileById(id);
        return ResponseEntity.ok(ApiResponse.successfulResponse("Profile retrieved successfully", response));
    }

    @PutMapping("/{id}/profile")
    @PreAuthorize("hasAuthority('USER_UPDATE')")
    public ResponseEntity<ApiResponse<org.web.users.dto.response.UserProfileResponse>> updateProfileByAdmin(
            @PathVariable Long id,
            @Valid @RequestBody org.web.users.dto.request.UserProfileUpdateRequest request) {
        org.web.users.dto.response.UserProfileResponse response = userProfileService.updateProfileById(id, request);
        return ResponseEntity.ok(ApiResponse.successfulResponse("Profile updated successfully", response));
    }

    @PostMapping(value = "/{id}/profile/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('USER_UPDATE')")
    public ResponseEntity<ApiResponse<org.web.users.dto.response.UserProfileResponse>> uploadAvatarByAdmin(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        org.web.users.dto.response.UserProfileResponse response = userProfileService.uploadAvatarById(id, file);
        return ResponseEntity.ok(ApiResponse.successfulResponse("Avatar updated successfully", response));
    }

    @DeleteMapping("/{id}/profile/avatar")
    @PreAuthorize("hasAuthority('USER_UPDATE')")
    public ResponseEntity<ApiResponse<Void>> deleteAvatarByAdmin(@PathVariable Long id) {
        userProfileService.deleteAvatarById(id);
        return ResponseEntity.ok(ApiResponse.successfulResponse("Avatar deleted successfully"));
    }
}
