# Brownfield Review: AGDF Companion in the Claude Projection of the AGDF Plugin

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: `done`

## Run

- run_id: `agdf-begleiter-companion-20261025-01`
- related_ur: `.agdf/control/artefacts/agdf-begleiter-companion-20261025-01/UR.md` (approved, revision 5)
- current_gate: Brownfield Review
- reviewer: Claude
- reviewed_at: 2026-10-25 (reassessed after the SD source revision of 2026-10-25; routing unchanged)

## Objective

Size and route the approved UR: ship an opt-in companion panel (Claude Code mod) inside the AGDF plugin, wired only through the Claude manifest, reading `RUN_STATE.md` read-only, with failures isolated from AGDF control functions and no effect on the Codex and Copilot payloads.

## UI / UX Impact Routing

- delivery_context: `brownfield`
- ui_ux_impact: `medium`
- ui_ux_impact_reason: The change adds a new visible status surface with its own visible state types (four figure states, gate bar), an opt-in activation and a display-only run assignment that the user can override. Panel language policy, objective presentation and the meaning of "the run of this session" are user-facing semantics still to be defined.
- ux_intent_definition_required: `yes`
- ux_intent_definition_result: `ready`

The inputs for UX intent definition are complete: the approved UR, the prototype seen in the Claude desktop app on 2026-10-25 and the user's panel screenshot with five findings. UX intent definition is the next internal step before PRD and must settle: activation wording and placement, state labels and reasons, language policy for run-derived texts, objective expansion and the user-visible behaviour of run assignment.

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | Approved UR; `plugins/agdf/meta/contracts/interaction.md`; `plugins/agdf/meta/contracts/task-target-resolution.md` | The companion is display-only. It must not become an approval, continuation or target-selection surface; target authority and approval authority stay with the existing owners. | `medium` |
| Source of truth | `RUN_STATE.md` written by `packages/core/lib/control-state/` (canonical writers `run-create`, `run-step`, `run-update`, `run-approve`); canonical readers under `packages/core/lib/control-read/` and `packages/core/lib/control-inspect/` | The prototype re-parses `RUN_STATE.md` (Run Meta fields, Current Control State table, Approvals table). A Claude mod runs without Node and cannot import the core readers, so a second reader of the format would exist unless SD selects a canonical projection. | `medium` |
| Runtime path | Claude manifest projection `createClaudePluginManifest` in `scripts/public-plugin/manifest.js:84-96` (runtime profile adds `mcpServers` from `definition.claude.mcpServers`); host section `claude` in `plugins/agdf/meta/agdf-plugin.definition.json`; integrity check `plugins/agdf/scripts/check-runtime-integrity.mjs:1333-1359` | The Claude manifest is a canonical projection checked byte-for-byte (`packages/cli/scripts/public-plugin-test.js:79-80`). A companion declaration must be added to the same projection and integrity owner, runtime profile only (source profile declares no runtime components, line 1344-1345). | `medium` |
| UI / UX | No existing companion surface. Related: `packages/control-ui/` (React cockpit, MCP app) and the canonical status-card renderer in `packages/core/lib/interaction-presentation.js` with locale packs `plugins/agdf/meta/agdf-interaction-locales.json` (`en`, `de`) | The cockpit is a separate MCP-app surface for explicit run inspection; the companion is a glanceable per-session panel. The locale packs and status-card fields are the existing owner for localized operational labels. | `medium` |
| Persistence / data | `.agdf/control/` unchanged and read-only; the remembered run selection would live in Claude's mod store (`$.store`) | No control schema change or migration. A per-project selection in host storage is new host-owned state; its removal on uninstall must be shown. | `low` |
| Tests / QA | Node-based repository verification (`scripts/verify-ci.mjs`, `npm run verify:ci`); no Claude CLI in CI (`.github/workflows/*` install none); prototype tests use `claude plugin test` and the `claude-code/testing` kit | Companion logic tests must run in the existing Node verification; `claude plugin validate/test` is available only where Claude Code is installed. TypeScript exists only in `packages/control-ui` and `pages`. | `medium` |
| Release / operations | Shared plugin folder `plugins/agdf` used by both `.claude-plugin/plugin.json` and `.codex-plugin/plugin.json` (installed marketplace: both `.claude-plugin/marketplace.json` and `.agents/plugins/marketplace.json` point to `./plugins/agdf`); provenance `digestDirectory` in `packages/core/lib/runtime/plugin-provenance.js`; payload budget owner `scripts/payload-budget.js` and `docs/maintenance/payload-budget-history.md`; Copilot inventory `scripts/public-plugin/copilot-profile.js`; `hostSupport` qualification targets Claude and Codex | Companion files change the runtime payload and its provenance digest for both qualified hosts and require refreshed payload, fingerprint and compatibility evidence. The Copilot profile is an explicit mapped inventory: unmapped files throw `AGDF_COPILOT_PAYLOAD_UNMAPPED`, so the companion stays outside unless mapped. | `high` |

## Architecture Impact

