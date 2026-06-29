# Implementation Plan: README Documentation Refresh

**Date:** 2026-06-29
**Created By:** loc.nt <0905071704b@gmail.com>
**Status:** Completed
**Complexity:** Medium
**Estimated Effort:** 3-4 hours

## Overview

Create a useful README set for the LensHub monorepo: one root overview plus focused README files for each runnable project.

## Problem Statement

Current README coverage is uneven. Root README is too shallow, frontend README is boilerplate, backend README is missing, and AI KYC README has encoding/path issues.

## Goals & Success Metrics

- Root README explains product, repo map, quick start, docs, and project links.
- Each runnable project has setup, env, commands, tests, and troubleshooting.
- No secrets or machine-specific absolute paths.
- Links and commands are repo-relative and consistent with existing docs/config.

## Research Findings

- README should be repo landing page: [researcher-readme-best-practices.md](research/researcher-readme-best-practices.md).
- Current-state analysis: [analysis-current-readmes.md](reports/analysis-current-readmes.md).

## Proposed Solution

Use root README as map and keep project READMEs as executable onboarding. Avoid duplicating full architecture docs; link to `docs/` for deeper detail.

## Phases

| Phase | Status | Scope |
| --- | --- | --- |
| 1 | Complete - structure applied | [README structure and content contract](phase-01-readme-structure.md) |
| 2 | Complete - README files rewritten | [Write root and project READMEs](phase-02-write-readmes.md) |
| 3 | Complete - validation passed, review passed | [Validate links, commands, and docs consistency](phase-03-validate-readmes.md) |

## Files To Modify

- `README.md`
- `frontend/README.md`
- `service/lenshub/README.md`
- `service/ai-kyc-service/README.md`

## Testing Strategy

- Check all README links point to existing repo files.
- Check all listed scripts exist in `package.json`, `build.gradle`, or service files.
- Run lightweight validation: `rg` for stale absolute paths and secret-like values.

## Rollback Plan

Revert README files only. No runtime code, DB, or API changes.

## Unresolved Questions

- None.

## Completion

Completed 2026-06-29. README files rewritten, validation passed, review passed with 0 critical issues.
