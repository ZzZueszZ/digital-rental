package org.web.users.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.web.common.exceptions.ApplicationException;
import org.web.common.utils.FileUploadUtil;
import org.web.users.dto.response.UserProfileResponse;
import org.web.users.dto.request.UserProfileUpdateRequest;
import org.web.users.model.User;
import org.web.users.model.UserProfile;
import org.web.users.repository.UserProfileRepository;
import org.web.users.repository.UserRepository;
import org.web.users.service.UserProfileService;

@Service
@RequiredArgsConstructor
public class UserProfileServiceImpl implements UserProfileService {

    private final UserProfileRepository userProfileRepository;
    private final UserRepository userRepository;
    private final org.web.common.service.AuditLogService auditLogService;

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getMyProfile() {
        User user = getCurrentUser();
        UserProfile profile = userProfileRepository.findById(user.getId())
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "User profile not found"));
        return mapToResponse(user, profile);
    }

    @Override
    @Transactional
    public UserProfileResponse updateMyProfile(UserProfileUpdateRequest request) {
        User user = getCurrentUser();
        UserProfile profile = userProfileRepository.findById(user.getId())
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "User profile not found"));

        if (request.getFullName() != null) profile.setFullName(request.getFullName());
        if (request.getFirstName() != null) profile.setFirstName(request.getFirstName());
        if (request.getLastName() != null) profile.setLastName(request.getLastName());
        if (request.getGender() != null) profile.setGender(request.getGender());
        if (request.getDateOfBirth() != null) profile.setDateOfBirth(request.getDateOfBirth());
        if (request.getOccupation() != null) profile.setOccupation(request.getOccupation());
        if (request.getCompanyName() != null) profile.setCompanyName(request.getCompanyName());

        return mapToResponse(user, userProfileRepository.save(profile));
    }

    @Override
    @Transactional
    public UserProfileResponse uploadMyAvatar(MultipartFile file) {
        User user = getCurrentUser();
        UserProfile profile = userProfileRepository.findById(user.getId())
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "User profile not found"));

        String oldAvatarUrl = profile.getAvatarUrl();

        String savedImageUrl = oldAvatarUrl != null 
                             ? FileUploadUtil.replaceImage(oldAvatarUrl, file)
                             : FileUploadUtil.saveImage(file);

        profile.setAvatarUrl(savedImageUrl);

        UserProfile saved = userProfileRepository.save(profile);
        auditLogService.logAction("PROFILE", user.getId(), "UPLOAD_AVATAR",
                "User uploaded avatar",
                oldAvatarUrl != null ? "{\"avatarUrl\":\"" + oldAvatarUrl + "\"}" : null,
                "{\"avatarUrl\":\"" + savedImageUrl + "\"}");
        return mapToResponse(user, saved);
    }

    @Override
    @Transactional
    public void deleteMyAvatar() {
        User user = getCurrentUser();
        UserProfile profile = userProfileRepository.findById(user.getId())
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "User profile not found"));

        if (profile.getAvatarUrl() != null) {
            String oldUrl = profile.getAvatarUrl();
            FileUploadUtil.deleteImage(profile.getAvatarUrl());
            profile.setAvatarUrl(null);
            userProfileRepository.save(profile);
            auditLogService.logAction("PROFILE", user.getId(), "DELETE_AVATAR",
                    "User deleted avatar",
                    "{\"avatarUrl\":\"" + oldUrl + "\"}", null);
        }
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new ApplicationException(HttpStatus.UNAUTHORIZED, "Bạn cần đăng nhập để thực hiện hành động này");
        }

        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Người dùng không tồn tại"));
    }

    private UserProfileResponse mapToResponse(User user, UserProfile profile) {
        return UserProfileResponse.builder()
                .id(profile.getId())
                .fullName(profile.getFullName())
                .firstName(profile.getFirstName())
                .lastName(profile.getLastName())
                .gender(profile.getGender())
                .dateOfBirth(profile.getDateOfBirth())
                .avatarUrl(profile.getAvatarUrl())
                .occupation(profile.getOccupation())
                .companyName(profile.getCompanyName())
                .email(user.getEmail())
                .roles(user.getRoles() != null ? 
                    user.getRoles().stream().map(r -> r.getCode()).collect(java.util.stream.Collectors.toSet()) : null)
                .createdAt(profile.getCreatedAt())
                .updatedAt(profile.getUpdatedAt())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getProfileById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "User not found"));
        UserProfile profile = userProfileRepository.findById(userId)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Hồ sơ không tồn tại cho user id: " + userId));
        return mapToResponse(user, profile);
    }

    @Override
    @Transactional
    public UserProfileResponse updateProfileById(Long userId, UserProfileUpdateRequest request) {
        UserProfile profile = userProfileRepository.findById(userId)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Hồ sơ không tồn tại cho user id: " + userId));

        if (request.getFullName() != null) profile.setFullName(request.getFullName());
        if (request.getFirstName() != null) profile.setFirstName(request.getFirstName());
        if (request.getLastName() != null) profile.setLastName(request.getLastName());
        if (request.getGender() != null) profile.setGender(request.getGender());
        if (request.getDateOfBirth() != null) profile.setDateOfBirth(request.getDateOfBirth());
        if (request.getOccupation() != null) profile.setOccupation(request.getOccupation());
        if (request.getCompanyName() != null) profile.setCompanyName(request.getCompanyName());

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "User not found"));
        return mapToResponse(user, userProfileRepository.save(profile));
    }

    @Override
    @Transactional
    public UserProfileResponse uploadAvatarById(Long userId, MultipartFile file) {
        UserProfile profile = userProfileRepository.findById(userId)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Hồ sơ không tồn tại cho user id: " + userId));

        String savedImageUrl = profile.getAvatarUrl() != null 
                             ? FileUploadUtil.replaceImage(profile.getAvatarUrl(), file)
                             : FileUploadUtil.saveImage(file);

        profile.setAvatarUrl(savedImageUrl);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "User not found"));
        return mapToResponse(user, userProfileRepository.save(profile));
    }

    @Override
    @Transactional
    public void deleteAvatarById(Long userId) {
        UserProfile profile = userProfileRepository.findById(userId)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Hồ sơ không tồn tại cho user id: " + userId));

        if (profile.getAvatarUrl() != null) {
            FileUploadUtil.deleteImage(profile.getAvatarUrl());
            profile.setAvatarUrl(null);
            userProfileRepository.save(profile);
        }
    }
}
