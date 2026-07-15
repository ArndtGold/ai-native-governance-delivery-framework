# SD: Guided AGDF UX Interaction Delivery

Status: approved
Gate: SD
Gate approval: `Approval: SD` provided on 2026-07-15
Based on: `.agdf/control/artefacts/agdf-ux-next-round/PRD.md`
Date: 2026-07-15
Owner: AGDF

## 1. Solution Overview

Extend the existing canonical control-state projection rather than adding a UX state store. The
solution has four coordinated projections:

| Concern | Canonical owner | Delivery approach |
|---|---|---|
| Ambiguous runs | `create-agdf/lib/control-state/*`, `create-agdf/bin/create-agdf.js` | Add one display-safe candidate projection to ambiguity reports; native hosts use it only for scope clarification and revalidate selection before any gate action. |
| Gate interaction and fallback | `create-agdf/lib/interaction-presentation.js`, Runtime Contract, `gate-check` skill | Add pure interaction-attempt/fallback payload helpers and locale copy; host adapters remain responsible for actual native invocation. |
| First contact and skill discovery | `plugin/meta/agdf-plugin.definition.json`, `pages/src/data/skills.ts`, Pages rendering | Add one canonical discovery classification and derive AGDF-owned grouped surfaces from it. |
| Version and screenshot evidence | package metadata, installer/status output, Pages proof metadata | Label expected package, observed installed state and historical visual evidence separately; never infer a live session version. |

The selected `RUN_STATE.md`, existing artefacts and exact approval validator remain the only
durable authority. Interaction payloads and receipts are derived, transient presentation data.

## 2. Ownership And Source Of Truth

| Domain | Authority | Non-authoritative projection |
|---|---|---|
| Gate state, approval and run lifecycle | `.agdf/control/runs/<run_id>/RUN_STATE.md` plus artefact chain | Gate Transition Card, status-card and interaction payload |
| Active-run discovery and ambiguity | `create-agdf/lib/control-state/run-state-repository.js` | Candidate list in gate-check detail/host selection prompt |
| Human title | Existing `resolveHumanRunTitle()` precedence | Sanitized candidate title; never raw Objective content |
| Gate interaction semantics | `plugin/meta/agdf-runtime-contract.md` | Adapter prompts and fallback copy |
| Native adapter availability | `plugin/meta/agdf-plugin.definition.json` | Codex/Claude/OpenCode host call or text fallback |
| Skill identity and routing | `skillSet` in canonical plugin definition | Pages grouping and onboarding copy |
| Package-version truth | canonical package/plugin metadata and surface-specific status command | Pages screenshot label and session-verification state |

## 3. Architecture Decisions

### 3.1 Candidate projection for ambiguous runs

Add a pure `buildRunCandidates()` projection close to the existing control-state/presentation
helpers. It accepts only valid active canonical runs and emits a bounded array of:

```text
run_id
display_title
current_gate
next_allowed_action
revision_id
```

- `display_title` derives from the current artefact heading, approved UR heading, then a
  normalized `run_id`; it must not use free-form Objective content for candidate display.
- Sort candidates by normalized `display_title`, then `run_id`; disambiguate duplicate titles with
  the secondary `run_id`.
- Do not include invalid, completed, non-active or stale candidates. The receiving adapter reruns
  canonical selection/evaluation immediately before presenting the next gate interaction.
- `gate-check --json` retains its fail-closed result and gains an optional detail-only
  `candidate_runs` projection when ambiguity is the blocker. Human primary copy stays concise.
- If a host cannot safely present all candidates, show a localized textual selection instruction
  with the same bounded list and no implied approval. The SD implementation must define an
  accessible list limit and an explicit “show remaining runs” continuation that remains
  clarification-only.

### 3.2 Non-authoritative interaction-attempt payload

Extend `create-agdf/lib/interaction-presentation.js` with validated pure helpers for:

```text
interaction_id
run_id
current_gate
surface
attempt_outcome: presented | unavailable_before_invocation | attempted_not_applied | unsafe_to_wait
fallback_reason
expected_approval
```

- The payload is created for an eligible gate decision and is never written into `RUN_STATE.md`,
  treated as an approval, or accepted by the existing approval validator.
- `presented` is evidence that the adapter invocation was requested, not that a user approved.
- A fallback emits its localized explanation from the complete locale pack and exposes the exact
  text value. It must say whether the adapter was unavailable, not applied or unsafe to await.
- A pre-artefact approval uses a separate `not_ready` explanation. It records no approval and, once
  the artefact is ready, the agent presents a fresh gate decision rather than reusing the old
  message as authority.
- A user can explicitly reopen an unchanged decision after a fallback. That creates a new
  `interaction_id`, revalidates run/gate/artefact state and allows one new native attempt; it is
  never an automatic retry.
