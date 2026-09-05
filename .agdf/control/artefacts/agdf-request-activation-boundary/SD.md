# SD: Request-Intent Activation Boundary

Status: approved
Gate: SD
Gate approval: Exact `Approval: SD` accepted for Revision 5 on 2026-09-04 after same-target,
same-run, same-gate and same-revision revalidation of run revision
`2B7A793E-156B-4EBB-BF1E-A644C910517E`.
Prior gate approval: Revision 4 was approved at run revision
`A539987B-52D4-4D08-805F-C93E2D686986` and remains historical evidence only.
Based on: approved PRD Revision 4, completed Brownfield Review and UX Intent Definition Revision 4
Date: 2026-09-04
Owner: Arndt Gold
Revision: 5
Revision reason: post-implementation instruction-footprint audit and normalized finding `RAB-CIR-02`

## 1. Design Decision

AGDF will gain one canonical, host-neutral Request Activation Contract before every existing
task-target, repository, run, control, dispatcher and presentation authority.

The delivery uses a two-stage instruction model. Before skill selection, one marker-bounded compact
Activation Kernel carries only applicability, silence and non-authority rules. After positive
applicability, the selected skill loads only the focused router or runtime-contract detail needed for
its route. The complete router, gate model and closeout rules are never global eager instructions.

The kernel is projected from the canonical Request Activation Contract into the existing common
SessionStart context, the OpenCode micro-bootstrap, the canonical router and each selected skill as a
direct-selection backstop. Discovery descriptions carry one short boundary, not the full negative
case taxonomy. The decision remains request-scoped, transient and non-authorizing. It either abstains
silently, asks one neutral effect clarification, activates one named operation, activates delivery
intake or activates continuation intent for downstream revalidation.

This design deliberately does not add:

- a second SessionStart, per-prompt or pre-tool hook;
- an executable intent classifier or remote model call;
- an executable applicability preflight in the first delivery;
- an activation field or abstention outcome in dispatcher contract v1;
- a durable request-classification record or second approval/state store;
- a full-router global system prompt or a second copy of immutable policy in dynamic host context.

Dispatcher v1 remains unchanged and post-activation. Existing target, lifecycle, gate, approval,
locale and presentation owners remain authoritative after positive applicability.

## 2. Authority And Execution Order

### 2.1 Owners

| Concern | Canonical owner | Design boundary |
|---|---|---|
| Request applicability, precedence, invocation evidence and silent abstention | new `plugin/meta/contracts/request-activation.md` | Decides only request applicability and the bounded downstream route. It owns the full policy, one marker-bounded Activation Kernel and one short discovery boundary. It does not resolve a target, inspect a repository, select a run, evaluate a gate or authorize work. |
| Eager Activation Kernel transport | marker-bounded block in `request-activation.md`, projected by existing generation owners | The same fingerprinted kernel is the only immutable pre-selection policy. Existing SessionStart carries it for Codex, Claude Code and Copilot. OpenCode carries it in a micro-bootstrap. A selected skill retains the same block as a direct-selection backstop until four-host evidence proves a common pre-selection guarantee. |
| Contract module inventory | ordered `runtimeContract` object in `plugin/meta/agdf-plugin.definition.json` | Lists plugin-root-relative runtime-contract paths once for source indexing, projection, installation and integrity checks. It does not duplicate module semantics. |
| Skill inventory and discovery metadata | `plugin/meta/agdf-plugin.definition.json` `skillSet` | Sole owner of skill-specific `useFor`, `boundary` and discovery class. Frontmatter descriptions are compact deterministic projections with one contract-owned boundary. They never carry the operation catalog or a second applicability policy. |
| Agent routing | `plugin/meta/agdf-agent-router.md` | Remains the complete on-demand routing source after positive activation. It is packaged as a resource, not projected wholesale into global OpenCode instructions. |
| Task and governance target | `plugin/meta/contracts/task-target-resolution.md` and existing resolver | Runs only after positive applicability and only for target-bound routes. Its existing precedence and failure semantics remain unchanged. |
| Physical control presence | existing lifecycle/status inspection factored as `absent | candidate_present` | Reports structural presence only. It never claims actionability, classifies intent, validates control or selects delivery intake. Doctor, run resolution and gate evaluation remain the validity owners. |
| Global and repository lifecycle | existing `status`, `init`, `disable`, `uninstall` and surface-specific lifecycle owners | Execute only an explicitly selected lifecycle operation within their existing scope and safety rules. |
| Canonical control initialization | existing `init` handler refactored through new `create-agdf/lib/scaffold/canonical-init.js` | Creates or resumes only owned scaffold state, never a free-standing legacy live run. It exposes exact-match, repairable-partial and conflict outcomes and grants no gate authority. |
| Direct skill orchestration | dispatcher contract v1 | Starts only after positive applicability on routes assigned to `skill_dispatch_v1`; input, output and ordering stay unchanged. |
| Gate evaluation and approval | existing gate and interaction contracts | No change to exact approval, artefact readiness or same-target/run/gate/revision revalidation. |
| Presentation | `plugin/meta/contracts/interaction.md`, `interaction-presentation.js` and existing lifecycle presentation | Own normalized operation status and non-gate control-setup orientation as well as existing gate presentation. Silent abstention invokes no AGDF renderer. Setup authority is target- and scope-bound and never approves a gate. |
| Instruction-footprint budgets | versioned `instructionFootprint` object in `plugin/meta/agdf-plugin.definition.json` | Owns machine-verifiable UTF-8 budgets by model-visible surface. Tests measure normalized host-variable paths separately from raw bytes. Budgets constrain projection and do not alter applicability semantics. |
| Host projection | existing generation and installer pipeline | Projects the kernel, compact discovery and variable bindings, then packages full contracts and router for on-demand access. Generated files and adapters never own applicability semantics. |

