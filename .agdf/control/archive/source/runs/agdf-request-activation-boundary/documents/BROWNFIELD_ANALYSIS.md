# Brownfield Analysis: Request-Intent Activation Boundary

Mode: `pre_implementation_analysis`
Status: passed
Decision: `pass`
Revision: 3
Reviewed at: 2026-09-04
Baseline: `main` at `2e98bb332587301274feba37a5d0d21fd706937a` plus the current Revision 1 worktree
Approved scope: `RAB-TP-17` through `RAB-TP-21` and reopened `RAB-TP-15`/`RAB-TP-16`
Based on: approved TP Revision 3, exact approval bound to run revision
`C11F3392-2A48-41B3-9E48-88188E67A5ED`

## 1. Current Coverage And Reuse

| TP area | Current coverage | Existing owner and reuse decision |
|---|---|---|
| `RAB-TP-17` | `partially_done` | Refactor the existing sole semantic owner `request-activation.md` and definition-owned `runtimeContract`/`skillSet`. Add the budget object there; do not create another policy owner. |
| `RAB-TP-18` | `partially_done` | Extend the existing safe marker/fingerprint projector. Generated router and skills remain projector-owned targets. Replace only the `gate-check` operational body needed after the kernel. |
| `RAB-TP-19` | `partially_done` | Reuse current SessionStart generation, OpenCode activation/version readback, installer transaction and package sync. Change only instruction composition and on-demand resource packaging. |
| `RAB-TP-20` | `partially_done` | Reuse the existing kernel, SessionStart, OpenCode transform, global-install, negative-fixture and two-build test seams. Add one shared pure measurement helper, one focused test and one evidence-only composed-profile loader. |
| `RAB-TP-21` | `partially_done` | Update existing README/handbook owners and `CG-REQUEST-ACTIVATION-AUTHORITY` after measured evidence. No new SoT or graph node. |
| `RAB-TP-15` | `not_done` | Earlier host observations remain partial or unavailable and must be repeated for the exact Revision 3 implementation profile. |
| `RAB-TP-16` | `not_done` | All post-TP reviews and QA evidence are stale for the revised design. |

The technical implementation path is Brownfield-clean. The only new algorithmic owner is a pure
instruction-footprint measurement helper. The composed-profile loader owns evidence composition,
not activation policy.

## 2. Reuse And File Boundaries

- `request-activation.md` remains the only semantic owner. Preserve request classes, precedence,
  operation catalog, invocation/selection distinction and failure semantics outside the marked kernel.
- `agdf-plugin.definition.json` remains the only runtime inventory, skill metadata and footprint-budget
  owner.
- `sync-request-activation-projections.js` remains the only kernel, description and router/skill
  projection owner. Keep existing marker/API names for compatibility.
- `sync-plugin-runtime.js` retains runtime copying, consent and repository inspection. Refactor only
  the generated kernel/binding/fact composition.
- `opencode-plugin.js` retains activation/version status, logging, `shell.env` and hook inventory.
  Refactor only active, inactive and compaction model-visible content.
- `sync-package-assets.js` and `lib/installers/opencode.js` retain safe generation/install ownership.
  Add the full router as an owned on-demand resource while `AGDF.md` becomes the micro-bootstrap.
- `plugin/scripts/check-runtime-integrity.mjs` and existing focused/package tests remain evidence
  owners. One shared pure measurement helper prevents competing normalization.
- Generated files and installed roots remain outputs and evidence targets, never policy owners.

## 3. Worktree And Parallel-Owner Isolation

All implementation candidates are already dirty from the Revision 1 request-activation work. They
must be patched on their current contents and never reset, restored from HEAD or replaced wholesale.

Protected overlapping authorities:

- `create-agdf/lib/skill-dispatch/**` and dispatcher-v1 binding semantics belong to
  `cross-surface-executable-skill-dispatcher`. Preserve executable, argument prefix, version,
  dispatcher-first order and terminal transfer.
- `opencode-native-dispatch-tool` owns any future custom OpenCode tool or permission experience.
  This run adds no native tool and changes no permission.
- Status, lifecycle, canonical-init, control evaluation and interaction behavior are retained
  Revision 1 owners and are regression-only in this delta.
