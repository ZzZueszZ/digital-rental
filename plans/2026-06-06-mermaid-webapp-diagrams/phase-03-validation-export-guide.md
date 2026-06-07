# Phase 03: Validation and Export Guide

## Context Links

- Parent: [plan.md](plan.md)
- Mermaid docs: https://mermaid.js.org/

## Overview

**Date:** 2026-06-06
**Created By:** loc.nt <0905071704b@gmail.com>
**Priority:** Medium
**Implementation Status:** Completed
**Review Status:** Completed

Verify diagrams are usable and document PNG export options.

## Key Insights

- Mermaid CLI may not be installed locally.
- The safest universal path is Mermaid Live Editor import/export.
- If CLI is installed, `mmdc` can batch export.

## Requirements

- README includes export steps.
- Files are standalone `.mmd`.
- Optional PowerShell export snippet if `mmdc` exists.

## Architecture

No app code changes. Documentation artifacts only.

## Related Code Files

- None.

## Implementation Steps

1. Inspect generated `.mmd` for syntax consistency.
2. Add README export instructions.
3. Optionally run `mmdc --version` if CLI exists.

## Todo List

- [x] README export with Mermaid Live Editor
- [x] README export with Mermaid CLI
- [x] Final file listing

## Success Criteria

- User can open any `.mmd` and export PNG.
- README explains commands clearly.

## Risk Assessment

- Risk: local Mermaid CLI unavailable. Mitigation: provide browser-based export path.

## Security Considerations

- Diagrams should not expose secrets.

## Next Steps

Send final artifact list to user.
