package org.web.authentication.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.web.authentication.dto.request.RoleAssignPermissionRequest;
import org.web.authentication.dto.request.RoleRequest;
import org.web.authentication.dto.response.RoleResponse;
import org.web.authentication.mapper.RoleMapper;
import org.web.authentication.model.AppRole;
import org.web.authentication.model.Permission;
import org.web.authentication.repository.AppRoleRepository;
import org.web.authentication.repository.PermissionRepository;
import org.web.authentication.service.RoleService;
import org.web.common.exceptions.ApplicationException;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements RoleService {

    private final AppRoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final RoleMapper roleMapper;

    @Override
    @Transactional
    public RoleResponse create(RoleRequest request) {
        if (roleRepository.findByCode(request.getCode()).isPresent()) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Role code already exists");
        }

        AppRole role = roleMapper.toEntity(request);
        return roleMapper.toResponse(roleRepository.save(role));
    }

    @Override
    @Transactional
    public RoleResponse update(Long id, RoleRequest request) {
        AppRole role = roleRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Role not found"));

        if (!role.getCode().equals(request.getCode()) &&
            roleRepository.findByCode(request.getCode()).isPresent()) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Role code already in use");
        }

        roleMapper.updateEntity(role, request);
        return roleMapper.toResponse(roleRepository.save(role));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        AppRole role = roleRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Role not found"));
        
        // Prevent deleting core roles like SUPER_ADMIN, ADMIN, CUSTOMER, STAFF
        if (List.of("SUPER_ADMIN", "ADMIN", "CUSTOMER", "STAFF").contains(role.getCode())) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Cannot delete system default roles");
        }

        roleRepository.delete(role);
    }

    @Override
    @Transactional(readOnly = true)
    public RoleResponse getById(Long id) {
        AppRole role = roleRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Role not found"));
        return roleMapper.toResponse(role);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoleResponse> getAll() {
        return roleRepository.findAll().stream()
                .map(roleMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public RoleResponse assignPermissions(Long id, RoleAssignPermissionRequest request) {
        AppRole role = roleRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Role not found"));

        if ("SUPER_ADMIN".equals(role.getCode())) {
             throw new ApplicationException(HttpStatus.BAD_REQUEST, "SUPER_ADMIN role permissions cannot be modified manually");
        }

        List<Permission> permissions = permissionRepository.findAllById(request.getPermissionIds());
        if (permissions.size() != request.getPermissionIds().size()) {
            throw new ApplicationException(HttpStatus.NOT_FOUND, "One or more permissions not found");
        }

        role.setPermissions(new HashSet<>(permissions));
        return roleMapper.toResponse(roleRepository.save(role));
    }
}
