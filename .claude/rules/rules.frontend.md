# Frontend rules

- Main app source: `frontend/src`.
- Route groups: `(main)`, `(auth)`, `(admin)`, `(staff)`, `(super-admin)`.
- Main API client: `frontend/src/lib/http.ts`.
- Feature API wrappers and React Query hooks live in `frontend/src/services/`.
- Shared UI lives in `frontend/src/components/`; keep UI copy in natural Vietnamese casing.
- Product management components are duplicated across admin, staff, and super-admin; update all relevant copies when changing shared behavior.
- Prefer existing components, schemas, types, and query keys before adding new patterns.