- Hook manifests and hook count remain unchanged.
- `assets/agdf-von-agentenarbeit-zu-verantwortbarer-auslieferung.png` is unrelated user work and is
  excluded.

Serialize changes to shared projector, package-sync and Runtime Integrity owners. Stop on
concurrent or unattributable edits.

## 4. Prior Plan Gap Resolved Before Implementation

The current request-activation behavioral adapter supports only `codex` and `claude` execution.
`behavioral.js` rejects `copilot` and `opencode` as live evaluator surfaces. Brownfield Analysis
Revision 2 found that approved TP Revision 2 used `--surface` for all four profile names and
therefore conflated two different facts:

- `profile_surface`: which real source/generated instruction composition is evaluated;
- `evaluator_surface`: which available model adapter executes the source-composed evaluation.

A Copilot or OpenCode profile evaluated by Codex must never be labelled as a loaded Copilot or
OpenCode session. The corpus also needs to state which automatically discovered skill body was
present when `expected.selected_skill` is `none` without leaking expected output into the model input.

Approved TP Revision 3 resolves the plan gap by requiring:

1. add optional closed case metadata
   `composed_profile.instruction_skill`, validated independently and never included in model input;
2. add separate `--profile-surface codex|claude|copilot|opencode` and
   `--evaluator-surface codex|claude` options;
3. retain legacy `--surface` only as an evaluator-surface alias;
4. report both identities plus `loaded_profile: false` and `evidence_plane: source_composed`;
5. use no new Copilot or OpenCode live adapter and make no installed-host claim.

It also removes three execution contradictions discovered during review: Fresh-Host evidence blocks
QA pass rather than profile construction, the evidence-only composed-profile loader is an allowed
evaluation owner but not a production-policy owner, and only the projector-owned derived
`guard_fingerprint` may change canonical source on the first generation pass. All canonical source
must be stable on the second pass.

## 5. Compatibility And Regression Boundary

- Preserve dispatcher v1 outer schema, CLI grammar, target-before-control order and terminal output.
- Preserve request classes, operation catalog, exact approvals and downstream target/gate authority.
- Preserve status, lifecycle, canonical-init, interaction and missing-control behavior.
- Preserve exact hook inventories and absence of `tool.execute.before`.
- Keep the skill-local kernel until four-host evidence proves a common pre-selection guarantee.
- Keep the kernel-only OpenCode compaction fallback until a same-version/digest fresh observation
  proves both transform reapplication and binding availability.
- Separate source, generated, package, installed and loaded-host evidence.

## 6. Context Graph Impact

- context_graph_impact: `update_existing_node`
- context_graph_refs: `CG-REQUEST-ACTIVATION-AUTHORITY`
- context_graph_reconciliation: `open_gap`
- context_graph_required_action: `update`
- context_graph_gate_effect: `warning`
- context_graph_evidence: Approved SD Revision 5 defines the two-stage architecture. Approved TP
  Revision 3 resolves the truthful composed-profile evidence gap. The graph remains open until the
  implementation and separate supported-host evidence are complete.

## 7. Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| `RAB-BA-01` | `plan_gap` | `TP` | `resolved` | Approved TP Revision 3 separates `profile_surface` from `evaluator_surface`, keeps legacy `--surface` evaluator-only, adds closed model-hidden `composed_profile.instruction_skill` metadata, requires `loaded_profile: false` plus `evidence_plane: source_composed`, and excludes new Copilot/OpenCode live adapters. | Implement and verify the approved interface under `RAB-TP-20`; do not treat source-composed evaluation as installed-host evidence. |

## 8. Decision

- decision: `pass`
- current_coverage: `partially_done`
- reuse_strategy: `extend_and_refactor`
- parallel_structure_risk: controlled by existing owners and the protected boundaries above
- implementation_blocker: none
- missing_evidence: implementation; deterministic/package results;
  independent fresh-host evidence
- required_next_step: begin CD+Tests with `RAB-TP-17`, then `RAB-TP-18` and `RAB-TP-19` only
  after the compact kernel, marker and budget contract are stable
- forbidden: scope expansion, manual generated or installed-root edits, QA/UAT/release claims,
  commit, push or PR
