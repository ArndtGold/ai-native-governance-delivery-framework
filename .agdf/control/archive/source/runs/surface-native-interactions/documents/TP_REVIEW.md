# Task Plan Review: Surface-Native AGDF Interactions

Status: done
Decision: pass_with_disclosure
Date: 2026-07-14
Based on: approved `TP.md`; `CD_TESTS.md`; actual implementation diff

## TP Coverage

| task_id | status | evidence | missing_evidence | QA impact |
|---|---|---|---|---|
| SNI-01 | fully_done | Runtime Contract diff and passing positive/negative integrity checks | none | none |
| SNI-02 | fully_done | gate-check Native Interaction Path and passing integrity checks | none | none |
| SNI-03 | fully_done | canonical `interactions` metadata with four mappings | none | none |
| SNI-04 | fully_done | generated sync path, routing/package smoke and idempotence evidence | none | none |
| SNI-05 | fully_done | missing-only global merge plus explicit allow/deny and existing-config fixtures | none | none |
| SNI-06 | fully_done | canonical assertions plus controlled negative mutations for metadata, contract and skill | none | none |
| SNI-07 | fully_done | aggregate package smoke covers generated OpenCode and Codex package surfaces | none | none |
| SNI-08 | fully_done | OpenCode missing, explicit allow, explicit deny and fragment-preservation fixtures | none | none |
| SNI-09 | fully_done | control-state stale/ambiguous tests, missing-artefact/implicit-consent smoke and contract exclusions for permission/plan/timeout/hook input | none; no parallel response parser exists to test | none |
| SNI-10 | fully_done | INSTALL, package README and affected Pages copy; Pages check/build pass | none | none |
| SNI-11 | fully_done | repeated synchronization produced identical diff hash | none | none |
| SNI-12 | fully_done | `CG-NATIVE-INTERACTION-AUTHORITY` created with implementation/test evidence | none | none |
| SNI-13 | fully_done | syntax, integrity, control-state, routing, aggregate smoke, Pages and diff checks pass | none | none |
| SNI-14 | partially_done | runtime versions/auth state inspected and Codex exact-text fallback observed | no authenticated Claude UI probe; no safely automated interactive Codex/OpenCode question rendering | advisory only; SD/TP classify live UI probes as supporting, not release-critical |
| SNI-15 | fully_done | CD evidence map plus TP, clean implementation and code review artefacts | none | none |

## Acceptance Coverage

- AC-01 through AC-13: done with high-confidence canonical contract/skill assertions and existing fail-closed control-state evidence.
- AC-14 and AC-15: done with high-confidence canonical metadata, generated-surface/config smoke and exact-text fallback evidence.
- AC-16 and AC-17: done with high-confidence unchanged exact textual approval/control-state authority and explicit normative assertions.
- AC-18: done with high-confidence positive/negative integrity tests, generated package smoke and idempotent synchronization.

## Summary

- fully_done: 14 tasks
- partially_done: SNI-14 supporting live UI evidence only
- not_done: none
- out_of_scope_changes: none
- risks: host UI schemas and authenticated interactive rendering remain drift-prone supporting evidence; deterministic fallback and contract tests mitigate correctness risk
- required_next_step: Carry the disclosed SNI-14 evidence limitation into QA; do not treat it as missing deterministic acceptance evidence.
