# PRD: Guided AGDF UX Next Round

Status: approved
Gate: PRD
Gate approval: `Approval: PRD` provided on 2026-07-15
Based on: `.agdf/control/artefacts/agdf-ux-next-round/UR.md`; `.agdf/control/artefacts/agdf-ux-next-round/BROWNFIELD_REVIEW.md`
Date: 2026-07-15
Owner: AGDF

## 1. Product Scope

Deliver one consistent guided UX layer for four existing AGDF presentation concerns:

1. When several active runs are plausible, present an explicit human-readable run choice before
   the agent asks for a gate approval or continues work.
2. Make first contact explain the immediate next action and the proportional path before exposing
   detailed governance terminology or the full skill catalogue.
3. Group skills by user intent: `Start here`, `used automatically`, and `optional`.
4. Make approval delivery, native-control fallback and release-version evidence explicitly
   understandable: an eligible approval must be presented as one deliberate decision step; if a
   native control cannot be used, state why text is required and distinguish installed/expected
   version state from historical screenshots.

The work extends the canonical control-state presentation. It must not introduce a separate run
selector, approval authority, state store, skill registry or host-owned UI replacement.

## 2. Functional Requirements

### 2.1 Ambiguous run selection

- A primary blocked or clarification interaction for multiple active runs names the situation in
  plain language and offers only evidenced candidates.
- Each candidate shows a deterministic human title, `run_id` as secondary context, current gate
  and one short next-action summary.
- Candidate title, summary and ordering are deterministic, localized and display-safe. They must
  not expose raw Objective text, sensitive artefact content or a stale/closed run as selectable.
- Candidates have a stable accessible name and remain distinguishable when titles collide or are
  truncated. The PRD's SD must define bounded list behavior, deterministic ordering and the
  overflow path for many active runs.
- Selecting a candidate is scope clarification, not gate approval. The canonical gate evaluation
  must rerun for that selected `run_id` before any next interaction or persistence.
- If a host cannot present a safe selection control, the exact-text path tells the user how to
  select a run without implying that an arbitrary reply is approval.
- Machine JSON, `--run`, `AGDF_RUN_ID`, no-auto-selection behavior and ambiguity fail-closed
  semantics remain unchanged.

### 2.2 First-contact orientation

- The first suggested AGDF interaction leads with a short, user-language explanation of what
  AGDF will inspect, what it will decide next and whether governance is proportionate.
- It then routes to the existing suitability assessment or scope clarification path; it must not
  imply implementation permission.
- Deeper concepts such as UR, Brownfield Review, Mode/Slice Decision and later skills appear only
  when the user needs them for the next action.
- A read-only question, status request or suitability assessment must remain advisory. First
  contact must not manufacture a governed delivery request, ask for approval or take ownership of
  an unrelated active run merely because AGDF is installed.

### 2.3 Skill discovery

- Skill metadata or a derived projection classifies the canonical nine skills into `Start here`,
  `used automatically`, and `optional` without copying skill descriptions into another owner.
- `gate-check` is the visible starting action for governed change intent or unclear next steps.
- Automatic skills are described as agent-routed workflow controls, not manual prerequisites.
- Optional skills remain discoverable with their existing use case and boundary.
- Existing skill identifiers, families, routing and packaging remain stable.
- The SD must name the AGDF-owned surfaces where this grouping is guaranteed. A host-owned plugin
  catalogue that renders a flat skill list is an explicit capability limit, not a failed AGDF
  grouping promise; its nearby onboarding copy must route users to the supported grouping surface.

### 2.4 Fallback and version evidence

- A ready gate is a user decision, not merely a line of agent guidance. Once the canonical
  evaluation confirms the selected run, current gate and durable artefact, AGDF must attempt the
  declared native decision control before rendering a textual approval path.
- When that native attempt cannot be invoked, rendered, applied or safely awaited, the
  user-visible fallback states which of those conditions occurred, gives the exact approval value
  and says that the same gate authority remains in effect.
- AGDF must never silently replace an eligible native decision with bare text, nor make the user
  infer whether a missing button means an unready gate, host limitation or agent failure.
- The fallback is a distinct, observable presentation outcome. It is not a retry loop, simulated
  widget or a second authorization path.
- Every eligible approval interaction produces one non-authoritative interaction-attempt receipt:
  `presented`, `unavailable_before_invocation`, `attempted_not_applied`, or `unsafe_to_wait`.
  The receipt is correlation/evidence data only; it cannot select a run, authorize a gate or
  replace the canonical `RUN_STATE.md` and approval validation.
- A pre-artefact or otherwise invalid `Approval: <GateName>` is rejected as authority, but the
  user-visible response states the blocking prerequisite and commits to presenting the deliberate
  approval choice once that prerequisite is completed. It must not require the user to infer the
  missing follow-up action.
- After a recorded non-native outcome, an explicit user request to reopen the unchanged decision
  may create one new interaction attempt only after fresh canonical revalidation. This is a new,
  user-initiated interaction, not an automatic retry loop.
- Revise, decline, cancel, empty, timeout, invalid and stale outcomes each return a concise
  receipt that identifies the affected run and gate, confirms that no authority changed, and
  states the next useful action.
- Version-oriented copy distinguishes: installed version, expected/current package version and
  historical screenshot or observed integration evidence. Where a running host session cannot be
  verified, it is labelled `session version unverified`, not inferred from either package metadata
  or the plugin cache.
- Historical screenshots are never presented as current-version proof and retain their explicit
  evidence boundary.