### 2.2 Required order

1. Evaluate request applicability from the requested effect and permitted invocation evidence using
   only already-loaded instructions.
2. On `abstain`, resume ordinary handling with no AGDF output or request-caused callback.
3. On `clarify`, provide useful read-only help or ask one neutral effect question with no AGDF
   callback.
4. On positive applicability, select exactly one bounded operation, delivery-intake or continuation
   route from the canonical catalog.
5. For `skill.<slug>`, invoke dispatcher v1 as the first operational call. Dispatcher v1 resolves
   target and control once under its existing contract; there is no preceding target/control probe.
6. For `delivery.start`, resolve the target once for draft/setup authority, then inspect only
   `absent | candidate_present`. On `candidate_present`, dispatcher v1 revalidates the same target and
   owns the authoritative control evaluation. A mismatch stops; no pre-dispatch control evaluator
   runs.
7. For lifecycle, status and control commands, invoke the declared existing owner. That owner performs
   only its own target, presence, validity and consent steps.
8. Preserve all downstream run, gate, approval, locale, blocker and recovery contracts.

Repository presence, current working directory, installed-plugin state, passive SessionStart
context, a prior unrelated run and automatic skill selection are not positive applicability
evidence.

## 3. Transient Request Activation Decision

The semantic decision is an internal contract value used by instructions and evaluation. It is not
printed in ordinary chat, written to control state or sent to a new service.

```text
policy_version: 1
requested_effect:
  read_only_assistance
  | governed_delivery
  | binding_delivery_artefact
  | named_agdf_operation
  | control_lifecycle
  | continuation_action
  | ambiguous
request_class:
  ordinary_read_only
  | delivery_intent
  | explicit_agdf_operation
  | explicit_control_lifecycle
  | active_run_continuation
  | ambiguous_effect
decision:
  abstain
  | clarify
  | activate_named_operation
  | activate_delivery_intake
  | activate_continuation
invocation_provenance:
  current_user_text
  | trusted_ephemeral_user_action
  | unavailable
selection_origin:
  explicit_user_action
  | automatic_discovery
  | router_selection
  | unavailable
operation_id: optional identifier from the bounded operation catalog
authorizes: false
persist: false
```

Class-to-decision mapping:

| Request class | Allowed decision |
|---|---|
| `ordinary_read_only` | `abstain` |
| `delivery_intent` | `activate_delivery_intake` |
| `explicit_agdf_operation` | `activate_named_operation` |
| `explicit_control_lifecycle` | `activate_named_operation` |
| `active_run_continuation` | `activate_continuation` |
| `ambiguous_effect` | `abstain` when useful read-only handling is possible, otherwise `clarify` |

The PRD precedence remains normative. Quoted, negated, example, error-message and hypothetical
delivery language does not become current delivery intent. A mixed request with an actual requested
delivery effect activates delivery. A formal artefact activates only when the requested output is a
binding gate-relevant artefact, not an example or recommendation.

`requested_effect`, `invocation_provenance` and `selection_origin` are independent. Automatic model
or host skill selection is never invocation provenance. Current-turn text that expressly asks to use
AGDF is sufficient. A host signal is accepted only when it is trusted, ephemeral and bound to the
current deliberate user action. When provenance is `unavailable`, requested effect still determines
whether delivery or a named operation is applicable; selection origin alone never activates AGDF.

## 4. Operation Catalog And Route

The Request Activation Contract owns the bounded logical catalog below. It maps an already
determined request class and logical `operation_id` to an exact existing owner; it does not classify
natural language. Skill IDs are derived from `pluginDefinition.skillSet`, CLI-backed IDs are checked
against `commandRegistry`, and Runtime Integrity rejects an owner or ID that no longer exists.

