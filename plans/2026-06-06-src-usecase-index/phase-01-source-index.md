# Phase 01: Source Index

## Context Links

- Parent: [plan.md](plan.md)
- Docs: `docs/codebase-summary.md`, `docs/system-architecture.md`, `docs/project-overview-pdr.md`
- Report: [analysis-2026-06-06-source-usecases.md](reports/analysis-2026-06-06-source-usecases.md)

## Overview

**Date:** 2026-06-06  
**Created By:** loc.nt <0905071704b@gmail.com>  
**Description:** Index active source roots and identify route/controller/service evidence.  
**Priority:** High  
**Implementation Status:** Completed  
**Review Status:** Pending

## Key Insights

- Active source roots are `frontend/src` and `service/lenshub/src`.
- Source scan found 559 files in active scope: 292 Java, 210 TSX, 55 TS, 1 YML, 1 CSS.
- Frontend route groups match backend domain modules closely.

## Requirements

- Index active `src` only.
- Preserve source evidence by route/controller/service family.
- Do not modify application code.

## Architecture

Frontend pages call `src/services`, services call `src/lib/http.ts`, backend controllers delegate to service/repository layers.

## Related Code Files

- `frontend/src/app`
- `frontend/src/services`
- `service/lenshub/src/main/java/org/web`
- `service/lenshub/src/main/resources/application.yml`

## Implementation Steps

1. List source files with `rg --files frontend/src service/lenshub/src`.
2. Count file types.
3. List Next.js pages/layout/API routes.
4. Extract Spring controller mappings and authorization hints.
5. Cross-check service API calls.

## Todo List

- [x] Source file inventory.
- [x] Frontend route inventory.
- [x] Backend controller inventory.
- [x] Frontend service API inventory.

## Success Criteria

- Report lists active src count.
- Report includes frontend and backend evidence.
- No non-src legacy folders mixed into usecase list.

## Risk Assessment

- Risk: legacy code outside active src pollutes index. Mitigation: scope fixed to active roots only.

## Security Considerations

- Do not include secrets or token values.
- Authorization is summarized by permission names only.

## Next Steps

Proceed to use case extraction.
