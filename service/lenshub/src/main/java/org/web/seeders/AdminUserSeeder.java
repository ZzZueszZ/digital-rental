package org.web.seeders;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.web.authentication.repository.AppRoleRepository;
import org.web.common.enums.AccountStatus;
import org.web.common.enums.Gender;
import org.web.users.model.User;
import org.web.users.model.UserProfile;
import org.web.users.repository.UserProfileRepository;
import org.web.users.repository.UserRepository;

import java.util.Set;

@Component
@RequiredArgsConstructor
@Order(4)
public class AdminUserSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final AppRoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserProfileRepository userProfileRepository;
    private final Environment environment;

    @Override
    public void run(String... args) {
        if (!environment.getProperty("app.bootstrap.admin.enabled", Boolean.class, false)) {
            return;
        }

        seedAccount(
                "ADMIN",
                requiredProperty("app.bootstrap.admin.email"),
                requiredProperty("app.bootstrap.admin.password"),
                propertyOrDefault("app.bootstrap.admin.full-name", "Admin Digital Rental"),
                propertyOrDefault("app.bootstrap.admin.first-name", "Admin"),
                propertyOrDefault("app.bootstrap.admin.last-name", "Digital Rental"),
                propertyOrDefault("app.bootstrap.admin.occupation", "System Administrator"),
                propertyOrDefault("app.bootstrap.admin.company-name", "Digital Rental")
        );

        seedAccount(
                "SUPER_ADMIN",
                requiredProperty("app.bootstrap.super-admin.email"),
                requiredProperty("app.bootstrap.super-admin.password"),
                propertyOrDefault("app.bootstrap.super-admin.full-name", "Super Admin"),
                propertyOrDefault("app.bootstrap.super-admin.first-name", "Super"),
                propertyOrDefault("app.bootstrap.super-admin.last-name", "Admin"),
                propertyOrDefault("app.bootstrap.super-admin.occupation", "Super Administrator"),
                propertyOrDefault("app.bootstrap.super-admin.company-name", "Digital Rental")
        );
    }

    private void seedAccount(
            String roleCode,
            String email,
            String password,
            String fullName,
            String firstName,
            String lastName,
            String occupation,
            String companyName
    ) {
        if (userRepository.existsByEmail(email)) {
            return;
        }

        var role = roleRepository.findByCode(roleCode).orElseThrow();
        User user = User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(password))
                .roles(Set.of(role))
                .accountStatus(AccountStatus.ACTIVE)
                .emailVerified(true)
                .build();
        User savedUser = userRepository.save(user);
        createProfile(savedUser, fullName, firstName, lastName, Gender.MALE, occupation, companyName);
    }

    private String requiredProperty(String key) {
        String value = environment.getProperty(key);
        if (value == null || value.isBlank()) {
            throw new IllegalStateException("Missing required admin bootstrap env: " + key);
        }
        return value.trim();
    }

    private String propertyOrDefault(String key, String fallback) {
        String value = environment.getProperty(key);
        return value == null || value.isBlank() ? fallback : value.trim();
    }

    private void createProfile(User user, String fullName, String firstName, String lastName,
                               Gender gender, String occupation, String companyName) {
        if (!userProfileRepository.existsById(user.getId())) {
            UserProfile profile = UserProfile.builder()
                    .user(user)
                    .fullName(fullName)
                    .firstName(firstName)
                    .lastName(lastName)
                    .gender(gender)
                    .occupation(occupation)
                    .companyName(companyName)
                    .build();
            userProfileRepository.save(profile);
        }
    }
}
