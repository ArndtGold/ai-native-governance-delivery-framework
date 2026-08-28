# Task Plan Review: AGDF GitHub Copilot Plugin Integration

Decision: revise
Date: 2026-08-28
Reference: approved `TP.md`

## TP Coverage

| task_id | status | evidence | missing_evidence | QA impact |
|---|---|---|---|---|
| CPI-T01 | fully_done | Official GitHub plugin, command, manifest, hook and precedence references observed on 2026-08-28; manifest and lifecycle positive and negative fixtures pass. | none | none |
| CPI-T02 | fully_done | Canonical definition and manifest renderer generate one root Copilot manifest; invalid name, version and path fixtures pass. | none | none |
| CPI-T03 | fully_done | Existing sync owner generates `copilot-skills/agdf-*`, contracts and locale projection in the shared bundle; package and routing suites pass. | none | none |
| CPI-T04 | fully_done | Copilot uses the packaged runtime, `PLUGIN_ROOT`, runtime manifest digest and normalized source digest; exact validator, Runtime Integrity and tamper suites pass. | Direct loaded-root proof belongs to CPI-T12/T13. | none |
| CPI-T05 | fully_done | Version-1 `sessionStart` hook, content-bound Copilot receipt, manual default, renewal identity and bounded runtime tests pass. | Direct hook invocation belongs to CPI-T12/T13. | none |
| CPI-T06 | fully_done | Install, list, enable, disable and uninstall command construction; missing executable, managed, malformed output, wrong version and command failure fixtures pass. | Direct managed-policy behavior is outside the current claim. | none |
| CPI-T07 | fully_done | Shared lifecycle presentation, conflict-safe local Marketplace registration, direct-install migration, update, restart and uninstall are implemented. Missing PATH executable uses pinned official `@github/copilot@1.0.80`; `npm run install:copilot` completed with exit code 0 and verified `agdf@agdf` `0.13.8`. | Fresh-session app behavior belongs to CPI-T12. | none |
| CPI-T08 | fully_done | Existing scaffold remains unchanged; deterministic project > personal > plugin collision diagnostics are non-mutating; aggregate scaffold/routing smoke passes. | Direct effective-source observation belongs to CPI-T12. | none |
| CPI-T09 | fully_done | `release:prepare`, package contents, byte-identical build, Runtime Integrity, version coherence, full smoke and `git diff --check` pass. | none | none |
| CPI-T10 | fully_done | Copilot exact-text adapter mapping and existing wrong-gate, stale-revision, permission, hook and decorated-value interaction regressions pass in the aggregate suite. | Direct Copilot presentation belongs to CPI-T12. | none |
| CPI-T11 | fully_done | `INSTALL.md`, `create-agdf/README.md` and `CONTRIBUTING.md` distinguish plugin, repository scaffold, CLI/app handoff, package, loaded session, OS and publication evidence. | Public publication review is out of scope. | none |
| CPI-T12 | partially_done | Installed macOS app version `1.1.14` was observed. Copilot's official CLI persisted AGDF `0.13.8` as enabled under its own installed plugin store with ten skills. | No post-restart rendered app inventory, routing, collision, disable or uninstall evidence. | Blocking visible-evidence gap for app acceptance. |
| CPI-T13 | fully_done | PATH lookup returned unavailable, then the pinned official npm CLI completed install and post-install list verification. Claims remain bounded to persistent host state; loaded hook behavior is not inferred. | Direct hook observation remains a CPI-T12 evidence obligation. | none |
| CPI-T14 | fully_done | Linux and native Windows are explicitly recorded unavailable with no parity claim. | Direct evidence is conditional on environment availability. | warning only |
| CPI-T15 | fully_done | Context Graph extension records shared owners, precedence, evidence planes, non-authorizing consent and distribution boundary. | none | none |

## UX Intent Fidelity

| prd_criterion | working_mode_state | task_id | visible_evidence | fidelity_status | gap_type |
|---|---|---|---|---|---|
| CPI-AC-01 | `not_installed` | CPI-T01,T02,T06,T07,T09,T12 | Copilot accepted installation and exposed exact version; post-restart rendered app state is absent. | partial | evidence_gap |
| CPI-AC-02 | `installed_pending_fresh_session` | CPI-T03,T09,T12,T13 | Declared inventory verified; loaded inventory absent. | not_verifiable | evidence_gap |
| CPI-AC-03 | active repository modes | CPI-T03,T10,T12 | Deterministic routing passes; Copilot session behavior absent. | not_verifiable | evidence_gap |
| CPI-AC-04 | active and degraded modes | CPI-T04,T09,T13 | Exact package/runtime provenance verified; loaded root absent. | partial | evidence_gap |
| CPI-AC-05 | plugin and bootstrap modes | CPI-T08,T12 | Scaffold and non-mutation tests pass; rendered app transition absent. | partial | evidence_gap |
| CPI-AC-06 | lifecycle modes | CPI-T05,T06,T07,T12,T13,T14 | Adapter fixtures and Marketplace install/update/list pass; rendered disable and uninstall remain absent. | partial | evidence_gap |
| CPI-AC-07 | `active_with_project_override` | CPI-T08,T12 | Deterministic precedence diagnostic passes; visible collision absent. | not_verifiable | evidence_gap |
| CPI-AC-08 | `active_governed_repository` | CPI-T10,T12 | Exact approval regressions pass; direct Copilot presentation absent. | partial | evidence_gap |
| CPI-AC-09 | bootstrap and active modes | CPI-T03,T08,T12 | Repository projection remains verified and non-destructive. | fulfilled | none |
| CPI-AC-10 | all | CPI-T01,T04,T06,T09,T11,T12,T13,T14,T15 | Evidence planes and unavailable hosts are explicit. | fulfilled | none |
| CPI-AC-11 | pending, active and degraded | CPI-T05,T10,T12,T13 | Consent and authority fixtures pass; direct hook invocation absent. | partial | evidence_gap |
| CPI-AC-12 | not installed and active | CPI-T02,T06,T07,T09,T11,T13 | Source, package version, handoff and publication boundary are explicit. | fulfilled | none |

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CPI-TPR-01 | evidence_gap | evidence_obligation | open | Persistent install is verified, but CPI-H02 through CPI-H07 have no post-restart rendered macOS Copilot app observations. | Restart the Copilot app and capture fresh-session, collision, disable and uninstall observations. |
| CPI-TPR-02 | evidence_gap | evidence_obligation | open | Linux and native Windows are unavailable; `HOST_EVIDENCE.md` narrows claims. | Keep those support rows unverified unless direct environments become available. |

## Summary

- fully_done: 14
- partially_done: 1
- not_done: 0
- out_of_scope_changes: none identified; pre-existing product-maturity-roadmap files remain excluded
- risks: direct path-sourced plugin installation may expose host-specific update, cache, managed-policy or loaded-session behavior not represented by deterministic fixtures
- required_next_step: complete CPI-H01 through CPI-H07 in the installed macOS Copilot app
