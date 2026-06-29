# Phase 03: Frontend API Consistency

## Context Links

- `frontend/src/lib/http.ts`
- `frontend/src/services/api.ts`
- `frontend/src/components/home/ProductListSection.tsx`
- `frontend/src/app/(main)/products/[id]/page.tsx`
- `frontend/src/app/api/auth/refresh-token/route.ts`

## Overview

**Date:** 2026-06-06
**Priority:** High
**Status:** Pending

Unify frontend API/auth behavior and remove hardcoded localhost asset URLs.

## Key Insights

- `http` uses Zustand access token and refresh queue.
- `api` uses `localStorage auth-token`, which is inconsistent.
- Image helpers hardcode `https://api.lenshub.shop`.
- Refresh-token route has GET that returns the raw token.

## Requirements

- One API client.
- One asset URL helper.
- No raw refresh token returned to client code.

## Architecture

Use `src/lib/http.ts` for API calls and add `src/lib/url.ts` for API origin/asset URL normalization.

## Related Code Files

- `frontend/src/lib/http.ts`
- `frontend/src/services/api.ts`
- `frontend/src/lib/utils.ts`
- Product/home/admin components with image URL helpers.

## Implementation Steps

1. Migrate `api` callers to `http`.
2. Delete or deprecate `services/api.ts`.
3. Add shared asset URL helper.
4. Replace hardcoded localhost image URL builders.
5. Remove refresh-token GET or return status only.

## Todo List

- [ ] Migrate ProductListSection.
- [ ] Migrate product detail page.
- [ ] Replace admin image base constants.
- [ ] Validate auth refresh behavior.

## Success Criteria

- `rg "@/services/api|localStorage.getItem(\"auth-token\")" frontend/src` has no active hits.
- `rg "https://api.lenshub.shop" frontend/src` has no active hardcoded URL hits.

## Risk Assessment

- Medium: user sessions may behave differently after client unification. Mitigate with login/refresh/manual route checks.

## Security Considerations

Keep refresh token httpOnly and avoid exposing it through readable endpoints.

## Next Steps

Run after backend URL/config conventions are settled.
