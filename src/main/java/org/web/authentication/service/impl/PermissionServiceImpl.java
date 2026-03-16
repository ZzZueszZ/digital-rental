package org.web.authentication.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.web.authentication.dto.request.PermissionRequest;
import org.web.authentication.dto.response.PermissionResponse;
import org.web.authentication.mapper.PermissionMapper;
import org.web.authentication.model.Permission;
import org.web.authentication.repository.PermissionRepository;
import org.web.authentication.service.PermissionService;
import org.web.common.exceptions.ApplicationException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PermissionServiceImpl implements PermissionService {

    private final PermissionRepository permissionRepository;
    private final PermissionMapper permissionMapper;

    @Override
    @Transactional
    public PermissionResponse create(PermissionRequest request) {
        if (permissionRepository.findByName(request.getName()).isPresent()) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Permission already exists");
        }
        
        Permission permission = permissionMapper.toEntity(request);
        return permissionMapper.toResponse(permissionRepository.save(permission));
    }

    @Override
    @Transactional
    public PermissionResponse update(Long id, PermissionRequest request) {
        Permission permission = permissionRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Permission not found"));

        if (!permission.getName().equals(request.getName()) && 
            permissionRepository.findByName(request.getName()).isPresent()) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Permission name already in use");
        }

        permissionMapper.updateEntity(permission, request);
        return permissionMapper.toResponse(permissionRepository.save(permission));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!permissionRepository.existsById(id)) {
            throw new ApplicationException(HttpStatus.NOT_FOUND, "Permission not found");
        }
        permissionRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public PermissionResponse getById(Long id) {
        Permission permission = permissionRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Permission not found"));
        return permissionMapper.toResponse(permission);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PermissionResponse> getAll() {
        return permissionRepository.findAll().stream()
                .map(permissionMapper::toResponse)
                .collect(Collectors.toList());
    }
}
