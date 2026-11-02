# Brownfield Review: Host Adapter Boundaries and Evidence-based Compatibility

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: done
Decision: pass

## Run

- run_id: agdf-host-adapter-compatibility
- related_ur: `.agdf/control/artefacts/agdf-host-adapter-compatibility/UR.md`, approved Revision 1
- current_gate: PRD after this review and proportional routing
- reviewer: Codex
- reviewed_at: 2026-09-05
- baseline_commit: `4ae59725fc583b5816334af47b08e446f51739b6`
- evidence_boundary: source and durable-artefact inspection; no installer execution, live-host test, product test pass, QA or UAT is claimed

## Objective and Bounded Outcome

Make the existing four host integrations comparable through one set of five compatibility outcomes,
clear ownership of host-specific lifecycle behavior and support statements traceable to evidence.

The first independently acceptable slice covers the existing Codex, Claude Code, Copilot and OpenCode
paths, a common compatibility evidence report and its explanation in existing documentation. Extract
or consolidate private host-specific behavior only where needed to establish the boundary. Preserve
public CLI flags, output fields and their meaning, dispatcher protocol/binding versions, runtime
locations, permission rules, consent identity semantics and recovery guarantees.

This is a complete bounded outcome within the approved UR, not a promise of universal host parity.
All five outcomes must be evaluated or explicitly identified as unverified/unsupported per environment.
New host APIs, stronger enforcement, new permission grants, persistent capability stores and a new
public compatibility CLI or protocol would exceed this slice and require renewed sizing and the
earliest affected product/design gate.

## UI / UX Impact Routing

- delivery_context: brownfield
- ui_ux_impact: medium
- ui_ux_impact_reason: The compatibility reference introduces comparable evidence states and next actions for choosing a supported host environment. Users must distinguish historical observations, current installation facts, automatic checks and enforcement. Existing install/status commands retain their behavior.
- ux_intent_definition_required: yes
- ux_intent_definition_result: ready
- ux_intent_definition_evidence: `.agdf/control/artefacts/agdf-host-adapter-compatibility/UX_INTENT_DEFINITION.md`

## Existing-System View

| Area | Existing owner or artefact | Evidence and current coverage | Impact |
|---|---|---|---|
| Governance decisions and target | `create-agdf/lib/skill-dispatch/service.js`; `task-target-resolution.js`; `control-evaluation/`; `interaction-presentation.js` | Dispatcher calls canonical target resolution, gate evaluation and rendering; no need for a new policy engine. Fully present for this reuse boundary, without a live-host conformance claim. | low |
| Invocation transport | `create-agdf/lib/skill-dispatch/binding.js`; `contract.js`; existing session producers | Binding and dispatcher protocols are separately versioned. `skill-dispatch-binding-test.js` includes all four surfaces and explicitly labels Windows strings as fixtures. Preserve these contracts and unresolved foreign host evidence. | low |
| Plugin lifecycle adapters | `create-agdf/lib/installers/plugin-installers.js` | Separate install functions coexist with shared helpers and status probing. Codex installation verifies its content-derived version; Claude reinstalls; Copilot verifies skill discovery and recovers filesystem, registration and enablement. Ownership is partly separated, with host branches still in common orchestration. | medium |
| Shared staging and provenance | `create-agdf/lib/installers/local-marketplace.js`; `create-agdf/lib/runtime/plugin-provenance.js` | Owned snapshots, source/runtime digests and transactions already exist. `captureLocalPluginSnapshot` also computes a Codex installation projection, so private host projection and shared snapshot policy need a clear boundary. Preserve ownership checks and byte-accurate rollback. | medium |
| OpenCode lifecycle | `create-agdf/lib/installers/opencode.js`; `opencode-activation.js` | Existing config-local package/runtime, host/SDK inspection and repository activation are distinct owners. `lifecycle/status.js` consumes their result. Keep the installation topology and hook behavior. | medium |
| Automatic checks and permissions | `create-agdf/lib/runtime-check-consent/{contract,service,adapters,coordinator,state}.js`; `claude-settings.js`; `codex-hooks.js` | Central identity/consent exists alongside host command construction and host evidence adapters. A receipt or trusted hook does not itself prove fresh execution. Existing receipt meanings and host-owned deny/ask remain authoritative. | medium |
| Lifecycle result and status | `create-agdf/lib/lifecycle/{result,status,presentation}.js`; `create-agdf/lib/cli/application.js` | Shared non-authorizing result already separates installation, activation, delivery and automatic checks. Installation `healthy` is not a uniform five-outcome conformance assertion. Status probing for Codex/Claude/Copilot primarily reads plugin lists, while OpenCode inspects a different set of facts. | medium |
| Compatibility communication | `INSTALL.md`; `docs/handbook/de/06-fehlerbehebung.md`; English handbook counterpart; `pages/src/data/site.ts` | Existing user explanation distinguishes repository/host evidence but does not present a single five-outcome comparison bound to the full environment tuple. Reuse these entry points and avoid a new dashboard. | medium |
| Deterministic tests | `create-agdf/scripts/{local-marketplace-test,cli-modularization-test,copilot-installer-test,lifecycle-test,runtime-check-consent-test,skill-dispatch-test,skill-dispatch-binding-test}.js` | Installation, same-version refresh, rollback, consent and dispatcher cases exist. Copilot fixture uses real local Git with simulated host commands; it is not an installed Copilot observation. Common result assertions are only partially present. | medium |
| Host observations | `.agdf/control/artefacts/agdf-live-host-conformance-matrix/{OBSERVATION_SCHEMA.json,HOST_CONFORMANCE_MATRIX.json,HOST_CONFORMANCE_REPORT.md}`; Claude follow-up protocol | Historical schema fixes one run, three hosts and 36 observations. The report discloses 16 passes, 8 limitations and 12 unavailable Claude cases for AGDF 0.11.4. Reuse scenarios/evidence principles, not its fixed schema as a current universal registry. | medium |
| Skill evaluations | `create-agdf/lib/skill-evals/{index,live-recorder}.js` | Fingerprints and separate replay/live evidence are reusable concepts. The recorder grades skill behavior and persists passing observations; it cannot be relabeled as a lifecycle recorder that must retain failures. | low |
| Enforcement claims | `create-agdf/lib/delivery-path-search/surfaces/capabilities.js`; `INSTALL.md` | DPS has execution-specific enforcement levels. They must not be promoted into whole-host governance guarantees. | low |
| Persistence and rollout | Existing consent receipts, provenance markers, control artefacts and generated packages | The slice requires no migration of runtime/control state and no new persistent capability authority. Existing build propagation and independent per-host installation remain sufficient. Updated bytes still trigger existing consent/identity checks. | low |

