# Orchestration Report: Lean Interaction Ownership and Local Validation

Status: `pass`
Gate: `OR`
Report mode: `OR-full`
Date: `2026-08-19`
Run: `agdf-interaction-ownership-quick-path-ux`

## OR

- gate: `OR`
- report_mode: `OR-full`
- artefact: `.agdf/control/artefacts/agdf-interaction-ownership-quick-path-ux/OR.md`
- status: `pass`
- delivered: canonical native-interaction ownership; Compact Delivery terminology and reduced
  visible ceremony; exact-version offline local validation; one global OpenCode boundary with
  permission-preserving merge behavior; sequential release-or rules; one code-owned operational
  status projection consumed verbatim by CLI and skills; fail-closed output and integrity coverage.
- intentionally_not_delivered: installation of a future released package into the authenticated
  OpenCode configuration; authenticated host restart, UI or stderr observation; native Windows
  execution; registry publication; VCS, release, deployment or plugin reinstall.
- evidence: approved expanded UR/PRD/SD/TP/QA/UAT; Brownfield Analysis pass; 12/12 TP tasks; Clean
  Review and Code Review pass; deterministic generation and digest checks; offline local command
  execution; isolated OpenCode wrapper and permission fixtures; Runtime Integrity positive/negative;
  27/27 deterministic skill evals; aggregate smoke, package-content and diff checks.
- missing_evidence: direct authenticated Codex, Claude Code and refreshed OpenCode observation,
  released-package consumption and native Windows execution remain unperformed post-release
  evidence.
- risks: focused skills could omit needed contract loading; terminology could affect persisted
  consumers; reduced ceremony could hide evidence; the OpenCode boundary could fail to load; local
  adapters could drift into a second CLI. Existing focused contract loading, compatibility,
  fail-closed integrity and shared-CLI delegation mitigate these warning-level risks.
- retained_fallbacks: the unrelated unowned `~/.config/opencode/opencode.jsonc` remains preserved;
  exit criterion is explicit user ownership or a separately approved configuration migration, never
  automatic deletion.
- required_next_step: re-evaluate Product Maturity Roadmap PMR-5/PMR-6 and proceed to the remaining
  `opencode-single-install-activation` owner decision if still required.
- quality_outlook: preserve compact semantic parity and collect released-package and authenticated
  host evidence without weakening the single-owner boundary.

## Approval And Acceptance State

| Gate | Result | Evidence |
|---|---|---|
| UR | approved | Exact expanded-scope approval accepted on 2026-07-18. |
| PRD | approved | Exact approval accepted on 2026-07-18. |
| SD | approved | Exact approval accepted on 2026-07-18. |
| TP | approved | Exact approval accepted on 2026-07-18. |
| QA | pass and approved | Refreshed QA Report pass; exact approval accepted on 2026-07-19 against Revision 20. |
| UAT | approved | Refreshed UAT Evidence accepted on 2026-08-19 against Revision 21 with release/install limits retained. |

## Delivery Evidence

| Dimension | Result | Evidence |
|---|---|---|
| TP coverage | pass | 12/12 tasks fully done after UAT revision reconciliation. |
| Brownfield fit | pass | Existing interaction, status-data, presentation, installer and CLI owners reused. |
| Solution integrity | pass | One data owner, one Markdown owner and no fallback template or parallel CLI. |
| Code quality | pass | Escaping, fail-closed output and compatibility findings resolved. |
| QA | pass | Refreshed deterministic status renderer, CLI parity and integrity evidence pass. |
| UAT | accepted | Repository behavior accepted with released-package, authenticated-host and Windows evidence limits retained. |

## Parent Reconciliation Handoff

- outcome: `not_applicable`
- relationship_evidence: this run declares no explicit
  `OR | reconciles_with | parent_run:<run_id>` relationship.
- authority_effect: none; no Parent relationship is inferred from backlog position, names, paths or
  roadmap references.
- next_action: none under the Parent reconciliation contract.

## Programme Aggregation Readiness

- applicable: `false`
- startable: `false`
- final_ready: `false`
- reason: this run declares no programme aggregation relationship or acceptance artefact.
- authority_effect: none.

## Context Graph Impact

- context_graph_impact: `update_existing_node`
- context_graph_refs: `CG-NATIVE-INTERACTION-AUTHORITY`; `CG-DOCUMENTATION-CEREMONY-BOUNDARY`;
  `CG-CREATE-AGDF-CLI-COMPOSITION`
- context_graph_reconciliation: `resolved`
- context_graph_required_action: `none`
- context_graph_gate_effect: `none`
- context_graph_evidence: the existing nodes record consolidated interaction ownership, Compact
  Delivery routing, code-owned operational status and exact-version local-validator composition.

## Final Boundary

The governance run is complete. This OR does not perform or authorize commit, push, PR, release,
publication, deployment or installed-plugin cache mutation.

