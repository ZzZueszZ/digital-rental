package org.web.seeders;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
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

    @Override
    public void run(String... args) {

        if (!userRepository.existsByEmail("tuhocbackend@gmail.com")) {
            var adminRole = roleRepository.findByCode("ADMIN").orElseThrow();
            User admin = User.builder()
                    .email("tuhocbackend@gmail.com")
                    .passwordHash(passwordEncoder.encode("Admin@123"))
                    .roles(Set.of(adminRole))
                    .accountStatus(AccountStatus.ACTIVE)
                    .build();
            User savedAdmin = userRepository.save(admin);
            createProfile(savedAdmin, "Admin LensHub", "Admin", "LensHub", Gender.MALE, "System Administrator", "LensHub Corp");
        }

        if (!userRepository.existsByEmail("superadmin@gmail.com")) {
            var superAdminRole = roleRepository.findByCode("SUPER_ADMIN").orElseThrow();
            User superAdmin = User.builder()
                    .email("superadmin@gmail.com")
                    .passwordHash(passwordEncoder.encode("Admin@123"))
                    .roles(Set.of(superAdminRole))
                    .accountStatus(AccountStatus.ACTIVE)
                    .build();
            User savedSuperAdmin = userRepository.save(superAdmin);
            createProfile(savedSuperAdmin, "Super Admin", "Super", "Admin", Gender.MALE, "Super Administrator", "LensHub Corp");
        }
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
