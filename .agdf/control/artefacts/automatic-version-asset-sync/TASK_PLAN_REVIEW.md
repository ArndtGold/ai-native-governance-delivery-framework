# Task Plan Review: Release-Built Plugin Runtime Distribution

Status: pass
Date: 2026-07-18
Based on: approved TP, Brownfield Analysis and completed CD+Tests

## TP Coverage

| task_id | status | evidence | missing_evidence | QA impact |
|---|---|---|---|---|
| RBP-01 | fully_done | Source runtime is ignored/absent; source-mode integrity and negative fixture pass. Confidence: high. | none | none |
| RBP-02 | fully_done | Explicit safe output root and direct generated-plugin runtime build; two complete builds match and source digest is unchanged. Confidence: high. | none | none |
| RBP-03 | fully_done | Source/installed layout expectations, runtime digest resolution and negative cases pass. Confidence: high. | none | none |
| RBP-04 | fully_done | Both host manifests, integrity script and runtime are in generated plugin; 218-file pack inventory asserts critical paths once. Confidence: high. | none | none |
| RBP-05 | fully_done | Cross-platform data root, exact marker, containment and unowned/tampered root tests pass. Confidence: high. | Native Windows filesystem execution. | warning only; platform-neutral APIs and fixtures cover the approved repository scope. |
| RBP-06 | fully_done | Stage/backup/failed-root swap, idempotency, interrupted recovery and rollback fixtures pass. Confidence: high. | Process-kill test on native Windows. | warning only; no approved task remains incomplete. |
| RBP-07 | fully_done | Five-state classifier covers observed Codex and isolated Claude JSON shapes, exact legacy, conflict and malformed cases. Confidence: high. | none | none |
| RBP-08 | fully_done | Codex absent/current/legacy failure/rollback/conflict/version cases verify literal argv and recovery. Confidence: high. | Authenticated real-host migration. | UAT evidence only. |
| RBP-09 | fully_done | Claude user-scope absent/current/conflict/version/degraded cases and isolated JSON-shape observation pass. Confidence: high. | Authenticated real-host migration. | UAT evidence only. |
| RBP-10 | fully_done | Both workflows explicitly build and verify installed/package layouts before publish; ordering assertion passes. Confidence: high. | Live GitHub Actions run. | Release evidence only; no repository gap. |
| RBP-11 | fully_done | Lifecycle evidence and install docs describe release-built staging, exact legacy migration and recovery while preserving public commands. Confidence: high. | Host-rendered lifecycle card. | UAT evidence only. |
| RBP-12 | fully_done | Canonical sync, SOT Registry and Context Graph owner are reconciled; selected-run doctor has zero findings. Confidence: high. | none | none |
| RBP-13 | fully_done | Full create-agdf smoke, 27/27 evals, CLI smoke, both integrity modes and whitespace check pass. Confidence: high. | Global all-active delivery-map is blocked by pre-existing invalid unrelated run. | disclosed external control-state blocker; selected scope remains pass. |

## Acceptance Coverage

| Criterion | Status | Evidence |
|---|---|---|
| AC-01 | done | Runtime-free source plus complete exact-version generated and staged plugin. |
| AC-02 | done | Explicit validate/publish builds, installed integrity and tarball inventory precede publication; contents permission is read-only. |
| AC-03 | done | Durable shared local marketplace, exact ownership and Codex/Claude injected host sequencing. |
| AC-04 | done | Exact legacy-only migration, conflict blocking and atomic host/filesystem rollback. |
| AC-05 | done | Focused/offline/aggregate suites pass with source/package/installed layout separation. |

## Summary

- fully_done: 13/13.
- partially_done: 0.
- not_done: 0.
- out_of_scope_changes: `agdf/scripts/smoke-test.js` was aligned to the already implemented
  `Bootstrap and lifecycle commands` heading from the earlier interaction/CLI run; it introduces no
  new behavior.
- risks: authenticated host migration, restart and native Windows interruption remain explicit UAT
  or release evidence boundaries, not hidden implementation gaps.
- required_next_step: run Clean Implementation Review and Code Review, then QA Gate.
