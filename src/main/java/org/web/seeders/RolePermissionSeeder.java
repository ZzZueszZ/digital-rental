package org.web.seeders;


import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.web.authentication.model.AppRole;
import org.web.authentication.repository.AppRoleRepository;
import org.web.authentication.repository.PermissionRepository;

import java.util.HashSet;

@Component
@RequiredArgsConstructor
@Order(3)
public class RolePermissionSeeder implements CommandLineRunner {

    private final AppRoleRepository roleRepository;
    private final PermissionRepository permissionRepository;

    @Override
    public void run(String... args) {

        AppRole admin = roleRepository.findByCode("ADMIN").orElse(null);
        AppRole superAdmin = roleRepository.findByCode("SUPER_ADMIN").orElse(null);
        AppRole staff = roleRepository.findByCode("STAFF").orElse(null);
        AppRole customer = roleRepository.findByCode("CUSTOMER").orElse(null);

        if (admin == null || superAdmin == null || staff == null || customer == null) return;

        // ================= ADMIN =================
        admin.setPermissions(new HashSet<>());
        
        // ADMIN gets STAFF permissions + CREATE, UPDATE, DELETE for users
        addPerm(admin, "AUTH_LOGOUT");
        addPerm(admin, "AUTH_REFRESH");
        addPerm(admin, "USER_PROFILE_READ");
        addPerm(admin, "USER_PROFILE_UPDATE");
        addPerm(admin, "USER_READ");
        addPerm(admin, "USER_CREATE");
        addPerm(admin, "USER_UPDATE");
        addPerm(admin, "USER_DELETE");

        roleRepository.save(admin);

        // ================= SUPER ADMIN =================
        superAdmin.setPermissions(new HashSet<>());
        permissionRepository.findAll().forEach(p -> superAdmin.getPermissions().add(p));
        roleRepository.save(superAdmin);

        // ================= STAFF =================
        staff.setPermissions(new HashSet<>());
        
        // STAFF gets CUSTOMER permissions + USER_READ
        addPerm(staff, "AUTH_LOGOUT");
        addPerm(staff, "AUTH_REFRESH");
        addPerm(staff, "USER_PROFILE_READ");
        addPerm(staff, "USER_PROFILE_UPDATE");
        addPerm(staff, "USER_READ");

        roleRepository.save(staff);

        // ================= CUSTOMER =================
        customer.setPermissions(new HashSet<>());

        // CUSTOMER only has basic access
        addPerm(customer, "AUTH_LOGOUT");
        addPerm(customer, "AUTH_REFRESH");
        addPerm(customer, "USER_PROFILE_READ");
        addPerm(customer, "USER_PROFILE_UPDATE");

        roleRepository.save(customer);

        System.out.println(">>> RolePermissionSeeder: permissions assigned.");
    }

    private void addPerm(AppRole role, String permName) {
        permissionRepository.findByName(permName).ifPresent(p -> {
            role.getPermissions().add(p);
        });
    }
}

