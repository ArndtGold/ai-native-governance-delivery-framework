# Brownfield Review: Deterministic Agent UX

- revision: `2`
- mode: `post_ur_review`
- decision: `pass`
- mode_slice_decision: `structured_slice`
- required_next_gate: `PRD`
- artefact: `.agdf/control/artefacts/deterministic-agent-ux/BROWNFIELD_REVIEW.md`

## Scope

Size and route approved UR revision 2 without implementing it. The review covers the visible
ownership boundary between agent skills, durable control state and CLI validation, plus the existing
approval-orientation projection across Codex, Claude Code, OpenCode and GitHub Copilot.

## Existing Owners And Coverage

| Concern | Existing owner | Coverage | Reuse decision |
|---|---|---|---|
| Gate authority and transitions | `plugin/meta/contracts/gate-transition.md`; selected `RUN_STATE.md` | `fully_done` | preserve unchanged |
| Agent-native versus CLI-verifiable ownership | `plugin/meta/contracts/control-scaffold.md`; `plugin/skills/gate-check/SKILL.md` | `fully_done` normatively, `partially_done` in first-contact UX | extend existing public projections |
| Public command journey | `README.md`; `INSTALL.md`; `agdf/README.md`; `create-agdf/lib/cli/command-registry.js` | `partially_done`: global installation is documented, but `npx ...@latest` remains the dominant visible command form | refine existing entry points, do not add another CLI |
| Approval snapshot and locale projection | `create-agdf/lib/interaction-presentation.js`; `plugin/meta/agdf-interaction-locales.json` | `partially_done`: immutable validated snapshot exists | extend the existing snapshot owner |
| Gate evaluation and human projection | `create-agdf/lib/control-evaluation/gate-check.js` | `partially_done`: snapshot is attached non-enumerably and is unavailable to an external JSON consumer | extend additively without a second evaluator |
| Native attempt orchestration | `executeNativeApprovalAttempt()` in `interaction-presentation.js`; host rules in `plugin/meta/contracts/interaction.md` | `partially_done`: deterministic helper and tests exist, but production host invocation remains agent-orchestrated | keep host adapters presentation-only |
| GitHub Copilot delivery | generated `AGENTS.md`, `.github/copilot-instructions.md`, `.github/skills/agdf-*`, runtime contract and locale registry from `create-agdf/scripts/sync-package-assets.js` | `partially_done`: shared skills and presentation rules are generated, but no Copilot interaction adapter is declared | extend generated instruction/skill consumption and use exact-text fallback; do not invent native capability |
| Deterministic regression coverage | `create-agdf/scripts/interaction-presentation-test.js`; control-state, smoke and Runtime Integrity suites | `partially_done`: snapshot invariants are covered; final host-visible composition remains separate live evidence | extend existing focused and live-eval paths |
| Generated agent surfaces | `create-agdf/scripts/sync-package-assets.js`; generated Codex, Claude, OpenCode and Copilot assets | `fully_done` propagation path | reuse the canonical sync path |

## Current Coverage

The core ownership model and gate safety are already implemented. The missing slice is not a new gate
system or Greenfield renderer. It is a bounded projection and discoverability gap:

1. the public journey does not foreground the existing ownership model early enough;
2. the command examples over-represent registry-resolved `npx ...@latest` execution for routine work;
3. the canonical approval snapshot is intentionally hidden from public JSON and therefore cannot yet
   be consumed as a render-ready payload by an external agent surface; and
4. repository tests validate snapshot semantics but cannot alone prove the final visible host message.
5. GitHub Copilot already receives the canonical gate-check skill, interaction contract and locale
   registry through generated repository files, but its current capability boundary is
   instruction-only and has no declared native executable interaction adapter.

## Reuse Strategy

- overall strategy: `extend`
- keep `interaction-presentation.js` as the sole presentation-payload owner;
- keep `gate-check.js` as the sole gate-evaluation composition owner;
- preserve exact approval validation and selected-run revalidation;
- reuse the locale registry, command registry, generated-asset sync and existing test suites;
- make any public projection additive and versioned rather than changing existing JSON fields; and
- treat live Codex and Claude Code observations as supplementary host evidence, never as gate authority.
- keep Copilot on the shared projection plus exact-text fallback unless a future host capability is
  independently evidenced and added through the canonical interaction definition.

## Change Impact

