package dev.xbase.controller.api.users.models;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import org.springframework.security.crypto.password.PasswordEncoder;
import dev.xbase.domain.users.RoleType;
import dev.xbase.domain.users.StatusType;
import dev.xbase.domain.users.User;

import java.util.List;
import java.util.Objects;

@Getter
public class UserRequest {
    Integer userId;
    @NotBlank(message = "error.first.name.notNull")
    String username;
    @NotBlank(message = "error.first.name.notNull")
    String firstName;
    @NotBlank(message = "error.first.name.notNull")
    String lastName;
    @NotBlank(message = "error.email.notNull")
    @Email(message = "error.email.inValid", regexp = "^(?=.{1,64}@)[A-Za-z0-9_-]+(.[A-Za-z0-9_-]+)*@[^-][A-Za-z0-9-]+(.[A-Za-z0-9-]+)*(.[A-Za-z]{2,})$")
    String email;
    List<RoleType> roles;
    StatusType status;
    //    @NotBlank(message = "error.current.password.notNull")
//    @Size(min = 8, max = 100, message = "error.password.size")
    String password;
    //    @NotBlank(message = "error.current.password.notNull")
//    @Size(min = 8, max = 100, message = "error.password.size")
    String passwordConfirm;
    @NotBlank
    String avatar;

//    @AssertTrue(message = "error.password.match")
//    public boolean isValidatePassword() {
//        return Objects.isNull(key) || password.equals(passwordConfirm);
//    }

    public User getUser(PasswordEncoder passwordEncoder) {
        User.UserBuilder userBuilder = User.builder()
                .username(username)
                .email(email)
                .password(password);
        if (Objects.nonNull(userId) && userId > 0) {
            userBuilder.userId(userId);
        }
        if (Objects.nonNull(password) && !password.isEmpty()) {
            userBuilder.password(passwordEncoder.encode(password));
        }
        return userBuilder.build();
    }
}
