# Brownfield Review: Interaction Ownership and Proportional Quick-Path UX

Status: pass
Mode: post_ur_review
Date: 2026-07-18
Approved input: `.agdf/control/artefacts/agdf-interaction-ownership-quick-path-ux/UR.md`

## 1. Decision

Revision note: Repeated after renewed approval of the expanded four-finding UR. The local-validator
requirement adds cross-surface packaging, offline execution and exact release-version coupling, so the
prior `structured_slice` decision is superseded.

- decision: pass
- mode_slice_decision: structured_delivery
- required_next_gate: PRD
- scope: Reuse the existing interaction contract, gate-check skill, control evaluator, locale registry,
  OpenCode global installer and their focused test suites. Remove duplicated policy or presentation
  ceremony without changing gate authority, persisted mode values or repository activation semantics.
- transparency: `quick_task` and `verified_change` are not eligible because the scope changes normative
  runtime and skill guidance plus installer/runtime availability. `structured_slice` is no longer
  sufficient: exact-version offline validator resolution affects Codex, Claude and OpenCode package
  layouts, install/status behavior and release evidence. The design must still reuse one existing CLI
  implementation rather than create a second evaluator.

## 2. Current Coverage

| Area | Coverage | Evidence | Finding |
|---|---|---|---|
| Native interaction policy ownership | partially_done | `plugin/meta/contracts/interaction.md`; `plugin/skills/gate-check/SKILL.md`; `plugin/scripts/check-runtime-integrity.mjs` | The contract is canonical, but the skill repeats adapter, locale, fallback and outcome semantics and integrity checks require several duplicated phrases. |
| Gate-specific orchestration | fully_done | `gate-check/SKILL.md`; `create-agdf/lib/control-evaluation/gate-check.js`; `create-agdf/lib/interaction-presentation.js` | Selected-run evaluation, readiness, canonical presentation, exact approval, post-response revalidation and persistence boundaries already have clear owners to retain. |
| Pure Quick Task distinction | partially_done | `plugin/meta/contracts/modes.md`; `plugin/skills/gate-check/SKILL.md` | The contract says pure Quick Tasks avoid ritual gates, but the same `quick_task` term is also used for post-UR compact delivery. |
| Brownfield plus Mode/Slice routing | partially_done | `plugin/meta/contracts/gate-transition.md`; `plugin/skills/brownfield-analysis/SKILL.md`; `create-agdf/lib/control-evaluation/gate-policy.js` | Brownfield Review already owns the decision, yet incomplete records surface Mode/Slice as a separate step and some human transition copy can imply another user decision. |
| Global OpenCode boundary ownership | partially_done | `create-agdf/lib/installers/opencode.js`; generated/global `AGDF.md`; global `opencode.json` | `globalOpenCodeBoundary()` is one code owner, but its full output is embedded in global instructions and all nine installed skill bodies. |
| Focused Runtime Contract dependencies | fully_done | `plugin/skills/*/SKILL.md`; `create-agdf/scripts/sync-package-assets.js`; `plugin/scripts/check-runtime-integrity.mjs` | Every skill explicitly names a different focused module set; generation rewrites paths for OpenCode. This is intentional dependency scoping, not nine copies of one policy. |
| Shared validator implementation | fully_done | `agdf/bin/agdf.js`; `create-agdf/package.json` `./cli`; `create-agdf/bin/create-agdf.js` | `@agdf/cli` already delegates to the one `create-agdf/cli` implementation; this owner must be reused. |
| Codex and Claude owned local validator | not_done | `plugin/.codex-plugin/plugin.json`; `plugin/.claude-plugin/plugin.json`; `plugin/` package layout | The installed plugin bundle exposes skills, hooks, contracts and templates but no owned executable/runtime path. |
| OpenCode owned local validator | partially_done | `create-agdf` npm dependency; config-local `node_modules/.bin/create-agdf`; global OpenCode installer | The executable exists beneath the owned config package tree but is not resolved through the ordinary shell `PATH` or surfaced as validator capability. |
| Repository-only/instruction-only availability | not_done | generated Copilot/OpenCode/Codex repository surfaces | No common availability classification distinguishes local, external-required and unavailable machine validation. |

## 3. Existing Owners and Reuse Strategy

