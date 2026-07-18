# PRD: Single-Owner Interaction Rules and Proportional Compact Delivery UX

Status: approved
Gate: PRD
Date: 2026-07-18
Derived from: `UR.md`; `BROWNFIELD_REVIEW.md`
Approval readiness: ready; the expanded UR is approved and repeated Brownfield Review selected
`structured_delivery` for the four-finding scope.
Gate approval: `Approval: PRD` provided on 2026-07-18 after same-run, same-gate revision-8
revalidation.

## 1. Product Outcome

AGDF must preserve its fail-closed governance while reducing avoidable instruction duplication and
visible ceremony. A maintainer should have one normative owner for interaction semantics, an OpenCode
user should not load the same full activation boundary in every skill, and a user with a small
post-UR change should experience Brownfield routing as one internal proportionality step rather than a
second user decision.

## 2. Scope

### PRD-01: Single normative native-interaction owner

`plugin/meta/contracts/interaction.md` owns the complete normative semantics for:

- interaction kinds and envelope fields;
- approval presentation sequence and canonical values;
- locale resolution and localized non-authorizing outcomes;
- native adapter capability, deliberate waiting and fallback behavior;
- surface-specific permission boundaries;
- transient presentation outcomes and post-response revalidation.

`plugin/skills/gate-check/SKILL.md` must remain executable but compact. It retains only:

1. focused contract references;
2. selected-run and current-gate evaluation;
3. durable artefact readiness confirmation;
4. verbatim consumption of the canonical approval presentation;
5. deliberate input followed by same-run/same-gate revalidation;
6. persistence through the existing control-state workflow.

It must not carry a second adapter matrix, locale specification, outcome taxonomy or fallback policy.

### PRD-02: Proportional Quick Task and compact-delivery UX

The persisted values `quick_task`, `verified_change`, `structured_slice`, `structured_delivery` and
`block` remain unchanged.

Human-facing behavior must distinguish:

- **Quick Task**: an ungated question, review, local debugging action or eligible narrow fix without
  new product semantics or formal artefacts;
- **Compact Delivery**: the human-facing name for a post-UR `quick_task` selected from Brownfield
  evidence for a narrow approved change.

Brownfield Review remains the owner of Mode/Slice selection. When sufficient evidence exists, the
review records its decision, reason, evidence and next depth in the same internal operation. A separate
`Mode/Slice Decision` state remains only as fail-closed recovery for an incomplete or legacy review; it
must not be presented as another normal user decision or approval.

Immediately after `Approval: UR`, the human transition says that the agent performs Brownfield Review
and proportional routing next and that no user action is required now. It must not claim Brownfield
Review itself is the next user decision or assume PRD before the routing result exists.

### PRD-03: One full global OpenCode boundary

The owned global OpenCode `AGDF.md` remains the one full prose owner of the Global OpenCode Surface
Boundary. The global installer must stop embedding that full preamble in all nine installed skill
bodies.

Each installed global skill may retain one compact fail-closed activation guard that:

- requires valid `.agdf/control/config.json` before applying AGDF governance;
- directs inactive repositories to the existing `opencode-repo` activation command;
- does not repeat global/local compatibility, namespace or installation explanations already owned by
  global `AGDF.md`.

The global config must continue to register `AGDF.md` through `instructions`, preserve user-owned
configuration, and keep global skills loaded on demand. Focused Runtime Contract references remain
explicit per skill and continue to resolve to the installed focused contract modules.

### PRD-04: Version-matched local machine validation

Routine skill execution must not silently depend on registry-resolved
`npx --yes @agdf/cli@latest`. The Solution Design must define one shared validator implementation and a
surface-specific resolution layer with this order:

1. an owned validator shipped or installed with the active AGDF surface and verified to match its
   version;
2. an explicitly configured pinned local `agdf` executable whose version is verified;
3. agent-native inspection with a visible `machine_validation: unavailable` boundary when neither
   local option exists.

Registry resolution is permitted only for explicit installation, bootstrap or refresh. It must not be
triggered automatically by `gate-check`, `doctor`, `delivery-map` or Delivery Path Search during normal
work.

Codex, Claude and OpenCode full plugin installations must expose a documented owned local validator
path. Repository-only or instruction-only surfaces must either ship the same version-matched evaluator
or declare `external_required` explicitly and provide a pinned recovery command; they must not claim
local deterministic evidence when only model inspection occurred.

The local surface adapter must delegate to the existing `create-agdf/cli` implementation. It must not
copy gate policy, control evaluation or command behavior into a second runtime.

## 3. Acceptance Criteria

### AC-01: Contract ownership

- Exactly one normative prose owner contains the full native adapter, locale, fallback and outcome
  rules: `plugin/meta/contracts/interaction.md`.
- `gate-check/SKILL.md` contains the six operational responsibilities above and focused contract
  references, but no second surface adapter matrix or detailed outcome/fallback specification.
- Runtime integrity fails when the contract owner, required focused reference or one of the six
  orchestration boundaries is removed.
