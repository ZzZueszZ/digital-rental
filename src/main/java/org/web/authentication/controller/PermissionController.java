package org.web.authentication.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.web.authentication.dto.request.PermissionRequest;
import org.web.authentication.dto.response.PermissionResponse;
import org.web.authentication.service.PermissionService;
import org.web.common.dto.ApiResponse;

import java.util.List;

@RestController
@RequestMapping("/permissions")
@RequiredArgsConstructor
public class PermissionController {

    private final PermissionService permissionService;

    @PostMapping
    @PreAuthorize("hasAuthority('PERMISSION_WRITE')")
    public ResponseEntity<ApiResponse<PermissionResponse>> create(@Valid @RequestBody PermissionRequest request) {
        PermissionResponse result = permissionService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.successfulResponse("Permission created successfully", result)
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('PERMISSION_WRITE')")
    public ResponseEntity<ApiResponse<PermissionResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody PermissionRequest request) {
        PermissionResponse result = permissionService.update(id, request);
        return ResponseEntity.ok(ApiResponse.successfulResponse("Permission updated successfully", result));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('PERMISSION_WRITE')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        permissionService.delete(id);
        return ResponseEntity.ok(ApiResponse.successfulResponse("Permission deleted successfully"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('PERMISSION_READ')")
    public ResponseEntity<ApiResponse<PermissionResponse>> get(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.successfulResponse("Permission retrieved successfully", permissionService.getById(id)));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('PERMISSION_READ')")
    public ResponseEntity<ApiResponse<java.util.List<PermissionResponse>>> getPermissions(org.springframework.data.domain.Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.successfulPageResponse("Permissions retrieved successfully", permissionService.getPermissions(pageable)));
    }
}