## Reuse and Scope Reconciliation

- current_coverage: shared decision/runtime/result owners are present; host encapsulation, common lifecycle evidence and comparable support presentation are partially_done; a current four-host five-outcome evidence report is not established by the inspected sources.
- reuse_strategy: extend existing tests and lifecycle evidence, refactor private host ownership where necessary, retain shared staging/provenance and canonical decision owners.
- `cross-surface-executable-skill-dispatcher` retains protocol, transport and missing fresh-host/native-OS evidence. This slice consumes its owner and reports evidence limits.
- `agdf-cross-host-runtime-integrity`, `installation-consent-runtime-checks` and `agdf-copilot-plugin-integration` retain their approved functional behavior and outstanding acceptance. No old pass is silently transferred to a new payload.
- `agdf-product-maturity-roadmap` remains broader coordination. Its UI/proportionality work is excluded.
- `agdf-live-host-conformance-matrix` and `claude-loaded-host-conformance-observation` remain historical or run-specific observations. Their exact versions and limitations survive reuse.
- `opencode-native-dispatch-tool` remains a separate UR. No native tool or permission change is implied here.

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| A common `healthy` label could be mistaken for all five outcomes | Installer/status branches and lifecycle result | warn | Preserve legacy result meaning and introduce an explicitly separate comparative evidence view. |
| A generic adapter framework could duplicate governance or transactions | Existing shared dispatcher, staging, consent and result owners | warn | Keep adapters responsible for host mechanisms; core decisions and shared invariants retain one owner. |
| Historical host or DPS evidence could inflate current support | Fixed observation schema and execution-specific DPS capability function | warn | Bind every claim to scope, payload, host variant/version, OS, path and evidence class. |
| A source-only matrix could appear to prove live installation | Copilot fixture and dispatch-binding test comments | warn | Keep deterministic and live lanes distinct, including negative and absent outcomes. |
| Private reorganization can change runtime bytes | Runtime provenance and content-bound consent contract | warn | Retain existing identity renewal and test it; do not suppress renewed trust to make the refactor look transparent. |

## Mode / Slice Decision

