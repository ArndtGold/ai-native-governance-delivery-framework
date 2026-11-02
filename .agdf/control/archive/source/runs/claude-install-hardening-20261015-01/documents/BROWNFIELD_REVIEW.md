# Brownfield Review: Harden the Claude installer against stale and shadowed installations

Gate: Brownfield Review
Type: Brownfield Review
Mode: post_ur_review
Status: done
Decision: pass

## Run

- run_id: claude-install-hardening-20261015-01
- related_ur: .agdf/control/artefacts/claude-install-hardening-20261015-01/UR.md
- current_gate: Brownfield Review
- reviewer: Claude Code (claude-opus-5-5)
- reviewed_at: 2026-10-15

## Objective

Size and route the approved UR: review/integrate fix `42c42850`, add a packaged-app preflight,
make the marketplace identical for processes inside and outside packaged apps, follow the actual
Claude Code loading model without per-run reinstall, verify installed content by digest, read host
state machine-readably, make Claude runtime facts consistent with plugin-enablement consent, and
stop destructive recovery after the marketplace commit. Source baseline: `main` at `6668ad9b` plus
candidate commit `42c42850` on `feat/claude-install-fix`; working tree clean.

## UI / UX Impact Routing

- delivery_context: brownfield
- ui_ux_impact: medium
- ui_ux_impact_reason: The install capability gains a new blocker (refusal inside a packaged app), its effective state changes meaning (`healthy` now requires matching content digests, otherwise degraded), its recovery behaviour changes (no uninstall/reinstall after commit, cleanup on next run), and Claude sessions may newly receive runtime facts plus a drift notice. These materially change blocker, effective-state and recovery semantics of one bounded capability; no cross-capability authority is created.
- ux_intent_definition_required: yes
- ux_intent_definition_result: pending; ux-intent-definition must record `ready | blocked | not_applicable` before PRD readiness.

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | Approved UR; install lifecycle result shape | `packages/cli/lib/host-adapters/claude/plugin.js` result object (`verificationStatus`, `evidence`); `packages/cli/lib/runtime-check-consent/service.js` Claude status | medium |
| Source of truth | Marketplace ownership and installation provenance | `packages/cli/lib/installers/local-marketplace.js` (`.agdf-owned.json`, `INSTALLATION_PROVENANCE_FILE`, `defaultAgdfDataRoot`, `localMarketplaceRoot`); `packages/core/lib/runtime/plugin-provenance.js` | high |
| Runtime path | Claude install sequence, transaction, SessionStart hook | `plugin.js:36-134` (uninstall/install cycle, commit, recovery); `local-marketplace.js:662-728` (commit/rollback); `scripts/sync-plugin-runtime.js:297-322` (runtime facts gate); `packages/cli/scripts/install-local-plugin.js` (no preflight) | high |
| UI / UX | CLI install output and SessionStart context | install result evidence strings; `AGDF installation drift` notice from `42c42850`; runtime facts block | medium |
| Persistence / data | Marketplace and data root under `%LOCALAPPDATA%\agdf`; Claude registrations | `defaultAgdfDataRoot` (`local-marketplace.js:149-155`); `known_marketplaces.json`/`installed_plugins.json` (host-owned); Codex absolute MCP paths via `renderCodexPluginMcpConfig` (`local-marketplace.js:576-584`) | high |
| Tests / QA | Installer, consent, layout and lifecycle suites; native probe | `packages/cli/scripts/{local-marketplace,claude-cache-recovery,runtime-check-consent,runtime-integrity-layout,lifecycle,claude-packaged-app-copy}-test.js`; `scripts/native-probes/claude-host-e2e.mjs` | medium |
| Release / operations | Local install entry and package assembly | `npm run install:claude` → `install-local-plugin.js`; `scripts/assemble-npm.mjs`; Copilot projection guard in `scripts/core-projection.mjs` | medium |

Current coverage: preflight `not_done`; marketplace location `not_done`; loading model `not_done`
(reinstall cycle present); digest verification `partially_done` (`42c42850` compares at
SessionStart only, installer checks version only); machine-readable listing `not_done` (marketplace
list already uses `--json`, plugin list does not); runtime facts `not_done` (contradiction
confirmed); post-commit path `not_done`; packaged-copy reconciliation `partially_done` (`42c42850`,
unreviewed).

