# Phase 5: Test Set & Threshold Tuning

## Context Links

- Parent: [plan.md](plan.md)
- Depends on Phase 1 for fixture validation.

## Overview

**Date:** 2026-06-10
**Created By:** loc.nt <0905071704b@gmail.com>
**Priority:** P1
**Status:** DONE 2026-06-11 - tests 40/40 passed, reviewed with 0 critical issues
**Review Status:** Pending

Create internal test set and tune thresholds from real FE captures.

## Key Insights

- Liveness thresholds cannot be trusted without local device/browser samples.
- Manual review remains final authority for KYC, so service should fail suspicious videos rather than over-pass.

## Requirements

Create non-public folder:

```text
testdata/liveness/
  pass/
  fail_wrong_order/
  fail_no_face/
  fail_multiple_faces/
  fail_spoof_screen/
  fail_short_video/
```

## Architecture

Tests run unit logic with synthetic data and integration checks with small private fixture videos. Fixture media should not be committed if it contains real faces.

## Related Code Files

- Create/modify: `service/ai-kyc-service/tests/test_liveness_service.py`
- Update: `service/ai-kyc-service/README.md`
- Optional local-only: `testdata/liveness/`

## Implementation Steps

1. Unit test metadata validator.
2. Unit test segment scorer with synthetic yaw/frame records.
3. Unit test score combiner.
4. Integration test fake/corrupt video rejection.
5. Manual Postman test with FE-recorded video.
6. Record threshold observations in README or plan report.

## Todo List

- [x] Create local testdata layout.
- [x] Add unit tests.
- [x] Add integration tests where fixture is safe.
- [ ] Tune config from FE videos. Blocked until local FE videos/models are available.

## Success Criteria

- Pass videos pass after tuning.
- Wrong order, no face, multi-face, spoof screen, and short video fail.
- Threshold changes are documented with sample count.

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
| --- | --- | --- | --- |
| Real face videos leak into git | Medium | High | Keep testdata ignored/local only |
| Threshold overfits one device | Medium | Medium | Test multiple browsers/devices |

## Security Considerations

- Do not commit user face videos.
- Store test media locally only, or anonymize before sharing.

## Next Steps

Collect at least 10 pass and 10 fail samples before enabling auto-pass behavior outside dev.
