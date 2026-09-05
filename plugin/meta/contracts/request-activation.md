# AGDF Runtime Contract — Request Activation

## Purpose And Authority

Request Activation decides whether the current user request may enter an AGDF operation. It runs
before task-target resolution, repository activation, control inspection, run or gate selection,
dispatcher v1, AGDF presentation, and mutation.

This contract is the sole semantic owner for request applicability, requested-effect precedence,
invocation provenance, selection origin, the bounded operation catalog, and silent abstention. It
does not resolve a target, inspect a repository, validate control, select a run, evaluate a gate,
render AGDF output, or authorize work.

The decision is request-scoped and transient:

- no raw prompt or derived request classification is written to disk, logs, control state, or a new
  telemetry field;
- no network request, remote classifier, repository read, tool call, or dispatcher call is needed
  to make the semantic decision;
- passive SessionStart context, installed-plugin presence, cwd, repository presence, durable control,
  a prior unrelated run, router selection, and automatic skill discovery are not activation evidence;
- exact approval, target, run, gate, lifecycle, status, and presentation authority remains with the
  existing downstream owners after positive applicability.

## Transient Decision

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

| Request class | Requested effect | Decision |
|---|---|---|
| `ordinary_read_only` | Assessment, explanation, comparison, recommendation, review, diagnosis, hypothetical or advisory implementation discussion, or AGDF discussed only as a subject. | `abstain` |
| `delivery_intent` | An actual governed change, fix, refactor, implementation, or other delivery effect is requested. | `activate_delivery_intake` |
| `delivery_intent` | A binding gate-relevant delivery artefact is requested. An example, template, recommendation, or advisory draft is not binding. | `activate_delivery_intake` |
| `explicit_agdf_operation` | The current request expressly invokes AGDF, a supported skill, or a named AGDF help, suitability, status, run, gate, audit, approval, quality, or closeout operation. Merely naming AGDF as the subject of a question is not invocation. | `activate_named_operation` |
| `explicit_control_lifecycle` | The current request expressly asks to initialize or validate durable `.agdf/control`, inspect its lifecycle or validity, or perform supported target-bound repository activation or disablement. | `activate_named_operation` |
| `active_run_continuation` | The request asks to perform the immediately pending action for an active run, supplies its exact pending approval, or unambiguously answers that pending action. Merely asking about the run or gate is named read-only inspection, not continuation. | `activate_continuation` |
| `ambiguous_effect` | The requested effect cannot be determined reliably and no explicit mutation or binding delivery output is established. | `abstain` when useful read-only assistance is possible; otherwise `clarify` |

Determine the requested effect, not the presence of delivery-related words. Quoted, negated,
hypothetical, example, error-message, and code-block text does not become a current delivery request.
When a mixed request actually asks for both assessment and a delivery effect, delivery intent wins.
When no actual delivery effect is requested, ambiguity stays read-only and never activates AGDF by
default.

Apply precedence in this order:

1. An explicit request for a supported AGDF or control-lifecycle operation activates exactly that
   named operation. AGDF discussed only as a subject does not.
2. An actual requested mutation or binding delivery outcome activates delivery even when assessment,
   explanation, or recommendation is also requested.
3. An explicit constraint such as `do not implement` or `only assess` keeps the constrained work
   read-only unless another actual delivery effect remains.
4. Delivery language inside quotations, examples, code, errors, negations, or hypothetical advice is
   context only.
5. Active-run continuation requires current-turn action intent or an immediately bound action
   response. A read-only question about a run or gate is a named inspection operation, not
   continuation, and an unrelated later request inherits no activation.
6. Without reliable positive evidence, choose ordinary read-only handling or ambiguous effect. Never
   default to activation.

## Invocation Provenance And Selection Origin

`requested_effect`, `invocation_provenance`, and `selection_origin` are independent values.

- Current-turn text that explicitly requests AGDF or a supported operation is sufficient provenance.
- A host signal is accepted only when it is trusted, ephemeral, bound to the current deliberate user
  action, and grants no approval or target authority.
- Automatic discovery, router selection, skill loading, and passive hook output are selection origin,
  never invocation provenance.
- When invocation provenance is unavailable, the requested effect remains decisive. Selection origin
  alone never activates AGDF.

## Operation Catalog

The following JSON block is the complete logical operation catalog. It maps an already determined
positive request class to one existing route owner; it is not a natural-language classifier. Entries
whose `owner_kind` is `command` must resolve through the existing `commandRegistry`. The
`delivery.start` skill owner and every derived direct-skill ID must resolve through
`pluginDefinition.skillSet`. Function owners remain downstream implementation owners and do not
grant applicability or authority.

