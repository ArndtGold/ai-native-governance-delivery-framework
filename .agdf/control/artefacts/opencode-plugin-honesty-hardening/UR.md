# UR: OpenCode Plugin Honesty Hardening

Status: approved
Gate: UR
Gate approval: `Approval: UR` accepted on 2026-07-23 after same-scope UR draft and exact-formula revalidation.
Revision: 1
Date: 2026-07-23
Owner: agent

## 1. Problem

The installed AGDF OpenCode plugin (`create-agdf` v0.11.4) relies on model instruction adherence for all gate enforcement. Three honesty gaps create false confidence without adding any enforcement:

1. **Subagent enforcement bypass is undocumented.** OpenCode plugin hooks `tool.execute.before` do not intercept tool calls from subagents spawned via the `task` tool (anomalyco/opencode issue #5894, PR #36238 open). AGDF guidance in `AGDF.md` and skills does not disclose this, so a reader can believe AGDF enforcement applies in the subagent path when it does not.

2. **Inactive-repository warning is buried in logs.** The `session.created` hook writes an `app.log` entry when `repositoryActivation.active === false`, but the user-facing surface (TUI) shows nothing. The bootstrap hint (`npx --yes @agdf/cli@latest opencode-repo`) is easily missed.

3. **Version drift between plugin and validator is silent.** `agdf/bin/agdf-local.js` pins `expectedVersion: "0.11.4"`, but the loaded `create-agdf/opencode-plugin.js` reads its own `packageJson.version`. If Bun-installed `node_modules/create-agdf` and the pinned validator diverge, nothing reports it; the validator may reject while the plugin behaves as a different version.

## 2. Goal

Remove three false-confidence sources in the OpenCode plugin surface without adding enforcement logic, adapter skins, or a core engine. Make host limitations explicit, make inactivity visible, and make version drift loud. The plugin remains an instruction and signal layer; this run hardens its honesty, not its enforcement.

## 3. Scope

After the required approvals, deliver the smallest safe change that:

1. adds an explicit disclosed-boundary note to `AGDF.md` and at least the `agdf-global-gate-check` skill stating that OpenCode `tool.execute.before` does not fire for subagent tool calls (issue #5894, PR #36238 open), that AGDF enforcement in the subagent path is auditing-only, and that this is a host limitation, not an AGDF-owned defect;
2. extends the `session.created` hook in `create-agdf/opencode-plugin.js` to call `client.tui.toast.show` with the bootstrap hint when `repositoryActivation.active === false`, in addition to the existing `app.log` entry; non-blocking, no behaviour change when active;
3. adds a version-drift check in `session.created` comparing `packageJson.version` (loaded plugin) to the `expectedVersion` declared by the surface-local validator (`agdf/bin/agdf-local.js`), emitting an `app.log` warn and a TUI toast on mismatch; on match, no output;
4. updates generated surfaces via the canonical sync owner when the plugin or skill source changes are under `create-agdf/generated/` or `plugin/`; no hand-edit of generated surfaces;
5. keeps all three changes failure-tolerant: a missing TUI client method, a missing validator file, or a read error must degrade to the existing `app.log` path, not throw.

## 4. Non-Goals

- adding a `tool.execute.before` enforcement guard, core engine, quick-task detection, or multi-agent locks (deferred until platform stabilises);
- implementing Claude Code or Codex adapter skins for the same three improvements;
- changing the plugin's `shell.env` hook behaviour or any existing hook contract;
- adding a new gate, approval value, schema field, or persisted finding registry;
- changing canonical control-state schema, gate order, or approval authority;
- claiming the subagent bypass is fixed by documentation; documentation is disclosure, not enforcement;
- performing commit, push, PR, publication, release or reinstall as part of this run;
- re-scaffolding or mutating existing valid `.agdf/control/` state beyond this run's own scaffold.

## 5. Acceptance Signals

1. A reader of `AGDF.md` and the `agdf-global-gate-check` skill cannot conclude that AGDF enforcement applies to subagent tool calls in OpenCode.
2. Inactive-repository session start produces a visible TUI toast with the bootstrap hint in addition to the existing log entry; active repositories produce no new toast.
3. Version drift between loaded plugin and pinned validator produces a warn log and a TUI toast; version match produces no new output.
4. All three changes degrade gracefully: TUI/validator/log failure paths do not throw into the session.
5. `agdf-local.js doctor --json` and the existing test suite remain green in shape; no assertion skipped or weakened.
6. Generated surfaces reflect the updated guidance and plugin code after canonical sync.

## 6. Existing Source Of Truth

- `create-agdf/opencode-plugin.js` — `session.created`, `shell.env`, `experimental.chat.system.transform`, `experimental.session.compacting` hooks; `AGDFPlugin` factory;
- `create-agdf/lib/installers/opencode-activation.js` — `evaluateOpenCodeRepositoryActivation` (reference for activation state);
- `agdf/bin/agdf-local.js` — surface-local validator, pins `expectedVersion: "0.11.4"`;
- `~/.config/opencode/AGDF.md` — global OpenCode instructions (loaded via `opencode.json` `instructions`);
- `~/.config/opencode/skills/agdf-global-gate-check/SKILL.md` — primary gate-check skill;
- `~/.config/opencode/agents/agdf-evaluator.md` — deny-locked evaluator agent (reference for safe subagent pattern);
- anomalyco/opencode issue #5894 and PR #36238 — subagent hook interception status;
- `create-agdf/scripts/sync-package-assets.js` — generated-surface propagation owner;
- `create-agdf/package.json` and `agdf/bin/agdf-local.js` — version sources for drift check.

## 7. Risks And Unknowns

- OpenCode `client.tui.toast.show` API stability and availability across OpenCode versions must be verified in Brownfield Review; if unavailable, degrade to `app.log` only and document the fallback.
- The subagent-bypass disclosure may reduce user confidence in AGDF on OpenCode; Brownfield Review must weigh honesty gain against adoption risk.
- Version-drift check reads `agdf/bin/agdf-local.js` expectedVersion at session start; if the validator file is absent, the check must fail open to the existing path, not block.
- Whether the disclosure belongs in additional skills beyond `gate-check` (e.g. `clean-implementation-review`, `code-review`) — Brownfield Review must inventory.
- Whether generated surfaces for Codex/Claude/Copilot need parallel disclosure (their subagent interception differs) — out of scope here, but Brownfield Review notes the cross-surface gap.
- Chat-language is `de` per `config.json`; artefact-language is `en`; the disclosure text in `AGDF.md` follows the existing English runtime-rule convention.

## 8. Next Step

Perform Brownfield Review and select the smallest safe delivery path before drafting later artefacts or implementation. Approve only with:

`Approval: UR`
