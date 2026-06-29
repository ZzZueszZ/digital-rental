# Phase 03: Validate Links, Commands, and Docs Consistency

## Context Links

- Parent plan: [plan.md](plan.md)
- Phase 02: [phase-02-write-readmes.md](phase-02-write-readmes.md)

## Overview

**Date:** 2026-06-29
**Created By:** loc.nt <0905071704b@gmail.com>
**Priority:** Medium
**Implementation Status:** Complete
**Review Status:** Passed - 0 critical issues

Verify README content against actual repo files.

## Key Insights

Docs-only changes still need validation because stale commands waste developer time.

## Requirements

- Validate links to local files.
- Validate scripts and commands exist.
- Check stale absolute paths.
- Check obvious secret-like values were not added.

## Architecture

No runtime architecture change.

## Related Code Files

- README files from Phase 02.
- `frontend/package.json`
- `service/lenshub/build.gradle`
- `service/ai-kyc-service/requirements*.txt`

## Implementation Steps

1. Run `rg` for old absolute paths.
2. Run `rg` for obvious placeholder violations and secret-like copied values.
3. Check README command names against project files.
4. Save docs-manager report.

## Todo List

- [x] Link/path scan.
- [x] Script command scan.
- [x] Secret/path scan.
- [x] Docs report.

## Success Criteria

- No stale absolute paths.
- No create-next-app boilerplate remains.
- No real `.env` secret values documented.

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
| --- | --- | --- | --- |
| Markdown typo | Medium | Low | Read final files |
| Bad command | Medium | Medium | Cross-check with config files |

## Security Considerations

Do not run or expose prod secrets. Do not include local `.env` contents.

## Next Steps

Summarize validation and request final review.