- Runtime integrity does not require duplicated normative phrases in the skill.

### AC-02: Proportional routing

- Pure ungated work is still described as Quick Task.
- Human-facing post-UR `quick_task` output is described as Compact Delivery while JSON and persisted
  records continue to expose `quick_task`.
- A successful Brownfield Review writes Mode/Slice selection in the same operation.
- `Mode/Slice Decision` remains detectable and blocking for incomplete records but is not described as
  a new user approval.
- The UR post-approval transition states that Brownfield routing is internal and no user action is
  required now; it does not preselect PRD.
- Existing exact approvals and gate order remain unchanged.

### AC-03: OpenCode boundary reduction

- A clean global OpenCode installation contains the full `## Global OpenCode Surface Boundary` exactly
  once in owned global instructions, not once per skill.
- All nine global skills retain their ownership markers, names, permissions and a compact activation
  guard.
- Missing or invalid repository activation still fails closed and directs the user to the existing
  activation command.
- Global `opencode.json` still includes owned `AGDF.md` instructions and preserves unrelated user
  instructions, plugins, permissions and skills.
- Every focused Runtime Contract reference resolves after global installation.

### AC-04: Regression evidence

- Runtime integrity and negative integrity tests pass with ownership-oriented assertions.
- Interaction presentation and control-state tests cover the corrected post-UR narration and compact
  delivery label without changing machine fields.
- Skill evaluations cover concise `gate-check` execution and fail-closed OpenCode activation.
- OpenCode install/status and aggregate package smoke tests pass.
- Generated Codex, Copilot and OpenCode assets are synchronized from canonical sources; no generated
  file is hand-maintained.
- `git diff --check` passes.

### AC-05: Local validator availability

- Clean Codex, Claude and OpenCode plugin-install fixtures resolve a version-matched owned validator
  without registry or network access.
- Offline `doctor --json`, `gate-check --json` and `delivery-map --json` execute against a fixture
  repository through that owned path.
- A validator version mismatch fails closed and never contributes machine-validation evidence.
- A missing local validator produces an explicit availability result and does not automatically invoke
  `npx`, install packages or contact the registry.
- `npx --yes @agdf/cli@latest` remains present only in explicit installation, bootstrap, repair or
  refresh guidance.
- The surface resolver delegates to the existing `create-agdf/cli`; source inspection and integrity
  tests prove there is no copied evaluator or second command-policy owner.

## 4. Non-Goals

- Removing or weakening any exact user gate.
- Allowing new product semantics without a durable approved UR.
- Treating small size alone as compact-path eligibility.
- Changing persisted mode enums or requiring a migration of existing run records.
- Removing focused per-skill Runtime Contract dependencies.
- Creating a new runtime contract module, renderer, gate evaluator or OpenCode skill hierarchy.
- Claiming live authenticated host behavior solely from repository tests.
- Requiring every target repository to be a Node project or to commit `node_modules`.
- Treating local validator availability as approval authority or making machine validation mandatory
  for ordinary agent-native interaction when the contract permits direct inspection.

## 5. Compatibility Requirements

- Existing run files and JSON consumers must continue to accept and emit the same machine enum values.
- Existing OpenCode ownership markers and collision-safe `agdf-global-*` names remain stable.
- Existing explicit `permission.question` decisions and unrelated user config remain authoritative.
- Exact textual approval remains universally supported and native presentation remains non-authorizing.
- Legacy local OpenCode assets remain a supported compatibility path.
- Owned validator resolution must be exact-version coupled to the active surface and must work without
  relying on shell `PATH` mutation.

## 6. Evidence Plan

| Evidence | Minimum proof |
|---|---|
| Contract ownership | focused integrity and negative-integrity fixtures |
| Gate-check executability | skill evaluation plus required orchestration-boundary assertions |
| Proportional routing | control-state and interaction-presentation fixtures for UR, completed Brownfield routing and incomplete recovery |
| OpenCode boundary | clean temporary global install asserting one full boundary, nine compact guards and resolvable focused modules |
| Config preservation | existing user-config and explicit-permission smoke fixtures |
| Generated parity | sync followed by runtime integrity and aggregate smoke |
| Local validator | clean per-surface install fixtures plus offline command execution and mismatch/missing negative cases |

## 7. Risks

- Concision can remove operationally necessary sequencing; tests must target behavior boundaries rather
  than prose volume.
- Host instruction semantics can change; repository evidence must remain fail closed and the final
  report must distinguish official documentation, deterministic fixtures and direct host observation.
- Human terminology can drift from machine state; locale and JSON parity tests must bind Compact
  Delivery explicitly to `quick_task` without renaming the machine value.
- Cross-surface validator packaging can create release skew; exact version checks and one delegated CLI
  implementation are mandatory.

## 8. Next Step

Proceed to Solution Design. Implementation remains forbidden until SD and TP are approved and the
pre-implementation Brownfield Analysis passes.
