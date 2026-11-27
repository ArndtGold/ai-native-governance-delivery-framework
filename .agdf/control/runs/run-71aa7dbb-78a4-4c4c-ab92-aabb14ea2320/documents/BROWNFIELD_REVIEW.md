# Brownfield Review: Single Core reader for the companion event journal

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: `done`

## Run

- run_id: run-71aa7dbb-78a4-4c4c-ab92-aabb14ea2320
- related_ur: .agdf/control/runs/run-71aa7dbb-78a4-4c4c-ab92-aabb14ea2320/documents/UR.md (approved, sha256:c1afd327459838910850c4632e96db339c664b9a3f755586d93a1657079abd60)
- current_gate: Brownfield Review
- reviewer: Claude (agent, brownfield-analysis post_ur_review)
- reviewed_at: 2026-11-27

## Objective

Size and route the approved UR: make the Core journal reader the single reader of the companion event journal, extend the read-only `run-view` command with the event history of the project root, switch the Claude companion's `pollEvents` to it, align the deliberate event semantics of the Codex card and the Claude pane, and add a contract test over shared journal fixtures. Work is stacked on branch `codex/companion-run-events` (PR #85, head b10fec4a).

## UI / UX Impact Routing

- delivery_context: `brownfield`
- ui_ux_impact: `low`
- ui_ux_impact_reason: Two bounded visible changes adopt semantics that already exist and are named in the UR: the Codex companion card hides unconfirmed `approval_recorded`/`run_completed` events and keeps still-uncertain `effect_unknown`/`recovery_required` events visible (the Claude companion's existing CONFIRMED_KINDS/STICKY_KINDS rules, CR findings B4 and B7), and the Claude pane prefixes events of an earlier day with their date (the Codex card's existing `eventTimeText`). No primary action, working mode, effective state, blocker, activation or recovery behaviour changes; the Claude toasts, cursor and pane semantics stay as they are.
- ux_intent_definition_required: `no`
- ux_intent_definition_result: `not_applicable`

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | Companion event semantics: Claude `events.mjs` (`CONFIRMED_KINDS`, `STICKY_KINDS`, `isConfirmed`, `isStillUncertain`, `unseenEvents`), Codex `CompanionCard.tsx` (`eventTimeText`, 5 newest items) | `plugins/agdf/host-templates/claude/companion/events.mjs`; `packages/control-ui/src/mcp/CompanionCard.tsx:21-29,74-80,190-196` on b10fec4a | `low` |
| Source of truth | Journal writer and line format `companion-event/1`: `packages/core/lib/companion/journal.js` (`appendJournalEvent`, `JOURNAL_LIMIT_BYTES` 256 KiB, one rotation file), `packages/core/lib/companion/events.js` (`parseEventLines`, `validEvent`, `EVENT_KINDS`); unchanged by this run | `journal.js:14-18,79-98`; `events.js` `parseEventLines`, `sameRoot` | `none` |
| Runtime path | Core reader `packages/core/lib/companion/read-cockpit-events.js` (`readCockpitEvents(dataRoot, projectRoot, runId)`, read bound `2 * JOURNAL_LIMIT_BYTES`, O_NOFOLLOW/identity check, stat-signature cache), used by `packages/core/lib/control-inspect/cockpit-session.js:311-313`; run view `packages/core/lib/companion/run-view.js` `readRunView` behind CLI `run-view` (`packages/cli/lib/cli/project-read-command.js` `executeRunView`, `parse-args.js:368-371,467`, `command-registry.js:37`); Claude companion reads the journal itself in `register.mjs` `pollEvents` (lines 194-246 on b10fec4a) and calls `run-view` through `$.process` in `run-state.mjs` `readSnapshot` | files as cited; measured `run-view` duration on this repository about 1.6 s | `medium` |
| UI / UX | Claude pane lines `view.mjs` `eventFields` (`clockText` only), toasts in `register.mjs`; Codex card events section | `view.mjs:270-277`; `CompanionCard.tsx:190-196` | `low` |
| Persistence / data | No durable state changes. The journal remains a notification channel below the plugin data root; nothing is written under `.agdf/control`. The Claude companion's persisted choices (`persistence.mjs`) are untouched | `journal.js` header comment; `persistence.mjs` | `none` |
| Tests / QA | `packages/core/test/companion-events-test.js`, `packages/core/test/cockpit-session-test.js`, `packages/core/test/companion-run-view-test.js`, `packages/cli/scripts/claude-companion-test.js` (event-kind parity test), `claude-companion-adapter-test.js` (journal polling, run-view argv), `claude-companion-parity-test.js`, control-ui `test/companion-reading.test.tsx`, `test/compact.test.tsx` | `git grep run-view` and `ls packages/core/test` on this branch | `medium` |
| Release / operations | Changes under `plugins/agdf` trigger the contract text change chain (Copilot payload baseline, eval fingerprints, `npm run build:prepare`, `npm run compatibility:record`); runtime and host templates ship in the same plugin build | memory of earlier runs; `plugins/agdf/meta/copilot-payload-baseline.json` touched by PR #85 | `low` |

