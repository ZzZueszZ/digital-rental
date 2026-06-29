# Evidence: MASTER

## 1 Research Findings

- Mermaid flowchart syntax supports nodes, edges, and subgraphs. Use this for use-case style diagrams because Mermaid has no stable built-in UML use-case diagram syntax.
- Mermaid sequenceDiagram syntax supports participants, actors, notes, loops, and alt/else branches. Use this for detailed interaction flows.
- Avoid lowercase `end` as a node label in Mermaid; quote or capitalize labels where needed.
- 2026-06-06 refresh: current code/docs include rental lifecycle and eKYC flows. Existing diagram plan/artifacts need revision, not duplicate plan.
- 2026-06-06 source index: active src scan found 559 files in `frontend/src` + `service/lenshub/src` (292 Java, 210 TSX, 55 TS, 1 YML, 1 CSS). Main use cases grouped by Guest, Customer, Staff/Admin, Super Admin, external systems.

## 2 Key Decisions

- Create one overview use-case diagram and multiple sequence diagrams grouped by business domain.
- Store generated files under `docs/diagrams/mermaid/`.
- Use `.mmd` files so Mermaid CLI, Mermaid Live Editor, or VS Code extensions can export PNG.
- Add dedicated rental/eKYC sequence coverage instead of overloading existing order/auth diagrams.
- For source usecase index, use frontend routes + services + backend controllers as evidence chain. Treat endpoint actions as evidence, but group final use cases by actor goal.

## 3 Constraints & Risks

- 16 flows are too large for one readable sequence diagram.
- Use case diagram will be approximated with `flowchart LR` and subgraphs, not strict UML notation.
- Some route names/behaviors are inferred from current docs/code and may need product owner confirmation.

## 4 Resend Integration Research Findings

- DigitalOcean blocks outbound SMTP ports 25, 465, and 587; HTTPS email API is required for the current Droplet.
- Resend provides `POST /emails`, Java support, verified-domain sending, CID inline attachments, idempotency keys retained for 24 hours, and delivery/bounce webhooks.
- Current Resend Java artifact is `com.resend:resend-java:4.13.0`; use an exact version if the SDK is selected.
- Resend default API rate limit is 5 requests/second per team; 429 responses expose retry guidance.
- Current `MailService` catches all send failures, so auth endpoints can report success while activation/reset/contract OTP email was never sent.
- Current templates use private MinIO objects as CID inline images; migration must preserve content IDs or deliberately remove those images.

## 5 Resend Integration Key Decisions

- Keep `MailService` responsible for template composition; introduce a provider-neutral gateway for transport.
- Use Resend HTTPS in production and retain SMTP only as an explicit local fallback during migration.
- Pin dependency versions; never use the `+` version shown in quickstart examples.
- Treat activation, password-reset OTP, and contract-signing OTP as critical delivery; notification mail remains best-effort.
- Use provider idempotency keys for safe retries; defer durable outbox and webhooks until MVP sending is stable.
- Verify a dedicated sending subdomain and configure SPF, DKIM, and DMARC before production cutover.

## 6 Resend Integration Constraints & Risks

- Existing admin reset flow emails a plaintext generated password; security remediation must be decided before implementation.
- Resend SDK transitive Jackson dependencies need compatibility verification against Spring Boot 4; direct Spring `RestClient` remains the fallback.
- Production secrets previously appeared in operational chat; Resend API key must be newly generated, scoped, and stored only in VPS env.
