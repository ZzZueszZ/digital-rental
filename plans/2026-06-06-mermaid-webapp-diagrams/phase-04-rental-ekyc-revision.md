# Phase 04: Rental and eKYC Diagram Revision

## Context Links

- Parent: [plan.md](plan.md)
- Research: [researcher-2026-06-06-mermaid-diagram-refresh.md](research/researcher-2026-06-06-mermaid-diagram-refresh.md)
- Analysis: [analysis-2026-06-06-diagram-revision.md](reports/analysis-2026-06-06-diagram-revision.md)
- Docs: `docs/codebase-summary.md`, `docs/project-overview-pdr.md`, `docs/system-architecture.md`

## Overview

**Date:** 2026-06-06  
**Created By:** loc.nt <0905071704b@gmail.com>  
**Description:** Revise existing Mermaid webapp diagrams to include current rental lifecycle and eKYC flows.  
**Priority:** High  
**Implementation Status:** Draft  
**Review Status:** Pending

## Key Insights

- Current docs/code include `/rentals`, `/ekyc`, `/identity`, `/admin/ekyc`.
- Existing diagram set covers ecommerce/admin well but not rental/eKYC enough.
- Keep Mermaid format; do not introduce PlantUML unless strict UML use-case notation is required.

## Requirements

- Update `00-usecase-overview.mmd` with rental/eKYC use cases.
- Add rental lifecycle sequence diagram.
- Add eKYC verification sequence diagram.
- Update diagram README file list/export notes.
- Do not change app code.

## Architecture

Data flow:

1. Customer/Admin/Staff action starts in Next.js route.
2. Frontend service calls Spring Boot API.
3. API controller delegates to service layer.
4. Service reads/writes PostgreSQL and may call VNPay/Mail/Redis.
5. API returns `ApiResponse<T>` to frontend.

Diagram files stay under `docs/diagrams/mermaid/`.

## Related Code Files

Read-only context:

- `frontend/src/app/(main)/rentals`
- `frontend/src/app/(main)/profile/ekyc`
- `frontend/src/app/(admin)/admin/ekyc`
- `frontend/src/app/(staff)/staff/ekyc`
- `frontend/src/app/(super-admin)/super-admin/ekyc`
- `service/lenshub/src/main/java/org/web/rentals`
- `service/lenshub/src/main/java/org/web/identity`
- `service/lenshub/src/main/java/org/web/payments/vnpay`

Files to modify/create:

- `docs/diagrams/mermaid/00-usecase-overview.mmd`
- `docs/diagrams/mermaid/11-rental-lifecycle.sequence.mmd`
- `docs/diagrams/mermaid/12-ekyc-verification.sequence.mmd`
- `docs/diagrams/mermaid/README.md`

## Implementation Steps

1. Inspect existing `00-usecase-overview.mmd` and route/service names.
2. Add rental/eKYC use-case nodes under Customer, Staff/Admin, Super Admin.
3. Create `11-rental-lifecycle.sequence.mmd` for availability, checkout, contract sign, deposit, handover, return, completion, device admin.
4. Create `12-ekyc-verification.sequence.mmd` for initiate, upload front/back/selfie, submit, status, admin approve/reject.
5. Update `docs/diagrams/mermaid/README.md` file table.
6. Validate `.mmd` syntax by inspection and, if Mermaid CLI exists, `mmdc`.

## Todo List

- [ ] Update use-case overview.
- [ ] Add rental lifecycle sequence.
- [ ] Add eKYC sequence.
- [ ] Update Mermaid README.
- [ ] Validate all diagram files.

## Success Criteria

- `rg "rental|thuê|handover|deposit|eKYC|KYC|verify|approve|reject" docs/diagrams/mermaid` finds coverage.
- New files render in Mermaid Live Editor or Mermaid CLI.
- README lists every `.mmd` file.
- No real token, secret, payment hash, or credential shown.

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
| --- | --- | --- | --- |
| Diagram too dense | Medium | Medium | Split rental/eKYC into dedicated files. |
| Flow mismatch with code | Medium | High | Base labels on controllers/routes and docs, not assumptions. |
| Mermaid syntax error | Medium | Medium | Keep syntax simple; validate with CLI or Live Editor. |

## Security Considerations

- Show token/payment concepts only.
- Do not include real VNPay secret, JWT, password, Redis password, DB credential.
- Keep uploaded identity images as abstract artifact names only.

## Next Steps

After user approves, run `/code plans/2026-06-06-mermaid-webapp-diagrams/plan.md` and implement this phase only.

## Unresolved Questions

- Should strict UML use-case notation be required instead of Mermaid flowchart approximation?
- Should rental payment return be duplicated in rental diagram or referenced to payment diagram?
