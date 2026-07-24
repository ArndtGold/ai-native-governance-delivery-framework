# Task/Test Plan: Project-Appropriate Community Health And Maintainer Governance

Status: approved
Gate: TP
Gate approval: accepted — exact user response `Approval: TP` on 2026-07-23
Based on: `.agdf/control/artefacts/github-community-health-governance/SD.md`
Date: 2026-07-23
Owner: Arndt Gold

## 1. Execution Boundary

This plan implements the approved repository policy system, GitHub interaction adapters, metadata desired state, deterministic validation and evidence preparation.

Implementation begins only after exact TP approval and a passing pre-implementation Brownfield Analysis. Repository implementation, external GitHub settings changes, VCS delivery and post-delivery recognition are separate task boundaries:

- repository files and tests are part of CD+Tests;
- authenticated read-only GitHub capability preflight is part of evidence collection;
- GitHub settings mutations may occur only at their explicitly listed task after repository checks pass and the exact target/current state are revalidated;
- commit, push, pull request, merge, release and publish remain outside this TP unless separately authorized after the applicable AGDF closeout state;
- default-branch Community Profile recognition is post-delivery evidence and cannot be claimed from local files.

## 2. Task List

| task_id | Task | Acceptance mapping | Evidence required |
|---|---|---|---|
| T01 | Run pre-implementation Brownfield Analysis against the approved SD; re-inventory existing policy owners, current GitHub metadata, Issues/Discussions, private-vulnerability-reporting visibility, labels, default branch and unrelated worktree paths. | CHG-001, CHG-002, CHG-004, CHG-015, CHG-017, CHG-018 | Brownfield Analysis report with `pass`; exact repository identity; before-state API evidence; isolated changed-path boundary |
| T02 | Add `.github/repository-metadata.json` with schema version, exact approved description, homepage, ordered topics, social-preview source and desired feature states. | CHG-001, CHG-017, CHG-018, CHG-019 | Parsed JSON assertion; exact-value fixture; no credential or effective-state claim |
| T03 | Add `CODE_OF_CONDUCT.md` using an attributed Contributor Covenant 2.1 baseline plus German-primary AGDF scope, confidential reporting, sole-maintainer enforcement, proportional response and reconsideration. | CHG-003, CHG-014, CHG-016 | Baseline attribution/source check; conduct/reporting/enforcement/reconsideration assertions; private-route link test |
| T04 | Add `SECURITY.md` with current-published-release-line support, best-effort/no-SLA handling, primary route conditional on verified PVR availability, permanent email fallback, public-disclosure warning and upgrade guidance. | CHG-004, CHG-005, CHG-016, CHG-018 | Supported-version fixture derived from package/release data; email/link checks; forbidden public/SLA assertions; capability-state fixture |
| T05 | Add `SUPPORT.md` and `GOVERNANCE.md` with deterministic Discussions/Issues/Security routing, unsupported support promises, sole-maintainer responsibilities, decision transparency, conflicts, succession and joint authority-change rule. | CHG-009, CHG-010, CHG-014, CHG-016, CHG-017 | Routing table fixtures; authority consistency assertions; no invented committee/paid support/SLA |
| T06 | Add `CONTRIBUTING.md` that routes setup, runtime, canonical/derived assets, validation, documentation, compatibility and release behavior to existing owners; state no CLA/DCO and define proportionate AI-assistance disclosure. | CHG-011, CHG-012, CHG-016, CHG-017 | Link/owner assertions; generated-cache negative fixture; AI-disclosure positive/negative fixtures; no CLA/DCO |
| T07 | Add the four approved GitHub Issue Forms and chooser config with stable IDs, required fields, common safety/language copy, blank Issues disabled, Discussions routing and Security-policy routing. | CHG-006, CHG-007, CHG-008, CHG-009, CHG-010, CHG-016 | YAML schema parse; form-specific field fixtures; duplicate-ID and malformed-YAML negatives; route URL validation |
| T08 | Add `.github/pull_request_template.md` with review evidence, AGDF proportionality, canonical/generated paths, compatibility, security, documentation and AI disclosure; add `.github/CODEOWNERS` with `* @ArndtGold` and non-enforcement wording in governance. | CHG-012, CHG-013, CHG-014, CHG-015, CHG-016 | Template assertion fixture; completed-PR fixture; CODEOWNERS syntax/handle/governance consistency |
| T09 | Add a concise README community/contribution navigation section linking to policies, Issues and Discussions without duplicating policy bodies. | CHG-002, CHG-009, CHG-010, CHG-011, CHG-016, CHG-017 | Relative/public link checks; duplicate-policy guard; rendered Markdown inspection |
| T10 | Create `assets/github-social-preview.png` at 1280×640, solid background, below 1 MB, derived from existing AGDF visual identity without stretching, unsafe crop or unrelated branding. | CHG-019 | Format/dimension/size assertions; visual inspection at native and reduced size; source/brand comparison |
| T11 | Update `.agdf/control/SOT_REGISTRY.md` and `.agdf/control/CONTEXT_GRAPH.md` with policy, adapter, desired/effective host-state and security/authority invariants. | CHG-014, CHG-017, CHG-018 | Registry rows; `CG-PUBLIC-COMMUNITY-GOVERNANCE`; cross-reference validation |
| T12 | Add the declared root `yaml` development dependency and lockfile plus root `check:community-health` and `test:community-health` scripts; do not consume Pages’ undeclared transitive dependency. | CHG-002, CHG-006, CHG-007, CHG-008, CHG-009, CHG-017 | Clean root `npm ci`; dependency/lock consistency; import provenance assertion |
| T13 | Implement `scripts/check-community-health.mjs` with repository-root injection and fail-closed checks for required files, JSON/YAML, form contracts, links, routing, authority/language/security/AI invariants, metadata and social-preview properties. | CHG-001 through CHG-019 | Direct repository check; typed/identifiable failures; non-zero exit on every required negative |
| T14 | Implement `scripts/community-health-test.mjs` with isolated positive and negative temporary fixtures covering all approved policy, form, routing, authority, language, metadata, image and evidence-boundary contracts. | CHG-001 through CHG-019 | Fixture suite pass; temporary cleanup; criterion-to-fixture coverage matrix |
| T15 | Integrate root dependency installation and both community-health commands into `.github/workflows/agdf-guardrails.yml` without weakening or reordering existing guardrails. | CHG-002, CHG-017, CHG-018 | Workflow syntax inspection; exact new steps; all former steps retained |
| T16 | Run focused and repository regression tests; resolve only scope-owned failures and record unrelated failures without modification. | CHG-001 through CHG-019 | Test ledger from Section 4; `git diff --check`; exact changed paths; no OpenCode-run overlap |
| T17 | Perform authenticated read-only GitHub preflight and, only when repository implementation is green and the capability/target is exact, apply approved non-VCS host settings: description, homepage, topics, PVR state and social preview. Read back every setting; do not mutate labels, branch protection or unrelated features. | CHG-001, CHG-004, CHG-018, CHG-019 | Before/after API or UI evidence; exact target; partial-failure report; public metadata read-back; social-preview observation |
| T18 | Run Task Plan Review, Clean Implementation Review and mandatory Code Review; resolve all `requirements_gap`, `design_gap`, `plan_gap`, `implementation_gap` and applicable `emergent_risk` findings at their canonical owner. | CHG-001 through CHG-019 | Durable review reports; 18/18 task coverage; no open normalized implementation/design/plan gaps |
| T19 | Run QA with repository and live-host evidence reported separately. Do not claim default-branch Community Profile, CODEOWNERS, Issue Form or PR-template recognition before delivery; carry those as explicit post-delivery evidence obligations. | CHG-001 through CHG-019 | QA report; UX Intent Fidelity matrix; deterministic evidence; live-setting evidence; explicit post-delivery gaps |
| T20 | After QA/UAT and only upon separate VCS authorization, deliver to the default branch and verify Community Profile, visible Issue chooser, PR-template load, CODEOWNERS recognition, public links and social preview; reconcile any host-recognition defect through the earliest affected owner. | CHG-002, CHG-015, CHG-018, CHG-019 | Default-branch commit identity; Community Profile API/UI; visible template checks; public link traversal; final host-state comparison |

