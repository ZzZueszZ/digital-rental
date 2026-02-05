package dev.xbase.services.users;

import dev.xbase.core.starter.security.JWTTokenService;
import dev.xbase.domain.JwtToken;
import dev.xbase.domain.common.RequestPagination;
import dev.xbase.domain.users.UserSearchCriteria;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import dev.xbase.domain.users.User;
import dev.xbase.domain.users.UserIds;
import dev.xbase.domain.users.UserId;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserUseCaseService {
    @NonNull
    final UserQueryService queryService;
    @NonNull
    final UserCommandService commandService;
    @NonNull
    final JWTTokenService jwtTokenService;

    public JwtToken auth(UserId userId) {
        User user = getOtsIdentify(userId);

        String refreshToken = jwtTokenService.createRefreshToken(user.userId().toString());
        return new JwtToken(jwtTokenService.createAccessToken(
                "",
                user.userId().toString()),
                refreshToken,
                user.userId(),
                user.username(),
                user.email());
    }

    public User getOtsIdentify(UserId userId) {
        return queryService.findBy(userId);
    }

    public Page<User> users(UserSearchCriteria criteria, RequestPagination pagination) {
        return queryService.users(criteria, pagination);
    }

    @Transactional
    public void delete(Integer id) {
        commandService.deleteAllById(new UserIds(List.of(new UserId(id))));
    }

    @Transactional
    public void save(User user) {
        commandService.save(user);
    }

    public User findBy(UserId userId) {
       return queryService.findBy(userId);
    }
}
