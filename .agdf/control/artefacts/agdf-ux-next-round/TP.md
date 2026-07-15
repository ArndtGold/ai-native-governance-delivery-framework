# TP: Guided AGDF UX Interaction Delivery

Status: approved
Gate: TP
Gate approval: `Approval: TP` provided on 2026-07-15
Based on: `.agdf/control/artefacts/agdf-ux-next-round/SD.md`
Date: 2026-07-15
Owner: AGDF

## 1. Task List

| task_id | Task | Acceptance mapping | Evidence required |
|---|---|---|---|
| UX-01 | Add a bounded, display-safe active-run candidate projection to canonical control-state helpers and ambiguity detail output. | PRD 2.1; SD 3.1 | Focused fixture covering active-only filtering, deterministic sort, duplicate titles, long titles, safe title fallback and stale-run rejection. |
| UX-02 | Add pure, non-authoritative interaction-attempt and fallback-receipt helpers with stable outcome validation. | PRD 2.4; SD 3.2 | Focused fixture for all attempt outcomes, exact expected approval, redaction boundary and proof that a receipt cannot advance a gate. |
| UX-03 | Extend Runtime Contract, gate-check guidance, locale registry and canonical plugin interaction metadata with one aligned primary/fallback/reopen contract. | PRD 2.1, 2.4; SD 3.2–3.3 | Runtime-integrity pass plus negative drift tests for missing outcome, locale copy or adapter contract mismatch. |
| UX-04 | Define and implement user-visible pre-artefact, fallback and explicit-reopen paths without automatic retry or authority carry-over. | PRD 2.4; SD 3.2 | Fixtures for pre-artefact approval, unavailable/not-applied/unsafe fallback, all non-approval outcomes and one fresh user-initiated reopen after revalidation. |
| UX-05 | Add one canonical skill discovery classification and derive grouped `Start here`, `used automatically` and `optional` guidance on AGDF-owned surfaces. | PRD 2.2, 2.3; SD 3.4 | Data/render test that every canonical skill is grouped once, retains its identifier and has no copied routing table. |
| UX-06 | Add explicit host-owned catalogue limits and version/screenshot evidence labels to supported onboarding and Pages proof surfaces. | PRD 2.3, 2.4; SD 3.4–3.5 | Pages check/build plus inspected copy showing expected, observed and session-unverified version states. |
| UX-07 | Synchronize generated package assets and add regression coverage across control-state, interaction presentation, runtime integrity, routing and package smoke paths. | All PRD acceptance criteria; SD 6 | Passing focused tests, `check-runtime-integrity`, control-state/routing/package smoke, Pages check/build and `git diff --check`. |
| UX-08 | Capture separate live-host evidence for each surface whose native interaction visibly changes, or record it as unverified with the reason. | PRD 7; SD 3.3, 6 | Dated observed session evidence or an explicit unverified record; no inferred host-version or rendered-button claim. |

## 2. Test Plan

| Area | Automated checks | Manual / observed evidence |
|---|---|---|
| Candidate projection | Unit/fixture tests for filter, title, ordering, collision, truncation, list bound and revalidation payload. | Inspect a multi-run clarification interaction for readable, distinct choices. |
| Approval delivery | Unit tests for interaction-attempt outcomes, exact approval binding, fallback copy, redaction and non-authority. | On callable hosts, observe one ready gate native question and one explained fallback where safely reproducible. |
| Pre-artefact and reopen | Fixture tests rejecting early approval, creating fresh ready choice and preventing automatic retry. | Verify copy makes the next user action explicit. |
| Skill discovery | Data/render tests for exact once-only grouping and stable skill IDs. | Inspect AGDF-owned grouping and a host-owned flat catalogue disclosure. |
| Version evidence | Copy/data tests for expected, observed installed, screenshot historical and session-unverified labels. | Validate observed version only from the relevant surface/status command. |
| Propagation | Runtime integrity, control-state, routing and package smoke. | Generated-surface diff inspection. |
| Pages | `npm --prefix pages run check` and `npm --prefix pages run build`. | Rendered page inspection if layout/copy changes materially. |

## 3. Brownfield Scope

- `create-agdf/lib/control-state/run-state-repository.js` and parser/selection helpers.
- `create-agdf/bin/create-agdf.js` ambiguity, status-card and JSON projection paths.
- `create-agdf/lib/interaction-presentation.js` and
  `create-agdf/scripts/interaction-presentation-test.js`.
- `plugin/meta/agdf-runtime-contract.md`, `plugin/skills/gate-check/SKILL.md`,
  `plugin/meta/agdf-interaction-locales.json` and `plugin/meta/agdf-plugin.definition.json`.
- `create-agdf/scripts/sync-package-assets.js`, runtime-integrity and negative tests.
- `pages/src/data/skills.ts`, `pages/src/data/site.ts` and `pages/src/pages/index.astro`.
- Existing `agdf-human-decision-surface` and `native-gate-buttons-live` artefacts as semantic
  constraints, not code to reopen.

## 4. Out Of Scope

