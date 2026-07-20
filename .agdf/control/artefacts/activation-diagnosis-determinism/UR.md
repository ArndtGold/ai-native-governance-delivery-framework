# UR: Deterministic Repository-Activation Diagnosis

Status: approved
Gate: UR
Gate approval: `Approval: UR` accepted on 2026-07-20 after same-run, same-gate, revision and durable-artefact revalidation.
Revision: 1
Date: 2026-07-19
Owner: agent

## 1. Problem

AGDF advertises plugin-shell environment variables (`AGDF_CONTROL_DIR`, `AGDF_OPENCODE_REPOSITORY_ACTIVATION`) as the diagnostic source of truth for whether a repository is AGDF-active. Observed on Windows OpenCode Desktop App: these variables are `<unset>` in LLM tool-shell sessions because the plugin's `shell.env` hook does not propagate into spawned tool shells.

The downstream effect observed: an agent fell back to relative glob/grep checks for `.agdf/control/config.json`; relative glob did not find the file (tool/search-path resolution), while absolute read succeeded. The agent then incorrectly reported "AGDF governance is not active; missing `.agdf/control/config.json`" and recommended running `npx --yes @agdf/cli@latest opencode-repo` — which, executed, would re-scaffold over an existing valid control state. A correct invocation of `evaluateOpenCodeRepositoryActivation(<repo-path>)` against the same repository returns `state: active, valid_control_config`.

The plugin activation logic is correct. The gap is in the AGDF skill and contract guidance: it treats shell-env propagation and relative glob as reliable diagnostic truth, when both can silently fail in tool-shell contexts.

## 2. Goal

Make repository-activation diagnosis deterministic and tool-shell-safe. An agent in any context (interactive shell, tool shell, scripted CI, fresh session) must be able to determine AGDF activation status through one canonical, code-owned probe that does not depend on shell-env propagation or relative-path resolution semantics. Skill guidance must not present `AGDF_*` env vars or relative globs as sufficient proof of presence or absence of durable control.

## 3. Scope

After the required approvals, deliver the smallest safe change that:

1. names `node <surface-local-agdf>/bin/agdf-local.js doctor --json` (and equivalent `gate-check --json` for selected runs) as the sole canonical, code-owned, tool-shell-safe activation diagnosis;
2. updates `plugin/skills/gate-check/SKILL.md` and `plugin/meta/contracts/control-scaffold.md` to state explicitly that plugin `AGDF_*` environment variables are convenience, not ground truth, and must not be used as the only proof of activation;
3. updates the same skills/contracts to forbid relative glob/grep as evidence of presence or absence of `.agdf/control/config.json`; an absolute `read` or the canonical CLI probe is required;
4. adds a disclosed-boundary note that OpenCode Desktop App `shell.env` propagation to tool shells is not guaranteed (host behavior, explicitly not claimed as AGDF-owned);
5. adds Runtime Integrity assertions that the skill/contract guidance references the canonical CLI probe and forbids relative glob/env-only diagnosis, so future drift is caught deterministically;
6. updates generated surfaces (Codex/Claude/OpenCode/Copilot) via the canonical sync owner; no hand-edit.

## 4. Non-Goals

- changing the plugin's `shell.env` hook behavior itself (that is OpenCode host behavior, not AGDF-owned);
- adding a new gate, approval value, CLI command surface, or persisted finding registry;
- modifying `evaluateOpenCodeRepositoryActivation` logic (already correct);
- changing canonical control-state schema, gate order, or approval authority;
- claiming live OpenCode Desktop App host behavior from repository evidence;
- performing commit, push, PR, publication, release or reinstall as part of this run;
- re-scaffolding or mutating existing valid `.agdf/control/` state.

## 5. Acceptance Signals

1. A reader of `gate-check` skill or `control-scaffold` contract cannot conclude that `AGDF_*` env vars alone prove activation.
2. A reader of the same skills/contracts cannot conclude that a relative glob miss proves absence of `.agdf/control/config.json`.
3. `agdf-local.js doctor --json` is named as the single canonical activation diagnosis probe.
4. Runtime Integrity fails when the canonical-probe reference is removed or when a relative-glob/env-only diagnosis claim is reintroduced.
5. Generated surfaces on all four surfaces reflect the updated guidance after canonical sync.
6. No new gate, approval value, schema field, or control-state mutation is introduced.

## 6. Existing Source Of Truth

- `plugin/skills/gate-check/SKILL.md` — currently references `AGDF_CONTROL_DIR` and `status_card` as diagnostic anchors;
- `plugin/meta/contracts/control-scaffold.md` — repository authority and CLI verification;
- `plugin/meta/contracts/interaction.md` — `status_presentation` deterministic projection;
- `create-agdf/opencode-plugin.js` — `shell.env` hook implementation (reference, not changed);
- `create-agdf/lib/installers/opencode-activation.js` — `evaluateOpenCodeRepositoryActivation` (already correct);
- `agdf/bin/agdf-local.js` (OpenCode) and equivalent plugin-runtime entrypoints (Codex/Claude) — canonical CLI probe;
- `plugin/scripts/check-runtime-integrity.mjs` — Runtime Integrity assertions to extend;
- `create-agdf/scripts/sync-package-assets.js` — generated-surface propagation;
- `~/.config/opencode/` installed plugin 0.11.0 — reference installation for verification.

## 7. Risks And Unknowns

- OpenCode Desktop App `shell.env` propagation may also affect other `AGDF_*` vars (`AGDF_PLUGIN_VERSION` etc.); Brownfield Review must inventory which AGDF guidance references env vars and whether other surfaces (CLI, Codex) have the same gap.
- The boundary between AGDF-owned (skill guidance, contract, CLI probe) and OpenCode-owned (shell.env propagation) must be kept explicit; AGDF must not silently try to "fix" OpenCode host behavior.
- Adding Runtime Integrity assertions for guidance prose (not code) is a different assertion class; Brownfield Analysis must confirm the assertion mechanism can deterministically detect prose drift without false positives.
- Whether existing skills beyond `gate-check` (e.g. `brownfield-analysis`, `qa-gate`) reference `AGDF_*` env or relative glob as proof — must be inventoried.
- Pages (`pages/src/pages/index.astro`) may surface `AGDF_CONTROL_DIR` or env-based diagnosis language — must be checked for drift.
- Whether other surfaces (Codex, Claude Code, Copilot) have an equivalent tool-shell env-propagation gap — disclosed as host behavior, not claimed.

## 8. Next Step

Perform Brownfield Review and select the smallest safe delivery path before drafting later artefacts or implementation. Approve only with:

`Approval: UR`
