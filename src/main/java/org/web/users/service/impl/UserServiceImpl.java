package org.web.users.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.web.authentication.model.AppRole;
import org.web.authentication.repository.AppRoleRepository;
import org.web.common.enums.AccountStatus;
import org.web.common.enums.RoleName;
import org.web.common.exceptions.ApplicationException;
import org.web.users.dto.criteria.UserCriteria;
import org.web.users.dto.request.UserCreateRequest;
import org.web.users.dto.UserResponse;
import org.web.users.dto.request.UserUpdateRequest;
import org.web.users.mapper.UserMapper;
import org.web.users.model.User;
import org.web.users.repository.UserRepository;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Join;
import org.web.users.service.UserService;
import org.springframework.beans.factory.annotation.Value;
import org.web.authentication.service.ActivationTokenProvider;
import org.web.common.mails.MailService;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final AppRoleRepository roleRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final MailService mailService;
    private final ActivationTokenProvider activationTokenProvider;
    private final org.web.users.repository.UserProfileRepository userProfileRepository;

    @Value("${app.activation.base-url:http://localhost:8080/api/auth/activate}")
    private String activationBaseUrl;

    @Override
    @Transactional(readOnly = true)
    public Page<UserResponse> getUsers(UserCriteria criteria, Pageable pageable) {
        Specification<User> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (criteria.getKeyword() != null && !criteria.getKeyword().isBlank()) {
                String pattern = "%" + criteria.getKeyword().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("email")), pattern),
                        cb.like(cb.lower(root.get("phone")), pattern)
                ));
            }
            if (criteria.getEmail() != null && !criteria.getEmail().isBlank()) {
                predicates.add(cb.equal(root.get("email"), criteria.getEmail()));
            }
            if (criteria.getPhone() != null && !criteria.getPhone().isBlank()) {
                predicates.add(cb.equal(root.get("phone"), criteria.getPhone()));
            }
            if (criteria.getAccountStatus() != null) {
                predicates.add(cb.equal(root.get("accountStatus"), criteria.getAccountStatus()));
            } else {
                // By default, exclude DELETED users
                predicates.add(cb.notEqual(root.get("accountStatus"), AccountStatus.DELETED));
            }
            if (criteria.getKycStatus() != null) {
                predicates.add(cb.equal(root.get("kycStatus"), criteria.getKycStatus()));
            }
            if (criteria.getTrustLevel() != null) {
                predicates.add(cb.equal(root.get("trustLevel"), criteria.getTrustLevel()));
            }
            if (criteria.getRole() != null) {
                Join<User, AppRole> rolesJoin = root.join("roles");
                predicates.add(cb.equal(rolesJoin.get("code"), criteria.getRole().name()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return userRepository.findAll(spec, pageable)
                .map(userMapper::toUserResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserResponse> getDeletedUsers(UserCriteria criteria, Pageable pageable) {
        Specification<User> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (criteria.getKeyword() != null && !criteria.getKeyword().isBlank()) {
                String pattern = "%" + criteria.getKeyword().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("email")), pattern),
                        cb.like(cb.lower(root.get("phone")), pattern)
                ));
            }
            if (criteria.getEmail() != null && !criteria.getEmail().isBlank()) {
                predicates.add(cb.equal(root.get("email"), criteria.getEmail()));
            }
            if (criteria.getPhone() != null && !criteria.getPhone().isBlank()) {
                predicates.add(cb.equal(root.get("phone"), criteria.getPhone()));
            }
            
            // Strictly get only DELETED users
            predicates.add(cb.equal(root.get("accountStatus"), AccountStatus.DELETED));
            
            if (criteria.getKycStatus() != null) {
                predicates.add(cb.equal(root.get("kycStatus"), criteria.getKycStatus()));
            }
            if (criteria.getTrustLevel() != null) {
                predicates.add(cb.equal(root.get("trustLevel"), criteria.getTrustLevel()));
            }
            if (criteria.getRole() != null) {
                Join<User, AppRole> rolesJoin = root.join("roles");
                predicates.add(cb.equal(rolesJoin.get("code"), criteria.getRole().name()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return userRepository.findAll(spec, pageable)
                .map(userMapper::toUserResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "User not found with id: " + id));
        return userMapper.toUserResponse(user);
    }

    @Override
    @Transactional
    public UserResponse createUser(UserCreateRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Email already in use");
        }

        User user = User.builder()
                .email(request.getEmail())
                .phone(request.getPhone())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .accountStatus(AccountStatus.PENDING)
                .enabled(true)
                .build();

        Set<AppRole> assignedRoles = new HashSet<>();
        if (request.getRoles() != null && !request.getRoles().isEmpty()) {
            for (RoleName roleName : request.getRoles()) {
                AppRole appRole = roleRepository.findByCode(roleName.name())
                        .orElseThrow(() -> new ApplicationException(HttpStatus.BAD_REQUEST, "Role not found: " + roleName));
                assignedRoles.add(appRole);
            }
        } else {
            AppRole customerRole = roleRepository.findByCode(RoleName.CUSTOMER.name())
                    .orElseThrow(() -> new ApplicationException(HttpStatus.INTERNAL_SERVER_ERROR, "CUSTOMER role not found"));
            assignedRoles.add(customerRole);
        }
        user.setRoles(assignedRoles);

        User savedUser = userRepository.save(user);

        // Auto create empty user profile
        org.web.users.model.UserProfile userProfile = org.web.users.model.UserProfile.builder()
                .user(savedUser)
                .build();
        userProfileRepository.save(userProfile);

        String activationToken = activationTokenProvider.generate(savedUser);
        mailService.sendActivationEmail(savedUser, buildActivationLink(activationToken));

        return userMapper.toUserResponse(savedUser);
    }

    @Override
    @Transactional
    public UserResponse updateUser(Long id, UserUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "User not found with id: " + id));

        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getAccountStatus() != null) {
            user.setAccountStatus(request.getAccountStatus());
        }
        if (request.getKycStatus() != null) {
            user.setKycStatus(request.getKycStatus());
        }
        if (request.getTrustLevel() != null) {
            user.setTrustLevel(request.getTrustLevel());
        }
        if (request.getEnabled() != null) {
            user.setEnabled(request.getEnabled());
        }
        if (request.getAccountNonLocked() != null) {
            user.setAccountNonLocked(request.getAccountNonLocked());
        }

        if (request.getRoles() != null) {
            Set<AppRole> assignedRoles = new HashSet<>();
            for (RoleName roleName : request.getRoles()) {
                AppRole appRole = roleRepository.findByCode(roleName.name())
                        .orElseThrow(() -> new ApplicationException(HttpStatus.BAD_REQUEST, "Role not found: " + roleName));
                assignedRoles.add(appRole);
            }
            user.setRoles(assignedRoles);
        }

        User updatedUser = userRepository.save(user);
        return userMapper.toUserResponse(updatedUser);
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "User not found with id: " + id));
        
        if (user.getAccountStatus() == AccountStatus.DELETED) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "User is already deleted");
        }

        // Perform soft delete
        user.setAccountStatus(AccountStatus.DELETED);
        user.setEnabled(false);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void restoreUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "User not found with id: " + id));
        
        if (user.getAccountStatus() == AccountStatus.ACTIVE) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "User is already active");
        }

        user.setAccountStatus(AccountStatus.ACTIVE);
        user.setEnabled(true);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void deleteUsers(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Please provide at least one user ID");
        }

        List<User> users = userRepository.findAllById(ids);
        if (users.isEmpty()) {
            throw new ApplicationException(HttpStatus.NOT_FOUND, "No valid users found for the provided IDs");
        }

        boolean hasChanges = false;
        for (User user : users) {
             if (user.getAccountStatus() != AccountStatus.DELETED) {
                 user.setAccountStatus(AccountStatus.DELETED);
                 user.setEnabled(false);
                 hasChanges = true;
             }
        }

        if (!hasChanges) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "All provided users are already deleted");
        }

        userRepository.saveAll(users);
    }

    @Override
    @Transactional
    public void restoreUsers(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
             throw new ApplicationException(HttpStatus.BAD_REQUEST, "Please provide at least one user ID");
        }

        List<User> users = userRepository.findAllById(ids);
        if (users.isEmpty()) {
            throw new ApplicationException(HttpStatus.NOT_FOUND, "No valid users found for the provided IDs");
        }

        boolean hasChanges = false;
        for (User user : users) {
             if (user.getAccountStatus() != AccountStatus.ACTIVE) {
                 user.setAccountStatus(AccountStatus.ACTIVE);
                 user.setEnabled(true);
                 hasChanges = true;
             }
        }

        if (!hasChanges) {
             throw new ApplicationException(HttpStatus.BAD_REQUEST, "All provided users are already active");
        }

        userRepository.saveAll(users);
    }

    private String buildActivationLink(String token) {
        String base = activationBaseUrl.endsWith("/")
                ? activationBaseUrl.substring(0, activationBaseUrl.length() - 1)
                : activationBaseUrl;
        return base.contains("?") ? base + "&token=" + token : base + "?token=" + token;
    }
}