## Architecture Impact

- architecture_relevance: `relevant`
- architecture_impact: `low`
- architecture_reason: The read path of one module family changes owner: the Claude host template stops reading the journal and consumes the Core reader through the existing `run-view` process boundary, which gains an optional input (the companion data root) and an additive output field (the root's event history). The runtime/host contract between the Claude companion template and the plugin runtime and the documented `run-view` interface (release notes 0.31.0) are therefore touched. The change is additive and backward compatible: a `run-view` call without the new input returns today's output; a view without the new field reads as "no events". Template and runtime ship in the same plugin build, so there is no independent consumer or version skew to coordinate.
- architecture_evidence: `docs/releases/0.31.0.md:13-16` documents `run-view --dir <path> --json --language de [--run <id>]`; consumers found by `git grep run-view`: only the Claude companion templates and tests in this repository; `snapshotFromRunView` in `run-state.mjs` already tolerates absent optional fields (`planned`).
- architecture_missing_evidence: `none` for routing; the SD owns the exact input form (argument versus environment variable), the output bounds, the event limit and whether the additive field keeps `run-view/1`.
- architecture_next_owner_and_action: SD (sd-definition) decides the `run-view` input/output contract, the Core reader signature and limits, and the Codex card selection rule; PRD states the observable behaviour.

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| problem: parallel journal readers (Claude `parseJournal`/`normalizeRoot`/`sameRoot`/`JOURNAL_READ_LIMIT`, Core `readCockpitEvents`) already drifted once (256 KiB vs 512 KiB bound) | `events.mjs` vs `read-cockpit-events.js`; PR #85 review fix 4bceb634 | `revise` | This run removes the Claude copy; reuse and extend `read-cockpit-events.js` instead of a third reader |
| Core `events.js` `sameRoot` (string normalization) is a third root matcher next to the Core reader's realpath match | `events.js` `sameRoot`; `git grep sameRoot` | `warn` | SD checks remaining callers; the reader keeps one matcher; unused copies are removed only where nothing else needs them |
| Event selection rules (confirmed and sticky kinds) live only in the Claude template; the Codex card would need the same rule | `events.mjs` `isConfirmed`, `isStillUncertain`; `CompanionCard.tsx` already imports `eventText` from the Claude template | `warn` | Reuse the existing template functions from the Codex card (established import path) instead of re-implementing them in TSX |
| trade-off: `run-view` per journal change instead of a file read (also for writes of other roots) | measured about 1.6 s; owner decision 2026-11-27 | `none` | Accepted by the owner in the routing question of 2026-11-27; no debt retained (cost is runtime, not structure) |

## Mode / Slice Decision

- decision: `structured_slice`
- required_next_gate: `PRD`
- scope_reason: bounded_structured_slice. One coherent outcome (a single journal reader feeding both companions) inside the companion module family. Compact Delivery (`quick_task`) is not eligible: the work changes the runtime/host contract of `run-view` (new optional input, additive output), moves a read path across the host/runtime boundary and changes visible behaviour of two hosts, so design decisions (input form, limits, schema version, selection rule) must be fixed before implementation. Verified Change is not eligible: more than one canonical owner (Core reader, CLI command, Claude template, Codex UI) and a CLI interface change. No full-depth trigger applies (see Structured Depth Evidence). Rejected alternative: structured_delivery, because the `run-view` change is additive and backward compatible with consumers only in this repository and the same plugin build, there is no persistence, authority or rollout boundary, and failure stays local (events unavailable, as today).
- evidence: this review; UR sections 3, 4 and 7; files cited in the Existing-System View on branch `agdf/companion-journal-reader` (base b10fec4a).
- transparency_note: PRD, SD and TP are kept at slice depth: PRD states the observable behaviour of both companions and the acceptance signals; SD fixes the reader signature, the `run-view` input/output contract and bounds, the Claude poll flow and the Codex selection rule; TP lists tasks and tests including the contract-text change chain.

## Structured Depth Evidence

- depth_policy_version: `1`
- depth_facts_status: `complete`
- primary_reason_code: bounded_structured_slice
- decisive_full_depth_triggers: none
- rejected_alternative: structured_delivery (no authority, runtime-beyond-slice, persistence, breaking external contract, release or unbounded coordination trigger); quick_task and verified_change (ineligible as stated in the scope reason)
- missing_or_conflicting_facts: none
- depth_evidence_refs: UR.md sections 3-7; `packages/core/lib/companion/read-cockpit-events.js`; `packages/core/lib/companion/run-view.js`; `packages/cli/lib/cli/project-read-command.js`; `plugins/agdf/host-templates/claude/companion/register.mjs`, `events.mjs`, `run-state.mjs`, `view.mjs`; `packages/control-ui/src/mcp/CompanionCard.tsx`; `docs/releases/0.31.0.md`

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | `pass` | One outcome: the journal is parsed only in Core and both companions show the same events for the same journal; acceptance boundary in UR section 5 |
| authority_boundary | `pass` | Read-only paths only (`run-view` writes nothing, `readCockpitEvents` opens read-only with O_NOFOLLOW); the journal stays a notification channel, the run state stays the source of truth; no permission, trust or policy change |
| owner_consumer_coordination | `pass` | Owners: Core companion modules, CLI `run-view`, Claude host template, control-ui card, all in this repository; consumers of `run-view` are only the Claude companion templates and tests; no shared external cutover |
| full_depth_impacts_absent | `pass` | Runtime: poll flow changes inside the companion slice; persistence: none; external API/public CLI: optional input and additive output field, backward compatible, documented interface keeps working; release/cross-host: both hosts ship in one plugin build, no separate rollout |
| migration_propagation_bounded | `pass` | No data migration; propagation through the existing build chain (`npm run build:prepare`, payload baseline, eval fingerprints, `npm run compatibility:record`), verified by `npm run compatibility:check` |
| failure_recovery_local | `pass` | A failed or event-less `run-view` read shows "events unavailable" or no events, as a failed journal read does today; reverting the branch restores the previous readers |
| independently_acceptable | `pass` | Acceptance by the new contract test and the existing suites named in UR section 5; no hidden prerequisite (PR #84/#85 merge order is a delivery note, not a prerequisite of this outcome) |

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| How does `run-view` learn the companion data root (explicit argument or environment variable), and what happens without it? | SD | `revise` |
| Does the additive `events` field keep schema `run-view/1`? | SD | `warn` |
| How many events and which fields (run id, review facts, outcome) does the root history carry, and with which byte bounds for `run-view` output and the Cockpit response? | SD | `revise` |
| How does the Claude poll keep its cursor semantics (rotation fallback by time) with a root-filtered list instead of the whole file? | SD | `warn` |
| Which run-detail fields confirm `approval_recorded`/`run_completed` and resolve `effect_unknown`/`recovery_required` in the Codex card? | SD | `revise` |
| Exact visible date format for events of an earlier day in the Claude pane (same as Codex card) | PRD | `warn` |

## Context Graph Impact

- context_graph_impact: `none`
- context_graph_refs: `.agdf/control/CONTEXT_GRAPH.md` has no companion, journal or run-view node
- context_graph_required_action: `none`
- context_graph_gate_effect: `none`
- context_graph_evidence: `grep -i "companion|journal|run-view" .agdf/control/CONTEXT_GRAPH.md` returns no match

## Next Permissible Step

- next_allowed_action: Draft the PRD at slice depth through prd-definition and present it for `Approval: PRD`.
- forbidden_until_then: SD, TP and any source change for this run.

## Quality Outlook

- quality_outlook: Main risks are behavioural regressions in the Claude companion poll loop (cursor, toasts, confirmation) and Windows root matching; both are covered by the planned contract test and the existing adapter tests. The contract text change chain under `plugins/agdf` must be completed before QA.