## 3. Task Dependencies And Order

```text
T01
 ├─ T02
 ├─ T03 ─┐
 ├─ T04 ─┤
 ├─ T05 ─┤
 ├─ T06 ─┼─ T09 ─┐
 ├─ T07 ─┤       │
 ├─ T08 ─┘       ├─ T13 ─ T14 ─ T15 ─ T16 ─ T18 ─ T19
 ├─ T10 ─────────┤
 ├─ T11 ─────────┤
 └─ T12 ─────────┘

T16 ─ T17
T19 ─ explicit UAT/VCS authorization ─ T20
```

- T01 must pass before implementation.
- T02–T12 may be implemented in coherent batches, but their canonical-owner boundaries remain distinct.
- T13 consumes the final file contracts; T14 proves its failure behavior.
- T15 follows passing focused checks.
- T17 is independent from VCS delivery but requires green repository implementation and exact authenticated preflight.
- T20 is not executable merely because TP is approved; it requires later AGDF closeout state and explicit VCS authority.

## 4. Test Plan

### 4.1 Focused automated tests

| test_id | Command or check | Expected result | Tasks |
|---|---|---|---|
| CT-01 | `npm ci` at repository root | Clean install from new root lockfile | T12 |
| CT-02 | `npm run test:community-health` | All positive and negative fixtures pass | T02–T14 |
| CT-03 | `npm run check:community-health` | Current repository passes with zero findings | T02–T15 |
| CT-04 | Parse all `.github/ISSUE_TEMPLATE/*.yml` with declared `yaml` dependency | Valid YAML; required metadata/body/IDs/validations | T07, T12–T14 |
| CT-05 | Metadata exact-value fixture | Description, homepage, topics and asset path equal approved PRD | T02, T13, T14 |
| CT-06 | Policy invariant fixtures | Security, conduct, support, governance, language and AI rules pass/fail deterministically | T03–T06, T13, T14 |
| CT-07 | Routing fixture matrix | Every representative request maps to exactly one primary route | T05, T07, T14 |
| CT-08 | Image header/dimension/size check | PNG, 1280×640, below 1 MB | T10, T13, T14 |
| CT-09 | Relative-link traversal | No broken committed relative link | T03–T09, T13 |
| CT-10 | CODEOWNERS/governance consistency | `@ArndtGold` and sole-maintainer policy agree | T05, T08, T13 |

