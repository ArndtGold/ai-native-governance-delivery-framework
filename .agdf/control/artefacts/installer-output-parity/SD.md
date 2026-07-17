# Solution Design: Coherent AGDF Installation Lifecycle

Status: approved; revision 2
Gate: SD
Date: 2026-07-17
Derived from: approved `PRD.md` revision 2
Gate approval: revision 1 approved on 2026-07-16; revision 2 approved with exact `Approval: SD` on 2026-07-17

## Revision 2 Solution Delta: English Multi-Surface Lifecycle Card

### 1. Design Summary

Extend the existing lifecycle result and presentation boundary; do not introduce a second card,
surface registry or status evaluator. Every lifecycle caller supplies one normalized coding-agent
surface. The result validates the canonical value, and the renderer maps it to the human product name
through one immutable presentation map.

The lifecycle renderer owns fixed English CLI copy and no longer imports interaction locale copy or
accepts project `chat_language`. Project language resolution remains unchanged for generated config,
agent chat and durable artefacts. `--language` and `--lang` retain that project-only meaning.

### 2. Canonical Surface Flow

```text
command target or explicit --surface
  -> validate/normalize canonical surface
  -> lifecycle operation or repository setup
  -> schema-v1 lifecycle result.surface
  -> shared English renderer
  -> human product label + surface-specific activation/next action
```

Canonical values are `codex`, `claude`, `opencode`, `copilot` and `generic`. `result.js` rejects an
unsupported or missing surface. `presentation.js` owns only this human-label map:

```text
codex    -> Codex
claude   -> Claude Code
opencode -> OpenCode
copilot  -> GitHub Copilot
generic  -> Generic coding agent
```

The `codex`, `claude`, `opencode`, `codex-repo`, `opencode-repo` and `copilot` handlers pass their
surface from the registered command identity. Shared `status`, `disable` and `uninstall` handlers pass
the validated `options.surface`. A concrete host operation rejects `generic`; no handler falls back to
Codex.

### 3. Additive Lifecycle Result Projection

Keep `schema_version: 1` and all existing fields. `createLifecycleResult()` adds deterministic
sections while retaining `verification` and `restart` for compatibility:

```json
{
  "schema_version": 1,
  "operation": "install",
  "result": "success",
  "surface": "claude",
  "scope": "global",
  "version": {
    "expected": "0.9.6",
    "installed": "0.9.6",
    "previous": null,
    "status": "verified",
    "transition": "unchanged"
  },
  "installation": { "status": "healthy" },
  "activation": { "status": "pending_restart", "reason": "host_reload" },
  "delivery": { "status": "not_evaluated" },
  "verification": { "status": "healthy", "evidence": [] },
  "restart": { "required": true, "reason": "host_reload" },
  "next_action": { "kind": "restart", "text": "Restart Claude Code, then verify the plugin in a new session." }
}
```

Default derivation is centralized in `result.js`:

- `installation.status` derives from verified lifecycle outcome unless explicitly provided by the
  existing status composer.
- `activation.status` derives from `restart.required` and observed host state; restart reasons remain
  canonical machine values.
- `delivery.status` defaults to `not_evaluated`. Only the existing general status composer may pass a
  repository delivery decision from doctor/gate-check evidence.
- Existing status values and exit codes remain unchanged. Additive fields must not reinterpret legacy
  evidence or claim activation from repository-file verification.

### 4. English Human Renderer

`create-agdf/lib/lifecycle/presentation.js` replaces locale lookup with a frozen English copy map and
operation-title map. It renders one structure for every surface:

```text
<operation-specific completion title>

Surface: <human surface label>
Version: <installed or transition> (<verification>)
Installation scope: <scope>
Installation: <health>
Activation: <activation state>
Repository delivery: <delivery state>

Next action: <one surface-specific action>
```

`Result: success` is represented by the operation-specific title and is not repeated. Human copy
converts underscore machine states to readable English; raw values remain in JSON. Failed and partial
results retain an explicit outcome plus phase-specific evidence.

`printLifecycleResult()` and `printGeneralStatus()` no longer accept a locale. All callers stop passing
`options.language.chat_language`. The interaction locale registry remains unchanged because it still
owns agent-chat, gate and approval presentation.

### 5. Native Output Capture And Verbose Mode

Add `--verbose` to the existing parser, validated command options and help. The option affects
presentation only; it does not change operations, confirmation or verification.

Codex and Claude plugin phases switch successful native execution from inherited stdio to captured
stdout/stderr. Each phase returns structured diagnostic evidence containing executable, arguments,
phase and captured text. OpenCode and repository setup use the same presentation policy for their
existing evidence.

