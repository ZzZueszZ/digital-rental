package org.web.e2ee.shield.sdk.policy;

import org.springframework.http.HttpMethod;

import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;

public final class E2eeRoutePolicy {

    private record Rule(HttpMethod method, Pattern path, E2eeLevel level) {
        private boolean matches(String requestMethod, String requestPath) {
            return method.matches(requestMethod) && path.matcher(requestPath).matches();
        }
    }

    private static final List<Rule> RULES = List.of(
            critical(HttpMethod.POST, "/auth/(login|google|register|forgot-password|reset-password|change-password|change-email)"),
            critical(HttpMethod.POST, "/ekyc/(submit|ocr-preview)"),
            critical(HttpMethod.PUT, "/admin/ekyc/\\d+/(approve|reject)"),
            critical(HttpMethod.POST, "/rentals/\\d+/contract/(send-otp|sign)"),
            critical(HttpMethod.POST, "/rentals/staff/\\d+/(prepare|handover-report|collect-deposit|handover|return-report|complete)"),
            sensitive(HttpMethod.POST, "/rentals/admin/devices"),
            sensitive(HttpMethod.PUT, "/rentals/admin/devices/\\d+"),
            sensitive(HttpMethod.PATCH, "/rentals/admin/devices/\\d+/status"),
            sensitive(HttpMethod.DELETE, "/rentals/admin/devices/\\d+"),
            sensitive(HttpMethod.GET, "/profile"),
            sensitive(HttpMethod.PUT, "/profile"),
            sensitive(HttpMethod.POST, "/addresses"),
            sensitive(HttpMethod.PUT, "/addresses/\\d+"),
            sensitive(HttpMethod.DELETE, "/addresses/\\d+"),
            sensitive(HttpMethod.PATCH, "/addresses/\\d+/default"),
            critical(HttpMethod.POST, "/addresses/user/\\d+"),
            critical(HttpMethod.PUT, "/addresses/\\d+/user/\\d+"),
            critical(HttpMethod.DELETE, "/addresses/\\d+/user/\\d+"),
            critical(HttpMethod.PATCH, "/addresses/\\d+/default/user/\\d+"),
            sensitive(HttpMethod.POST, "/rentals/checkout"),
            sensitive(HttpMethod.POST, "/orders/checkout"),
            sensitive(HttpMethod.POST, "/orders/checkout/carts"),
            sensitive(HttpMethod.POST, "/orders/my/\\d+/confirm-received"),
            critical(HttpMethod.PATCH, "/orders/\\d+/status"),
            sensitive(HttpMethod.POST, "/payments/vnpay/create"),
            sensitive(HttpMethod.POST, "/payments/vnpay/rental-fee/create"),
            sensitive(HttpMethod.POST, "/support/tickets"),
            sensitive(HttpMethod.PUT, "/admin/support/tickets/\\d+/(status|reply)"),
            sensitive(HttpMethod.PUT, "/inventory/products/\\d+/stock"),
            sensitive(HttpMethod.PUT, "/inventory/products/\\d+/stock/(sale|rental)"),
            critical(HttpMethod.POST, "/roles"),
            critical(HttpMethod.PUT, "/roles/\\d+"),
            critical(HttpMethod.DELETE, "/roles/\\d+"),
            critical(HttpMethod.POST, "/roles/\\d+/permissions"),
            critical(HttpMethod.POST, "/permissions"),
            critical(HttpMethod.PUT, "/permissions/\\d+"),
            critical(HttpMethod.DELETE, "/permissions/\\d+"),
            critical(HttpMethod.GET, "/users"),
            critical(HttpMethod.GET, "/users/deleted"),
            critical(HttpMethod.GET, "/users/\\d+"),
            critical(HttpMethod.GET, "/users/\\d+/profile"),
            critical(HttpMethod.POST, "/users"),
            critical(HttpMethod.PUT, "/users/\\d+"),
            critical(HttpMethod.PATCH, "/users/\\d+/status"),
            critical(HttpMethod.DELETE, "/users/\\d+"),
            critical(HttpMethod.PUT, "/users/\\d+/restore"),
            critical(HttpMethod.DELETE, "/users"),
            critical(HttpMethod.PUT, "/users/restore"),
            critical(HttpMethod.PUT, "/users/\\d+/profile"),
            critical(HttpMethod.PUT, "/users/\\d+/(reset-password|lock|unlock)")
    );

    private E2eeRoutePolicy() {
    }

    public static Optional<E2eeLevel> resolve(String method, String path) {
        return RULES.stream()
                .filter(rule -> rule.matches(method, path))
                .map(Rule::level)
                .findFirst();
    }

    private static Rule critical(HttpMethod method, String pathRegex) {
        return new Rule(method, Pattern.compile(pathRegex), E2eeLevel.CRITICAL);
    }

    private static Rule sensitive(HttpMethod method, String pathRegex) {
        return new Rule(method, Pattern.compile(pathRegex), E2eeLevel.SENSITIVE);
    }
}
