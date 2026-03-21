package org.web.users.mapper;

import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;
import org.web.authentication.model.AppRole;
import org.web.users.dto.UserResponse;
import org.web.users.model.User;

import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class UserMapper {

    private final ModelMapper modelMapper;

    public UserResponse toUserResponse(User user) {
        UserResponse response = modelMapper.map(user, UserResponse.class);
        
        // Custom mapping for roles since we want a Set<String> of role codes
        if (user.getRoles() != null) {
            response.setRoles(
                user.getRoles().stream()
                    .map(AppRole::getCode)
                    .collect(Collectors.toSet())
            );
        }
        
        return response;
    }
}
