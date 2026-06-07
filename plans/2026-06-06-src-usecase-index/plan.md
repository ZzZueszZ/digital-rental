# Implementation Plan: Source Use Case Index

**Date:** 2026-06-06  
**Created By:** loc.nt <0905071704b@gmail.com>  
**Status:** In Progress  
**Complexity:** Medium  
**Estimated Effort:** 1-2 hours

## Overview

Index active source code under `frontend/src` and `service/lenshub/src`, then list main LensHub webapp use cases by actor/domain. This is analysis only; no app code changes.

## Goals

- [x] Count/index active source files.
- [x] Map frontend pages/services to backend controllers.
- [x] List main use cases with source evidence.
- [ ] Review with user before turning into diagrams/docs.

## Research Findings

- Use cases should describe actor goals inside a system boundary.
- Top-level use cases should be complete user-visible functions, not low-level implementation calls.
- Mermaid flowchart/subgraph can later represent use-case boundaries if diagrams are generated.

## Proposed Solution

Create concise reports in this plan folder:

- source inventory and route/controller index.
- use case list grouped by Guest, Customer, Staff/Admin, Super Admin, External Systems.
- next-step plan for converting index into diagrams or formal docs.

## Phases

| Phase | Status | Link |
| --- | --- | --- |
| 01 Source index | Completed | [phase-01-source-index.md](phase-01-source-index.md) |
| 02 Use case extraction | Completed | [phase-02-usecase-extraction.md](phase-02-usecase-extraction.md) |
| 03 Review and diagram next step | IN_PROGRESS - Step 3 complete, validation 4/4 passed | [phase-03-review-and-diagram-next-step.md](phase-03-review-and-diagram-next-step.md) |

## Key Outputs

- [Research: use case indexing](research/researcher-2026-06-06-usecase-indexing.md)
- [Analysis: source use cases](reports/analysis-2026-06-06-source-usecases.md)

## Risk Analysis

| Risk | Probability | Impact | Mitigation |
| --- | --- | --- | --- |
| Use case too granular | Medium | Medium | Group endpoint-level actions into user goals. |
| Route exists but feature incomplete | Medium | High | Mark inferred use cases from source evidence. |
| Role overlap confusing | Medium | Medium | Separate Super Admin-only RBAC from Staff/Admin operations. |

## Next Steps

1. Review use case list.
2. Confirm route family ambiguity for eKYC and rental payment.
3. If approved, run `/code plans/2026-06-06-src-usecase-index/plan.md` to generate formal diagrams/docs.

## Unresolved Questions

- Which eKYC route family is canonical: `/ekyc/*` or `/identity/ekyc/*`?
- Should Staff and Admin be separated in final use-case diagram, or grouped where permissions overlap?
