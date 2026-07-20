# Verified Change: Deterministic Repository-Activation Diagnosis

Status: executed

## Record

- status: executed
- related_ur: .agdf/control/artefacts/activation-diagnosis-determinism/UR.md
- related_brownfield_review: .agdf/control/artefacts/activation-diagnosis-determinism/BROWNFIELD_REVIEW.md
- escalation_target: structured_slice
- canonical_owner: plugin/skills/gate-check/SKILL.md (agent guidance); plugin/meta/contracts/control-scaffold.md (contract boundary); plugin/scripts/check-runtime-integrity.mjs (deterministic assertion)
- allowed_source_paths: plugin/skills/gate-check/SKILL.md, plugin/meta/contracts/control-scaffold.md, plugin/scripts/check-runtime-integrity.mjs
- allowed_derived_paths: create-agdf/generated/** (via sync-package-assets; gitignored derived output)
- prohibited_impacts: gate order, approval values, control-state schema, plugin host behavior (opencode-plugin.js, opencode-activation.js, opencode.js), VCS, release
- propagation_command: npm --prefix create-agdf run sync-package-assets
- validation_commands: node plugin/scripts/check-runtime-integrity.mjs && npm --prefix create-agdf run sync-package-assets && npm --prefix create-agdf run sync-package-assets && git diff --check
- baseline_tracked_paths: plugin/skills/gate-check/SKILL.md, plugin/meta/contracts/control-scaffold.md, plugin/scripts/check-runtime-integrity.mjs
- baseline_untracked_paths: .agdf/control/artefacts/activation-diagnosis-determinism/, .agdf/control/runs/activation-diagnosis-determinism/
- baseline_runtime_integrity: pass (10 skills and 16 control files checked)
- baseline_source_paths_clean: yes (git diff --stat empty for all three allowed_source_paths)
- validation_status: pass
- propagation_status: pass

## Eligibility Assertions

| Condition | Evidence | Status |
|---|---|---|
| Exactly one canonical owner | Agent activation diagnosis is owned by `plugin/skills/gate-check/SKILL.md`; the contract boundary by `plugin/meta/contracts/control-scaffold.md`; deterministic enforcement by `plugin/scripts/check-runtime-integrity.mjs`. No second owner is created. | pass |
| Source and derived paths are bounded | Source changes limited to the three listed files; derived changes limited to `create-agdf/generated/**` via the canonical sync owner; no other path is touched. | pass |
| No gate, permission, security, persistence, architecture, external API, CLI or release impact | Brownfield Review confirms: no gate order, approval value, schema, plugin host behavior, or release change. The `shell.env` hook, `evaluateOpenCodeRepositoryActivation`, and `opencode-status` consumer are explicit non-goals. | pass |
| Deterministic propagation is defined when derived paths exist | `npm --prefix create-agdf run sync-package-assets` propagates to generated surfaces; second run must be idempotent (no further drift). | pass |
| Deterministic validation is defined | `node plugin/scripts/check-runtime-integrity.mjs` asserts required phrases present and anti-pattern phrases absent; `git diff --check` validates whitespace. The assertion mechanism (`string.includes`) is already in deterministic use for gate-check prose (lines 356-378). | pass |
| Candidate paths are clean at baseline | `git diff --stat` empty for all three allowed_source_paths; `git ls-files --error-unmatch` confirms all tracked; Runtime Integrity passes at baseline. | pass |
| Prose-assertion determinism confirmed (open question 1) | Runtime Integrity already uses `string.includes()` for gate-check operational boundaries (lines 356-378) and forbidden-phrase detection (lines 370-372). The mechanism is deterministic; this run extends it with the same pattern. | pass |

## Pre-Implementation Brownfield Analysis

| Insertion point | Existing owner | Reuse / extension |
|---|---|---|
| gate-check SKILL.md new subsection "Repository Activation Diagnosis" | "Agent-Native Control Path" section already names `doctor --json`; extends with explicit forbidden-list + canonical-probe rule | additive, no second owner |
| control-scaffold.md new subsection "Repository Activation Diagnosis Boundary" | "Agent-Native Runtime And CLI Verification" section already names `doctor --json` as the check; extends with env-var/relative-glob boundary | additive, no second owner |
| check-runtime-integrity.mjs new assertions after line 378 | Existing `gateCheckSkill.includes(...)` pattern (lines 364-378); extends with required-phrase and forbidden-phrase assertions for the new guidance | same mechanism, no new assertion class |

No parallel structure, no second owner, no SOT drift. Eligibility proven.

## Execution Evidence

| Evidence | Source | Result |
|---|---|---|
| Changed paths since baseline | `git diff --name-only` | pass: only `plugin/skills/gate-check/SKILL.md`, `plugin/meta/contracts/control-scaffold.md`, `plugin/scripts/check-runtime-integrity.mjs` plus this run's control-state files (AGDF_RUN.md, MASTER_BACKLOG.md) |
| Runtime Integrity (source mode) | `node plugin/scripts/check-runtime-integrity.mjs` | pass: 10 skills and 16 control files checked; new required-phrase and forbidden-phrase assertions active |
| Propagation command (run 1) | `npm --prefix create-agdf run sync-package-assets` | pass: 3 generated gate-check SKILL.md copies + 3 generated control-scaffold.md copies contain the new sections |
| Propagation command (run 2, idempotence) | `npm --prefix create-agdf run sync-package-assets` | pass: second run produced no further drift |
| Routing test | `npm --prefix create-agdf run test:routing` | pass: AGDF routing render test passed |
| Lifecycle test | `npm --prefix create-agdf run test:lifecycle` | pass: lifecycle tests passed (env-var exposure for active/inactive states unchanged) |
| Runtime Integrity negative test | `node create-agdf/scripts/runtime-integrity-negative-test.js` | pass: negative tests passed |
| Whitespace | `git diff --check` | pass: no whitespace errors |
| Installed plugin 0.11.0 boundary | `grep -c "Repository Activation Diagnosis" ~/.config/opencode/skills/agdf-global-gate-check/SKILL.md` | 0 (expected: installed plugin unchanged until next release; this run does not claim live-install behavior) |

## Mini-Closeout

- delivered: one canonical "Repository Activation Diagnosis" section in `plugin/skills/gate-check/SKILL.md` naming `doctor --json` as the sole canonical, code-owned, tool-shell-safe activation probe and forbidding `AGDF_*` env-only and relative-glob/grep as proof; one "Repository Activation Diagnosis Boundary" subsection in `plugin/meta/contracts/control-scaffold.md` classifying `AGDF_*` env vars as non-agent-facing diagnosis and forbidding relative glob/grep as proof; deterministic Runtime Integrity assertions (required-phrase + forbidden-phrase) for both; canonical sync to all four generated surfaces.
- intentionally_not_delivered: change to `opencode-plugin.js` `shell.env` hook (OpenCode-owned host behavior); change to `evaluateOpenCodeRepositoryActivation` (already correct); change to `opencode-status` consumer; publication, release, install-cache mutation, commit, push, PR.
- escalation_result: none
- residual_risk: the asserted required phrases are stable but a future editor could add a new anti-pattern instruction that is not in the forbidden-phrase list; Runtime Integrity catches the listed anti-patterns but not novel ones. Disclosed as a scope limitation; future runs may extend the forbidden-phrase list.
- open_questions_resolved: (1) prose-assertion determinism confirmed via existing `string.includes()` mechanism; (2) generated surfaces on all four surfaces updated via sync; (3) boundary lives in both control-scaffold.md (CLI verification section) and gate-check SKILL.md (agent guidance) for defense in depth.
- next_step: record compact OR and offer delivery closeout; do not perform VCS actions automatically.

This compact record is valid only for the Brownfield-selected `verified_change`. Any missing, failed or ambiguous condition must set `status: escalated` and continue at `structured_slice`.
