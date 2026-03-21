package org.web.seeders;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.web.authentication.model.AppRole;
import org.web.authentication.repository.AppRoleRepository;

@Component
@RequiredArgsConstructor
@Order(2)
public class RoleSeeder implements CommandLineRunner {

    private final AppRoleRepository roleRepository;

    @Override
    public void run(String... args) {
        createRole("CUSTOMER", "Default role for normal customers");
        createRole("STAFF", "Staff role for handling orders and inventory");
        createRole("ADMIN", "Administrator with full permissions");
        createRole("SUPER_ADMIN", "Super Administrator with system-wide permissions");
    }

    private void createRole(String code, String description) {
        roleRepository.findByCode(code).orElseGet(() -> {
            AppRole role = AppRole.builder()
                    .code(code)
                    .description(description)
                    .build();
            return roleRepository.save(role);
        });
    }
}
