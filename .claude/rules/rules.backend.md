# Backend rules

- Main API source: `service/lenshub/src/main/java/org/web`.
- Lenshub is organized by feature module, not by one global layer.
- Common module shape: `controller`, `dto`, `mapper`, `model`, `repository`, `service`.
- Use `service/lenshub/.env.example` as the template for backend configuration.
- Runtime API path is `/api` on port `8080`.
- Public/security behavior is centralized in `configs/SecurityConfig.java` plus the `security` package.
- Preserve VNPAY verification behavior and payment transaction logging when editing payment flows.
- Treat eKYC/identity models and artifacts as sensitive data.
