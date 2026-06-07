# Phase 02: Use Case Extraction

## Context Links

- Parent: [plan.md](plan.md)
- Research: [researcher-2026-06-06-usecase-indexing.md](research/researcher-2026-06-06-usecase-indexing.md)
- Report: [analysis-2026-06-06-source-usecases.md](reports/analysis-2026-06-06-source-usecases.md)

## Overview

**Date:** 2026-06-06  
**Created By:** loc.nt <0905071704b@gmail.com>  
**Description:** Convert route/controller/service evidence into main actor-goal use cases.  
**Priority:** High  
**Implementation Status:** Completed  
**Review Status:** Pending

## Key Insights

- Use cases should be actor goals, not endpoint list.
- Guest, Customer, Staff/Admin, Super Admin, VNPay, Mail, Redis are the meaningful actors/systems.
- Staff/Admin overlap heavily; Super Admin adds role/permission management.

## Requirements

- Group use cases by actor.
- Link each group to source evidence.
- Mark ambiguous/current-risk items.

## Architecture

Use case evidence chain:

`frontend/src/app` route -> `frontend/src/services` API call -> backend controller -> service/module.

## Related Code Files

- `frontend/src/app/(main)`
- `frontend/src/app/(auth)`
- `frontend/src/app/(admin)`
- `frontend/src/app/(staff)`
- `frontend/src/app/(super-admin)`
- `frontend/src/services/*.ts`
- `service/lenshub/src/main/java/org/web/*/controller/*.java`

## Implementation Steps

1. Extract actor entry points from route groups and sidebar role menus.
2. Extract backend capability boundaries from controller mappings.
3. Merge endpoint-level operations into user-goal use cases.
4. Add source evidence and unresolved questions.

## Todo List

- [x] Guest use cases.
- [x] Customer use cases.
- [x] Staff/Admin use cases.
- [x] Super Admin use cases.
- [x] External system use cases.

## Success Criteria

- Main use cases are listed by actor.
- Each major backend module maps to at least one use case.
- Ambiguous route families are called out.

## Risk Assessment

- Risk: route exists but page workflow incomplete. Mitigation: label as source-derived, not product-approved.
- Risk: duplicated admin/staff/super-admin screens inflate count. Mitigation: group common admin goals.

## Security Considerations

- Note permission-gated admin use cases.
- Do not document confidential values.

## Next Steps

Review report with user before generating final diagrams/docs.
