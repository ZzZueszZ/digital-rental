# Phase 01: Diagram Structure

## Context Links

- Parent: [plan.md](plan.md)
- Docs: `docs/codebase-summary.md`, `docs/project-overview-pdr.md`

## Overview

**Date:** 2026-06-06
**Created By:** loc.nt <0905071704b@gmail.com>
**Priority:** High
**Implementation Status:** Completed
**Review Status:** Completed

Define final Mermaid file map and actor/system naming.

## Key Insights

- One giant sequence diagram would be unreadable.
- Use-case overview can use flowchart subgraphs.
- Sequence diagrams should be grouped by business domain.

## Requirements

- Cover all 16 requested flows.
- Keep filenames sortable.
- Use Vietnamese labels for business actions.
- Use stable participant names: Guest, Customer, Admin/Staff, Super Admin, Frontend, Backend API, DB, Redis, Mail, VNPay.

## Architecture

`docs/diagrams/mermaid/` will contain all `.mmd` files and `README.md`.

## Related Code Files

- `frontend/src/app`
- `frontend/src/services`
- `service/lenshub/src/main/java/org/web`

## Implementation Steps

1. Create diagram directory.
2. Create README with export commands.
3. Map each requested flow to one diagram file.

## Todo List

- [x] Create `docs/diagrams/mermaid/README.md`
- [x] Confirm diagram file list
- [x] Confirm actor naming

## Success Criteria

- Every requested flow appears in the file map.
- No diagram file tries to cover too many unrelated flows.

## Risk Assessment

- Risk: diagrams too dense. Mitigation: split by domain.

## Security Considerations

- Do not include real credentials, tokens, or secret values in diagrams.

## Next Steps

Proceed to Mermaid generation.