<!-- AGDF-REQUEST-ACTIVATION-OPERATIONS:START -->
```json
{
  "schema_version": 1,
  "operations": [
    { "operation_id": "assist.agdf_help", "route_family": "control_independent_help", "target_boundary": "explicit_optional", "control_boundary": "no_probe", "owner_kind": "contract", "owner": "request_activation_contract" },
    { "operation_id": "assist.agdf_suitability", "route_family": "control_independent_help", "target_boundary": "explicit_optional", "control_boundary": "no_probe", "owner_kind": "contract", "owner": "request_activation_contract" },
    { "operation_id": "delivery.start", "route_family": "governed_delivery_intake", "target_boundary": "required_after_activation", "control_boundary": "presence_then_dispatcher_revalidation", "owner_kind": "skill", "owner": "gate-check" },
    { "operation_id": "lifecycle.control.init", "route_family": "repository_control_lifecycle", "target_boundary": "required_after_activation", "control_boundary": "absence_allowed", "owner_kind": "command", "owner": "init" },
    { "operation_id": "lifecycle.repository.activate.codex", "route_family": "repository_surface_lifecycle", "target_boundary": "explicit_required", "control_boundary": "no_delivery_invention", "owner_kind": "command", "owner": "codex-repo" },
    { "operation_id": "lifecycle.repository.activate.opencode", "route_family": "repository_surface_lifecycle", "target_boundary": "explicit_required", "control_boundary": "no_delivery_invention", "owner_kind": "command", "owner": "opencode-repo" },
    { "operation_id": "lifecycle.repository.disable", "route_family": "repository_surface_lifecycle", "target_boundary": "required_after_activation", "control_boundary": "existing_owner", "owner_kind": "command", "owner": "disable" },
    { "operation_id": "lifecycle.plugin.install.codex", "route_family": "global_plugin_lifecycle", "target_boundary": "none", "control_boundary": "no_probe", "owner_kind": "command", "owner": "codex" },
    { "operation_id": "lifecycle.plugin.install.claude", "route_family": "global_plugin_lifecycle", "target_boundary": "none", "control_boundary": "no_probe", "owner_kind": "command", "owner": "claude" },
    { "operation_id": "lifecycle.plugin.install.copilot", "route_family": "global_plugin_lifecycle", "target_boundary": "none", "control_boundary": "no_probe", "owner_kind": "command", "owner": "copilot" },
    { "operation_id": "lifecycle.plugin.install.opencode", "route_family": "global_plugin_lifecycle", "target_boundary": "none", "control_boundary": "no_probe", "owner_kind": "command", "owner": "opencode" },
    { "operation_id": "lifecycle.plugin.uninstall", "route_family": "global_plugin_lifecycle", "target_boundary": "none", "control_boundary": "no_probe", "owner_kind": "command", "owner": "uninstall" },
    { "operation_id": "status.installation.codex", "route_family": "global_installation_status", "target_boundary": "none", "control_boundary": "no_probe", "owner_kind": "function", "owner": "inspectGlobalInstallationStatus" },
    { "operation_id": "status.installation.claude", "route_family": "global_installation_status", "target_boundary": "none", "control_boundary": "no_probe", "owner_kind": "function", "owner": "inspectGlobalInstallationStatus" },
    { "operation_id": "status.installation.copilot", "route_family": "global_installation_status", "target_boundary": "none", "control_boundary": "no_probe", "owner_kind": "function", "owner": "inspectGlobalInstallationStatus" },
    { "operation_id": "status.installation.opencode", "route_family": "global_installation_status", "target_boundary": "none", "control_boundary": "no_probe", "owner_kind": "function", "owner": "inspectGlobalInstallationStatus" },
    { "operation_id": "status.overview", "route_family": "status_overview", "target_boundary": "explicit_or_reliably_resolved_optional", "control_boundary": "repository_component_only_after_target", "owner_kind": "function", "owner": "evaluateStatusOverview" },
    { "operation_id": "status.repository_delivery", "route_family": "repository_status", "target_boundary": "explicit_required", "control_boundary": "absence_is_result", "owner_kind": "function", "owner": "evaluateGeneralStatus" },
    { "operation_id": "status.opencode_repository", "route_family": "repository_status", "target_boundary": "explicit_required", "control_boundary": "absence_is_result", "owner_kind": "function", "owner": "evaluateOpenCodeStatus.repository" },
    { "operation_id": "runtime.checks", "route_family": "global_runtime_lifecycle", "target_boundary": "none", "control_boundary": "no_probe", "owner_kind": "command", "owner": "runtime-checks" },
    { "operation_id": "control.doctor", "route_family": "deterministic_control_inspection", "target_boundary": "required_after_activation", "control_boundary": "missing_is_result", "owner_kind": "command", "owner": "doctor" },
    { "operation_id": "control.delivery_map", "route_family": "deterministic_control_inspection", "target_boundary": "required_after_activation", "control_boundary": "missing_is_result", "owner_kind": "command", "owner": "delivery-map" },
    { "operation_id": "run.create", "route_family": "run_lifecycle", "target_boundary": "required_after_activation", "control_boundary": "command_preconditions", "owner_kind": "command", "owner": "run-create" },
    { "operation_id": "run.migrate", "route_family": "run_lifecycle", "target_boundary": "required_after_activation", "control_boundary": "command_preconditions", "owner_kind": "command", "owner": "run-migrate" },
    { "operation_id": "run.render_legacy", "route_family": "run_lifecycle", "target_boundary": "required_after_activation", "control_boundary": "command_preconditions", "owner_kind": "command", "owner": "run-render-legacy" },
    { "operation_id": "continuation.current", "route_family": "active_run_continuation", "target_boundary": "required_after_activation", "control_boundary": "target_run_gate_revalidation", "owner_kind": "function", "owner": "existingTargetRunGateRevalidators" }
  ],
  "derived_operations": [
    { "operation_id_pattern": "skill.<slug>", "route_family": "direct_skill", "derive_from": "pluginDefinition.skillSet", "target_boundary": "dispatcher_v1", "control_boundary": "dispatcher_v1", "owner_kind": "dispatcher", "owner": "skill-dispatch-v1" }
  ]
}
```
<!-- AGDF-REQUEST-ACTIVATION-OPERATIONS:END -->

