# LensHub Mermaid Diagrams

## Documentation Maintenance
**Last Updated:** 2026-06-06  
**Document Version:** 1.0  
**Maintained By:** Development Team

## Files

| File | Content |
| --- | --- |
| `00-usecase-overview.mmd` | Source-backed use-case style overview for Guest, Customer, Staff/Admin, Super Admin, and external systems. |
| `01-guest-public.sequence.mmd` | Guest public browsing, product/category/review view, register entry, support ticket. |
| `02-auth.sequence.mmd` | Register, activate, login, refresh token, forgot/reset/change password, logout. |
| `03-customer-cart-checkout.sequence.mmd` | Profile, avatar, address, cart, voucher, checkout. |
| `04-payment-vnpay.sequence.mmd` | VNPay payment URL, redirect, backend return verification, frontend result. |
| `05-order-lifecycle.sequence.mmd` | Customer order lifecycle and admin/staff order handling. |
| `06-admin-dashboard.sequence.mmd` | Dashboard metrics and recent activity. |
| `07-admin-catalog.sequence.mmd` | Product and category management. |
| `08-admin-users-permissions.sequence.mmd` | User, role, permission, and role-based routing flows. |
| `09-voucher-inventory.sequence.mmd` | Voucher and inventory flows. |
| `10-review-support-audit.sequence.mmd` | Review, support ticket, audit/log flows. |
| `11-ekyc-upload-verification-flow.mmd` | Customer eKYC upload, OCR preview, facematch, liveness, risk scoring, and manual review flow. |

## Export PNG

### Option 1: Mermaid Live Editor

1. Open https://mermaid.live
2. Paste one `.mmd` file content.
3. Use `Export -> PNG`.

### Option 2: Mermaid CLI

Install Mermaid CLI if needed:

```powershell
npm install -g @mermaid-js/mermaid-cli
```

Export one file:

```powershell
mmdc -i docs/diagrams/mermaid/00-usecase-overview.mmd -o docs/diagrams/mermaid/00-usecase-overview.png
```

Export all `.mmd` files:

```powershell
Get-ChildItem docs/diagrams/mermaid -Filter *.mmd | ForEach-Object {
  mmdc -i $_.FullName -o ($_.FullName -replace '\.mmd$', '.png')
}
```

## Notes

- `00-usecase-overview.mmd` uses Mermaid `flowchart` syntax to approximate UML use-case diagrams.
- Source-backed use-case index: `docs/usecase-index.md`.
- Sequence files use `sequenceDiagram`.
- Diagrams avoid real secrets, token values, payment secrets, and credentials.
