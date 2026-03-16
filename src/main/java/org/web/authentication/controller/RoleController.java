package org.web.authentication.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.web.authentication.dto.request.RoleAssignPermissionRequest;
import org.web.authentication.dto.request.RoleRequest;
import org.web.authentication.dto.response.RoleResponse;
import org.web.authentication.service.RoleService;
import org.web.common.dto.ApiResponse;

import java.util.List;

@RestController
@RequestMapping("/roles")
@RequiredArgsConstructor
public class RoleController {

    private final RoleService roleService;

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_WRITE')")
    public ResponseEntity<ApiResponse<RoleResponse>> create(@Valid @RequestBody RoleRequest request) {
        RoleResponse result = roleService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.successfulResponse("Role created successfully", result)
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_WRITE')")
    public ResponseEntity<ApiResponse<RoleResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody RoleRequest request) {
        RoleResponse result = roleService.update(id, request);
        return ResponseEntity.ok(ApiResponse.successfulResponse("Role updated successfully", result));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_WRITE')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        roleService.delete(id);
        return ResponseEntity.ok(ApiResponse.successfulResponse("Role deleted successfully"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_READ')")
    public ResponseEntity<ApiResponse<RoleResponse>> get(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.successfulResponse("Role retrieved successfully", roleService.getById(id)));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_READ')")
    public ResponseEntity<ApiResponse<java.util.List<RoleResponse>>> getRoles(org.springframework.data.domain.Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.successfulPageResponse("Roles retrieved successfully", roleService.getRoles(pageable)));
    }

    @PostMapping("/{id}/permissions")
    @PreAuthorize("hasAuthority('ROLE_WRITE')")
    public ResponseEntity<ApiResponse<RoleResponse>> assignPermissions(
            @PathVariable Long id,
            @Valid @RequestBody RoleAssignPermissionRequest request) {
        RoleResponse result = roleService.assignPermissions(id, request);
        return ResponseEntity.ok(ApiResponse.successfulResponse("Permissions assigned to role successfully", result));
    }
}