## Architecture Impact

- architecture_relevance: relevant
- architecture_impact: high
- architecture_reason: The change touches the runtime/host contract (how Claude Code loads and how the installer verifies the plugin), data/SoT ownership (marketplace location and installation provenance shared with Codex), compatibility/migration (possible relocation of existing installations and host registrations, irreversible retirement of package copies), and the consent/policy boundary for automatic session-start checks in Claude.
- architecture_evidence: `plugin.js:42-48` reinstall rationale contradicted by observed in-place loading (MCP launcher and SessionStart binding run from the marketplace path, 2026-10-15); `runtime-check.js:6-19` and `service.js:69-75,136-137` versus `sync-plugin-runtime.js:297-322`; `local-marketplace.js:149-158` data-root/marketplace location; `plugin.js:84-134` with `local-marketplace.js:697-706` and `plugin-command.js:13-22` for the post-commit path; `packaged-app-marketplace.js` and `host-installation.js` from `42c42850`.
- architecture_missing_evidence: Claude Code loading behaviour across supported versions (evidence owner: SD with native probe); availability of machine-readable `claude plugin list` output (SD); reliable in-package detection before any private copy exists (SD); target location for the marketplace if relocated and its effect on Codex registrations (SD).
- architecture_next_owner_and_action: ux-intent-definition, then prd-definition for behaviour and acceptance; sd-definition decides location, detection signal, verification comparator and transaction boundary within existing owners.

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| problem: packaged-app detection would be duplicated between preflight, reconciliation and SessionStart | `host-installation.js` `packagedAppCopies`/`sameFileSystemEntry`; `packaged-app-marketplace.js` | warn | Extend the existing core module as the single detector; preflight, reconciliation and drift notice consume it. |
| problem: installer verification and SessionStart drift notice could compare provenance differently | `inspectClaudeHostInstallationDrift` (`host-installation.js`) versus version-only check in `plugin.js:77-83` | warn | One comparator in `host-installation.js` serves installer verification and SessionStart; no second digest logic in `plugin.js`. |
| problem: Claude consent has two contradictory owners | `service.js` treats plugin enablement as consent and deletes receipts; generated session check requires a receipt | revise | SD assigns one owner for Claude consent evaluation used by both status and SessionStart; no receipt reintroduction contrary to the approved UR. |
| problem: post-commit recovery is split between installer and transaction owner | `plugin.js` catch-all recovery; `local-marketplace.js` committed-marker recovery in `recoverInterruptedTransaction` | warn | Keep recovery after commit with the transaction owner; the installer only reports. |
| unresolved: marketplace location shared with Codex | `localMarketplaceRoot`/`defaultAgdfDataRoot`; Codex absolute MCP paths; uninstall retains the shared directory (`uninstall.js:50`) | warn | SD decides relocation versus preflight plus reconciliation, including Codex/uninstall consequences; no second marketplace root may coexist without an owner. |
| problem: plugin list parsing is shared with Codex | `plugin-command.js` `pluginVersionFromList`/`inspectPluginList` used by Codex adapter | warn | Change Claude listing through the Claude adapter or a host-parameterised path; Codex behaviour stays unchanged. |
| problem: `42c42850` was written before this run | commit on `feat/claude-install-fix`, tests green locally | warn | Treat as candidate; Code Review and QA cover it like new code. |

No retained-debt acceptance is proposed.

## Mode / Slice Decision

- decision: structured_delivery
- required_next_gate: PRD
- scope_reason: external_contract_depth: the public Claude install outcome (refusal, healthy/degraded semantics, recovery) and the SessionStart context consumed by agents change; additionally the consent/policy boundary for automatic Claude session checks changes, package copies are retired irreversibly, and a marketplace relocation would require coordinated migration of Claude and Codex registrations. Reject quick_task and verified_change because CLI, runtime-host and policy behaviour change across several owners. Reject structured_slice because full-depth triggers are evidenced.
- evidence: .agdf/control/artefacts/claude-install-hardening-20261015-01/BROWNFIELD_REVIEW.md (Architecture Impact, Structured Depth Evidence)
- transparency_note: The full UR → PRD → SD → TP → QA → UAT approval sequence remains required; UX intent definition precedes PRD readiness. Depth covers the affected install, consent, provenance, location/migration and SessionStart boundaries only; no release, publication or unrelated cleanup is authorised.