- normal success: do not replay captured native success chatter or internal paths; print one card;
- verbose success: replay ordered captured phase detail, then print the identical card;
- failure/partial: print the decisive upstream error and recovery action in normal mode; verbose also
  prints all captured phase diagnostics available before failure;
- JSON: emit only the lifecycle result, including structured evidence; never replay human diagnostics.

Capturing output must preserve exit status, Windows command resolution behavior and phase
classification. It must not parse success from prose; verification continues to use the existing
plugin-list/config/file evidence.

### 6. Repository Setup Integration

Refactor `scaffold/presentation.js` so generated/preserved path lists are technical detail rather than
a competing completion surface. Repository targets pass the canonical surface into the lifecycle
result:

- `codex-repo` -> `codex`
- `opencode-repo` -> `opencode`
- `copilot` -> `copilot`

Normal successful setup prints the shared card. `--verbose` adds generated, preserved and removed-path
detail before it. `init`, `config` and compatibility-only composite targets retain their existing
task-oriented output where no single coding-agent lifecycle result exists.

### 7. Surface Capability Policy

Surface-specific code may supply only evidence-based activation and next-action data:

- Codex: pending restart and repository plugin activation where applicable;
- Claude Code: pending restart/new-session verification where required;
- OpenCode: pending restart when the config/package change requires reload;
- GitHub Copilot: repository instructions/config visibility and `/instructions` verification;
- Generic: `unknown` activation unless the caller has explicit generic evidence.

These adapters may not change card row order, CLI language, health semantics or delivery authority.
The general status composer remains the only lifecycle surface that combines repository delivery from
doctor/gate-check.

### 8. Focused Verification

1. Surface matrix: canonical value, human label, handler propagation and no Codex fallback for all
   four supported coding agents.
2. English invariance: German/English OS locale and project language produce identical lifecycle
   labels and human values.
3. Result invariants: additive installation/activation/delivery derivation and schema-v1 compatibility.
4. Card shape: install/update/unchanged/repository setup/disable/uninstall/partial/failure.
5. Output policy: quiet normal success, ordered verbose evidence and always-visible decisive failure.
6. Repository setup: Codex, OpenCode and Copilot use the shared renderer with surface-specific action.
7. Existing lifecycle, CLI, scaffold, smoke, release-bootstrap and runtime-integrity suites plus
   `git diff --check`.

### 9. Compatibility And Ownership

- No existing command spelling, JSON field or exit code is removed.
- `--verbose` is additive and defaults false.
- Project language files and interaction locales do not migrate.
- Host commands remain authoritative; this delta changes capture and presentation, not installation
  sequences or mutation scope.
- Existing `lifecycle/result.js`, `lifecycle/presentation.js`, CLI parser/application, installer
  adapters and scaffold presentation remain the only owners.
- Update existing Context Graph nodes `CG-CREATE-AGDF-CLI-COMPOSITION` and `CG-RUN-STATUS-CARD`; do
  not add a new node.

### 10. Required Next Step

After exact SD approval, draft a bounded Task Plan for the existing owners and focused surface/output
matrix. Implementation remains forbidden until TP approval and Brownfield Analysis pass.

## Revision 1 Baseline

## 1. Design Decision

Introduce one versioned lifecycle result model and human renderer around the existing installer,
scaffold and control-evaluation owners. Add `status`, `disable` and `uninstall` to the current command
registry. The new orchestration layer composes host evidence and delegates delivery evaluation to
`doctor` and `gate-check`; it does not become a second installer, plugin manager or gate evaluator.

Keep approval interaction in its existing interaction-presentation owner. This run extends the
installation and first-use projections to report the actual transport capability, but does not create
a parallel approval adapter or change approval authority.

## 2. Ownership And Module Boundaries

```text
create-agdf/lib/cli/
  command-registry.js, parse-args.js, application.js
    -> command discovery, option validation and handler routing

create-agdf/lib/lifecycle/
  result.js
    -> schema-v1 lifecycle result, status vocabulary and invariants
  presentation.js
    -> localized Success Card, status view and failure view
  status.js
    -> read-only composition of surface, repository and delivery evidence
  operations.js
    -> preview/apply orchestration for disable and uninstall

create-agdf/lib/installers/
  plugin-installers.js, opencode.js
    -> host-native probes and install/remove adapters; phase-classified evidence

create-agdf/lib/scaffold/
  plan.js, write.js, presentation.js
    -> collision-safe repository writes and post-write verification

create-agdf/lib/control-evaluation/
  doctor.js, gate-check.js, delivery-map.js
    -> unchanged delivery authority consumed by lifecycle status

create-agdf/lib/interaction-presentation.js
plugin/meta/contracts/interaction.md
plugin/meta/agdf-plugin.definition.json
  -> single approval capability and exact-text fallback owner
```

