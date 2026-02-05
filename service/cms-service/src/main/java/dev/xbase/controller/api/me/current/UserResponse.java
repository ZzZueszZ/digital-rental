package dev.xbase.controller.api.me.current;

import lombok.Builder;
import lombok.Getter;
import dev.xbase.domain.users.User;

import java.util.ArrayList;
import java.util.List;

@Getter
@Builder
public class UserResponse {
    String username;
    String userId;
    String email;
    String avatar;
    final List<String> privileges;
    String lastConnect;
    String status;

    public static UserResponse of(User user) {
        return new UserResponse(user.username(),
                user.userId().toString(), user.email(),
                "",
                new ArrayList<>(),
                "", "");
    }
}