- `revise`, `decline`, `cancel`, `no_response`, `timeout`, `empty`, `invalid` and `stale` remain
  existing non-approval outcomes. Their visible receipt names the selected run and gate, confirms
  that authority did not change, and gives one next action.

### 3.3 Surface adapters and evidence boundary

The existing surface rules remain unchanged: Codex uses `request_user_input` when callable,
Claude uses `AskUserQuestion` only when safe, OpenCode uses `question` only with permitted
`permission.question`, and all other cases use exact text.

Deterministic tests validate payload construction, ordering and fallback semantics. They cannot
prove that a host actually rendered a native control. A live session check is therefore required
as separate evidence for every changed host; unavailable hosts are reported as unverified, never
as a passing native interaction.

### 3.4 Progressive skill discovery

Add a canonical discovery classification to each `skillSet` entry:

```text
start_here | automatic | optional
```

Pages and supported onboarding copy derive the grouping from that field. No second skill catalogue
or manually copied skill descriptions are introduced. Codex/Claude plugin detail pages remain
host-owned; where they retain a flat list, AGDF does not claim in-place grouping and links users to
the grouped AGDF-owned explanation.

### 3.5 Version and screenshot evidence

Model visible version evidence with three distinct labels:

| Label | Meaning | Evidence source |
|---|---|---|
| Expected package version | Version declared by canonical package/plugin metadata | repository/package metadata |
| Observed installed version | Version reported by a surface-specific status or installation check | command/session observation with timestamp |
| Session version unverified | No direct evidence of the version loaded by the active host session | explicit unknown state |

Pages proof metadata adds an observation label/date where known and retains its existing statement
that screenshots are historical integration evidence, not release-version proof.

## 4. Integration Points

- `create-agdf/bin/create-agdf.js`: ambiguity report and status-card/detail projection; JSON field
  additions must be backward compatible.
- `create-agdf/lib/control-state/run-state-repository.js`: active-run discovery only; no write path
  is added for candidate selection.
- `create-agdf/lib/interaction-presentation.js`: candidate, receipt and locale-safe fallback
  helpers.
- `plugin/meta/agdf-runtime-contract.md`, `plugin/skills/gate-check/SKILL.md` and
  `plugin/meta/agdf-plugin.definition.json`: one aligned semantic contract and adapter mapping.
- `pages/src/data/skills.ts`, `pages/src/pages/index.astro`, `pages/src/data/site.ts`: grouped
  discovery and version/screenshot evidence projection.
- `create-agdf/scripts/sync-package-assets.js`: propagation of canonical plugin metadata and
  runtime files into generated package surfaces.

## 5. Constraints And Compatibility

- Preserve exact `Approval: <GateName>` values, existing outcome normalization, `--run`,
  `AGDF_RUN_ID`, lifecycle semantics, locale fallback and all JSON fields.
- Candidate selection, interaction receipt and native presentation are input/presentation only;
  none may persist an approval or choose a run implicitly.
- Receipt data is bounded, redacted and non-durable. It must never contain free-text approval
  input, Objective text or host permission data beyond the defined outcome/reason.
- Do not retry automatically after a host failure. Reopen only from a fresh explicit user request
  and fresh gate evaluation.
- Keep the existing no-table Gate Transition Card boundary for ready gate approvals.

## 6. Test And Evidence Strategy

- Extend `interaction-presentation-test.js` with candidate title/sort/collision/safe-display tests,
  interaction-attempt payload validation, fallback reasons, non-approval receipts, pre-artefact
  handling and explicit reopen/revalidation behavior.
- Extend control-state and CLI tests with an ambiguous-run fixture that verifies `candidate_runs`
  contains only eligible runs and preserves failure-closed behavior.
- Extend runtime-integrity negative tests to prove drift between Runtime Contract, gate-check
  guidance, locale keys, plugin definition and generated surfaces fails.
- Add Pages data/render checks for one-source skill grouping and evidence labels.
- Run runtime integrity, control-state, routing, package smoke, Pages check/build and
  `git diff --check`.
- Capture live native-control evidence separately for Codex, Claude and OpenCode where callable;
  record unavailable surfaces as unverified.

## 7. Risks And Open Questions

- The current CLI does not itself invoke host-native controls; the SD depends on agent/host
  adapters honouring the contract. Live evidence is required to avoid overstating enforcement.
- Adding `candidate_runs` to JSON needs a compatibility review for consumers that validate a
  strict schema.
- Host short-question controls may impose option-count or label-length limits; the exact bounded
  overflow interaction must be specified in the TP from current host capability evidence.
- Session-version observation may not be available for every host. The UI must retain the explicit
  `session version unverified` state rather than approximate it.

## 8. Next Step

Review this solution design and approve only with:

`Approval: SD`
