package dev.xbase.services.auth;

import dev.xbase.configurations.security.UserAuthentication;
import dev.xbase.repository.database.users.UserEntity;
import dev.xbase.repository.database.users.UserRepository;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;
import dev.xbase.repository.database.users.UsersMapper;

import java.util.Optional;

@Slf4j
@RequiredArgsConstructor
@Service
public class UserAuthQueryService implements UserDetailsService {

    @NonNull
    final UserRepository userRepository;
    @NonNull
    final UsersMapper userMapper;

    @Override
    public UserAuthentication loadUserByUsername(final String username) {
        Optional<UserEntity> userEntity = userRepository.findByUsername(username);
        return userEntity.map(entity -> new UserAuthentication(userMapper.toDto(entity)))
                .orElse(null);
    }
}