- decision: structured_slice
- required_next_gate: PRD
- scope_reason: `bounded_structured_slice`; one comparative compatibility outcome extends existing internal owners and documentation with unchanged external CLI, dispatcher, permission, persistence and installation contracts. Quick Task would omit required new product/evidence semantics. Verified Change is ineligible because the result spans lifecycle/runtime ownership. Full Structured Delivery is rejected because no coordinated cutover, new public protocol or non-local recovery boundary is required within the stated slice.
- evidence: Existing-System View; Structured Depth Evidence; approved UR Revision 1
- transparency_note: PRD, SD and TP remain required, at bounded slice depth. Private extraction is selected by ownership and observable outcomes, not file counts or an installer-wide rewrite target.

## Structured Depth Evidence

- depth_policy_version: 1
- depth_facts_status: complete
- primary_reason_code: bounded_structured_slice
- decisive_full_depth_triggers: none within the explicit slice boundaries
- rejected_alternative: structured_delivery, because the existing independent host lifecycle and unchanged public contracts permit local acceptance and rollback; quick_task and verified_change are ineligible as described above
- missing_or_conflicting_facts: none needed for this sizing decision; exact internal module contracts and evidence normalization are SD questions, while fresh execution is a later evidence obligation
- depth_evidence_refs: Existing-System View; UR Acceptance Signals; `plugin/meta/contracts/modes.md` Structured Depth Decision

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | pass | Users and maintainers obtain one five-outcome comparison and traceable capability claims for the existing integrations. UR signals 1-8 and the Bounded Outcome define acceptance. |
| authority_boundary | pass | Canonical dispatcher/control evaluators, consent receipt semantics and host-owned permission decisions are retained. The report is evidence, never a gate or execution authority. |
| owner_consumer_coordination | pass | Existing repository owners and in-repository consumers are identified above. Existing exported imports can remain compatibility entry points without a public cutover. No independent external consumer needs coordination for the report. |
| full_depth_impacts_absent | pass | Public CLI fields/semantics, protocol and binding versions, permission behavior, runtime paths and install/recovery algorithms are frozen. The comparison is a repository evidence/documentation result, not a new runtime API or technical support guarantee. |
| migration_propagation_bounded | pass | Existing package generation distributes unchanged behavior from refactored private owners. No receipt/provenance/control schema migration is needed. Historical evidence remains immutable and only explicitly mapped. |
| failure_recovery_local | pass | Existing transaction and per-host recovery owners remain unchanged. Report generation can fail without modifying host state. Product rollback is a source/package revert using existing lifecycle behavior, without coordinated host rollback. |
| independently_acceptable | pass | Shared deterministic cases, unchanged external behavior, explicit adapter ownership and a correctly limited report can be accepted without implementing new host APIs or closing foreign evidence gaps. Unsupported/unverified combinations are visible, not hidden prerequisites. |

Re-evaluate the sizing decision if SD discovers that the frozen contracts cannot be preserved.

## PRD / SD / TP Questions

| Question | Required stage | Impact |
|---|---|---|
| Which reader-visible evidence states and recovery actions prevent confusion with live status? | UX input and PRD | medium |
| Which exact private adapter entry points and compatibility import boundaries fit the existing callers? | SD | medium |
| Which existing test and observation fields can be normalized without rewriting historical evidence or adding a capability store? | SD | medium |
| Which exact final host/version/OS tuples have admissible evidence, and which remain unverified? | TP and QA | medium |
| How are all five outcomes covered, including partial recovery, denied permission and same-version changed bytes? | TP | medium |

## Context Graph Impact

- context_graph_impact: link_only
- context_graph_refs: CG-CREATE-AGDF-CLI-COMPOSITION; CG-EXECUTABLE-SKILL-DISPATCH-AUTHORITY; CG-NATIVE-INTERACTION-AUTHORITY
- context_graph_reconciliation: resolved
- context_graph_required_action: link
- context_graph_gate_effect: none
- context_graph_evidence: Existing nodes are linked in this review and the run. Findings remain run-scoped until a later approved design changes an invariant or owner; no node or SoT owner is changed now.
- memory_target: scope_artifact
- memory_reason: Preserve bounded analysis and source-specific evidence for this run without expanding global governance.
- memory_refs: this review; UX_INTENT_DEFINITION.md; RUN_STATE.md

## Next Permissible Step and Quality Outlook

- next_allowed_action: Incorporate the ready UX intent into a bounded PRD and request exact Approval: PRD.
- forbidden_until_then: SD, TP, implementation, host lifecycle mutations and QA/release claims.
- pre_implementation_analysis_required: yes, after approved TP, to verify caller ownership, baseline drift, public compatibility and test coverage.
- quality_outlook: Demonstrate fewer cross-host decision changes and reusable failure detection rather than measuring success by newly created adapter files.
