package org.web.users.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.web.users.dto.criteria.UserCriteria;
import org.web.users.dto.request.UserCreateRequest;
import org.web.users.dto.UserResponse;
import org.web.users.dto.request.UserUpdateRequest;
import org.web.common.enums.AccountStatus;

import java.util.List;
import java.util.Map;

public interface UserService {
    Page<UserResponse> getUsers(UserCriteria criteria, Pageable pageable);
    Page<UserResponse> getDeletedUsers(UserCriteria criteria, Pageable pageable);
    UserResponse getUserById(Long id);
    UserResponse createUser(UserCreateRequest request);
    UserResponse updateUser(Long id, UserUpdateRequest request);
    UserResponse updateStatus(Long id, AccountStatus status);
    void deleteUser(Long id);
    void restoreUser(Long id);
    Map<String, Object> deleteUsers(List<Long> ids);
    Map<String, Object> restoreUsers(List<Long> ids);
}