| Logical `operation_id` | Route family | Target and control boundary | Exact owner | Missing-control or presentation result |
|---|---|---|---|---|
| `assist.agdf_help`, `assist.agdf_suitability` | control-independent help | No target unless the request expressly supplies one; no control probe. | Request Activation Contract plus ordinary assistant response | Normal answer; state absence only when material; no AGDF status or synthetic UR. |
| `delivery.start` | governed delivery intake | Resolve target for draft/setup; inspect structural presence only. Candidate control is revalidated by dispatcher v1. | `gate-check` skill delivery-intake section, existing target resolver, canonical-init coordinator, then dispatcher v1 | Draft plus setup orientation when absent; after durable persistence, canonical approval presentation. |
| `lifecycle.control.init` | repository control initialization | Target required; prior control not required. | existing `init` command handler through canonical-init coordinator | Lifecycle setup result; never a UR approval request. |
| `lifecycle.repository.activate.codex`, `lifecycle.repository.activate.opencode` | repository host-surface activation | Explicit resolved target and named surface required; delivery control is not invented or selected. | existing `codex-repo` or `opencode-repo` scaffold handler with explicit `--dir` | Existing repository-scaffold result or collision recovery; activation never falls back to cwd. |
| `lifecycle.repository.disable` | repository disable-with-retention | Target and existing lifecycle preconditions required. | existing `disable` handler and lifecycle result owner | Existing retained-state result or bounded recovery. |
| `lifecycle.plugin.install.<codex|claude|copilot|opencode>`, `lifecycle.plugin.uninstall` | global plugin lifecycle | No repository target or delivery control. Existing surface, scope, preview and consent rules apply. | matching existing install handler or `uninstall` handler in `cli/application.js` | Existing lifecycle result; cwd never supplies repository authority. |
| `status.installation.<codex|claude|copilot|opencode>` | global installation status | No repository target and no repository/control callback. | new targetless `inspectGlobalInstallationStatus()` factored from existing installation probes in `lifecycle/status.js` and `installers/opencode.js` | Installed/degraded/not-installed plus existing global next action; no repository claim. |
| `status.overview` | generic explicit AGDF status | Applicability is already positive. Inspect global installation without a target; add repository/delivery status only after explicit or reliably resolved target evidence. | new `evaluateStatusOverview()` in `lifecycle/status.js`, composing targetless installation status, existing target orientation and target-bound general status | Always return the global result. If target is unresolved, mark only the repository component unresolved and provide one target action; no cwd inference and no approval. |
| `status.repository_delivery` | repository and delivery status | Explicit resolved target required; control is optional and absence is a valid result. | `evaluateGeneralStatus()` with the resolved target | Repository status plus `not_configured`, no selected run, blocked/open/complete and one target/setup action; no synthetic approval. |
| `status.opencode_repository` | OpenCode repository activation status | Explicit resolved target required; control is not inferred. | repository portion of `evaluateOpenCodeStatus()` after refactoring | Existing OpenCode repository activation/binding result and bounded recovery. |
| `runtime.checks` | global runtime-check capability | No repository target or delivery control. | existing `runtime-checks` handler and consent service | Existing requested/effective/reason result. |
| `control.doctor`, `control.delivery_map` | explicit deterministic inspection | Target required; missing/invalid control is a result, not delivery intake. | `evaluateDoctor` or `evaluateDeliveryMap` through validation handlers | Normalized blocked/unavailable status and one restore/setup action; no synthetic UR. |
| `run.create`, `run.migrate`, `run.render_legacy` | explicit run lifecycle | Target required; command-specific control preconditions. | existing `run-create`, `run-migrate`, `run-render-legacy` handlers | Existing exact result or collision/recovery; never inferred from ordinary conversation. |
| `skill.<slug>` for every `pluginDefinition.skillSet` entry | direct AGDF skill | No pre-probe. Dispatcher v1 owns target then control. | dispatcher v1, followed by the named skill only on its existing continuation outcome | Deterministic gate-check returns its status presentation; judgement skills stop on a non-actionable snapshot and use the existing interaction owner. |
| `continuation.current` | active-run continuation | Target/run/gate revalidation required after positive action intent. | existing target/run/gate revalidators, then current declared owner | Restore/select the referenced run; never reinterpret as a new UR. |

The general `status` owner already distinguishes delivery `not_configured` from installation
failure. Its structural check is factored into a pure `inspectControlPresence()` returning only
`absent | candidate_present`. Only lifecycle/status and `delivery.start` may call it directly.
`candidate_present` is not actionable-control evidence: Doctor, run selection and gate-check remain
the sole validity and gate owners. An unqualified explicit `AGDF status` request remains positive
`explicit_agdf_operation` and maps to `status.overview`. Missing scope or target is a downstream
component state, not an applicability ambiguity; the status owner never supplies cwd as target
authority.

## 5. Skill Entry And Dispatcher Boundary

Every canonical skill retains the same marker-bounded Activation Kernel before its existing
Executable Dispatch or Direct Skill Invocation section. This is an on-selection backstop, not ten
eager copies. The block is projected from the canonical contract and lets a falsely selected skill
stop without another resource read or tool call:

1. Evaluate requested effect, invocation provenance and selection origin without a file read or tool.
2. If automatic discovery was a false positive, stop the AGDF skill silently and answer the
   original ordinary request.
3. If the requested effect is ambiguous, do not mutate and do not invoke AGDF operational owners.
4. Continue to the catalog route only after positive applicability. Load the full contract and other
   focused modules only after this decision when the route needs them.

The projected kernel carries an owner marker, policy version and source fingerprint and does not copy
the full class or operation tables. Runtime Integrity compares it byte-for-byte with the source
block. YAML descriptions are generated from compact definition-owned skill metadata plus one short
contract-owned boundary. Every description remains explicit that automatic discovery alone is
insufficient. The kernel, not ten exhaustive description suffixes, owns the complete exclusions for
assessment, explanation, comparison, recommendation, review, diagnosis, hypothetical advice,
quoted content and AGDF-as-topic discussion.

`gate-check` discovery wording is narrowed. The phrases `unclear approval` and `unclear next
step` are valid only inside already positive delivery or explicit AGDF context. They are not
standalone activation triggers.

Dispatcher v1 retains its CLI grammar, outer schema, contract version and orchestration ownership:

- no request class, prompt, provenance or operation field;
- no `not_applicable` or `silent_abstain` outcome;
- no request-sensitive control-missing policy;
- existing target-to-control order inside dispatch;
- existing non-authorizing outer result and host-action behavior.

For a false-positive automatic selection, no dispatcher call occurs. For explicit status or
lifecycle operations, the router selects their existing owner instead of using `gate-check` as a
generic proxy. For a valid direct `skill.<slug>` route, dispatcher v1 remains the first operational
call after the semantic guard and performs its target and control work once. `delivery.start` is not
a direct-skill route: its initial target/presence check authorizes only draft/setup; if candidate
control exists, dispatcher v1 repeats target resolution as the authoritative TOCTOU revalidation
before evaluating control.

`gate-check/SKILL.md` becomes a compact runtime bootstrap. It keeps purpose, the Activation Kernel,
the distinction between delivery intake and direct `skill.gate-check`, exact executable dispatch and
the terminal transfer rule. On the normal deterministic path, `terminal: true` ends the skill. Only a
declared `instruction_only` fallback loads the already packaged focused runtime-contract modules and
uses their canonical rules. The skill does not keep a second long gate handbook after its terminal
dispatch boundary.

## 6. Missing-Control And Delivery Intake

### 6.1 Generic gate-check correction