## Structured Depth Evidence

- depth_policy_version: 1
- depth_facts_status: complete
- primary_reason_code: external_contract_depth
- decisive_full_depth_triggers: External or public contract (Claude install CLI outcome and SessionStart context); Authority, policy or security (automatic session-start check consent for Claude); Persistence, data or migration (irreversible retirement of package copies; possible relocation with migration); Release or cross-host (marketplace shared with Codex if relocated).
- rejected_alternative: structured_slice, because full-depth triggers are evidenced; quick_task and verified_change, because CLI, runtime-host and policy behaviour change.
- missing_or_conflicting_facts: none decisive for the route; loading behaviour across Claude Code versions, machine-readable listing, in-package detection signal and relocation target are assigned to SD.
- depth_evidence_refs: packages/cli/lib/host-adapters/claude/plugin.js; packages/cli/lib/installers/local-marketplace.js; packages/cli/lib/runtime-check-consent/service.js; scripts/sync-plugin-runtime.js; packages/core/lib/runtime/host-installation.js

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | pass | The approved UR defines one outcome: a Claude installation that verifiably reaches the loaded state or reports accurately. |
| authority_boundary | fail | Consent semantics for automatic Claude session-start checks change (`service.js` versus generated session check). |
| owner_consumer_coordination | fail | The marketplace and data root are shared with Codex; relocation needs coordinated Claude and Codex registration changes. |
| full_depth_impacts_absent | fail | Public install outcome, SessionStart context and host loading contract change. |
| migration_propagation_bounded | fail | Package copies are retired irreversibly; relocation would migrate existing installations and registrations. |
| failure_recovery_local | pass | Recovery stays with the existing transaction owner and its committed-marker recovery; no new persistent executor. |
| independently_acceptable | pass | Each scope item has its own acceptance signal and regression test; native confirmation is a separate evidence lane. |

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| Exact user-facing behaviour for refusal inside a packaged app, degraded results and drift notice wording | PRD | revise |
| Whether Claude sessions receive runtime facts (plugin enablement as consent) or status is reduced to what sessions receive | PRD | revise |
| Relocate the marketplace (target, Codex migration, uninstall) or rely on preflight plus reconciliation | SD | revise |
| Signal for in-package detection before a private copy exists | SD | revise |
| Supported Claude Code loading behaviours and how new content reaches sessions without reinstall; reconciliation with the cache-based drift comparison | SD | revise |
| Machine-readable plugin listing availability and fallback | SD | warn |
| Transaction boundary: which failures after commit are reported and how next-run cleanup is evidenced | SD | warn |

## Context Graph Impact

- context_graph_impact: link_only
- context_graph_refs: .agdf/control/CONTEXT_GRAPH.md (CG-PUBLIC-PLUGIN-DISTRIBUTION, CG-CREATE-AGDF-CLI-COMPOSITION)
- context_graph_required_action: link
- context_graph_gate_effect: warning
- context_graph_evidence: Existing nodes own plugin distribution and CLI composition. Link the delivered installer hardening at closeout; if SD relocates the marketplace, update CG-PUBLIC-PLUGIN-DISTRIBUTION instead of creating a node.

## Next Permissible Step

- next_allowed_action: Record this review and the structured_delivery route, then run ux-intent-definition and draft the PRD.
- forbidden_until_then: PRD approval requests, SD, TP, implementation-preparation Brownfield Analysis, code changes beyond the existing candidate commit, QA and release.

## Quality Outlook

- quality_outlook: Candidate `42c42850` has local green suites but no review. Windows-specific behaviour (MSIX virtualization, file locking, in-place loading) can only be simulated locally; native confirmation on Windows with Claude Desktop and Claude Code is required before UAT. Codex regression evidence is required if the marketplace is relocated.
