package dev.xbase.controller.api.me.current;

import com.google.common.collect.ImmutableMap;
import lombok.AccessLevel;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import dev.xbase.domain.users.User;
import dev.xbase.domain.users.UserId;
import dev.xbase.services.users.UserUseCaseService;

@RestController
@RequestMapping("/v1/api/users/me")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class SecuredUsersController {
    @NonNull
    final UserUseCaseService userUseCaseService;

    @GetMapping("/current")
    ImmutableMap getCurrent(JwtAuthenticationToken jwtAuthenticationToken) {
        User user = userUseCaseService.getOtsIdentify(new UserId(Integer.valueOf(jwtAuthenticationToken.getName())));

        return ImmutableMap.of("data", UserResponse.of(user)
                , "success", true
        );
    }

}
