# Implementation Plan: KYC Risk Score Display Fix

**Date:** 2026-06-09
**Status:** Completed
**Complexity:** Low

## Overview

Fix admin KYC UI showing backend risk score `100` as `10000%`.

## Problem

`riskScore` from backend is already on `0..100` scale. `livenessScore`, `faceMatchScore`, and OCR confidence are ratio-style `0..1`. Current `formatPercent` multiplies all values by `100`.

## Tasks

- [x] Add dedicated risk score formatter for `0..100`.
- [x] Keep ratio percent formatter for `0..1` values.
- [x] Replace risk score UI calls only.
- [x] Run frontend lint/build validation.

## Success Criteria

- [x] `riskScore = 100` renders `100%`.
- [x] `livenessScore = 0.98` still renders `98%`.

## Unresolved Questions

None.
