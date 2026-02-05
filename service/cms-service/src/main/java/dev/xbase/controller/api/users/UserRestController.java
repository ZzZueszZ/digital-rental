package dev.xbase.controller.api.users;

import dev.xbase.controller.api.users.models.UserResponse;
import dev.xbase.controller.api.users.models.UsersModelMapper;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.RestController;
import dev.xbase.controller.api.users.models.UserRequest;
import dev.xbase.domain.common.RequestPagination;
import dev.xbase.domain.users.Email;
import dev.xbase.domain.users.Statuses;
import dev.xbase.domain.users.User;
import dev.xbase.domain.users.UserId;
import dev.xbase.domain.users.UserName;
import dev.xbase.domain.users.UserSearchCriteria;
import dev.xbase.services.users.UserUseCaseService;
import dev.xbase.core.model.PageImplResponse;
import dev.xbase.core.model.ValueResponse;

@RestController
@RequiredArgsConstructor
public class UserRestController implements UsersAPI {

    @NonNull
    final UserUseCaseService userUseCaseService;

    @NonNull
    final PasswordEncoder passwordEncoder;

    @NonNull
    final UsersModelMapper usersModelMapper;

    @Override
    public PageImplResponse<UserResponse> users(String[] status, String userName, String email, Integer timeZone, Integer currentPage, Integer pageSize) {
        Page<User> page = userUseCaseService.users(
                new UserSearchCriteria(new UserName(userName), new Email(email), Statuses.of(status)),
                RequestPagination.of(currentPage, pageSize));

        return getPageImplResponse(page, currentPage);
    }

    @Override
    public ValueResponse<UserResponse> findBy(Integer userId) {
        User user = userUseCaseService.findBy(new UserId(userId));
        return new ValueResponse<>(usersModelMapper.toModel(user));
    }

    @Override
    public void delete(Integer id) {
        userUseCaseService.delete(id);
    }

    @Override
    public void save(UserRequest userRequest) {
        userUseCaseService.save(usersModelMapper.toDomain(userRequest));
    }

    private PageImplResponse<UserResponse> getPageImplResponse(Page<User> userPage, int currentPage) {
        return new PageImplResponse<>(usersModelMapper.toModel(userPage.getContent()),
                true,
                userPage.getTotalElements(),
                userPage.getTotalPages(),
                currentPage
        );
    }
}
