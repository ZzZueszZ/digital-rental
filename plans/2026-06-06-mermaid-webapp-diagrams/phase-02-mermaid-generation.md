# Phase 02: Mermaid Generation

## Context Links

- Parent: [plan.md](plan.md)
- Research: [researcher-mermaid-diagram-syntax.md](research/researcher-mermaid-diagram-syntax.md)

## Overview

**Date:** 2026-06-06
**Created By:** loc.nt <0905071704b@gmail.com>
**Priority:** High
**Implementation Status:** Completed
**Review Status:** Completed

Generate Mermaid `.mmd` files for use-case overview and detailed sequence diagrams.

## Key Insights

- Use `flowchart LR` for use case overview.
- Use `sequenceDiagram` with `alt`, `opt`, `loop`, and `Note over` for detailed flows.
- Avoid Mermaid reserved-word pitfalls.

## Requirements

- Include all user-provided flow items.
- Diagrams must be exportable to PNG.
- Keep each `.mmd` syntactically valid and standalone.

## Architecture

Each sequence diagram includes:

- actors/users
- frontend
- backend controller/API
- service layer
- database/cache/external service where relevant

## Related Code Files

- Auth: `authentication`
- Product/category: `products`, `categories`
- Cart/order/payment: `carts`, `orders`, `payments`
- Admin: `dashboard`, `users`, `inventory`, `vouchers`, `reviews`, `support`, `common`

## Implementation Steps

1. Generate `00-usecase-overview.mmd`.
2. Generate sequence diagrams `01` to `10`.
3. Keep labels concise but descriptive.

## Todo List

- [x] Use-case overview
- [x] Guest/public sequence
- [x] Auth sequence
- [x] Customer/cart/checkout sequence
- [x] Payment sequence
- [x] Order sequence
- [x] Admin dashboard sequence
- [x] Catalog sequence
- [x] Users/permissions sequence
- [x] Voucher/inventory sequence
- [x] Review/support/audit sequence

## Success Criteria

- `rg` confirms all 16 flow names represented.
- Mermaid files have no obvious syntax hazards like lowercase node `end`.

## Risk Assessment

- Risk: Mermaid parser rejects non-ASCII labels in some export tools. Mitigation: labels are quoted where needed and README suggests Mermaid Live Editor if CLI fails.

## Security Considerations

- Payment/token flows show concepts only, not real secret data.

## Next Steps

Validate syntax and export instructions.
