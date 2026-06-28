# Debugger Report: SessionKeyStoreTest Compile Blocker

## Executive Summary

`.\gradlew test --tests org.web.common.utils.FileUploadUtilTest` cannot execute the new liveness tests because `compileTestJava` fails first in an unrelated existing test file.

## Root Cause

`service/lenshub/src/test/java/org/web/e2ee/shield/sdk/security/SessionKeyStoreTest.java` calls `SessionKeyStore.put`, `get`, `markNonce`, and `revoke` as static methods. Current `SessionKeyStore` exposes these as instance methods, so Java test compilation fails before Gradle can filter down to `FileUploadUtilTest`.

## Evidence

- Lines 20-35: eight `non-static method ... cannot be referenced from a static context` errors.
- New liveness validator test class did not execute.
- `.\gradlew compileJava` succeeds, so main backend source compiles.

## Recommendation

1. Update `SessionKeyStoreTest` to instantiate `SessionKeyStore` or use the Spring test context.
2. Rerun `.\gradlew test --tests org.web.common.utils.FileUploadUtilTest`.
3. Then run full `.\gradlew test` if the wider suite is required.

## Unresolved Questions

- None.
