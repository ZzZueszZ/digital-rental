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

        // ADMIN gets READ-ONLY access to Roles and Permissions
        addPerm(admin, "ROLE_READ");
        addPerm(admin, "PERMISSION_READ");

        // Category management
        addPerm(admin, "CATEGORY_READ");
        addPerm(admin, "CATEGORY_WRITE");

        // Address management for all users
        addPerm(admin, "ADDRESS_READ_ALL");
        addPerm(admin, "ADDRESS_WRITE_ALL");

        // Product management
        addPerm(admin, "PRODUCT_READ");
        addPerm(admin, "PRODUCT_WRITE");

        // Inventory management
        addPerm(admin, "INVENTORY_READ");
        addPerm(admin, "INVENTORY_WRITE");

        // Vouchers
        addPerm(admin, "VOUCHER_READ");
        addPerm(admin, "VOUCHER_WRITE");
        addPerm(admin, "VOUCHER_STATUS_MANAGE");

        // Orders
        addPerm(admin, "ORDER_MANAGE");

        // Reviews
        addPerm(admin, "REVIEW_MANAGE");

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
        addPerm(staff, "CATEGORY_READ");
        addPerm(staff, "PRODUCT_READ");

        // Address read for all users
        addPerm(staff, "ADDRESS_READ_ALL");

        // Inventory
        addPerm(staff, "INVENTORY_READ");

        // Vouchers
        addPerm(staff, "VOUCHER_READ");
        addPerm(staff, "VOUCHER_STATUS_MANAGE");

        // Orders
        addPerm(staff, "ORDER_MANAGE");

        // Reviews
        addPerm(staff, "REVIEW_MANAGE");

        roleRepository.save(staff);

        // ================= CUSTOMER =================
        customer.setPermissions(new HashSet<>());

        // CUSTOMER only has basic access
        addPerm(customer, "AUTH_LOGOUT");
        addPerm(customer, "AUTH_REFRESH");
        addPerm(customer, "USER_PROFILE_READ");
        addPerm(customer, "USER_PROFILE_UPDATE");

        // Customer can manage their own addresses
        addPerm(customer, "ADDRESS_READ");
        addPerm(customer, "ADDRESS_WRITE");

        // Cart
        addPerm(customer, "CART_READ");
        addPerm(customer, "CART_WRITE");

        // Orders
        addPerm(customer, "ORDER_READ");
        addPerm(customer, "ORDER_WRITE");

        roleRepository.save(customer);

        System.out.println(">>> RolePermissionSeeder: permissions assigned.");
    }

    private void addPerm(AppRole role, String permName) {
        permissionRepository.findByName(permName).ifPresent(p -> {
            role.getPermissions().add(p);
        });
    }
}