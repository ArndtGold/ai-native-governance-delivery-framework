# Code Review: Copilot Task-Target Binding

Status: done
Decision: pass
Revision: 11
Date: 2026-09-05

## Code Review

- decision: pass
- findings: none open after review corrections
- correctness: absence of semantic target evidence maps to the resolver's native no-target form; the chat storage cwd remains context only; a German user conversation deterministically requires literal `--language de`, and the question must match the rendered language
- failure_isolation: repo-less or malformed SessionStart input skips doctor and config lookup; Git or parser failure cannot activate a neighboring repository; target-only options are rejected on unrelated commands
- compatibility: validator schemas and resolution semantics are unchanged; CLI help now truthfully documents optional target arguments, while resolved calls retain source and primary target
- security: all new behavior is local, read-only and network-free; Git receives fixed arguments and an explicit path; no target or approval state is persisted
- maintainability: one resolver still owns target semantics; the skill selects between its existing no-target and selected-target invocation forms, and static integrity locks the boundary
- missing_evidence: a fourth fresh-session Copilot model observation against the locale-corrected installed bytes; repository-bound and consented hook observations remain separate
- risks: Copilot instruction-only conformance still depends on the loaded model following the projected skill; the executable preflight does not claim universal host interception
- required_next_step: QA consumes Task Plan Review Revision 11, Clean Review Revision 10, this review and the open fourth fresh-session evidence obligation

## Review Corrections Applied

1. Restricted `--working-directory` to `target-check` instead of silently accepting it on other commands.
2. Required `current_repository` to match the Git worktree of the supplied execution context.
3. Rejected contradictory `continued_target` plus `target_changed`.
4. Moved unresolved recovery wording into the locale registry to prevent mixed-language target cards.
5. Made unresolved terminal before every later skill branch and added an adversarial prior-UR replay case.
6. Split context-only unresolved invocation from selected-target invocation, passed chat locale and removed extra unresolved narration/examples.
7. Bound a German user conversation to literal `--language de` and required the follow-up question to match the canonical presentation language.

## 2026-09-05 Installer correction review

- decision: pass for the reviewed installer correction
- scope: actual diff in local-marketplace.js, plugin-installers.js, copilot-settings.js, CLI composition, the new marketplace-transport and skill-discovery modules, focused tests and installer documentation; pre-existing dispatcher and OpenCode changes are excluded
- findings: no open defect in this correction; review found that native recovery can re-enable a previously disabled plugin, so AGDF settings are restored again after recovery and the regression test now covers disabled prior state
- correctness: the normal preparation owner generates Git metadata in its existing atomic stage; content-derived refs invalidate same-version catalog entries; native discovery must find exactly one enabled plugin skill per expected name, one installation root and the exact normalized source digest
- isolation: source registration is checked against the canonical owned root or a validated predecessor; foreign configured and native sources stop before host mutation; settings writes preserve unrelated entries; no native cache is edited directly
- rollback: real Copilot 1.0.80 and 1.0.83-5 tests restore the prior managed package and settings after injected discovery failure; rollback errors remain visible rather than being reported as success
- security: Git receives fixed argv, a clean stage, disabled hooks/signing and filtered inherited GIT variables; generated Git trees reject symlinks and byte mismatches; all package transport is local
- compatibility: the common native skill-list command passes on both tested CLI versions; Git checkout with autocrlf enabled preserves plugin bytes; native Windows remains unobserved
- missing_evidence: successful final normal installation and pending desktop rendering are recorded separately in HOST_EVIDENCE.md
- required_next_step: consume final installer and host evidence in QA
