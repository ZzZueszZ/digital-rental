package dev.xbase.services.users;

import dev.xbase.repository.database.users.UserRepository;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import dev.xbase.domain.users.User;
import dev.xbase.domain.users.UserId;
import dev.xbase.domain.users.UserIds;
import dev.xbase.repository.database.users.UsersMapper;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserCommandService {
    @NonNull
    final UserRepository repository;
    @NonNull
    final UsersMapper userMapper;

    public void deleteAllById(UserIds userIds) {
        repository.deleteAllById(userIds.list()
                .stream()
                .map(UserId::value)
                .collect(Collectors.toList()));
    }

    public void save(User user) {
        repository.save(userMapper.toEntity(user));
    }
}