- likely normative paths: `plugin/meta/contracts/interaction.md`,
  `plugin/meta/contracts/control-scaffold.md`, `plugin/skills/gate-check/SKILL.md`;
- likely runtime paths: `create-agdf/lib/interaction-presentation.js`,
  `create-agdf/lib/control-evaluation/gate-check.js`, and only if required the focused CLI
  presentation/registry owners under `create-agdf/lib/cli/`;
- likely public paths: `README.md`, `INSTALL.md`, `agdf/README.md`;
- likely generated paths: synchronized Codex, Claude Code, OpenCode and Copilot assets;
- Copilot transport boundary: repository-local generated instructions and skills; no new plugin package
  or assumed native question adapter;
- likely tests: interaction-presentation, control-state, smoke, Runtime Integrity negative checks and
  bounded live skill/host evidence;
- data model or migration: none;
- gate or approval compatibility: must remain unchanged;
- public JSON compatibility: additive changes only, with an explicit projection schema if exposed.

## Parallel-Structure And Visible-Ownership Risks

- A new Markdown renderer outside `interaction-presentation.js` would create a second presentation
  authority and is rejected.
- A second gate evaluator embedded in a host adapter would create semantic drift and is rejected.
- A docs-only fix would leave the model-formatting failure path intact.
- A runtime-only fix would leave the skill/CLI mental model undiscoverable.
- A new required network command in the primary chat path would contradict the approved UR.
- Host-specific code may translate transport only; it may not own decision content or approval state.
- Adding a speculative Copilot native adapter would overstate current capability and is rejected;
  Copilot remains a full semantic/rendering target through its repository instruction surface and
  exact-text transport.

The primary visible owner remains the shared interaction projection. No large UI surface, persistence
migration or central state hook is introduced. Pre-implementation Brownfield Analysis will still be
required after an approved TP because the final projection transport and generated-surface impact must
be verified against the approved design.

## Product And Source-Of-Truth Drift

No conflicting product direction was found. The repository already declares the desired
agent-native/CLI-verifiable boundary and deterministic projection principles. The new UR makes the
gap between that intent and the experienced UX explicit without changing authority.

## Open Questions For PRD And SD

1. Which additive render-ready projection is the stable surface: structured blocks, canonical
   Markdown lines, or both?
2. How can supported agents consume the projection without making a fresh network-resolved CLI call
   a normal-work requirement?
3. Which first-contact locations must show the three-role mental model, and which repeated command
   examples should remain bootstrap-only?
4. Which parts of the current 14-step agent procedure become code invariants and which irreducible
   host actions remain instructions?
5. What repository evidence is mandatory, and what Codex/Claude live evidence remains explicitly
   supplementary?
6. Which deterministic generated-output and optional live observation prove Copilot consumption
   without promoting its instruction-only boundary to native enforcement?

## Context Graph Impact

- context_graph_impact: `link_only`
- context_graph_refs: `CG-RUN-STATUS-CARD`, `CG-NATIVE-INTERACTION-AUTHORITY`,
  `CG-CREATE-AGDF-CLI-COMPOSITION`
- context_graph_reconciliation: `resolved`
- context_graph_required_action: `link`
- context_graph_gate_effect: `none`
- context_graph_evidence: Existing nodes already own the presentation, adapter-authority and CLI
  composition invariants; this review links them rather than creating a new node.
- memory_target: `scope_artifact`
- memory_reason: Current findings size this run; durable cross-run knowledge already has canonical
  Context Graph owners.
- memory_refs: `.agdf/control/artefacts/deterministic-agent-ux/BROWNFIELD_REVIEW.md`

## Transparency

`quick_task` and `verified_change` remain ineligible because the proposed slice affects normative
interaction guidance, executable presentation code, public CLI/documentation behavior and generated
surfaces. Copilot adds a generated instruction/skill consumer, not a new authority or runtime plugin.
Full `structured_delivery` remains unnecessary because gate authority, persistence and core
architecture remain unchanged and the existing owners can be extended. A compact `structured_slice`
with deliberately small PRD, SD and TP artefacts remains the proportional path.

## Missing Evidence

- No approved PRD yet defines the exact public projection and user-visible acceptance boundary.
- No SD yet proves how agents consume the projection without creating a second renderer or routine
  network dependency.
- No live-host evidence exists for the future behavior; this is intentionally not required to size
  the run.

## Required Next Step

Draft a compact PRD that resolves the user-visible contract, projection acceptance criteria and
non-goals, then request `Approval: PRD`.
