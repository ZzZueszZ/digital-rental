package org.web.seeders;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.web.authentication.model.Permission;
import org.web.authentication.repository.PermissionRepository;

@Component
@RequiredArgsConstructor
@Order(1)
public class PermissionSeeder implements CommandLineRunner {

    private final PermissionRepository permissionRepository;

    @Override
    public void run(String... args) {

        // ================= AUTH =================
        create("AUTH_LOGOUT", "Can logout from session (Requires valid token)");
        create("AUTH_REFRESH", "Can refresh access token (Requires valid token)");

        // ================= USER =================
        create("USER_CREATE", "Can create new users (Admin/Staff only)");
        create("USER_READ", "Can view user list and details");
        create("USER_UPDATE", "Can update user details and roles (Admin/Staff only)");
        create("USER_DELETE", "Can delete or deactivate users (Admin only)");
        
        // ================= USER PROFILE =================
        create("USER_PROFILE_READ", "Can read their own profile details");
        create("USER_PROFILE_UPDATE", "Can update their own profile details");
    }

    private void create(String name, String desc) {
        permissionRepository.findByName(name).orElseGet(() -> {
            Permission p = Permission.builder()
                    .name(name)
                    .description(desc)
                    .build();
            return permissionRepository.save(p);
        });
    }
}
