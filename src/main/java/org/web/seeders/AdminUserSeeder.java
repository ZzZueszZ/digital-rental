package org.web.seeders;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.web.authentication.repository.AppRoleRepository;
import org.web.common.enums.AccountStatus;
import org.web.users.model.User;
import org.web.users.repository.UserRepository;

import java.util.Set;

@Component
@RequiredArgsConstructor
@Order(4)
public class AdminUserSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final AppRoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

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
            userRepository.save(admin);
        }

        if (!userRepository.existsByEmail("superadmin@gmail.com")) {
            var superAdminRole = roleRepository.findByCode("SUPER_ADMIN").orElseThrow();
            User superAdmin = User.builder()
                    .email("superadmin@gmail.com")
                    .passwordHash(passwordEncoder.encode("Admin@123"))
                    .roles(Set.of(superAdminRole))
                    .accountStatus(AccountStatus.ACTIVE)
                    .build();
            userRepository.save(superAdmin);
        }
    }
}