### 4.2 Repository regression tests

| test_id | Command | Expected result |
|---|---|---|
| RT-01 | `node plugin/scripts/check-runtime-integrity.mjs` | pass |
| RT-02 | `npm --prefix create-agdf run sync-package-assets` followed by dirty-path inspection | no community-health change creates unexpected generated runtime deltas |
| RT-03 | `npm --prefix create-agdf run test:package-contents` | pass |
| RT-04 | `npm --prefix create-agdf run smoke-test` | pass |
| RT-05 | `npm --prefix agdf run smoke-test` | pass |
| RT-06 | `npm --prefix pages ci` when dependencies require refresh, then `npm --prefix pages run check` | pass |
| RT-07 | version-matched local `doctor --all-active --json` | no new block/revise finding attributable to this scope |
| RT-08 | version-matched local `gate-check --run github-community-health-governance --json` | current state and artefact chain consistent |
| RT-09 | `node create-agdf/bin/create-agdf.js delivery-map --dir . --all-active` | no new per-run block from this scope |
| RT-10 | `git diff --check` and exact changed-path comparison | pass; no unrelated path absorbed |

If RT-02 creates derived changes owned by another active run, stop and reconcile rather than accepting them into this scope.

### 4.3 Manual and visual repository evidence

- Read all public policy entry points as a first-time German-speaking contributor.
- Repeat routing review as an English-speaking reporter.
- Verify security recovery with PVR available and unavailable.
- Complete representative bug, runtime, documentation and feature forms without sensitive information.
- Complete a representative AI-assisted pull request disclosure without raw prompts or hidden reasoning.
- Inspect the social preview at 1280×640 and scaled to approximately 320×160 on light and dark surrounding backgrounds.
- Confirm README navigation is concise and policies remain the detailed owners.

