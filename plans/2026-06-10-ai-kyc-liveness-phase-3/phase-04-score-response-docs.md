# Phase 4: Score, Response, Docs

## Context Links

- Parent: [plan.md](plan.md)
- Depends on Phase 1, Phase 2, and optionally Phase 3.

## Overview

**Date:** 2026-06-10
**Created By:** loc.nt <0905071704b@gmail.com>
**Priority:** P0
**Status:** DONE 2026-06-11 - tests 39/39 passed, reviewed with 0 critical issues
**Review Status:** Pending

Finalize score combination, stable response, diagnostics, and local usage docs.

## Key Insights

- Java parser expects only `data` keys. Extra diagnostics must stay outside `data`.
- Fail-closed should still return HTTP 200 to mimic provider-style behavior.

## Requirements

Response keeps:

```json
{
  "data": {
    "score": 0.91,
    "passed": true,
    "spoof_detected": false,
    "multiple_faces_detected": false
  }
}
```

Scoring:

```text
final_score = pose_score * 0.60 + antispoof_score * 0.40
passed = final_score >= 0.80
      && valid_face_ratio >= 0.80
      && !multiple_faces_detected
      && !spoof_detected
      && sequence_passed
```

If anti-spoof not implemented:

```text
final_score = pose_score
spoof_detected = pose_score < 0.50
```

## Architecture

`LivenessService` becomes coordinator: input validator -> active validator -> anti-spoof validator -> score combiner -> response builder.

## Related Code Files

- Modify: `service/ai-kyc-service/app/services/liveness_service.py`
- Modify: `service/ai-kyc-service/README.md`
- Modify: `docs/codebase-summary.md`

## Implementation Steps

1. Add stable `diagnostics` object outside `data`.
2. Include config values in diagnostics where useful.
3. Standardize failure reasons: `invalid_video`, `metadata_rejected`, `mediapipe_unavailable`, `pose_sequence_failed`, `antispoof_unavailable`, `spoof_detected`.
4. Update README Postman/curl liveness guide.
5. Update docs summary for liveness model behavior.

## Todo List

- [x] Response builder updated.
- [x] Failure reason enum/string set.
- [x] README updated.
- [x] Docs summary updated.

## Success Criteria

- Existing Java parser continues to read response.
- Diagnostics explain every fail-closed path.
- Manual Postman test instructions are current.

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
| --- | --- | --- | --- |
| Java parser breaks on new fields | Low | High | Add diagnostics outside `data`; keep `data` stable |

## Security Considerations

- Diagnostics should not include secrets or raw media content.

## Next Steps

Use diagnostics to tune with real FE videos.
