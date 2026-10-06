# UX Intent Definition: Embedded AGDF Cockpit for Codex

- run_id: agdf-cockpit-mcp-app-20261005-01
- decision: ready
- blocking_reason: none
- primary_user_intent: Understand a selected delivery run using its maintained evidence and ask Codex a question without manually locating, copying and assigning sources.
- success_signal: In an actual Codex session the user opens the cockpit, selects a run, reads an artefact and explicitly related graph entries, then asks a source-bound question; the resulting chat context visibly identifies the same run and sources.
- primary_decision_or_action: Deliberately use the inspected selection for a contextual question. Reading and selection never approve a gate or authorize implementation.
- working_modes: compact entry; run exploration; artefact/context inspection; contextual question; browser fallback.
- affected_outputs: PRD behavior and acceptance criteria; later SD/TP mapping and visible evidence.
- evidence: Approved UR sections 1–5; BROWNFIELD_REVIEW.md; existing packages/control-ui/src/App.tsx, state.ts, api.ts and packages/core/lib/control-inspect/cockpit.js inspected in Brownfield Review; .agdf/control/CONTEXT_GRAPH.md maintained nodes.
- missing_evidence: Actual Codex host bridge, rendering and question delivery remain future implementation/verification obligations, not observed results.
- open_product_questions: none preventing PRD drafting; the behavior below proposes the bounded interpretation of the approved first journey. Detailed transport, capacity limits and local setup remain SD/TP decisions.
- required_next_step: Register this analytical result, update Brownfield routing evidence to ready, then prepare the PRD through prd-definition.

This is analytical input. Its proposed behavior becomes product authority only through the approved PRD. It contains no gate decision, approval or technical design prescription.

## Working Modes and State

| Mode | Effective state | Visible state types | Effective state authority | Primary state presentation owner |
|---|---|---|---|---|
| Compact entry | An explicitly opened local cockpit; no implicit selected delivery run | Ready to open; loading; unsupported; failed | Canonical project identity plus negotiated host capability | Compact app entry explains availability and one next action |
| Run exploration | Selected project/run and observed canonical revision; selecting does not authorize work | Loading; current; partial; invalid; missing; stale | Core evaluation and canonical run files | Cockpit run view distinguishes objective, evaluated status, persisted statements and provenance |
| Artefact/context inspection | Current inspected document and explicitly registered graph relationships for that run | Available; no references; unresolved reference; unsupported; missing; stale | Canonical artefact registration, run context_graph_refs and maintained graph content | Cockpit source view explains content, identity and availability |
| Contextual question | A deliberate, bounded selection checked again before it is used in chat | Preparing; ready; delivered; changed; unsupported; failed; delivery uncertain | Canonical sources for content and freshness; host acknowledgement only for transport; existing control validators for any later delivery action | Cockpit explains transfer outcome; Codex chat names sources and answers with uncertainty |
| Browser fallback | Existing local read workflow when embedded capability is unavailable | Browser path available; embedded path unavailable | Existing Core reads and browser session contract | Existing browser cockpit and explicit host limitation message |

## Activation Paths

- The user explicitly opens the cockpit for this project. Opening does not infer a run from directory, recency or agent activity.
- A compact entry offers at most two primary actions. Detailed navigation uses the supported larger surface; no nested dashboard or deep navigation is required in a narrow inline card.
- The user selects a run, then an artefact or explicitly related graph entry. Missing references remain inspectable as unavailable references; no automatic relationship inference fills the gap.
- The deliberate contextual-question action uses the visible selection. It may submit a neutral review question to the host conversation when supported; the existing Codex composer remains the place for custom questions. No second general-purpose chat composer is required inside the app.
- Closing/deactivating the app ends its temporary view session. A new instance does not silently restore a previous selection from durable browser state.

## Blockers and Recovery

| Blocker | Visible explanation | Permitted next action |
|---|---|---|
| No control tree or usable run | State is absent or invalid, with known source identity | Reload when corrected outside the app; remain read-only |
| Graph references empty | No explicit related context has been registered | Continue with the available artefact; do not imply graph completeness |
| Graph entry/reference missing | Name the unresolved reference and its source | Exclude unavailable content from a disclosed selection or refresh after external correction |
| Source changed, run removed or read failed | Previous data remains explicitly stale/unavailable | Deliberate reload/retry; reselect as necessary; block transfer of unvalidated data |
| Selection exceeds context capacity | Explain which selection cannot be transferred in full | Choose a smaller selection; no silent truncation or successful partial transfer |
| Host lacks app/context/message capability | Name the unsupported part of the journey | Existing browser fallback for reading; contextual handoff remains unverified/unavailable |
| Context update/message rejected or connection lost | Transfer failed or outcome uncertain | Retry the confirmed safe step; never claim delivery or invisibly resend a question |
| User selects another run while a transfer is pending | Pending prior selection is cancelled or its completion discarded | Confirm the new current selection before another question; no late cross-run result may become current |

## Relevant State Transitions

1. Open → loading → current inventory or explicit error with retry.
2. Select run → loading → current run; obsolete requests cannot replace the new view.
3. Select source → current source with provenance, or explicit unavailable state.
4. Observe source change → stale; retain previous content for orientation but disable contextual transfer until refreshed.
5. Choose contextual question → preparing → checked selection → acknowledged transfer/question, or explicit failure/uncertain outcome.
6. Switch run/source, refresh or deactivate → previously published selection is visibly superseded or invalidated before a new handoff. The app cannot erase earlier chat messages; historical chat content must not be advertised as current context. A later agent action must revalidate sources and delivery binding independently.
7. Missing host capability → honest limitation and existing browser path; this is not success for embedded acceptance.

## Proposed PRD Acceptance Criteria

- A real Codex user completes the approved journey with an identifiable local project and no manual copy/paste of source content.
- Compact entry, larger exploration, focus, back navigation, reading and supported responsive surfaces are usable; no invented host pixel width is required.
- Objective, status, revision and the next allowed action come from canonical reads and stay distinct from persisted claims, approvals and UI selection.
- Explicit graph relationships expose source identity and missing references. An empty graph selection never manufactures related context.
- Before contextual use, the sources are checked again and the user can see what is included. Unavailable/oversized content is disclosed and not silently passed as complete.
- Run/source changes, races, refresh and failure cannot let an old response silently become the current selection or current chat context.
- Transfer and question delivery outcomes are visible. Failure offers a safe next action; uncertain message delivery does not trigger automatic duplicate questions.
- App operations retain the read boundary and never record an approval, invoke implementation or change canonical control state. A subsequent delivery request routes through existing independent checks.
- Actual Codex evidence is required for embedded completion; protocol fixtures and browser evidence are separate supporting lanes.