### 4.4 Authenticated host evidence

| test_id | Observation | Pass condition | Timing |
|---|---|---|---|
| GH-01 | Repository API metadata | Exact approved description, homepage and topic set | after T17 |
| GH-02 | PVR capability/status | Enabled and confidential route works, or unavailable with email-only effective fallback | after T17 |
| GH-03 | Social preview | Approved image visibly configured | after T17 |
| GH-04 | Community Profile API/UI | Applicable components recognized | after T20 |
| GH-05 | New Issue chooser | Four forms, Discussions and Security routes visible; blank Issue unavailable | after T20 |
| GH-06 | New Pull Request | Template loads from default branch | after T20 |
| GH-07 | CODEOWNERS | File recognized on default branch and owner valid | after T20 |
| GH-08 | Public link traversal | Policies and public routes resolve from the default branch | after T20 |

No local test substitutes for GH-01 through GH-08. GH-04 through GH-08 are not prerequisites for implementing the repository files, but remain required before the final public acceptance signals may be claimed.

## 5. PRD And UX Fidelity Coverage

| PRD criterion | Working mode/state | Tasks | Visible evidence |
|---|---|---|---|
| CHG-001 | repository entry / metadata visible | T01, T02, T13, T17, T19 | GH-01 |
| CHG-002 | repository entry / Community Profile complete | T03–T09, T13–T15, T20 | GH-04 |
| CHG-003 | maintainer decision / conduct route available | T03, T05, T13, T14 | policy inspection and private-route fixture |
| CHG-004 | security / confidential route or safe fallback | T01, T04, T07, T13, T17 | GH-02 and fallback fixture |
| CHG-005 | security / bounded support state | T04, T13, T14 | release-line and no-SLA fixture |
| CHG-006 | bug / ready or redirected | T07, T13, T14, T20 | form fixture and GH-05 |
| CHG-007 | compatibility / sufficient evidence | T07, T13, T14, T20 | four-surface fixtures and GH-05 |
| CHG-008 | documentation / focused route | T07, T13, T14, T20 | documentation fixture and GH-05 |
| CHG-009 | idea/proposal / deterministic redirect | T05, T07, T09, T14, T20 | routing fixture and GH-05 |
| CHG-010 | support / truthful best-effort route | T05, T07, T09, T14, T20 | support fixture and GH-05 |
| CHG-011 | contribution / canonical owners visible | T06, T09, T13, T14 | owner/link fixture |
| CHG-012 | contribution / proportionate AI disclosure | T06, T08, T13, T14 | completed-PR fixtures |
| CHG-013 | pull request / evidence visible | T08, T13, T14, T20 | PR fixture and GH-06 |
| CHG-014 | governance / one current owner and change path | T03, T05, T08, T11, T13 | governance assertions |
| CHG-015 | ownership / review routed without enforcement claim | T08, T13, T20 | consistency fixture and GH-07 |
| CHG-016 | all modes / German primary, English accepted | T03–T09, T13, T14 | cross-document language fixture |
| CHG-017 | all modes / single-source policies | T02–T15 | registry/context and duplication checks |
| CHG-018 | repository vs host / state distinguished | T01, T02, T13, T17, T19, T20 | separate evidence ledgers |
| CHG-019 | repository entry / brand preview configured | T02, T10, T13, T17, T20 | CT-08, visual inspection and GH-03 |

## 6. Brownfield Scope

The pre-implementation analysis must inspect and preserve:

- `README.md`, `INSTALL.md`, `RELEASE.md`;
- `LICENSE`, `NOTICE`, `TRADEMARKS.md`;
- `pages/src/data/site.ts` and existing public contact identity;
- `plugin/meta/contracts/`, generated-asset and installer ownership;
- root and subproject package/lockfile boundaries;
- `.github/workflows/agdf-guardrails.yml` and publish workflow separation;
- `.agdf/control/SOT_REGISTRY.md`, `.agdf/control/CONTEXT_GRAPH.md` and all active run boundaries;
- the current GitHub repository identity, default branch, public metadata, Issues, Discussions, Community Profile and authenticated security-setting state;
- current labels before any Issue Form would depend on them.

