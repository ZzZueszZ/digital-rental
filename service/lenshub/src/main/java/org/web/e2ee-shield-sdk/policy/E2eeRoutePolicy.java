package org.web.e2ee.policy;

import org.springframework.http.HttpMethod;

import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;

public class E2eeRoutePolicy {

    private record Rule(HttpMethod method, Pattern path, E2eeLevel level) {
        boolean matches(String requestMethod, String requestPath) {
            return method.matches(requestMethod) && path.matcher(requestPath).matches();
        }
    }

    private static final List<Rule> RULES = List.of(
            critical(HttpMethod.POST, "/auth/(login|register|forgot-password|reset-password|change-password|change-email)"),
            critical(HttpMethod.POST, "/ekyc/(submit|ocr-preview)"),
            critical(HttpMethod.POST, "/rentals/\\d+/contract/sign"),
            critical(HttpMethod.POST, "/rentals/staff/\\d+/(handover-report|return-report)"),
            sensitive(HttpMethod.PUT, "/profile"),
            sensitive(HttpMethod.POST, "/addresses"),
            sensitive(HttpMethod.PUT, "/addresses/\\d+"),
            sensitive(HttpMethod.DELETE, "/addresses/\\d+"),
            sensitive(HttpMethod.POST, "/rentals/checkout"),
            sensitive(HttpMethod.POST, "/orders/checkout"),
            sensitive(HttpMethod.POST, "/orders/checkout/carts"),
            sensitive(HttpMethod.PUT, "/inventory/products/\\d+/stock"),
            sensitive(HttpMethod.PUT, "/inventory/products/\\d+/stock/(sale|rental)"),
            critical(HttpMethod.POST, "/roles"),
            critical(HttpMethod.PUT, "/roles/\\d+"),
            critical(HttpMethod.POST, "/roles/\\d+/permissions"),
            critical(HttpMethod.POST, "/permissions"),
            critical(HttpMethod.PUT, "/permissions/\\d+"),
            critical(HttpMethod.POST, "/users"),
            critical(HttpMethod.PUT, "/users/\\d+"),
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
