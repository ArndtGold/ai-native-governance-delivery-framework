# Brownfield Analysis: Cockpit Core and UI list slice

- mode: pre_implementation_analysis
- decision: pass
- run: cockpit-active-backlog-core-ui-20261008-01
- based_on: approved TP, SD, PRD and UR; exact source digests in IMPLEMENTATION_BASELINE.json
- current_coverage: partially_done
- reuse_strategy: extend existing Core parser/read boundary and App/reducer; refactor duplicated list presentation policy into one pure Core module; replace compact native picker with shared passive rows.
- scope: T-001 through T-008; bounded structured_slice remains valid.

## Existing-system evidence and owners

Inspected cockpit-backlog.js: three stored sections, source-order entries, counts, scoped missing/layout/malformed diagnostics, cross-section duplicate disabling and contained UR reads. cockpit.js and session/read workers retain observation authority. Raw entry order must stay intact because opaque title selectors are position-bound.

Overview.tsx currently reverses each section locally, infers diagnostic coverage and lets cached UR titles replace primary/search titles. CompactCockpit.tsx independently filters every section in original order and renders an overflowing native select. These competing rules are replaced by cockpit-list.js, not another service, protocol or store. api.ts retains raw DTO validation and additionally rejects contradictory counts/entries through the pure Core contract.

App.tsx owns the reading reducer, area/query, generation cancellation, named-capture safeguard for pending title reads, freshness/change listening and document/context navigation. Reuse these paths. Local overview source_changed becomes stale until deliberate reload; detail/document/context behavior remains protected. Shared showOverview restores originating run focus; new explicit feedback distinguishes removal from preview-hidden rows. Mode transitions preserve active query or reset non-active state on return to compact.

useBacklogTitles.ts retains intersection demand, one adjacent row, twelve-row batches, cancellation, hidden-view handling and LRU/byte bounds; only its source identity comes from Core and headings become supplementary. Existing test fixtures and browser harness cover this path, including the committed-title response barrier.

UI styles retain tokens/branding/document layout; shared rows wrap titles and disclose full next steps. scripts/core-projection.mjs already owns canonical Core copying and private Cockpit exclusions; extend that exclusion for helper/declaration. README and docs/architecture/06-agdf-cockpit.md remain documentation owners.

## Baseline and protected boundaries

Baseline HEAD and tracked/untracked status are saved in IMPLEMENTATION_BASELINE.json. Only MASTER_BACKLOG and this run's control artefacts/state were changed before implementation; affected code paths are clean. No applicable AGENTS.md was found in this repository. Preserve unrelated work if it appears later. Approved source bytes were checked exactly before this analysis.

No writer/gate, durable schema, transport operation, external API, host support or release boundary changes. Source text stays passive data. The pure Core module has no Node/fs/network/React dependency. Presentation identity never authorizes reads or approvals; opaque selectors and run evaluation remain existing owners.

## Regression risks and evidence

Cross-section duplicate diagnostics require checking disabled selected rows as well as scoped diagnostics. Missing layouts must not claim zero; invalid DTO counts must fail explicitly. Matching is per original field. Original indices must survive filtering/reverse order and metadata-only capture rotation. Return focus must not imply removal merely because five-row preview hides an item. Keep run/document/context refresh, committed-title navigation and session expiry assertions.

Execute TP scenario/command matrix after implementation, including source closure, both builds and private packaging checks. Actual compact Codex/build identity/no-write observation remains required later and is not implied by this source review. No implementation or tests were claimed complete here.

- missing_evidence: none for the preparation decision; all implementation, regression, rendered and native evidence is still due under TP.
- parallel_structure_risk: mitigated by removing renderer policy and importing one Core owner; shared row component owns markup only.
- context_graph_impact: none
- context_graph_reconciliation: not_applicable
- context_graph_required_action: none
- context_graph_gate_effect: none
- memory_target: scope_artifact
- memory_reason: run-specific preparation and baseline only
- memory_refs: this analysis; IMPLEMENTATION_BASELINE.json
- required_next_step: CD+Tests for the exact approved TP scope after canonical recording and gate revalidation.
