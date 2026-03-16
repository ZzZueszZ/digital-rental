package org.web.authentication.mapper;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.web.authentication.dto.request.RoleRequest;
import org.web.authentication.dto.response.RoleResponse;
import org.web.authentication.model.AppRole;

import java.util.HashSet;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class RoleMapper {

    private final PermissionMapper permissionMapper;

    public AppRole toEntity(RoleRequest request) {
        if (request == null) {
            return null;
        }
        return AppRole.builder()
                .code(request.getCode())
                .description(request.getDescription())
                .permissions(new HashSet<>()) // Initialize empty, managed by service
                .build();
    }

    public void updateEntity(AppRole role, RoleRequest request) {
        if (request == null || role == null) {
            return;
        }
        role.setCode(request.getCode());
        role.setDescription(request.getDescription());
    }

    public RoleResponse toResponse(AppRole role) {
        if (role == null) {
            return null;
        }
        
        var permissionResponses = role.getPermissions() != null ? 
            role.getPermissions().stream()
                .map(permissionMapper::toResponse)
                .collect(Collectors.toList()) : java.util.List.<org.web.authentication.dto.response.PermissionResponse>of();

        return RoleResponse.builder()
                .id(role.getId())
                .code(role.getCode())
                .description(role.getDescription())
                .permissions(permissionResponses)
                .build();
    }
}