The current `AGDF_CONTROL_FILE_MISSING` branch in
`create-agdf/lib/control-evaluation/gate-check.js` must stop advertising an immediate
`Approval: UR` before a durable run and UR revision exist. It becomes a non-ready setup state:

- current conceptual gate remains UR;
- missing approval is `none` until a durable UR revision is ready;
- allowed work is draft UR, explicit setup/link authority, initialization and persistence;
- later artefacts and implementation remain forbidden;
- no approval presentation is rendered;
- the existing interaction owner renders a localized non-gate `control_setup_required` status with
  target, planned durable scope and one setup or cancel action.

This correction contains no request classifier. Applicability and operation routing have already
selected whether gate-check is the correct owner. It deliberately changes the nested missing-control
gate result consumed by dispatcher v1; configured-control results and the dispatcher's grammar,
outer schema, contract version and call order remain unchanged. Missing-control fixtures are migrated
as an explicitly superseded nested-owner behavior, not claimed byte-compatible.

### 6.2 Control-less delivery sequence

The current public `init` followed naively by `run-create` is not a valid implementation: `init`
creates a free-standing legacy `AGDF_RUN.md`, canonical run creation then produces
`mixed_authority`, and current scaffold collision handling cannot resume a partial setup. The design
therefore refactors the existing lifecycle rather than composing those commands unchanged.

The only valid sequence is:

1. After positive `delivery.start`, resolve the target for draft/setup authority and draft one
   concrete UR revision without mutating control.
2. Inspect structural presence. Reuse a conforming revision-stable run or linked authoritative SoT;
   treat `candidate_present` as requiring Doctor/run validation, not as actionability.
3. When control is absent, render the canonical setup orientation. Reuse setup authority already
   explicit in the current request or request it exactly once. Do not ask for gate approval yet.
4. Immediately before mutation, revalidate the same target and setup scope.
5. Invoke the existing `init` lifecycle through a new internal canonical-init coordinator. For a new
   repository it stages the owned scaffold, creates the canonical `runs/` store, omits a live legacy
   `AGDF_RUN.md`, validates the plan and publishes the new control directory atomically.
6. For an existing or interrupted scaffold, compare every planned owned file. Skip exact matches,
   complete only ownership-proven missing files, and block on changed, unknown or conflicting state.
   A temporary stage is non-authoritative and is cleaned or reported; it never becomes a second SoT.
7. Persist the UR, its artefact link, backlog row and a complete canonical run through existing atomic
   control-state writers. Reuse an existing matching run and its revision identity; an occupied run ID
   with different semantics remains `AGDF_RUN_COLLISION`.
8. Do not create a legacy live run. If an explicit compatibility projection is required, create it
   only from the selected canonical run through `writeLegacyProjection` after canonical persistence.
9. Run Doctor and focused selected-run gate-check. Any partial state, invalid link, projection drift,
   target drift or writer failure stops before approval presentation and remains non-authorizing.
10. Render the existing canonical approval orientation only when the persisted revision is ready,
    then request the exact approval once.
11. Revalidate the same target, run, gate and revision immediately before persisting approval.

Explicit `lifecycle.control.init` uses steps 4 through 6 only and reports the lifecycle result; it
does not invent a run or UR. Exact-match retries are idempotent. Repairable partial state is completed
only with the same bounded setup authority; conflicts are never overwritten or silently deleted.

No new public delivery-intake command or durable classification store is added. Existing `init`,
run-state, artefact and legacy-projection primitives are refactored behind the coordinator and remain
the only mutation owners. If implementation cannot provide the staged-new/exact-resume guarantees,
the work routes back to SD rather than adding a hidden fallback or using `--force`.

## 7. Canonical Source And Projection Changes

