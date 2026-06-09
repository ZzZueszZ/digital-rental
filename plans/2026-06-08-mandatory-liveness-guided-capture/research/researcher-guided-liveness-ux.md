# Research Report: Guided Liveness UX

**Date:** 2026-06-08
**Research Question:** How should LensHub implement mandatory web liveness video capture with guided face angles?

## Executive Summary

Use active liveness UX: ask user to center face, turn left, turn right, return center, while recording one video. Browser validation should be quality gate only; backend provider remains final decision.

## Key Findings

### Active prompts are standard

- Active liveness commonly asks user to perform actions like turning head left/right.
- Fit LensHub request: validate one prompt before next prompt.
- Source: https://doc.ozforensics.com/oz-knowledge/general/oz-platform/passive-and-active-liveness

### Quality feedback improves capture

- Good lighting, centered face, no mask/sunglasses, stable distance reduce failed checks.
- Use localized instructions, visual frame, progress, and retake path.
- Source: https://support.advance.ai/hc/en-us/articles/51152247076889-How-to-Improve-Liveness-Detection-Results

### Do not trust client as security authority

- Web liveness has runtime security constraints; server/provider validation remains source of truth.
- Client should not expose final liveness scores as a bypass target.
- Source: https://learn.microsoft.com/en-us/azure/ai-services/computer-vision/concept-face-liveness-detection
- Source: https://docs.aws.amazon.com/rekognition/latest/dg/recommendations-liveness.html

## Recommendations

1. Implement 4-prompt guided recording: nhìn thẳng -> quay trái -> quay phải -> nhìn thẳng.
   - Rationale: simple, understandable, enough face angle variation.
   - Trade-off: approximate validation unless adding landmarks.

2. Enforce liveness on backend.
   - Rationale: frontend-only required field is bypassable.
   - Trade-off: old clients without liveness will fail submit.

3. Add clear Vietnamese UI text.
   - Rationale: user audience likely Vietnamese; less friction.
   - Trade-off: no i18n abstraction in this phase.

## Alternatives Considered

| Option | Pros | Cons | Verdict |
| --- | --- | --- | --- |
| Lightweight timed prompts | No new dependency, fast | Angle validation approximate | Rank 1 |
| Add face landmark model | Better angle validation | New dependency, model load, privacy/perf cost | Rank 2 |
| Provider SDK/session | Strongest security | Larger integration change, may not fit FPT flow | Defer |

## Sources

1. https://doc.ozforensics.com/oz-knowledge/general/oz-platform/passive-and-active-liveness
2. https://learn.microsoft.com/en-us/azure/ai-services/computer-vision/concept-face-liveness-detection
3. https://docs.aws.amazon.com/rekognition/latest/dg/recommendations-liveness.html
4. https://support.advance.ai/hc/en-us/articles/51152247076889-How-to-Improve-Liveness-Detection-Results

## Next Steps

1. Backend require `livenessVideoUrl`.
2. Frontend replace liveness step with guided recording state machine.
3. Test submit blocked until all prompts pass and video uploads.

## Unresolved Questions

- Should guided sequence include look up/down too, or keep left/right/center for MVP?