## 3. Acceptance Criteria

- A multiple-active-run fixture renders only real active candidates with deterministic titles,
  `run_id`, gate and next-action context; it neither selects nor approves a run implicitly.
- Candidate selection is revalidated against the same run before the next gate interaction.
- Unsupported native selection yields concise localized exact-text guidance, not a retry loop or
  simulated widget.
- For every eligible gate-approval fixture, the evidence records exactly one of: native control
  invoked and presented; native control unavailable before invocation; native control attempted
  but not applied; or native control unsafe to await. Each non-native outcome includes localized
  reason, exact textual authorization value and the unchanged authority boundary.
- Fixtures prove that an interaction-attempt receipt is emitted for the selected run and expected
  gate, is never accepted as authority, and cannot advance the gate without an exact revalidated
  approval.
- No eligible gate-approval fixture renders a bare `Approval: <GateName>` request without either
  the native attempt or an explicit fallback explanation.
- A pre-artefact approval fixture explains the missing artefact, preserves no authorization and,
  after the artefact becomes ready, presents a fresh deliberate approval choice rather than
  requiring the user to rediscover the next action.
- A reopen fixture proves that a user can request one fresh, revalidated interaction after a
  non-native outcome without creating an automatic retry loop.
- Candidate fixtures cover title collisions, long titles, display-safe projection, deterministic
  ordering, a stale candidate and a list larger than the host's short-question affordance.
- The first-contact surface communicates the immediate next action in plain language and keeps
  suitability assessment advisory; read-only and status prompts do not create a gate interaction.
- The skill surface visibly groups all nine canonical skills exactly once; no duplicated routing
  table or changed identifiers are introduced on AGDF-owned surfaces. Host-owned flat catalogues
  disclose their presentation limit and point to the grouped surface.
- Every non-approval outcome returns a localized receipt with run, gate, unchanged authority and
  next action.
- Fallback copy states the reason and exact text value while preserving the existing approval
  validator and outcome semantics.
- Version and screenshot copy makes current package evidence and historical visual evidence
  distinguishable without changing the version source of truth, and does not claim a running
  session version without direct observation.
- Existing interaction-presentation, runtime-integrity, control-state, routing and package smoke
  tests pass, and new focused coverage protects the new presentation states.

## 4. Non-Goals

- No automatic selection of an active run.
- No new gate, approval syntax, mode, durable control-state model or custom host UI.
- No best-effort or silent degradation from native approval UX to an unexplained text instruction.
- No interaction-attempt receipt that becomes a second approval, scope-selection or persistence
  authority.
- No promise that AGDF can reorder or group a host-owned plugin catalogue it does not control.
- No alteration of JSON fields, CLI selector compatibility, exact approval validation, UAT or
  release authority.
- No removal of the full skill reference; progressive grouping is an additional presentation.
- No claim of live cross-surface evidence without an actual observed session.

## 5. Users And Roles

| User or role | Need |
|---|---|
| First-time user | Understand what AGDF will do now and whether it fits before encountering process detail. |
| Returning delivery owner | Select the correct active work line quickly without learning CLI syntax first. |
| Approver | See when a native control is unavailable and retain one unambiguous exact approval path. |
| Maintainer | Keep canonical state, metadata, generated assets and visible evidence aligned. |

## 6. Constraints

- `plugin/meta/agdf-runtime-contract.md` remains the authority for interaction and gate semantics.
- `plugin/skills/gate-check/SKILL.md` remains the agent-routing authority.
- `create-agdf/bin/create-agdf.js` remains the canonical CLI evaluation/projection path.
- Interaction-attempt receipts are derived, bounded and non-authoritative; their retention,
  redaction and test visibility must not leak user input or turn chat transport into durable state.
- All human-facing copy follows the configured chat locale; durable artefacts and runtime rules
  remain English.
- The implementation must extend the prior `agdf-human-decision-surface` and
  `native-gate-buttons-live` work rather than reopen or fork it.

## 7. Evidence Requirements

- Focused automated fixtures for ambiguity, candidate projection/revalidation, first-contact
  copy/grouping, fallback copy, non-approval receipts and version-evidence labels.
- Native-attempt evidence that distinguishes presentation, pre-invocation unavailability,
  non-application and unsafe waiting; live host evidence remains separate from deterministic
  fixture evidence.
- Runtime integrity, control-state, routing, package smoke and whitespace evidence.
- A recorded visual or live-session check for each supported surface that gains a visible change,
  with any unavailable surface explicitly marked as unverified.

## 8. Risks And Open Questions

- The SD must choose the canonical source and transport for candidate lists without making CLI
  reports diverge from agent-native presentation.
- The SD must decide whether grouping belongs in the plugin definition, a derived mapping or both,
  and how generated-surface integrity will detect drift.
- Native selection availability differs by host and must remain a presentation capability, not a
  new authority domain.
- The SD must define an observable native-attempt/fallback result so tests can distinguish a host
  limitation from an agent omission without turning that result into approval authority.
- The SD must specify the interaction identity, receipt lifetime, redaction rules and user-initiated
  reopen semantics without persisting transient host input as a second control record.
- The SD must establish a safe candidate-title projection and clarify the maximum candidate list
  that each host can present accessibly.
- The SD must map grouping promises to surfaces AGDF actually controls and make host-owned limits
  visible in onboarding material.
- “Installed” version evidence may require surface-specific observation; package metadata alone
  cannot claim the version currently loaded by every host session.

## 9. Next Step

Review this PRD and approve only with:

`Approval: PRD`