| Source | Required design change |
|---|---|
| `plugin/meta/contracts/request-activation.md` | Sole semantic owner for requested-effect classes, precedence, invocation evidence, selection origin, exact operation catalog, silence and pre-target order. Include one marker-bounded Activation Kernel and one compact discovery-boundary projection block. |
| `plugin/meta/agdf-runtime-contract.md` | Replace its hand-maintained module list with a bounded non-authoritative index projection generated from the definition. Request Activation is first. |
| `plugin/meta/agdf-plugin.definition.json` | Keep the concrete ordered `runtimeContract` inventory and add the versioned `instructionFootprint` budget object. Keep `skillSet.useFor`, `skillSet.boundary` and `skillSet.discovery` as the sole skill-specific discovery metadata. Existing explicit default prompts remain valid. |
| `plugin/meta/agdf-agent-router.md` | Keep Request Activation before Task Target Resolution and Quick Task downstream of positive applicability. Remain the complete packaged on-demand router, not a global eager OpenCode instruction. |
| `plugin/meta/contracts/task-target-resolution.md` | Limit target-first ordering to positive, target-bound applicability. Keep target precedence unchanged afterward. |
| `plugin/meta/contracts/modes.md` | State that ordinary read-only work is outside AGDF. Quick Task handles only positively activated governed work. |
| `plugin/meta/contracts/interaction.md`; `create-agdf/lib/interaction-presentation.js`; existing lifecycle result/presentation | Make ordinary abstention fully silent. Add normalized `operation_status` and non-gate `control_setup` envelopes with target, scope, planned effect, excluded authority, outcome and one next action. Retain read-only orientation only for positively activated explicit AGDF operations whose existing contract requires it. |
| `plugin/skills/*/SKILL.md` | Keep the generated marker-bounded kernel before operational dispatch as an on-selection backstop. Load the full contract only after positive applicability. Generate compact frontmatter from definition metadata plus the short discovery boundary. |
| `plugin/skills/gate-check/SKILL.md` | Keep narrowed discovery and pre-approval missing-control intake, but remove the post-terminal duplicate handbook. Load existing focused contracts only for declared `instruction_only` fallback. |
| `plugin/hooks/session-start.sh` | Remain a separately shipped, non-configured compatibility helper and contain no independent activation policy. It is not counted as model-visible unless a host explicitly configures it. |
| `create-agdf/scripts/sync-plugin-runtime.js` | Project the exact Activation Kernel and the smallest version-bound dispatcher binding into the existing generated SessionStart runtime. Keep optional consented health output as compact variable data, not repeated policy prose. |
| `create-agdf/scripts/sync-request-activation-projections.js` | Extract the canonical kernel/discovery blocks, update or check their marked regions in canonical router/skills and derive every compact frontmatter description. Packaging invokes check mode and fails on manual drift. |
| `create-agdf/opencode-plugin.js` | Emit only current repository-activation and version-bound dispatcher facts, with `authorizes: false`, through an idempotent system transform. Inactive repositories receive no executable binding. Compaction never repeats the complete active/inactive guidance block. |
| `create-agdf/lib/installers/opencode.js` | Consume the canonical module inventory but write a global micro-bootstrap instead of the complete router. Keep the prefix convention, Activation Kernel, bounded positive route families, repository activation boundary and pointers to the packaged router/contracts. Global lifecycle and control-independent help still bypass repository activation. |
| `create-agdf/lib/lifecycle/status.js`; status portions of `create-agdf/lib/installers/opencode.js` | Split targetless global installation/capability inspection from explicitly target-bound repository/delivery inspection. Add `evaluateStatusOverview()` to compose them without implicit cwd. Neither targetless path may read repository activation or control. |
| `create-agdf/scripts/sync-package-assets.js` | Derive contract modules, compact discovery and the OpenCode micro-bootstrap from canonical owners. Package the complete router separately for on-demand access. Fail on missing/duplicate kernel markers, forbidden full-router sections in eager OpenCode instructions and projection drift. |
| `create-agdf/lib/scaffold/plan.js`, `create-agdf/lib/scaffold/write.js` and new `create-agdf/lib/scaffold/canonical-init.js` | Remove parallel module lists; make `init` canonical-run-store aware, staged for a new control directory and exact-match resumable without `--force`; never create an authoritative legacy placeholder. |
| `create-agdf/lib/cli/application.js` and `create-agdf/lib/control-state/*` | Keep existing public handlers but reuse canonical-init and atomic run/artefact writers. Matching retry resumes; semantic collision blocks. |
| `create-agdf/scripts/smoke-test.js` | Consume the canonical module inventory and verify clean init, explicit lifecycle init, interrupted exact resume and no mixed legacy authority. |
| `create-agdf/lib/control-evaluation/gate-check.js` | Make missing control non-ready and pre-approval without receiving request intent. |
| `plugin/scripts/check-runtime-integrity.mjs` | Validate owner presence, inventory parity, kernel-before-dispatch ordering, silent hook inventory, instruction budgets, duplicate/conflict absence and negative drift cases. Verify identities and structure instead of freezing redundant natural-language sentences. |
| new `create-agdf/scripts/instruction-footprint-test.js` | Compose real generated and temporary installed surfaces, normalize only machine-specific absolute paths, measure every declared budget and reject a second binding, duplicate kernel, full eager router or policy prose in dynamic facts. |
| `evals/request-activation/` and focused test/recording owners | Add a separate no-skill-capable semantic and callback corpus rather than forcing silent abstention into the existing skill-eval schema. |
| German and English handbook quickstart/workflow pages | Explain when AGDF activates and when ordinary work remains outside it. Documentation remains secondary to the contract. |

Generated files under `create-agdf/generated/**`, generated manifests and installed host roots are
outputs only. They are regenerated and never edited as policy owners.

### 7.1 Existing projection drift repaired in scope

Add this exact plugin-root-relative schema to `agdf-plugin.definition.json`:

```json
{
  "runtimeContract": {
    "schemaVersion": 1,
    "manifestPath": "meta/agdf-runtime-contract.md",
    "modules": [
      "meta/contracts/request-activation.md",
      "meta/contracts/task-target-resolution.md",
      "meta/contracts/gate-transition.md",
      "meta/contracts/interaction.md",
      "meta/contracts/modes.md",
      "meta/contracts/quality.md",
      "meta/contracts/context-graph.md",
      "meta/contracts/control-scaffold.md",
      "meta/contracts/closeout.md"
    ]
  }
}
```

The implementation must consolidate the currently divergent contract-module lists in:

- `sync-package-assets.js`, which currently includes Task Target Resolution;
- `lib/installers/opencode.js`, `lib/scaffold/plan.js` and `scripts/smoke-test.js`, which
  currently omit it.

The canonical definition becomes the one module inventory. Every consumer reads this exact ordered
field and strips `meta/contracts/` only where a filename is required. The manifest index is a
marker-bounded projection, not another list owner. Runtime Integrity rejects missing, duplicate,
unknown, out-of-order or non-projected modules and a stale index.

The canonical full router keeps the order Surface Convention, Request Activation, Task Target
Resolution, Mode Selection and remains packaged as an on-demand resource. The OpenCode instruction
generator no longer transforms that full file into `AGDF.md`. It renders a separate micro-bootstrap
from the same canonical kernel and definition-owned prefix/skill metadata. The bootstrap must contain
exactly one kernel, must not contain Task Target Resolution, Mode Selection, gate tables, quality or
closeout sections, and must point to the packaged full router and focused runtime contracts for use
only after positive applicability. Missing or duplicate kernel markers fail generation.

## 8. Host And Hook Design