`create-agdf/generated/` remains derived output and is refreshed only through the existing asset-sync
pipeline. README, INSTALL and package README retain their current documentation ownership.

## 3. Lifecycle Result Contract

All lifecycle commands return a schema-v1 operation result. Human output renders from this result;
`--json` emits it without translating enum values.

```json
{
  "schema_version": 1,
  "operation": "install",
  "result": "success",
  "surface": "codex",
  "scope": "global",
  "version": { "expected": "0.9.3", "installed": "0.9.3", "status": "verified" },
  "verification": { "status": "healthy", "evidence": ["codex plugin list"] },
  "restart": { "required": true, "reason": "host_reload" },
  "next_action": { "kind": "prompt", "text": "..." },
  "changes": [],
  "retained": [],
  "failure": null
}
```

Invariants:

- successful install, update, disable and uninstall results contain all Success Card fields;
- `next_action` is one object, never a list;
- unknown versions stay explicit and cannot produce `verified`;
- host output is preserved as evidence and phase classification is additive;
- a partial operation uses `result: partial`, lists completed and retained work and provides one
  recovery action;
- human and JSON output derive from the same object.

## 4. Success Card Rendering

`renderLifecycleSuccess()` prints one localized card in this fixed order: Result, Surface,
Installation scope, AGDF version, Verification, Restart required, Next action. Install adapters stop
printing their own competing completion summaries and instead return evidence to the renderer.
Host-native command output may appear before the card and is not rewritten.

For `codex-repo`, the post-write verifier checks every planned file, ownership/collision outcome and
the repository marketplace definition. When the host still requires restart plus `/plugins`, these
are expressed as one compound next action. The card must report repository files as verified but
plugin activation as pending; it must not collapse both into `healthy`.

## 5. General Status Composition

`status` is a read-only aggregator with this top-level contract:

```json
{
  "schema_version": 1,
  "installation": { "status": "healthy", "surface": "codex", "version": "0.9.3", "evidence": [] },
  "repository": { "status": "active", "scope": "repository", "evidence": [] },
  "delivery": { "status": "blocked", "run_id": "example", "current_gate": "PRD", "evidence": [] },
  "next_action": { "kind": "approval", "text": "..." }
}
```

`status` probes a selected surface or safely detects observable configured surfaces. It does not
install, initialize `.agdf/control`, select among ambiguous runs or persist diagnostics. Repository
state comes from owned surface markers/configuration. Delivery state is mapped from existing
selected-run `doctor` and `gate-check` results. Ambiguity remains visible and blocked rather than
silently resolved. `opencode-status` stays compatible and becomes a surface-specific projection over
the shared probes only when this can be done without changing its schema or exit codes.

Installation and delivery status never inherit from one another. In particular,
`installation.status: healthy` and `delivery.status: blocked` are a valid simultaneous result.

## 6. Command And Option Design

Primary help uses task-oriented groups and only the `npx --yes @agdf/cli@latest` family above the
fold. Scaffold and legacy forms move under `Advanced / Compatibility`.

```text
npx --yes @agdf/cli@latest status [--surface <surface>] [--run <run_id>] [--json]
npx --yes @agdf/cli@latest disable --surface <surface> [--scope repository] [--dir <path>] [--json]
npx --yes @agdf/cli@latest uninstall --surface <surface> --scope global [--confirm] [--json]
```

- `status` defaults to safe observation; `--run` is optional and ambiguity fails visibly.
- `disable` defaults to repository scope but still requires a surface. It writes only the minimal
  supported opt-out after ownership preflight and never deletes durable control state.
- `uninstall` requires both explicit surface and `--scope global`. Without `--confirm` it returns a
  non-mutating preview. `--confirm` applies exactly the displayed owned operations.
- unsupported surface/scope pairs fail before mutation with an actionable message.
- existing commands and compatibility entry points remain accepted.

## 7. Surface Adapter Contract

Each surface adapter implements only supported operations:

```text
inspect({ repository, config }) -> installation/repository evidence
install({ scope })              -> lifecycle evidence
disable({ repository })         -> owned minimal opt-out or unsupported
uninstall({ scope: global })    -> planned host-native and owned-file operations
verify({ intendedState })       -> observed result
```

Codex and Claude use their native plugin CLIs for global mutation and parse plugin-list evidence for
verification. OpenCode reuses its existing config/package probes and ownership markers. Repository
operations reuse scaffold collision and ownership rules. No adapter deletes `.agdf/control`, source
documents, user-authored configuration or ambiguous files.

Claude failures are classified by phase (`executable`, `marketplace`, `plugin_operation`, `version`,
`verification`) using the invoked command and preserved stdout/stderr. A marketplace Git failure is
therefore not rewritten as a missing Claude executable. No automatic retry through another transport
is allowed.

