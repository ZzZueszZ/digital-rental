package dev.xbase.services.users;

import dev.xbase.domain.common.RequestPagination;
import dev.xbase.domain.users.UserSearchCriteria;
import dev.xbase.repository.database.users.UserEntity;
import dev.xbase.repository.database.users.UserRepository;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import dev.xbase.domain.users.User;
import dev.xbase.domain.users.UserId;
import dev.xbase.domain.users.UserName;
import dev.xbase.repository.database.users.UsersMapper;
import dev.xbase.core.configurations.controller.exceptions.ResourceNotFoundException;

@Service
@RequiredArgsConstructor
public class UserQueryService {
    @NonNull
    final UserRepository repository;
    @NonNull
    final UsersMapper userMapper;

    public Page<User> users(UserSearchCriteria criteria, RequestPagination pagination) {
        return repository.findUserAndPageable(criteria, pagination.toPageRequest())
                .map(userMapper::toDto);
    }

    public User findUser(UserName username) {
        UserEntity userEntity = repository.findByUsername(username.asText())
                .orElseThrow(ResourceNotFoundException::new);

        return userMapper.toDto(userEntity);
    }

    public User findBy(UserId userId) {
        UserEntity userEntity = repository.findById(userId.value())
                .orElseThrow(ResourceNotFoundException::new);
        return userMapper.toDto(userEntity);
    }
}
