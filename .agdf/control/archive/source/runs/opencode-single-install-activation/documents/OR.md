# Orchestration Report: Single-Install OpenCode Activation

Status: `pass`
Gate: `OR`
Report mode: `OR-full`
Date: `2026-08-19`
Run: `opencode-single-install-activation`

## OR

- gate: `OR`
- report_mode: `OR-full`
- artefact: `.agdf/control/artefacts/opencode-single-install-activation/OR.md`
- status: `pass`
- delivered: one global OpenCode AGDF installation with repository activation derived from durable
  `.agdf/control/config.json`; early active-repository routing; fail-closed inactive/invalid
  orientation; status separation for global install, durable activation, legacy compatibility and
  session signal; repository scaffolding without generated `.opencode/**` runtime duplication or
  mutation of existing OpenCode files.
- intentionally_not_delivered: authenticated interactive OpenCode restart, UI or skill-selection
  observation; installation mutation; removal of legacy or user-owned OpenCode assets; VCS,
  publication, release, deployment or plugin reinstall.
- evidence: approved UR/PRD/SD/TP/QA/UAT; Brownfield Analysis pass; 6/6 TP tasks; Clean Review and
  Code Review pass; lifecycle fixtures for missing, invalid, active and legacy-compatible states;
  scaffold/status smoke; generated-asset synchronization; routing, Runtime Integrity, skill eval and
  whitespace checks; Doctor pass with zero findings.
- missing_evidence: authenticated live OpenCode rendering, runtime skill precedence and observed
  session restart remain unperformed post-release evidence.
- risks: legacy local and global surfaces may coexist; collision-safe global names and preservation
  of user-owned local assets are deliberate compatibility behavior, not proof of live precedence.
- retained_fallbacks: legacy local assets remain supported and untouched; exit only through a
  separately authorized migration after verified global activation, never automatic deletion.
- required_next_step: re-evaluate Product Maturity Roadmap PMR-5/PMR-6 using this accepted owner
  outcome while retaining the live-host evidence limit.
- quality_outlook: preserve one durable activation owner and obtain authenticated OpenCode evidence
  without reintroducing repository-local runtime duplication.

## Approval And Acceptance State

| Gate | Result | Evidence |
|---|---|---|
| UR | approved | Exact approval accepted on 2026-07-17. |
| PRD | approved | Exact approval accepted on 2026-07-17. |
| SD | approved | Exact approval accepted on 2026-07-17. |
| TP | approved | Exact approval accepted on 2026-07-17. |
| QA | pass and approved | QA Report pass; exact approval accepted on 2026-07-17. |
| UAT | approved | UAT Evidence accepted on 2026-08-19 against Revision 11 with the live-host limit retained. |

## Delivery Evidence

| Dimension | Result | Evidence |
|---|---|---|
| TP coverage | pass | 6/6 approved tasks fully done. |
| Brownfield fit | pass | Existing plugin, installer, scaffold, status and generated-asset owners reused. |
| Solution integrity | pass | One activation owner and no new parallel repository runtime. |
| Code quality | pass | No remaining reviewed finding. |
| QA | pass | Lifecycle, status, scaffold, routing, integrity and aggregate checks pass. |
| UAT | accepted | Repository behavior accepted with authenticated live OpenCode observation retained as a non-claim. |

## Parent Reconciliation Handoff

- outcome: `not_applicable`
- relationship_evidence: this run declares no explicit
  `OR | reconciles_with | parent_run:<run_id>` relationship.
- authority_effect: none; no Parent relationship is inferred from roadmap references, backlog
  position, names, paths or chat history.
- next_action: none under the Parent reconciliation contract.

## Programme Aggregation Readiness

- applicable: `false`
- startable: `false`
- final_ready: `false`
- reason: this run declares no programme aggregation relationship or acceptance artefact.
- authority_effect: none.

## Context Graph Impact

- context_graph_impact: `link_only`
- context_graph_refs: `CG-NATIVE-INTERACTION-AUTHORITY`; `CG-CREATE-AGDF-CLI-COMPOSITION`;
  `CG-RUN-STATUS-CARD`
- context_graph_reconciliation: `resolved`
- context_graph_required_action: `none`
- context_graph_gate_effect: `none`
- context_graph_evidence: existing nodes own native interaction, exact-version CLI composition and
  independent installation/activation status; this run reuses those boundaries without a new node.

## Final Boundary

The governance run is complete. This OR does not perform or authorize commit, push, PR, release,
publication, deployment or installed-plugin cache mutation.

