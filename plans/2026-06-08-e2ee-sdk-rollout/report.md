# E2EE SDK Rollout Report

Date: 2026-06-08

## Applied

- Frontend E2EE is integrated at the shared Axios layer in `frontend/src/lib/http.ts`.
- Relative API paths now retain the `/api` base path when generating AAD.
- Backend E2EE is active for protected routes while public routes remain plaintext.
- Frontend verifies the backend identity signature during ECDH handshake.
- Request and response payloads use AES-GCM with request-bound AAD.
- Timestamp validation and nonce replay protection are active.
- Local `.env` files remain on disk but are removed from Git tracking.

## Verification

- Frontend TypeScript check: passed.
- Frontend ESLint check for the integration and verification script: passed.
- Backend Gradle tests: passed.
- Backend `bootJar`: passed.
- Public product API: HTTP 200 without encrypted envelope.
- Plaintext request to protected login API: rejected with `invalid_e2ee_payload`.
- Encrypted request to protected login API: encrypted HTTP 401 response decrypted successfully.
- Reusing the same encrypted envelope: rejected with `e2ee_replay_detected`.
- Frontend home page: HTTP 200.

## Runtime

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8080/api`
- Verification command: `npm run verify:e2ee` from `frontend`

## Remaining Production Work

- Replace local identity key material with a secret manager or deployment secret.
- Replace in-memory session and nonce stores before horizontal scaling.
- Add production metrics for handshake failures, invalid envelopes, timestamp rejection, and replay attempts without logging sensitive payloads.