- New AGDF gates, approval syntax, persisted interaction ledger or custom host UI.
- Automatic active-run selection, automatic retries or acceptance of pre-artefact approvals.
- Reordering host-owned plugin catalogues.
- Claiming live native rendering, session version or cross-surface parity without direct evidence.
- VCS, release or package-publishing work.

## 5. Risks And Blockers

| Condition | QA effect | Required response |
|---|---|---|
| Candidate projection can select/advance a run implicitly. | block | Remove the authority path; keep selection clarification-only and revalidate. |
| Interaction receipt is persisted or accepted as approval. | block | Restore `RUN_STATE.md` and exact approval as sole authority. |
| Native attempt is silently replaced by bare text. | revise | Add explicit localized fallback reason and evidence fixture. |
| Generated/runtime/locale surfaces drift. | block | Synchronize from canonical owner and rerun integrity tests. |
| Host-native rendering cannot be directly observed. | revise | Record the surface as unverified; do not claim parity or success. |
| Skill grouping is promised inside host-owned UI. | revise | Restrict promise to AGDF-owned surfaces and disclose the limit. |

## 6. Next Step

Review this task and test plan and approve only with:

`Approval: TP`

## 7. Follow-up Task And Test Plan: Reliable Native Approval Invocation

Status: approved
Based on: approved follow-up SD sections 9.1–9.7
Gate approval: `Approval: TP` provided on 2026-07-15

### 7.1 Task list

| task_id | Task | Acceptance mapping | Evidence required |
|---|---|---|---|
| NAI-01 | Add deterministic pre-creation reconciliation for active and recently completed matching runs as a read-only projection. | PRD 2.5; SD 9.1 | Fixtures for `active_match`, `completed_match`, `no_match` and `match_uncertain`; no implicit selection or persistence. |
| NAI-02 | Add an additive `native_attempt_required` readiness signal to the canonical gate-ready projection. | PRD 2.7; SD 9.7 | Ready-gate fixture asserts `true`; blocked, ambiguous, status-only and non-ready fixtures assert absent/false. |
| NAI-03 | Implement one central gate-approval orchestration path that emits both cards and invokes the configured native adapter exactly once before fallback. | PRD 2.7; SD 9.7 | Hermetic orchestration fixture fails when a ready gate goes directly to bare text; exactly-one-attempt evidence. |
| NAI-04 | Keep hooks preparation-only and prove that SessionStart, UserPromptSubmit and permission hooks cannot answer, approve or replace the native gate attempt. | PRD 2.7; SD 9.7 | Negative fixtures and runtime-integrity assertions for hook non-authority. |
| NAI-05 | Classify native outcomes and emit immediate localized exact-text fallback without automatic retry. | PRD 2.4, 2.7; SD 9.7 | Coverage for `presented`, `unavailable_before_invocation`, `attempted_not_applied` and `unsafe_to_wait`; no retry fixture. |
| NAI-06 | Add configured-locale human projections for lifecycle, closeout and all primary status fields without raw enum leakage. | PRD 2.6; SD 9.2–9.3 | German/English projection tests reject unexplained internal values and preserve exact approval tokens. |
| NAI-07 | Run propagation, regression and host evidence checks across canonical and generated surfaces. | PRD acceptance criteria; SD 9.4–9.5 | Runtime Integrity, control-state, interaction, routing, package smoke, Pages checks and explicit host evidence boundary. |

### 7.2 Focused test plan

| Area | Automated proof | Manual / host evidence |
|---|---|---|
| Readiness | Exactly-one-run, artefact-ready and current-gate fixture produces `native_attempt_required: true`. | Inspect the ready-gate orientation before the native question. |
| Native invocation | Orchestrator spy records one adapter call and rejects zero calls or retries. | Observe one Codex native attempt where callable; record unavailable/not-applied otherwise. |
| Fallback | Outcome-specific localized fallback includes exact approval value and unchanged authority. | Confirm the user can continue with exact text without requesting buttons again. |
| Non-ready safety | Ambiguous, blocked, status-only and internal-step fixtures produce no approval control. | Verify no buttons appear for clarification or status interactions. |
| Hook boundary | Hook fixtures cannot supply answers or persist approvals. | Inspect host-specific hook behavior where available. |
| Existing-run reconciliation | Active/completed matching fixtures prevent duplicate creation and distinguish delivered work. | Confirm the chat explains reuse, already-delivered scope or why a new follow-up is needed. |
| Language boundary | Configured German/English primary projections contain no unexplained raw enums. | Inspect human-facing cards and fallback copy. |

### 7.3 QA blockers

- A ready gate reaches bare text without a recorded native attempt: `block`.
- More than one native attempt occurs for one eligible interaction: `block`.
- A hook supplies an answer, approval or second authority: `block`.
- A fallback hides whether the native attempt was unavailable or not applied: `revise`.
- A completed matching run is offered as an active approval candidate: `block`.
- Human-facing primary copy exposes raw internal values without explanation: `revise`.
- Host rendering cannot be observed: record `unverified`; do not claim native success.

### 7.4 Next step

The follow-up Task And Test Plan was approved with:

`Approval: TP`
