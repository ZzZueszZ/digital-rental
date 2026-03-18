package org.web.users.service;

import org.springframework.web.multipart.MultipartFile;
import org.web.users.dto.response.UserProfileResponse;
import org.web.users.dto.request.UserProfileUpdateRequest;

public interface UserProfileService {
    UserProfileResponse getMyProfile();
    UserProfileResponse updateMyProfile(UserProfileUpdateRequest request);
    UserProfileResponse uploadMyAvatar(MultipartFile file);
    void deleteMyAvatar();
    
    // Admin operations
    UserProfileResponse getProfileById(Long userId);
    UserProfileResponse updateProfileById(Long userId, UserProfileUpdateRequest request);
    UserProfileResponse uploadAvatarById(Long userId, MultipartFile file);
    void deleteAvatarById(Long userId);
}