## 8. Disable And Uninstall Safety

Operations are planned before mutation as ordered records containing path/command, scope, ownership
proof and expected postcondition. The apply phase accepts only the immutable validated plan created
for the same selected surface and scope.

- Repository disable prefers a supported local `enabled = false` or equivalent owned setting.
- Existing user-owned/conflicting settings produce a retained finding and manual next action.
- Global uninstall invokes the host-native removal command first where supported, then removes only
  generated global files with valid canonical markers.
- Verification reruns the same read-only probes; mismatch yields `partial` or `failed`, never success.
- Removal retains all repository plugin files and durable run state unless a future separately
  approved command owns that scope.

## 9. Read-Only Request Orientation

The runtime contract and gate-check skill receive one localized orientation branch for a newly
classified read-only request: “Read-only Prüfung – kein neuer AGDF-Run und keine Freigabe
erforderlich.” It is emitted once per request, before findings, and performs no control-state write.
Existing-run status inspection remains read-only and does not restate the banner after the initial
request classification.

This behavior is runtime guidance plus contract tests; it is not inferred from the new CLI `status`
command and does not create a run solely to remember that the message was shown.

## 10. Native Approval Capability Truth

`evaluateNativeApprovalCapability()` remains the single preflight. Runtime capability evidence wins
over static metadata; conflict, missing transport, unsafe wait and `decorated_label_only` fail closed
before native invocation. The fallback receives the reason and renders the unchanged canonical value
exactly once.

The currently loaded Codex question tool cannot be advertised as exact-value native approval because
its recommended option label is decorated and no independent value field is available. Static plugin
metadata and public copy must describe native buttons as capability-dependent. Repository tests can
prove preflight and fallback semantics, but only live UAT can prove host-visible button behavior.
`Approval: <GateName> (Recommended)` remains invalid at parsing, revalidation and persistence.

## 11. Documentation And Product Entry

- Root `README.md`: current product boundary, primary install and verified supported surfaces first;
  conceptual framework text follows.
- `INSTALL.md`: canonical install, verification, status, update, disable and uninstall journeys,
  including restart and retained-state semantics.
- `create-agdf/README.md`: primary command reference; scaffold and legacy commands under
  `Advanced / Compatibility`.
- Approval UX copy states capability dependence and exact-text fallback without promising buttons.
- Existing independent-project, discussion-draft and non-standard disclaimers remain visible.

## 12. Test And Verification Design

Focused deterministic coverage:

1. lifecycle schema and ordered human Success Card for install/update/unchanged/unknown/partial;
2. simultaneous healthy installation and blocked delivery in human and JSON output;
3. status read-only behavior, no run creation and ambiguous-run handling;
4. repository disable ownership collision, retained control state and verification;
5. uninstall preview, missing confirmation, owned removal, ambiguous retention and partial failure;
6. Codex/Claude/OpenCode adapter phase classification and upstream evidence preservation;
7. `codex-repo` post-write verification and one truthful remaining host action;
8. read-only orientation once with no durable mutation;
9. decorated-only/conflicting capability, exact-text fallback and decorated approval rejection;
10. help hierarchy and compatibility command acceptance.

Final verification runs focused unit/smoke tests, generated asset sync plus integrity checks, package
and release-bootstrap smoke tests, selected-run doctor/gate-check, documentation link checks and
`git diff --check`. Live Codex UAT is required for host-visible approval sequencing and restart/plugin
activation claims; repository tests alone cannot close those claims.

## 13. Migration And Compatibility

The lifecycle schema is new and versioned. Existing `doctor`, `gate-check`, `delivery-map` and
`opencode-status` JSON contracts and exit codes remain compatible. Existing install and scaffold
commands retain their accepted invocations, while their human completion output is intentionally
normalized through the Success Card. No persistent migration is required.

## 14. Context Graph Reconciliation

- `CG-CREATE-AGDF-CLI-COMPOSITION`: link the lifecycle command/orchestration modules to the
  existing registry and adapters.
- `CG-RUN-STATUS-CARD`: extend with the explicit installation/repository/delivery separation without
  changing gate authority.
- `CG-NATIVE-INTERACTION-AUTHORITY`: record runtime-over-static capability truth and the
  decorated-only fail-closed invariant; keep the existing approval owner.
- context_graph_impact: `update`
- context_graph_gate_effect: `warning until implementation reconciliation`

## 15. Required Next Step

SD is approved. The Task Plan may be drafted; implementation remains forbidden until the Task Plan
is approved and the required pre-implementation Brownfield Analysis is complete.

## Approval

- `Approval: PRD` provided on `2026-07-16`.
- `Approval: SD` provided on `2026-07-16`.
