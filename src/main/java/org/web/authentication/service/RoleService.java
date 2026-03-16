package org.web.authentication.service;

import org.web.authentication.dto.request.RoleAssignPermissionRequest;
import org.web.authentication.dto.request.RoleRequest;
import org.web.authentication.dto.response.RoleResponse;

import java.util.List;

public interface RoleService {
    RoleResponse create(RoleRequest request);
    RoleResponse update(Long id, RoleRequest request);
    void delete(Long id);
    RoleResponse getById(Long id);
    List<RoleResponse> getAll();
    RoleResponse assignPermissions(Long id, RoleAssignPermissionRequest request);
}