SessionStart remains the only common startup mechanism. For Codex, Claude Code and Copilot it emits
exactly one Activation Kernel plus one smallest version-bound dispatcher binding. It may also, under
existing consent, perform passive read-only repository health checks, but their result is compact
variable data rather than another instruction block. That baseline is request-independent and does
not:

- classify user text;
- select a target, operation, skill, run or gate for the request;
- dispatch a skill;
- persist applicability;
- emit an ordinary-request AGDF banner.

The binding carries only schema version, executable, argument prefix, expected AGDF version,
activation owner/version/fingerprint and `authorizes: false`. Absolute executable and validator paths
are runtime data. Silence, applicability classes and terminal transfer are expressed once by the
kernel and selected skill, not repeated as prose and redundant JSON flags around the binding.

Codex and Claude consume the canonical plugin contract and skill sources. Copilot and OpenCode
receive generated prefixed projections. Host metadata may prove deliberate invocation only when it
is an ephemeral user-action signal. The current design baseline is fail-closed until a version-bound
probe establishes such a signal:

| Host | Current trusted invocation signal | Treatment and named gap |
|---|---|---|
| Codex | `unavailable` | Skill selection/loading is not accepted as user invocation. Current-turn text/requested effect is authoritative until a fresh-host probe proves a bound user action. |
| Claude Code | `unavailable` | Loaded-skill state is not invocation evidence. Current-turn text/requested effect is authoritative until a version-bound probe proves otherwise. |
| GitHub Copilot | `unavailable` | A visible `Loaded skill` event may be automatic and is not trusted provenance. Current-turn text/requested effect is authoritative. |
| OpenCode | `unavailable` | Native skill-tool execution does not yet prove user-vs-model origin and subagent hook propagation is unverified. Probe both explicitly; missing callback trace is evidence `unavailable`, never parity. |

Each profile may later change only its evidence capability from `unavailable` to a version-bound
trusted signal. The canonical semantics and fallback do not change. `selection_origin` is recorded
separately whenever a test harness or host can observe it.

OpenCode's inactive-repository SessionStart warning toast remains removed because it is visible
without a request. Its global and repository `AGDF.md` files are micro-bootstraps. The dynamic system
transform is content-idempotent and contributes only binding plus variable active/version facts. An
inactive repository contributes no executable binding and no repeated policy prose. Explicit status
or lifecycle actions retain their existing visible results and recovery.

`experimental.session.compacting` must not copy active or inactive dynamic guidance wholesale. Until
fresh OpenCode evidence proves that the Activation Kernel and current binding survive or are reapplied
after compaction, it may append exactly one kernel-only recovery block within the declared compaction
budget. The exit criterion for reducing this to a fingerprint-only reminder is a fresh version-bound
observation proving that system transform is reapplied and the current binding remains available.
The existing hook inventory otherwise remains structurally unchanged.

### 8.1 Instruction Footprint Contract

`plugin/meta/agdf-plugin.definition.json` owns one versioned, machine-readable
`instructionFootprint` object. Measurement uses UTF-8 bytes after LF normalization. For dynamic
bindings, tests replace only absolute executable, validator and working-directory values with the
fixed tokens `<executable>`, `<validator>` and `<working-directory>` before applying normalized
budgets. Tests also report raw bytes. They do not remove policy prose, headings or repeated content.

| Surface | Maximum normalized UTF-8 bytes | Structural condition |
|---|---:|---|
| Activation Kernel including markers and fingerprint | 1,100 | exactly one semantic kernel source |
| One skill discovery description | 420 | one skill-specific purpose/boundary plus short activation boundary |
| All ten discovery descriptions | 3,000 | no repeated full exclusion taxonomy or operation catalog |
| Common SessionStart base context | 1,900 | exactly one kernel and one dispatcher binding; no router or gate handbook |
| Optional consented runtime-check supplement | 320 | variable result facts only |
| OpenCode eager `AGDF.md` micro-bootstrap | 4,000 | exactly one kernel; no Task Target, Mode, gate, quality or closeout section |
| OpenCode active dynamic context | 1,000 | exactly one binding and active/version facts; no copied kernel or policy prose |
| OpenCode inactive dynamic context | 0 | no binding and no system instruction |
| OpenCode composed eager static plus active dynamic | 5,000 | no duplicate binding or kernel |
| OpenCode compaction addition | 1,100 | at most one kernel-only recovery block until its exit criterion is proven |
| Selected `gate-check/SKILL.md` | 6,500 | kernel plus dispatch/bootstrap only; detailed fallback comes from focused contracts |

Runtime Integrity and the focused footprint test fail on budget excess, a second binding, duplicate
kernel, conflicting activation language, full-router leakage into eager OpenCode instructions or
immutable policy prose in dynamic binding facts. Budgets may be tightened from measured evidence.
Increasing a budget or weakening a structural condition is a design change and requires the normal
SD/TP path. Machine-specific path growth alone is reported and does not change the normalized result.

## 9. Compatibility, Rollout And Rollback

- Request Activation policy starts at `policy_version: 1`.
- Dispatcher `contract_version: 1`, CLI grammar, normalized input, outer outcomes and internal
  target-to-control order are unchanged.
- No control-state schema migration is required.
- Existing exact approvals, target resolution, lifecycle safety, locale and interaction schemas are
  unchanged after positive applicability.
- The previous visible generic read-only orientation remains available only for positively activated
  explicit AGDF read-only operations. It is removed from ordinary non-AGDF handling.
- Generated profiles ship as one coherent version. A surface is not claimed updated until its
  installed profile digest and fresh-session behavior are evidenced.
- Rollback reinstalls the prior coherent profile version. It does not delete or rewrite repository
  control state.
- There is no fallback to the broad old trigger, keyword matching or automatic control
  initialization.
