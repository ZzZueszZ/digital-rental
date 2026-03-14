package org.web.users.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.web.users.criteria.UserCriteria;
import org.web.users.dto.UserCreateRequest;
import org.web.users.dto.UserResponse;
import org.web.users.dto.UserUpdateRequest;

public interface UserService {
    Page<UserResponse> getUsers(UserCriteria criteria, Pageable pageable);
    UserResponse getUserById(Long id);
    UserResponse createUser(UserCreateRequest request);
    UserResponse updateUser(Long id, UserUpdateRequest request);
    void deleteUser(Long id);
}
