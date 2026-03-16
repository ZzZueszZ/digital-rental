package org.web.authentication.mapper;

import org.springframework.stereotype.Component;
import org.web.authentication.dto.request.PermissionRequest;
import org.web.authentication.dto.response.PermissionResponse;
import org.web.authentication.model.Permission;

@Component
public class PermissionMapper {

    public Permission toEntity(PermissionRequest request) {
        if (request == null) {
            return null;
        }
        return Permission.builder()
                .name(request.getName())
                .description(request.getDescription())
                .build();
    }

    public void updateEntity(Permission permission, PermissionRequest request) {
        if (request == null || permission == null) {
            return;
        }
        permission.setName(request.getName());
        permission.setDescription(request.getDescription());
    }

    public PermissionResponse toResponse(Permission permission) {
        if (permission == null) {
            return null;
        }
        return PermissionResponse.builder()
                .id(permission.getId())
                .name(permission.getName())
                .description(permission.getDescription())
                .build();
    }
}
