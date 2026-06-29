# Phase 01: README Structure and Content Contract

## Context Links

- Parent plan: [plan.md](plan.md)
- Research: [researcher-readme-best-practices.md](research/researcher-readme-best-practices.md)
- Current analysis: [analysis-current-readmes.md](reports/analysis-current-readmes.md)

## Overview

**Date:** 2026-06-29
**Created By:** loc.nt <0905071704b@gmail.com>
**Priority:** High
**Implementation Status:** Complete
**Review Status:** Passed - 0 critical issues

Define a consistent README shape before writing content.

## Key Insights

- Root README should route readers.
- Project README should unblock local work.
- Deep architecture belongs in `docs/`.

## Requirements

- Use concise sections.
- Use repo-relative paths.
- Do not include secrets.
- Preserve documentation maintenance metadata in root README.

## Architecture

README hierarchy:

```text
README.md
+-- frontend/README.md
+-- service/lenshub/README.md
+-- service/ai-kyc-service/README.md
+-- docs/*.md
```

## Related Code Files

- Modify: `README.md`
- Modify: `frontend/README.md`
- Create: `service/lenshub/README.md`
- Modify: `service/ai-kyc-service/README.md`

## Implementation Steps

1. Define shared sections: purpose, prerequisites, env, run, test, deploy notes, troubleshooting.
2. Decide which details live in root vs project files.
3. List project-specific commands from package/build/config files.

## Todo List

- [x] Draft section contract.
- [x] Map project commands.
- [x] Confirm env files to reference.

## Success Criteria

- Clear README outline exists before writing.
- No content duplicates full docs unnecessarily.

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
| --- | --- | --- | --- |
| Overlong README | Medium | Medium | Link to docs for detail |
| Missing key setup | Medium | High | Derive commands from actual files |

## Security Considerations

Never copy `.env` values. Reference `.env.example` only.

## Next Steps

Proceed to Phase 02.
