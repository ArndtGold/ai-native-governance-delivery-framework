# Brownfield Review: OpenCode Registry Installation and Runtime Integrity

## Brownfield Analysis

- mode: `post_ur_review`
- decision: `pass`
- mode_slice_decision: `structured_slice`
- required_next_gate: `PRD`
- artefact: `.agdf/control/artefacts/opencode-registry-install/BROWNFIELD_REVIEW.md`
- scope: Repair the published-package installation path and the existing control-state parser/transition implementation so OpenCode installation is portable and late-gate decisions are deterministic.
- evidence:
  - `create-agdf/bin/create-agdf.js:532` passes the local `packageRoot` to npm, and the live global OpenCode package files currently contain `create-agdf: file:../../.npm/_npx/...`.
  - `create-agdf/bin/create-agdf.js:42` registers only `Brownfield Review` as an internal artefact although `gateProgressOrder` and `nextSkillByGate` already model `Brownfield Analysis`, `CD+Tests` and `CR`.
  - `create-agdf/lib/control-state/run-state-parser.js:106-116` maps only QA `passed` to `approved` and searches for `Mode / Slice Decision`, while the runtime contract and generated guidance use `Mode/Slice Decision`.
  - `create-agdf/bin/create-agdf.js:2143-2296` has no explicit transition branches for Brownfield Analysis, CD+Tests, CR or pre-QA QA; the final fallback incorrectly returns Brownfield Analysis after TP.
  - `create-agdf/bin/create-agdf.js:1820` defines `firstUnapprovedGate` without a call site.
  - `create-agdf/scripts/smoke-test.js` already contains OpenCode install/status fixtures and late QA transition fixtures, but no complete regression coverage for the newly reported internal-step transition path.
  - The current global `AGDF.md` already contains `agdf-global-*`; the stale-guidance finding is therefore a deployment-state regression to protect against, not a current source mismatch.
- transparency: A PRD is required because the scope crosses installer dependency semantics, canonical control-state parsing, gate transition authority and regression-test contracts. Existing OpenCode config/status/version behavior should be preserved; the implementation path must remain one shared control-state model rather than adding an OpenCode-specific gate model.
- missing_evidence:
  - Exact registry-install migration behavior for an existing `file:` lockfile must be specified and tested without deleting unrelated global dependencies.
  - The canonical status vocabulary and transition order for `Brownfield Analysis -> CD+Tests -> CR -> QA` must be fixed in the PRD/SD against the runtime contract before implementation.
  - The release/bootstrap test must prove that the exact published package is available before the installer is exercised.
- current_coverage:
  - `fully_done`: global OpenCode config wiring, native global skill generation, package version/status reporting, current global namespace guidance, existing doctor/status/smoke infrastructure.
  - `partially_done`: gate vocabulary and progress ordering exist, but parser artefact admission and transition consumption are incomplete; OpenCode smoke tests cover the installer but currently encode the local-source fixture boundary.
  - `not_done`: registry-only production dependency, late internal-step transition branches, canonical Mode/Slice parsing, QA `pass` normalization and dead-helper cleanup.
- reuse_strategy: `extend` the existing installer, shared `run-state-parser`, shared transition function, canonical runtime contract and existing smoke/control-state fixtures. Keep package name/version ownership in `plugin/meta/agdf-plugin.definition.json`; do not create an OpenCode-specific parser or gate table.
- risks:
  - A registry-only installer requires published-package readiness and network access; a production cache fallback would recreate the defect.
  - Changing transition logic can affect every surface using `gate-check`, so fixtures must cover each boundary and the legacy projection must remain derived.
  - Heading and QA vocabulary changes can alter existing run-state interpretation; compatibility aliases should be deliberate parser-boundary behavior, not a second canonical heading or status model.
  - Global package migration must preserve unrelated OpenCode dependencies and user-owned files.
  - Generated OpenCode guidance can drift again unless the installer/generator and integrity checks validate the current namespace.
- context_graph_impact: `link_only`
- context_graph_refs: `CG-RUN-STATUS-CARD`; existing OpenCode global-install/runtime-integrity evidence in the scoped artefact chain.
- context_graph_reconciliation: `resolved`
- context_graph_gate_effect: `none`
- context_graph_required_action: `none`
- required_next_step: Draft the PRD for the registry migration, canonical parser/transition contract, compatibility policy and regression evidence. Do not implement before PRD, SD and TP approvals.