| Concern | Existing owner | Strategy |
|---|---|---|
| Normative native interaction semantics | `plugin/meta/contracts/interaction.md` | extend ownership statement; remove redundant normative prose from `gate-check` |
| Gate workflow orchestration | `plugin/skills/gate-check/SKILL.md` | refactor to a short operational sequence plus focused contract references |
| Contract/skill integrity | `plugin/scripts/check-runtime-integrity.mjs`; negative tests | refactor prose-presence checks into ownership, reference and operational-boundary checks |
| Quick-path policy | `plugin/meta/contracts/modes.md`; `plugin/meta/contracts/gate-transition.md` | extend terminology and same-operation routing rules without changing persisted enums |
| Human transition copy | `plugin/meta/agdf-interaction-locales.json`; `create-agdf/lib/interaction-presentation.js`; control evaluator | extend existing projection only where tests prove a redundant user-decision implication |
| Global OpenCode activation boundary | `create-agdf/lib/installers/opencode.js` global `AGDF.md` generation | retain one full boundary in global instructions; replace skill copies with at most one compact fail-closed guard |
| Generated surfaces | `create-agdf/scripts/sync-package-assets.js` | reuse current deterministic propagation; do not hand-edit generated copies |
| Shared machine validator | `create-agdf/cli` export and `@agdf/cli` wrapper | extend through thin surface adapters/resolvers; never copy evaluator policy |
| Surface install and status | existing Codex/Claude installers, OpenCode npm installer and lifecycle/status modules | extend to install or expose an owned exact-version runtime and report its availability |
| Release/version integrity | `plugin/meta/agdf-plugin.definition.json`; package manifests; release bootstrap smoke | extend exact-version parity and offline execution checks across supported full plugin surfaces |

No new evaluator, gate model, contract module, enum or parallel skill hierarchy is justified. A thin
surface-owned validator resolver/adapter is justified only if it delegates to `create-agdf/cli` and is
version-checked against the active surface.

## 4. OpenCode Host Evidence

The current owned global configuration adds `AGDF.md` through `opencode.json` `instructions`, and the
current installer tests already assert that relationship. Current official OpenCode documentation says:

- `instructions` configures instruction files for the model:
  `https://opencode.ai/docs/config/#instructions`;
- global and project skills are discovered separately and loaded on demand through the native skill
  tool: `https://opencode.ai/docs/skills`.

This supports one full boundary in the always-configured global instruction file and a compact
skill-local fail-closed reminder rather than the full repeated preamble. Repository tests must still
cover missing/invalid durable control and must not infer a live host session from configuration alone.
Direct authenticated host observation remains supporting evidence, not a substitute for deterministic
installation and activation tests.

## 5. Compatibility and Regression Impact

- Persisted `quick_task`, `verified_change`, `structured_slice` and `structured_delivery` values remain
  unchanged.
- Exact `Approval: <GateName>` authority, durable artefact requirements and post-response revalidation
  remain unchanged.
- Existing global OpenCode skill names, ownership markers and permissions remain unchanged.
- Focused Runtime Contract module references remain per skill and continue to be path-rewritten for
  generated OpenCode assets.
- Generated files must be updated only through the existing sync mechanism.
- Regression scope includes runtime integrity, its negative fixtures, interaction presentation,
  control-state/gate-policy fixtures, skill evaluations, OpenCode install/status smoke and aggregate
  package smoke.
- Codex/Claude/OpenCode full-install fixtures must prove offline validator execution. Repository-only or
  instruction-only surfaces must expose an honest `external_required` or `unavailable` classification
  when they cannot own the runtime.

## 6. Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Terse `gate-check` loses executable sequencing | high | Keep selected-run, readiness, canonical presentation, deliberate input, revalidation and persistence steps explicit; test their presence. |
| Global instructions are absent or user-modified | high | Preserve owned-config checks and a compact skill-local fail-closed activation guard; status remains incomplete when owned global files are absent. |
| Quick-path wording becomes an implicit bypass | high | Keep machine enums and evidence rules; change only human distinction and same-operation presentation. |
| Generated copies drift | medium | Run existing sync and integrity checks; never edit generated assets directly. |
| Scope expands into a gate-model redesign | high | PRD must exclude enum migration, gate removal and new authority paths. |
| Surface adapters duplicate CLI policy | high | Adapters may resolve and delegate only; integrity checks reject copied evaluator/control-policy owners. |
| Plugin and validator versions drift | high | Exact version parity is required before machine evidence is accepted; mismatch fails closed. |
| Host-native direct plugin install lacks npm lifecycle | high | SD must define a bundle or owned runtime path that works without assuming global npm installation or shell `PATH` mutation. |

## 7. Context Graph Impact

- context_graph_impact: update_existing_node
- context_graph_refs: `CG-NATIVE-INTERACTION-AUTHORITY`; `CG-DOCUMENTATION-CEREMONY-BOUNDARY`
- context_graph_reconciliation: open_gap
- required_action: Update the two existing nodes after the approved design is implemented and verified;
  do not create a new node unless PRD introduces a genuinely separate durable decision.

## 8. Required Next Step

Use the expanded PRD as the current product specification and request exact `Approval: PRD`. Solution
Design must define the cross-surface validator packaging/resolution boundary before implementation.
