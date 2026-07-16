# Task Plan Review: create-agdf CLI Modularization

Status: pass
Date: 2026-07-16
Plan: `.agdf/control/artefacts/create-agdf-cli-modularization/TP.md`
Evidence confidence: high

## TP Coverage

| task_id | status | evidence | missing_evidence | QA impact |
|---|---|---|---|---|
| CM-01 | fully_done | `scripts/cli-modularization-test.js`; package smoke wiring; baseline registry, parser, application, ownership and import-graph checks | none | none |
| CM-02 | fully_done | `lib/cli/runtime-context.js`; `lib/cli/command-registry.js`; one immutable registry drives validation, usage and dispatch | none | none |
| CM-03 | fully_done | `lib/cli/parse-args.js`; direct valid/error matrix; no console or process mutation | none | none |
| CM-04 | fully_done | `lib/installers/plugin-installers.js`; recording subprocess adapter tests preserve commands, arguments, stdio and version checks | Native Windows execution remains unverified as declared in TP | disclose boundary; no QA block |
| CM-05 | fully_done | `lib/installers/opencode.js`; OpenCode smoke covers install, status, ownership, npm test override and native-surface transitions | Native Windows execution remains unverified as declared in TP | disclose boundary; no QA block |
| CM-06 | fully_done | `lib/scaffold/{plan,write,presentation}.js`; full scaffold smoke covers target plans, reruns, overwrite refusal, preservation and cleanup | none | none |
| CM-07 | fully_done | `lib/control-evaluation/{shared,doctor}.js`; control-state and smoke fixtures preserve doctor findings and aggregation | none | none |
| CM-08 | fully_done | `lib/control-evaluation/verified-change.js`; full fail-closed Verified Change suite passes | none | none |
| CM-09 | fully_done | `lib/control-evaluation/delivery-map.js`; focused active-run command passes; all-active retains canonical invalid-run blockers | Repository has three unrelated pre-existing invalid revision IDs in all-active output | disclose unrelated state; no implementation defect |
| CM-10 | fully_done | `lib/control-evaluation/{gate-policy,gate-check}.js`; control-state and interaction suites preserve paths, formulas and cards | none | none |
| CM-11 | fully_done | `lib/cli/{application,delivery-path-search-command}.js`; explicit handler map, injected IO, returned exit codes; bin reduced to 11 lines | none | none |
| CM-12 | fully_done | Static ownership/import-direction checks; no duplicate transition tree, command list or relocated catch-all | none | none |
| CM-13 | fully_done | `npm pack --dry-run --json` contains all 16 planned modules; release-bootstrap smoke passes unchanged | none | none |
| CM-14 | fully_done | Aggregate package smoke, Runtime Integrity, focused live commands, release bootstrap and `git diff --check` pass after documentation reconciliation; package README, wrapper README, install guide and canonical backlog template match the modular owners | Native Windows execution remains unverified | disclose boundary; no QA block |

## Acceptance Coverage

All AC-1 through AC-11 have direct code and regression evidence. AC-12 is intentionally
deferred to OR as specified by the approved TP: the Context Graph action remains an explicit
`open_gap` and does not affect the current review result.

## Summary

- fully_done: 14/14
- partially_done: 0/14
- not_done: 0/14
- out_of_scope_changes: none. Runtime Integrity and public/control documentation were updated only where the approved extraction moved an authoritative owner or exposed an inaccurate command/language reference.
- risks: Native Windows installer execution is unverified. Three unrelated active runs have non-conforming revision IDs and keep repository-wide `delivery-map --all-active` blocked.
- required_next_step: Run refreshed Clean Implementation Review and Code Review before the revised QA decision.