Reuse rules:

- link to existing canonical runtime/release/legal owners;
- do not copy runtime matrices into contribution or support policies;
- do not edit installed plugin caches;
- do not absorb unrelated OpenCode control artefacts or generated deltas;
- do not introduce another CLI implementation under the community-health validator.

## 7. Out Of Scope

- AGDF gate, approval, interaction, runtime or capability changes;
- Candidate Generation or Delivery Path Search work;
- changing existing package publication or release orchestration;
- CLA, DCO, paid support, numeric SLA or multi-maintainer committee;
- branch-protection, repository ruleset, label taxonomy or GitHub Actions permission changes;
- automatic GitHub settings synchronization or credential-bearing mutation scripts;
- translating all repository documentation into parallel language trees;
- modifying generated or installed plugin caches;
- commit, push, pull request, merge, release or publish without later separate authorization.

## 8. QA Classification Rules

### Block

- public vulnerability disclosure is invited or the private fallback is absent;
- policy authority contradicts CODEOWNERS or existing release authority;
- credentials, secrets or reporter data are stored or logged;
- a required policy/form is missing or invalid;
- repository identity is ambiguous before host mutation;
- implementation touches AGDF runtime/gate semantics outside the approved scope.

### Revise

- any approved CHG criterion lacks a task, test or evidence mapping;
- required deterministic fixtures fail;
- policy copy duplicates or contradicts a canonical owner;
- local and live-host evidence are conflated;
- visible behavior is claimed without the required visible evidence;
- any normalized review gap remains open;
- social-preview or metadata state differs from approved intent.

### Warn

- GitHub-hosted recognition remains pending because default-branch delivery has not yet been authorized;
- Issue Forms preview behavior or Social Preview UI cannot be independently API-verified;
- PVR is unavailable but the complete email fallback is verified;
- unrelated pre-existing doctor/delivery-map warnings remain isolated and unchanged.

QA may approve repository implementation without claiming post-delivery GitHub recognition only when all deterministic and currently executable live checks pass and the remaining GH-04 through GH-08 obligations are explicit. Final public acceptance of those signals remains unavailable until T20 evidence exists.

## 9. Risks And Blockers

| Risk | Severity | Planned control |
|---|---|---|
| Security route advertises an unavailable feature | block | T01/T17 capability preflight and permanent email fallback |
| Generic templates create policy drift | revise | canonical owner model, focused validator and review |
| Root dependency adds supply-chain surface | warn | one declared pinned parser dependency, lockfile and clean `npm ci` |
| Existing broad worktree changes contaminate scope | block | exact baseline and changed-path check in T01/T16 |
| Social-preview adaptation becomes an unrelated redesign | revise | derive from approved existing asset; exact format/size and visual check |
| Host mutation partially succeeds | warn/revise | independent before/after read-back and partial-state report |
| Default-branch recognition cannot run before delivery | warn | explicit GH-04–GH-08 post-delivery evidence contract |
| Sole maintainer is unavailable | warn | truthful best-effort policy and documented succession mechanism |

## 10. Completion Conditions

CD+Tests is complete only when:

- T01 passes;
- T02–T17 are implemented or, for a capability-dependent host action, recorded with its approved fail-safe state;
- CT-01 through CT-10 and RT-01 through RT-10 pass or unrelated pre-existing results are explicitly isolated;
- every changed path is within this TP;
- no security-sensitive material is present;
- host evidence is separated from repository evidence.

Review/QA preparation is complete only when T18 reports no open design, plan or implementation gap. T19 must state exactly which live claims are proven and which remain post-delivery obligations.

The complete public acceptance signals are satisfied only after separately authorized T20 supplies GH-04 through GH-08.

## 11. Next Step

Review this task and test plan and approve only with:

`Approval: TP`