- architecture_relevance: `relevant`
- architecture_impact: `medium`
- architecture_reason: The change adds a host-specific runtime component (a Claude hooks module running in Claude's mod worker) to the distributed AGDF plugin, extends the Claude manifest projection and its integrity contract, changes the shared runtime payload and provenance of both qualified hosts, and introduces a second consumer of the `RUN_STATE.md` format outside the core readers.
- architecture_evidence: `scripts/public-plugin/manifest.js:84-96`; `plugins/agdf/meta/agdf-plugin.definition.json` (`claude`, `codex.hooks`, `copilot` sections); `plugins/agdf/scripts/check-runtime-integrity.mjs:1330` (Codex hook declaration) and `:1333-1359` (Claude manifest); `packages/cli/scripts/public-plugin-test.js:79-80`; `packages/core/lib/runtime/plugin-provenance.js` (`digestDirectory`); `scripts/public-plugin/copilot-profile.js:30-38,90-130`; installed marketplace layout under the AGDF data root; Claude Code plugin manifest reference (plugin `hooks` field merges with `hooks/hooks.json`; mods load from a hooks file's `modules`); prototype evidence of 2026-10-25.
- architecture_missing_evidence: (1) Whether a hooks file referenced only from `.claude-plugin/plugin.json` may declare `modules`, so that the shared `hooks/hooks.json` stays unchanged — owner: SD with an early host probe in TP. (2) Whether a failing or incompatible companion module leaves the AGDF SessionStart hook, MCP server and skills unaffected — owner: SD and host probe. (3) Canonical status source for the companion (core projection versus a contract-tested second reader) — owner: SD.
- architecture_next_owner_and_action: The SD author decides the Claude-only wiring (definition field, manifest projection, integrity check), the companion's status source and its parity tests, the opt-in persistence, the failure-isolation proof, the payload placement with provenance and budget review, and the test split between Node verification and native Claude evidence.

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| unresolved: Claude-only wiring of a hooks module | Claude manifest supports a `hooks` field that merges with `hooks/hooks.json`; the shared `hooks/hooks.json` also feeds Codex (`codex.hooks: hooks/hooks.json`) and Codex hook trust is digest-bound; `plugins/agdf/meta/agdf-plugin.definition.json` ships in the Copilot payload (`scripts/sync-plugin-runtime.js:219`, generated Copilot `meta/`), so it cannot carry the declaration (Brownfield Analysis BA-F01, SD source revision 2026-10-25) | warn | SD: declare the companion in `createClaudePluginManifest` (runtime profile) from a Claude companion descriptor under `plugins/agdf/host-templates/claude/companion/`; keep the shared definition, `hooks/hooks.json` and the Copilot payload unchanged; extend `check-runtime-integrity.mjs`; TP: early host probe that the module loads from the manifest-referenced file |
| problem: second reader of `RUN_STATE.md` outside core | Prototype parser `hooks/run-state.ts`; canonical readers in `packages/core/lib/control-read/`; a mod has no Node and cannot import core | warn | SD: choose a canonical status source (for example the existing read projections exposed through the plugin's MCP tools, or a format parser bound by contract tests against fixtures produced by the canonical writers); no undocumented second format interpretation |
| problem: status labels outside the locale owner | Prototype hard-codes German labels; locale packs `plugins/agdf/meta/agdf-interaction-locales.json` and status-card fields already localize operational values | warn | UX intent / PRD: define the language policy; SD: reuse the existing locale owner rather than a second label table where possible |
| trade-off risk: shared payload growth | Companion files enter `plugins/agdf` used by Claude and Codex; provenance digests and payload budget change for both | warn | SD: limit the companion to the runtime profile, record budget growth through `scripts/payload-budget.js` with a reason, keep the Copilot inventory unmapped for companion files |
| unresolved: verification without Claude CLI | No Claude Code in CI; `claude plugin validate/test` need the host | warn | SD/TP: run parsing, state rules, assignment and SVG/text rendering as Node tests in `verify:ci`; keep `claude plugin validate/test` and the desktop check as native evidence, labelled separately |
| problem: overlap with the cockpit | `packages/control-ui` cockpit inspects runs explicitly through MCP apps | none | PRD: state the boundary (glanceable per-session companion versus explicit inspection cockpit); no shared state or second selection authority |

No retained debt is accepted. All findings are scoped design obligations with named owners; none prevents the sizing route.

## Mode / Slice Decision

- decision: structured_delivery
- required_next_gate: PRD
- scope_reason: release_cross_host_depth. The companion enters the shared AGDF plugin payload consumed by both qualified hosts (Claude and Codex): it changes the runtime payload and provenance digests, the Claude manifest projection and its integrity contract, payload budgets and compatibility evidence, and it adds a host runtime component on an early-access host API. structured_slice is rejected because full_depth_impacts_absent fails and failure_recovery_local is not yet evidenced. quick_task and verified_change fail on the new user capability, the manifest contract and the cross-host release impact.
- evidence: This review; approved UR revision 5; scripts/public-plugin/manifest.js:84-96; plugins/agdf/scripts/check-runtime-integrity.mjs:1330-1359; packages/core/lib/runtime/plugin-provenance.js; scripts/public-plugin/copilot-profile.js; plugins/agdf/meta/agdf-plugin.definition.json; installed AGDF marketplace layout; prototype and native observations of 2026-10-25.
- transparency_note: Full depth follows from the shared cross-host payload, the Claude manifest contract and the early-access host runtime, not from file count. PRD, SD and TP stay limited to the Claude companion, its opt-in, failure isolation and honest host evidence; Codex, Copilot and publication remain excluded.

## Structured Depth Evidence

- depth_policy_version: 1
- depth_facts_status: complete
- primary_reason_code: release_cross_host_depth
- decisive_full_depth_triggers: Release, deployment or cross-host: the companion changes the distributed plugin payload and provenance shared by the qualified Claude and Codex hosts and requires refreshed payload, fingerprint and compatibility evidence. Secondary: external contract (the Claude plugin manifest projection and its integrity contract gain a hooks-module declaration) and architecture/runtime (a new host-executed module whose failure must stay isolated). No gate-policy change and no control-data migration is proposed.
- rejected_alternative: quick_task and verified_change fail on the new user capability, the manifest contract and the cross-host payload; structured_slice fails full_depth_impacts_absent.
- missing_or_conflicting_facts: None for the depth decision. The loadability of a manifest-referenced hooks module, the failure-isolation behaviour and the canonical status source are later evidence obligations (SD, TP probe) and do not erase the evidenced cross-host trigger.
- depth_evidence_refs: Approved UR sections 3 and 5; scripts/public-plugin/manifest.js:84-96; plugins/agdf/scripts/check-runtime-integrity.mjs:1330,1333-1359; packages/cli/scripts/public-plugin-test.js:79-80; packages/core/lib/runtime/plugin-provenance.js; scripts/public-plugin/copilot-profile.js:30-38,90-130; plugins/agdf/meta/agdf-plugin.definition.json; https://code.claude.com/docs/en/plugins/manifest-reference.

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | pass | One outcome: an opt-in, display-only companion panel for the session's run in Claude (UR acceptance 1, 4-6) |
| authority_boundary | pass | Read-only display; no approval, continuation or target selection; the run assignment is display-only and binds no delivery (UR scope and non-goals) |
| owner_consumer_coordination | pass | Owners identified inside the repository: plugin definition, manifest projection, integrity check, provenance, payload budget, Copilot inventory, compatibility evidence; no shared external cutover |
| full_depth_impacts_absent | fail | Shared runtime payload and provenance of both qualified hosts change; Claude manifest contract changes; host runtime on an early-access API |
| migration_propagation_bounded | pass | No control-data migration; propagation through the existing generators and reinstall; Codex and Copilot manifests unchanged |
| failure_recovery_local | unknown | Failure isolation of a host-executed module from the AGDF hook, MCP server and skills is not yet evidenced; owner SD with TP host probe |
| independently_acceptable | pass | The companion has its own acceptance signals and depends on no other run or publication |

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| Activation wording and mechanism (slash command, plugin setting or both) and how the choice persists | UX Intent / PRD | warn |
| Language policy for run-derived texts in the panel; use of the existing locale packs and status-card fields | UX Intent / PRD | warn |
| User-visible meaning of "the run of this session", tie-breaks with several sessions, and the selection override | UX Intent / PRD | warn |
| Boundary to the cockpit and to the status card in chat | PRD | warn |
| Claude-only wiring through definition, manifest projection and integrity check; shared `hooks/hooks.json` unchanged | SD | warn |
| Canonical status source and parity tests versus a contract-tested parser | SD | warn |
| Payload placement, provenance, budget review, Copilot inventory and compatibility evidence refresh | SD | warn |
| Early host probe: module loads from the manifest-referenced file in the desktop app and terminal; failure isolation; byte-identical control state | TP | warn |

## Context Graph Impact

- context_graph_impact: update_existing_node
- context_graph_refs: .agdf/control/CONTEXT_GRAPH.md#CG-PUBLIC-PLUGIN-DISTRIBUTION; .agdf/control/CONTEXT_GRAPH.md#CG-RUN-STATUS-CARD
- context_graph_required_action: update
- context_graph_gate_effect: warning
- context_graph_evidence: The plugin distribution node will gain a Claude-only runtime component in the shared payload; the run status node gains a second, glanceable status consumer. Curate both only after implementation and host evidence, before clean closeout. No graph change was made by this review.

## Next Permissible Step

- next_allowed_action: Run UX intent definition for the companion's user-facing semantics, then draft the PRD.
- forbidden_until_then: SD, TP, implementation, payload or manifest changes, and any approval request beyond the PRD sequence.

## Quality Outlook

- quality_outlook: Medium risk. The main quality levers are an honest host probe for module loading and failure isolation early in TP, a canonical or contract-tested status source, and keeping Codex and Copilot payloads provably unaffected.
