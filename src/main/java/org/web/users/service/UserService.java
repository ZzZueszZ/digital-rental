package org.web.users.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.web.users.dto.criteria.UserCriteria;
import org.web.users.dto.request.UserCreateRequest;
import org.web.users.dto.UserResponse;
import org.web.users.dto.request.UserUpdateRequest;

public interface UserService {
    Page<UserResponse> getUsers(UserCriteria criteria, Pageable pageable);
    Page<UserResponse> getDeletedUsers(UserCriteria criteria, Pageable pageable);
    UserResponse getUserById(Long id);
    UserResponse createUser(UserCreateRequest request);
    UserResponse updateUser(Long id, UserUpdateRequest request);
    void deleteUser(Long id);
    void restoreUser(Long id);
    void deleteUsers(java.util.List<Long> ids);
    void restoreUsers(java.util.List<Long> ids);
}