- Configured-control dispatcher goldens remain byte-stable. Missing-control nested gate snapshots
  and presentations intentionally change to the approved pre-approval setup behavior and receive an
  explicit fixture migration; they are not represented as byte-compatible v1 output.

An executable non-classifying preflight is explicitly deferred. It may be considered only in a
separate governed scope if version-bound fresh-host evidence still shows false activation after the
contract, discovery and projection corrections. Any future preflight must receive no raw prompt,
target, run or control data, persist nothing, authorize nothing and remain outside dispatcher v1.

## 10. Privacy, Security And Failure Semantics

- Production request text stays in the existing host/model context. No new network call, log,
  durable file or telemetry field receives it.
- The transient decision is not approval, target evidence, run selection or mutation authority.
- `abstain` and `clarify` cause zero request-driven calls to dispatcher, target, repository
  activation, run, control or AGDF renderer owners.
- Ambiguity blocks mutation and formal artefact creation but does not force AGDF activation.
- Missing or conflicting invocation provenance never becomes an approval and never overrides the
  requested effect.
- Global lifecycle operations never inherit a repository target from cwd.
- Failures after positive activation use the existing bounded recovery path and never leak internal
  activation diagnostics into ordinary handling.
- No hook, generated profile, test fixture or installed runtime becomes a second policy owner.

## 11. Verification Design

### 11.1 Dedicated request-activation corpus

Create a versioned German/English corpus under `evals/request-activation/`. Its schema supports
`selected_skill: none`, unlike the current skill-eval corpus. Each case records:

- case id, locale, current user text and only the minimum necessary prior-turn context;
- requested effect, invocation provenance and independent selection origin;
- expected request class and decision;
- optional existing operation id;
- expected visible AGDF policy;
- allowed and forbidden callback names;
- covered PRD criteria.

Coverage includes ordinary project assessment, AGDF-as-topic, advice versus implementation,
assessment plus repair, quoted/negated/example/code-block language, advisory versus binding
artefacts, ambiguity, explicit skill/status/lifecycle operations, missing control and active-run
continuation/deactivation. Explicit user selection, false-positive automatic discovery, router
selection and unavailable origin are distinct cases; none may be inferred from invocation
provenance.

Deterministic corpus validation proves schema, pair coverage, expected callback policy and source
fingerprints. Behavioral model and loaded-host evaluation are reported separately and may not be
called deterministic product proof.

### 11.2 Callback and ordering evidence

Instrumentation or test doubles use these request-driven callback names:

`dispatcher_v1`, `target_resolver`, `repository_activation`, `control_presence`,
`run_selector`, `control_evaluator`, `agdf_renderer`, `installation_status_owner`,
`repository_status_owner`,
`help_suitability_owner`, `lifecycle_owner`, `canonical_init`.

- `abstain` and `clarify` require zero calls to every AGDF callback.
- Positive target-bound routes require applicability before target.
- Direct skill routes require dispatcher as their first operational callback; dispatcher owns target
  then control. Delivery intake may resolve target and structural presence first, but no control
  evaluator runs before dispatcher revalidation when candidate control exists.
- Lifecycle and status routes invoke only their declared owners.
- Global installation/capability status asserts zero target, repository and control callbacks;
  repository/delivery and OpenCode-repository status require a previously resolved explicit target.
- Generic explicit AGDF status stays positively activated, returns targetless global status and
  reports an unresolved repository component when no target is reliable. Separate cases cover
  generic overview, explicit global installation status and explicit repository/run status.
- Repository activation cases cover `codex-repo` and `opencode-repo` independently and assert the
  resolved `--dir`, selected surface, lifecycle result and absence of delivery/run invention.
- Control-less delivery proves draft, setup, persistence, validation, presentation and one approval
  in order, including refusal, failure, partial and stale-revision cases.
- Every request-driven test captures consent state and callback counters after passive SessionStart
  and immediately before the prompt. Abstention requires a zero delta from that baseline. Passive
  setup before the baseline is reported separately and cannot mask a request-caused callback.

### 11.3 Regression suites

Required repository evidence includes:

- all existing skill and target preflight tests;
- dispatcher v1 golden input, output, CLI and timing compatibility;
- explicit migration of only missing-control nested gate fixtures, with configured-control goldens
  unchanged;
- gate-check missing-control non-readiness;
- general status and lifecycle missing-control behavior;
- exact approval and same-target/run/gate/revision tests;
- Runtime Integrity positive and negative checks;
- hook inventory and OpenCode no-toast regression;
- canonical-to-generated semantic projection for Codex, Claude, Copilot and OpenCode;
- repeated generation with byte/digest stability;
- package contents, install and rollback checks;
- clean implementation review rejecting duplicate classifiers, keyword tables, host forks and
  hidden fallbacks.

### 11.4 Composed Instruction Evidence

Add `test:instruction-footprint` as a focused deterministic owner. It must generate the actual
profiles, create an isolated temporary OpenCode global surface and execute the real SessionStart and
OpenCode transform/compaction functions. It reports raw and normalized bytes for every budget in
section 8.1 and fails on duplicate or conflicting content.

Extend the behavioral request-activation evaluator with a `composed_profile` input mode. That mode
uses the real micro-bootstrap or SessionStart kernel, discovery description and selected skill
content for each surface instead of supplying the complete canonical Request Activation Contract as
an oracle. It must cover negative, positive, mixed, explicit-operation and continuation pairs.
Behavioral results remain supporting model evidence and never replace deterministic composition,
installed readback or fresh-host observations.

Runtime Integrity verifies identities, fingerprints, route ownership, section absence and budgets.
It must not require long duplicate sentences merely to prove semantic parity. Negative fixtures add
a second binding, duplicate kernel, old full OpenCode router, dynamic policy prose and each budget
overflow independently.

