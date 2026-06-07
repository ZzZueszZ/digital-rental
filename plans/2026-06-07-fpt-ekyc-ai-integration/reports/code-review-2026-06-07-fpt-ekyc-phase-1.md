## Code Review Summary

### Scope

- Backend KYC DTO/service/provider/risk changes.
- Frontend customer eKYC flow, identity service contract, admin KYC display.
- Plan files updated for Phase 1 state.

### Findings

- Fixed: `UploadedFileResolver` normalized user-controlled upload paths without checking they stayed inside `uploads`. Added boundary check.
- Fixed: FPT provider timeout config existed but was not applied. Added `SimpleClientHttpRequestFactory` with configured connect/read timeout.
- Remaining medium: FPT parser is based on expected sandbox shape, not verified against live sandbox payload in this run.
- Remaining medium: uploaded images are still served from current upload path; acceptable for MVP/demo only, not production private storage.
- Remaining low: `DecisionSource.AI_AUTO_APPROVED/REJECTED` is used as AI recommendation while session still stays `PENDING_REVIEW`; naming may confuse future audit/reporting.

### Verification

- `.\gradlew test`: pass.
- `pnpm build`: pass.
- Focused lint on changed frontend files: no errors, existing warnings only.
- Full frontend lint: fails due unrelated pre-existing errors outside KYC scope.

### Summary

Phase 1 implementation matches MVP flow: user submits front/back/selfie only, backend extracts OCR data, performs facematch, scores risk, and keeps manual admin review as final gate.

### Unresolved Questions

- [ ] Should Phase 1 store KYC images in private object storage before demo defense?
- [ ] Should AI recommendation use a separate enum instead of `DecisionSource` auto approve/reject names?
