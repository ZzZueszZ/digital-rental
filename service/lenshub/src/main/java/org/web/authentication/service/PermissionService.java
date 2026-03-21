package org.web.authentication.service;

import org.web.authentication.dto.request.PermissionRequest;
import org.web.authentication.dto.response.PermissionResponse;

import java.util.List;

public interface PermissionService {
    PermissionResponse create(PermissionRequest request);
    PermissionResponse update(Long id, PermissionRequest request);
    void delete(Long id);
    PermissionResponse getById(Long id);
    org.springframework.data.domain.Page<PermissionResponse> getPermissions(org.springframework.data.domain.Pageable pageable);
}