Route boundaries:

- `assist.*`, global plugin lifecycle, global runtime checks, and global installation status never
  invent a repository target or probe repository control.
- `status.overview` always returns its targetless global component. It adds repository or delivery
  status only after explicit or reliably resolved target evidence; cwd is never implicit authority.
- Repository lifecycle, repository status, Doctor, Delivery Map, and run lifecycle resolve a target
  only after positive applicability and then call only their declared owner.
- `skill.<slug>` invokes dispatcher v1 as the first operational call. There is no preceding target,
  repository, control, run, gate, or renderer call.
- `delivery.start` may resolve target and inspect structural control presence for draft/setup only.
  Candidate control is not actionable evidence; dispatcher v1 revalidates target and control before
  any gate result.
- Active-run continuation establishes applicability from action intent, then revalidates target, run,
  gate, revision, and exact approval through existing owners.

Missing control is route-specific. Help and suitability answer normally; status reports unavailable
control or run state; gate-dependent operations block on missing evidence; explicit lifecycle setup
uses its existing recovery; continuation requests restoration or selection of the referenced run;
delivery intake drafts and persists a real UR before any approval presentation. No missing-control
route synthesizes an immediate `Approval: UR` merely because a control file is absent.

## Request Applicability Guard

The block below is the only compact guard source. It is projected byte-for-byte into the canonical
router and every canonical skill before any operational boundary. Generated surfaces may transform
only host-specific skill names and resource paths outside this block.

The `guard_fingerprint` is SHA-256 over the complete marker-bounded block after replacing its own
hex value with `<computed>` and normalizing line endings to LF. The projection tool owns that derived
field and every copied marker region; missing, partial, duplicate, reordered, or manually edited
regions fail check mode.

<!-- AGDF-REQUEST-ACTIVATION-GUARD:START -->
## Request Activation

- `owner`: `request_activation_contract`
- `path`: `plugin/meta/contracts/request-activation.md`
- `policy_version`: `1`
- `guard_fingerprint`: `sha256:50833bf7396f65e57ffd73bb9200e6dfd5dc016440e6d7186fbcd8a6e07dd2ab`

Decide effect from loaded instructions before AGDF action/output.

Abstain silently, call no AGDF owner, for assessment/explanation/comparison/recommendation/review/diagnosis/advice; hypothetical/example/error/code/quoted/negated delivery language; AGDF as subject; or a read-only constraint absent other delivery. Ambiguity is read-only: answer or ask one neutral question.

Activate only for actual delivery/mutation, binding gate artefact, explicit AGDF/control-lifecycle operation or unambiguous active-run action; delivery wins mixed intent.

Invocation proof: explicit user text/trusted ephemeral action, not discovery/selection, skill load, hooks, cwd, repo/control or prior runs.

Then choose one catalog route. Non-authorizing; downstream checks remain.
<!-- AGDF-REQUEST-ACTIVATION-GUARD:END -->

## Discovery Description Suffix

The single sentence below is appended to every skill frontmatter description after the
definition-owned `useFor` and `boundary` values.

<!-- AGDF-REQUEST-ACTIVATION-DISCOVERY-SUFFIX:START -->
Automatic discovery alone does not activate AGDF.
<!-- AGDF-REQUEST-ACTIVATION-DISCOVERY-SUFFIX:END -->

## Failure Semantics

- `abstain` and `clarify` cause zero request-driven calls to dispatcher v1, target resolution,
  repository activation, control presence, run selection, control evaluation, AGDF rendering,
  lifecycle, status, or mutation owners.
- A partial, missing, duplicate, stale, or fingerprint-mismatched guard fails generation and Runtime
  Integrity. It never falls back to the previous broad trigger.
- A missing or unknown operation ID stops at routing. It is not reinterpreted as `delivery.start` or
  generic `gate-check`.
- No hook, generated profile, test fixture, installed runtime, keyword list, or host-specific prompt
  becomes another request-applicability owner.
