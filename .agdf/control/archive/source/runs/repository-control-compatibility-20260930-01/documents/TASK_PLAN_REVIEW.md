# Task Plan Review: Repository-specific migration and repair

Date: 2026-09-30
Decision: pass (evidence only; QA remains the sole final decision owner)
Reference: approved TP, AC-001 through AC-012 and SCN-001 through SCN-030.

## TP Coverage

| task_id | status | evidence | missing_evidence | QA impact |
|---|---|---|---|---|
| T-001 | fully_done | Passing Brownfield Analysis, byte baseline, approved digests and preserved original index. | None | Preparation satisfied. |
| T-002 | fully_done | One shared capability; extracted bodies preserve exact canonical behavior; installer parity tests pass. | None | Ownership and write invariants evidenced. |
| T-003 | fully_done | Dedicated parser/registry/validator adapter; actual direct source/generated command, roots and no-write/error/TTY tests. | None in automated lane | New additive command proven in generated runtime. |
| T-004 | fully_done | EN/DE/fallback 1/2/3 plus aliases; separate reviewed apply; original proof/backups/reset; actual reinspection and stale target/source tests. | None in automated lane | Guided workflow evidenced. |
| T-005 | fully_done | Generated consent-bound hook, shared bounded child invocation, independent Doctor state, nested/root-switch and OpenCode cwd fixtures. | Fresh-host evidence belongs to T-008. | Source/generated behavior proven; no live acceptance inferred. |
| T-006 | fully_done | Minimal dependency closure; deterministic profiles/manifests, exact reviewed payload, docs and 29 suites. | None in package lane | Candidate concrete and reviewable. |
| T-007 | fully_done | CD_TESTS.md/AUTOMATED_EVIDENCE.json, passed Code/Clean reviews, resolved implementation findings, scope/diff/integrity checks. | None for source review | No open source defect evident. |
| T-008 | fully_done | Exact installed identity and real PTY operations in CODEX_LIVE_OBSERVATION.md plus four actual fresh native SessionStart events with enabled trusted hooks in NATIVE_SESSION_OBSERVATION.md / NATIVE_SESSION_EVIDENCE.json. | None within approved Codex lane; no graphical restart or completed model answer claimed. | SCN-028/029/030 evidenced; TP-E01 resolved. |
| T-009 | fully_done | QA evaluated using all completed reviews and the separately recorded native/installed lanes. | Human QA/UAT decisions remain separate. | QA can evaluate pass within the approved scope. |

## Acceptance Coverage

| criterion_id | status | evidence confidence | evidence |
|---|---|---|---|
| AC-001 | done | high | SCN-001/002 shared parity and isolated roots. |
| AC-002 | done | high | SCN-003/004 preserved classification and generated blocked-Doctor/current-control output. |
| AC-003 | done | high for native Codex lane | SCN-005/006/007 plus four actual fresh native SessionStart events: trusted enabled hook, migration/repair hint and current/absent no-hint, unchanged roots and receipt. |
| AC-004 | done | high | SCN-008/009/010 root reentry, explicit targeting, stale source/target rejection. |
| AC-005 | done | high | SCN-011/012/013 actual localized selections, deliberate apply and EOF. |
| AC-006 | done | high | SCN-014/015 same canonical migration, preserved originals/pending outputs/reset. |
| AC-007 | done | high | SCN-016/017 exact Git/checkpoint proofs and negative repair cases. |
| AC-008 | done | high | SCN-018 unchanged canonical locks/fault/owned rollback and direct idempotence. |
| AC-009 | done | high | SCN-019/020/021 passed; SCN-030 actual installed direct command/PTY migration and repair passed. |
| AC-010 | done | high | SCN-022/023 actual partial/needs-input/deferral/reinspection and exit semantics. |
| AC-011 | done | high | SCN-024/025 compact projection and actual EN/DE/fallback rendering; native Windows unclaimed. |
| AC-012 | done | high for native Codex lane | SCN-026/027 package evidence plus separately identified native sessions and exact installed binding/digests in NATIVE_SESSION_EVIDENCE.json; no other host claim. |

## UX Intent Fidelity

| prd_criterion | working_mode_state | task_id | visible_evidence | fidelity_status | gap_type |
|---|---|---|---|---|---|
| AC-001 | Explicit repository/current/absent | T-003 | Source/generated root results and no-write snapshots. | fulfilled | none |
| AC-002 | Compatibility separate from Doctor | T-005 | Actual hook: blocked Doctor plus current compatibility. | fulfilled | none |
| AC-003 | Effective permission at startup | T-005/T-008 | Native hooks/list reports enabled/trusted and native hook/completed supplies target-specific context in four fresh sessions; unchanged real receipt. | fulfilled | none |
| AC-004 | Reentry and stale proposal | T-003/T-005 | A/B/nested/OpenCode fixture output; replaced-target rejection. | fulfilled | none |
| AC-005 | 1/2/3, reviewed application, EOF | T-004 | Rendered menu/transcript and real stream EOF assertions. | fulfilled | none |
| AC-006 | Migration consequence and backups | T-004 | Plan callback, original journal bytes, approval reset and missing pending output. | fulfilled | none |
| AC-007 | Proven repair or required input | T-004 | Actual restoration and no-source required paths/results. | fulfilled | none |
| AC-008 | Recovery, conflict and repeat | T-004 | Canonical fault/lock snapshots and direct byte-identical repeat. | fulfilled | none |
| AC-009 | Direct installed runtime | T-003/T-008 | Actual cache runtime and real PTY migration/repair/reinspection in CODEX_LIVE_OBSERVATION.md. | fulfilled | none |
| AC-010 | Actual completed/remaining state | T-004 | Applied/partial/deferred/needs-input/unavailable result matrix. | fulfilled | none |
| AC-011 | Bounded localized hints/details | T-004/T-005 | EN/DE/fallback output; large projector, inert text and display quoting. | fulfilled | none |
| AC-012 | Honest package vs fresh host proof | T-006/T-008 | Matching installed candidate digests, separate installed PTY and actual fresh native session event evidence; explicit model/desktop/other-host limits. | fulfilled | none |

## Summary

- fully_done: 9 tasks (T-001 through T-009)
- partially_done: none
- not_done: none.
- out_of_scope_changes: None attributable in the reviewed product delta; pre-existing unrelated work preserved.
- risks: Fresh-session and native host behavior cannot be established by generated fixtures. TP has no task priorities; none were invented.
- required_next_step: Evaluate QA with completed native and installed evidence; human approval remains separate.

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| TP-E01 | evidence_gap | evidence_obligation | resolved | NATIVE_SESSION_OBSERVATION.md / NATIVE_SESSION_EVIDENCE.json: four automatically completed fresh-session hooks, migration/repair/current/absent states, trusted installed binding, unchanged roots/consent. SCN-030 PTY evidence remains separate. | Evaluate QA using the completed native and installed evidence. |
