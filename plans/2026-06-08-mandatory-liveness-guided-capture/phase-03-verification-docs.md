# Phase 3: Verification And Docs

## Context Links

- Parent: [plan.md](plan.md)
- Docs: `docs/system-architecture.md`, `docs/codebase-summary.md`

## Overview

**Date:** 2026-06-08
**Created By:** loc.nt <0905071704b@gmail.com>
**Priority:** Medium
**Implementation Status:** Not Started
**Review Status:** Pending

Verify backend/frontend and update docs for mandatory liveness.

## Key Insights

- Docs currently say liveness optional.
- Need build/compile checks because both FE and BE contract change.

## Requirements

- Run backend tests or compile.
- Run frontend lint/build.
- Update docs/diagram text from optional to mandatory.

## Architecture

No schema changes. API contract changes only: `livenessVideoUrl` required.

## Related Code Files

- Modify: `docs/system-architecture.md`
- Modify: `docs/diagrams/mermaid/11-ekyc-upload-verification-flow.mmd`
- Possibly modify: `docs/codebase-summary.md`

## Implementation Steps

1. Run `service/lenshub/gradlew test`.
2. Run `frontend/pnpm lint`.
3. Run `frontend/pnpm build`.
4. Update docs for mandatory liveness.

## Todo List

- [ ] Backend verification.
- [ ] Frontend verification.
- [ ] Docs update.

## Success Criteria

- Checks pass or failures documented with cause.
- Docs no longer describe liveness as optional.

## Risk Assessment

- Local deps missing: document exact failure.
- Existing unrelated build failures: do not hide.

## Security Considerations

- Keep eKYC media privacy caveat in docs if touched.

## Next Steps

- Implement after plan approval.
