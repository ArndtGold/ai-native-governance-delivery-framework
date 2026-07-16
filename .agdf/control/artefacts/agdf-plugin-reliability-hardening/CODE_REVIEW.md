# Code Review: Dual-Layout Runtime-Integrity Validation

Status: pass
Date: 2026-07-16
Owner: agent

## Review Scope

- `plugin/scripts/check-runtime-integrity.mjs`
- `create-agdf/scripts/runtime-integrity-layout-test.js`
- `create-agdf/package.json`
- `INSTALL.md`
- directly affected existing negative tests and CI/release smoke entry points

## Decision

- decision: pass
- findings: none
- missing_evidence: none in the approved review scope
- risks: classification relies on stable shipped/source markers; focused tests cover both accepted
  modes and a rejected partial mode, while source-only invariant depth remains covered by the
  existing negative suite
- required_next_step: run QA Gate and persist the QA report

## Reviewed Dimensions

- correctness: plugin root is derived with `..` from `plugin/scripts/`; the initial mistaken `../..`
  assumption was caught and permanently regression-tested
- error paths: invalid layouts return a stable diagnostic before directory traversal; missing common
  invariants keep canonical failure messages
- security: resolution checks only the exact override or script root/direct parent; no arbitrary
  search, network access or production mutation
- compatibility: source mode retains repository-only checks; installed mode retains canonical
  manifest, contract, skill, hook, asset and template checks
- maintainability: one canonical checker and one focused test owner; no fallback, shim or duplicated
  fixture tree