### 11.5 Fresh-host evidence

Codex, Claude Code, GitHub Copilot and OpenCode are each tested in a fresh version-bound session for:

- repositoryless context;
- repository without control;
- repository with one active run;
- ordinary assessment and AGDF-as-topic;
- advice/delivery and mixed-intent pairs;
- explicit invocation, false-positive automatic discovery, router selection and unavailable
  selection origin independently from invocation provenance;
- lifecycle/status and unavailable later-gate operations;
- continuation versus unrelated follow-up;
- ambiguous effect.

Each observation records host, model, plugin version, profile digest, host capability result,
invocation provenance, selection origin, SessionStart consent and post-SessionStart callback
baseline, visible transcript, callback delta when available, filesystem/control delta and covered
PRD criterion. A missing callback trace is recorded `unavailable`, not zero and not pass. The
OpenCode matrix names both user-vs-model skill-origin and subagent-hook propagation probes. Source,
generated profile, installed bytes and loaded-host behavior remain separate evidence planes. One
host result never proves another.

## 12. PRD Coverage

| Product criteria | Design components |
|---|---|
| `RAB-01`, `RAB-02`, `RAB-04`, `RAB-05`, `RAB-06`, `RAB-10`, `RAB-12`, `RAB-18`, `RAB-20` | Request Activation Contract, skill discovery guard, silent no-callback path and semantic corpus. |
| `RAB-03`, `RAB-11`, `RAB-13` | Positive delivery/continuation routing followed by unchanged target, run, gate and approval revalidation. |
| `RAB-07`, `RAB-08`, `RAB-09`, `RAB-19` | Operation Route, lifecycle/status reuse and pre-approval control-less delivery sequence. |
| `RAB-14`, `RAB-15` | Canonical module inventory, bounded projection, Runtime Integrity and separate fresh-host evidence. |
| `RAB-16` | No new executable classifier, network dependency, raw-prompt transport or persistence. |
| `RAB-17` | Existing bounded recovery after positive activation. |

## 13. Rejected Alternatives

| Alternative | Reason rejected |
|---|---|
| Second SessionStart, per-prompt or pre-tool hook | Creates another policy owner, differs by host and can make ordinary requests visibly noisy. |
| Full router in global or repository OpenCode `AGDF.md` | Loads target, mode, gate, quality and closeout rules before applicability exists and then overlaps with selected-skill and dynamic context. Package it for on-demand use instead. |
| Repeat complete active/inactive guidance during OpenCode compaction | Duplicates immutable policy and binding prose. Retain at most one kernel-only recovery block until host retention is proven. |
| Keyword or regex classifier | Cannot safely distinguish quotes, negation, advice, examples and mixed requested effects. |
| Remote classifier | Adds privacy, availability, latency and policy-owner problems without gate authority. |
| Executable preflight in this delivery | It could validate only a model-provided enum, not correct semantic misclassification without receiving the prompt, and may itself become visible or permission-bound. |
| Dispatcher v1 request-class field or abstention outcome | Breaks an independently governed public post-selection contract and turns the dispatcher into an activation owner. |
| Request-sensitive logic inside gate-check evaluation | Duplicates applicability semantics in the gate owner. Only generic pre-approval missing-control safety changes there. |
| Host-specific activation policies | Produces semantic drift and prevents coherent rollback. |
| Automatic control initialization | Mutates durable state without explicit setup authority. |
| Current `init` followed directly by current `run-create` | Creates a legacy/canonical mixed-authority state and cannot safely resume partial scaffold writes. The existing lifecycle is refactored behind one canonical-init coordinator instead. |
| Retaining the generic ordinary read-only banner | Violates the approved silent-abstention outcome. |

## 14. Context Graph And Source Of Truth

After Revision 5 approval and within the revised implementation plan, update the existing
`CG-REQUEST-ACTIVATION-AUTHORITY` node with:

- refs to the new contract, router, definition, skill entries, projection owners, dedicated corpus
  and this run, including `INSTRUCTION_FOOTPRINT_AUDIT.md`;
- decision that requested effect and permitted invocation provenance determine request-scoped,
  non-authorizing applicability before every existing AGDF operational owner;
- invariants for silent abstention, no persistence, no second hook, no raw-prompt classifier and
  unchanged downstream authority, one eager kernel, on-demand operational detail and bounded
  model-visible instruction planes;
- relationships that it precedes `CG-TASK-TARGET-AUTHORITY` and
  `CG-EXECUTABLE-SKILL-DISPATCH-AUTHORITY`, while
  `CG-NATIVE-INTERACTION-AUTHORITY` remains the sole visible interaction and approval owner after
  activation.

The existing Source-of-Truth Registry entry for `plugin/meta/contracts/` already covers the contract.
No second SoT row is required. Reconciliation remains an explicit warning until the node, budgets
and two-stage projection are implemented and evidenced.

## 15. Open Questions And Next Step

Revision 5 resolves normalized finding `RAB-CIR-02` at the design level. It retains Revision 4's
request semantics, operation catalog, target/status/init ownership and dispatcher-v1 boundary while
replacing full eager OpenCode routing and overlapping policy prose with a two-stage instruction
model and measurable budgets.

The only evidence-dependent exit decision is OpenCode compaction: keep one kernel-only recovery block
until a fresh version-bound observation proves that system transform and current binding survive or
are reapplied. That bounded fallback has a named owner, budget and exit criterion.

Solution Design Revision 5 is approved. TP Revision 1 and its implementation/review evidence are
stale for this design change. The next permissible step is to review Task/Test Plan Revision 2 and
provide exact `Approval: TP`, request revision or decline. Implementation remains forbidden before
that approval and focused pre-implementation Brownfield Analysis.
