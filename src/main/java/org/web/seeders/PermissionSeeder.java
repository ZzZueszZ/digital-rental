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

        // ================= ROLES & PERMISSIONS =================
        create("ROLE_READ", "Read role list and details");
        create("ROLE_WRITE", "Create, update, delete roles and assign permissions");
        create("PERMISSION_READ", "Read permission list");
        create("PERMISSION_WRITE", "Create, update, delete permissions");

        // ================= CATEGORY =================
        create("CATEGORY_READ", "Can view category list and details");
        create("CATEGORY_WRITE", "Can create, update, delete categories (Admin only)");

        // ================= ADDRESS =================
        create("ADDRESS_READ", "Can view their own shipping addresses");
        create("ADDRESS_READ_ALL", "Can view all users shipping addresses (Admin/Staff only)");
        create("ADDRESS_WRITE", "Can manage their own shipping addresses");
        create("ADDRESS_WRITE_ALL", "Can manage all users shipping addresses (Admin only)");

        // ================= PRODUCT =================
        create("PRODUCT_READ", "Can view all product details, inventory and history (Admin/Staff)");
        create("PRODUCT_WRITE", "Can manage all product details, gallery and prices (Admin only)");

        // ================= INVENTORY =================
        create("INVENTORY_READ", "Can view inventory audit logs (Admin/Staff)");
        create("INVENTORY_WRITE", "Can adjust product stock (Admin only)");

        // ================= CART =================
        create("CART_READ", "Can view cart (Customer)");
        create("CART_WRITE", "Can modify cart items (Customer)");

        // ================= VOUCHER =================
        create("VOUCHER_READ", "Can view vouchers (Admin/Staff)");
        create("VOUCHER_WRITE", "Can create/update/deactivate vouchers (Admin only)");
        create("VOUCHER_STATUS_MANAGE", "Can activate vouchers (Admin/Staff)");

        // ================= ORDER =================
        create("ORDER_READ", "Can view own orders and confirm receipt (Customer)");
        create("ORDER_WRITE", "Can checkout and create orders (Customer)");
        create("ORDER_MANAGE", "Can view all orders, logs and update status (Admin/Staff)");

        // ================= REVIEW =================
        create("REVIEW_MANAGE", "Can view all, hide/unhide and review reported comments (Admin/Staff)");
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
