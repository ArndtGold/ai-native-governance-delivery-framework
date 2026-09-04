# Task Plan Review: Cross-surface Executable Skill Dispatcher

Status: revise
Date: 2026-09-04
Plan: `.agdf/control/artefacts/cross-surface-executable-skill-dispatcher/TP.md`
Evidence confidence: high for repository and generated-package scope; partial for Copilot loaded-host behavior

## TP Coverage

| task_id | status | evidence | missing_evidence | QA impact |
|---|---|---|---|---|
| TP-01 | fully_done | canonical ten-skill registry; strict metadata, duplicate, mode, surface, language, path, target-pair and run-id tests | none | none |
| TP-02 | fully_done | injected orchestration service; unresolved fail-if-called test; immutable continuation; bounded output; presentation/evaluator failures; central machine-readable `host_action` with exact terminal text | none | none |
| TP-03 | fully_done | parser, command registry, handler, local wrapper identity/timing and CLI failure tests; generated runtime direct calls under two seconds | native Windows execution belongs to TP-09 | retain evidence boundary |
| TP-04 | fully_done | SessionStart and active-OpenCode exact binding projections; inactive OpenCode withholds the binding; all global skills require explicit active declaration plus exact plugin binding and forbid runtime search or shell recovery; silent internal context and generated integrity | newest binding and skill guard in freshly loaded hosts | TP-09 required before QA |
| TP-05 | fully_done | `SKILL_INSTRUCTION_COMPACTION.md`; 921-byte static reduction; delayed 40,430-byte shared-contract loading; 83/83 evals | weak-model loaded-host behavior | TP-09 required before QA |
| TP-06 | fully_done | unchanged renderer object identity; fail-closed missing presentation; German CD+Tests mappings; approval remains outside dispatch | loaded-host locale rendering | TP-09 required before QA |
| TP-07 | fully_done | idempotent sync; Runtime Integrity positive/negative; public candidate; 395-file package; exact 84-file/630,216-byte Copilot payload; audit-free and script-free OpenCode local package update | clean corrected OpenCode install completion and installed-profile digest | TP-09 required before QA |
| TP-08 | fully_done | focused suites and complete smoke pass; all ten skills, typed outcomes, consent, target/run and terminality boundaries | direct weak-model/host latency | TP-09 required before QA |
| TP-09 | partially_done | `HOST_EVIDENCE.md` Revision 7 records Copilot evidence and OpenCode CSED-HOST-05 through CSED-HOST-07; the latest repository correction blocks static-skill runtime reconstruction and passes smoke | clean corrected OpenCode install, fresh inactive retest, later activated-repository execution, newest Copilot retest, all Codex/Claude Code cases and native Windows | blocks QA readiness |
| TP-10 | partially_done | TP Review, Clean Review and Code Review completed; Context Graph reconciled; release transaction and generation rollback fixtures pass | completion of TP-09, refreshed QA and final rollback/closeout evidence | blocks QA readiness |

## Summary

- fully_done: 8/10
- partially_done: 2/10
- not_done: 0/10
- out_of_scope_changes: none; the unrelated untracked image remains untouched
- risks: Copilot promptness, German locale, terminality and one-action recovery are proven for the
  repo-less QA case; visible header fidelity, latest host activation behavior and the matrix are open
- required_next_step: install and retest OpenCode in the inactive repository without a shell prompt,
  then use an explicitly activated repository for execution evidence and complete TP-09
