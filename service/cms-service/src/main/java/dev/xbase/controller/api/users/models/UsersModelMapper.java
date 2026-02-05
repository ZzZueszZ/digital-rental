package dev.xbase.controller.api.users.models;

import org.mapstruct.Mapper;
import dev.xbase.domain.users.User;

import java.util.List;

@Mapper(componentModel = "spring")
public interface UsersModelMapper {
    User toDomain(UserRequest dto);

    UserResponse toModel(User entity);

    List<User> toDomain(List<UserRequest> dtoList);

    List<UserResponse> toModel(List<User> entityList);
}
