# Solution Design: Cross-surface Executable Skill Dispatcher

- revision: 2
- status: `approved`
- related_prd: `.agdf/control/artefacts/cross-surface-executable-skill-dispatcher/PRD.md`
- delivery_depth: `structured_delivery`

## Design Summary

Revision 2 corrects the transport design after CSED-HOST-08. UR and PRD Revision 1 remain
unchanged. The earlier SD approval applies only to Revision 1, recoverable at commit
`4d38db394d05bf2afb5280dc3af92dfee042a2bb`. Revision 2 was approved by the user's exact
`Approval: SD` after revalidation of target, run, gate and run revision 18
(`3CA1DBAC-196A-4268-A103-F8B79045B18F`). It permits the TP revision, not implementation,
installation or release.

Extend the existing surface-local `agdf-local.js` runtime with one `skill-dispatch --json` command.
The command validates the invocation, derives the shipped skill registry from the canonical plugin
definition, runs the existing target resolver first and then either returns a terminal canonical
orientation, returns an existing deterministic control presentation, or hands the named skill one
immutable bounded continuation packet.

The dispatcher is an orchestration facade. It contains no target policy, gate table, QA decision,
approval persistence, locale copy or Markdown rendering.

## Architecture Boundary

```text
Host skill invocation
  -> installed dispatch binding
  -> runtime/agdf-local.js
  -> skill-dispatch command
     -> existing runtime/provenance resolver
     -> existing task-target resolver and interaction renderer
     -> existing gate evaluator where deterministic control state is required
     -> terminal result OR bounded skill continuation
  -> host transmits canonical output / named skill continues
```

The runtime remains local and process-bounded. There is no daemon, remote service, persistent queue
or second workflow state.

## Owners And Changes

| Concern | Canonical owner | Design action |
|---|---|---|
| Skill inventory | `plugin/meta/agdf-plugin.definition.json` `skillSet` | Derive registry membership; add only dispatch metadata that cannot be inferred. |
| CLI grammar | `create-agdf/lib/cli/parse-args.js`; `command-registry.js` | Add `skill-dispatch`, `--skill`, and its legal target/run/surface options. |
| Dispatch contract | new `create-agdf/lib/skill-dispatch/contract.js` | Own schema, enums, validation, safe output bounds and timing fields. |
| Dispatch orchestration | new `create-agdf/lib/skill-dispatch/service.js` | Compose existing owners; dependency-inject resolver/evaluator/renderer/clock for tests. |
| CLI integration | `validation-handlers.js`; `validator-application.js` | Register one handler in the existing surface-local validator boundary. |
| Wrapper timing/runtime identity | `local-validator.js`; generated `agdf-local.js` | Pass validated runtime envelope and wrapper start marker into the child without weakening digest/provenance checks. |
| Target semantics | existing `task-target-resolution.js` and contract | Call unchanged; no duplicated rules. |
| Gate semantics | existing `control-evaluation/gate-check.js` | Call unchanged for deterministic control snapshot. |
| Presentation | existing `interaction-presentation.js` and locale registry | Return existing renderer objects and Markdown unchanged. |
| Skill instructions | canonical `plugin/skills/*/SKILL.md` | Add one short dispatcher-first entry block and remove redundant operational discovery where safe. |
| Runtime binding | `agdf-session-check.js`, hooks, OpenCode plugin guidance | Publish exact installed command binding without repository inspection; retain consent for automatic checks. |
| Generation | `sync-plugin-runtime.js`; `sync-package-assets.js` | Generate all runtime and host projections from canonical source. |
| Integrity | Runtime Integrity, profile, package and skill conformance tests | Reject missing registry entries, stale bindings, semantic duplication and payload drift. |

## Canonical Skill Registry

The registry is derived from `agdf-plugin.definition.json.skillSet`; it is not a separately maintained
slug list. Each derived entry exposes:

- `skill_id` from the canonical slug;
- `dispatch_mode`: `deterministic_control | judgement_required`;
- `deterministic_command` only where an existing evaluator already owns the complete result;
- `requires_control_snapshot`: boolean;
- `contract_version`: dispatcher compatibility version.

`gate-check` uses `deterministic_control`. Review, Brownfield, QA and closeout skills use
`judgement_required`; the dispatcher prepares their target and control boundary but never produces
their decision. Any shipped skill missing valid dispatch metadata blocks generation and Runtime
Integrity. Duplicate registries or per-host overrides are forbidden.

## CLI Contract

Canonical form:

```text
node <surface-local-agdf> skill-dispatch --json --skill <skill-id> --surface <surface>
  --language <tag> --working-directory <absolute-path>
  [--target-source <source> --primary-target <absolute-path>]
  [--run <run-id>]
```

Rules:

- `--json` is mandatory.
- `--skill`, `--surface`, `--language` and absolute `--working-directory` are mandatory.
- Target source and primary target use the existing paired validation rules.
- `--run` never resolves a task target and is consumed only after target resolution.
- Existing target options become legal for `target-check` and `skill-dispatch` only.
- Unknown options, skills, surfaces or unsafe paths fail before target or repository access.
- Existing public commands retain their current grammar and output.

## Dispatch Input

The normalized in-process input is:

```json
{
  "schema_version": "1",
  "skill_id": "gate-check",
  "surface": "copilot",
  "presentation_language": "de",
  "working_directory": "/absolute/context",
  "target_source": "explicit_target",
  "primary_target": "/absolute/repository-or-file",
  "run_id": null,
  "expected_version": "0.14.5"
}
```

Absence is represented by `null` or an omitted optional field, never sentinel paths. Input is
validated before any filesystem read other than the already completed installed-runtime identity
check.

## Dispatch Output

One bounded JSON document:

```json
{
  "schema_version": "1",
  "contract_version": 1,
  "outcome": "target_unresolved | control_result | skill_continuation | dispatcher_unavailable | invalid_input | evaluator_error",
  "terminal": true,
  "authorizes": false,
  "skill": {
    "skill_id": "gate-check",
    "dispatch_mode": "deterministic_control"
  },
  "runtime": {},
  "target": {},
  "control": null,
  "presentation": null,
  "continuation": null,
  "recovery": null,
  "timing": {
    "wrapper_ms": 0,
    "input_ms": 0,
    "target_ms": 0,
    "control_ms": 0,
    "render_ms": 0,
    "total_ms": 0
  },
  "diagnostics": []
}
```

Output is capped before printing. It contains no artefact bodies, source snapshots, prompt text,
hidden reasoning, secrets or unrelated paths.

## Outcome Semantics

### `target_unresolved`

- `terminal: true`
- contains the existing normalized target report and `task_target_orientation` renderer object;
- recovery contains exactly the resolver's normalized next action;
- control, run and skill-specific repository fields are absent;
- no downstream repository callback is invoked.

### `control_result`

- used when an existing deterministic command owns the complete result;
- for `gate-check`, returns the unchanged gate evaluation plus its existing canonical presentation;
- terminal unless that existing result explicitly requires a deliberate user response;
- does not persist approvals or state.

### `skill_continuation`

- `terminal: false`
- contains immutable runtime, target, governance target, requested skill, optional selected run and
  the current gate snapshot when applicable;
- contains exactly one continuation instruction: execute the named skill using only this target and
  snapshot;
- skill-specific evidence inspection and judgement remain owned by that skill.

### Failure outcomes

- `invalid_input`: typed invalid field; no target or repository access.
- `dispatcher_unavailable`: missing or mismatched binding/runtime; one repair/restart action.
- `evaluator_error`: existing owner failed after resolved target; one retry or repair action, no
  model reconstruction.

Failures are terminal, non-authorizing and exit with code 2. Successful control or continuation
returns code 0. No automatic retry occurs.

## Execution Order And Terminality

1. Surface-local wrapper validates version, digest, provenance and plugin root as today.
2. Parser and dispatcher validate the invocation and registry entry.
3. Existing target resolver and target-orientation renderer run.
4. On unresolved target, finalize output and return immediately. Tests inject repository callbacks
   that fail if called, proving terminality.
5. On resolved target, use only `governance_target` for activation and optional control evaluation.
6. Resolve the optional run only through existing control evaluation.
7. Return either the existing deterministic result or one judgement continuation.
8. Before any later mutation or approval persistence, the owning skill revalidates current target,
   run, gate and revision under existing contracts.

## Runtime Binding Design

### Common rule

Every loaded profile provides one exact version-matched dispatch binding to the model before a
direct skill is invoked. One shared transport owner constructs the binding for every runtime-bearing
surface. Binding schema `2` extends the existing executable, immutable prefix arguments, surface and
expected version with a bounded child-process environment and a code-derived invocation grammar.
The `skill-dispatch` command, its input/output schema and contract version remain `1`. Binding version
and dispatcher protocol version are separate identities. A binding is context, not target or gate
authority.

### Shared Invocation Owner And Runtime Suitability

- Add one small transport module under `create-agdf/lib/skill-dispatch/`, consumed by the existing
  session-runtime generator and OpenCode plugin. It owns binding construction and validation only.
- Keep Node/Electron child-process launch preparation reusable by the existing local-validator
  wrapper. Do not duplicate process policy in four host adapters or construct a second dispatcher.
- An absolute `process.execPath` alone is not proof that the executable can run a script. Inspect
  runtime metadata and verify the exact launch tuple with a bounded, fixed, repository-free probe.
  The probe performs no network, control inspection, installation or target selection.
- For a normal Node runtime, retain the exact executable and an empty environment override map.
  For an Electron runtime, supply the fixed child-only override `ELECTRON_RUN_AS_NODE=1` and verify
  that exact tuple. Other Node-compatible runtimes need their own passing capability evidence;
  unknown or failed runtime capability is unavailable, never an invitation to search PATH.
- Allow only AGDF-owned, necessary transport overrides. Do not publish inherited environment
  variables, credentials or arbitrary user-supplied override keys in model context.
- Preserve the environment across the verified wrapper-to-validator process chain. Do not mutate
  the parent application's environment or globally persist an Electron workaround.
- Bound probe time and output and reuse its result only within the same session and exact launch
  identity. Invalid or stale identity requires revalidation, not a persistent capability store.
- Missing executable, failed probe, invalid environment or incompatible binding yields one
  non-authorizing `dispatcher_unavailable` recovery through existing owners. Never advertise an
  executable binding that failed preflight or retry with a guessed executable.

### Exact Argument And Target Transport

- Derive the invocation grammar from the existing canonical CLI owner. Expose the exact required
  `--skill`, `--language`, `--working-directory` and optional paired `--target-source`,
  `--primary-target`, plus optional `--run`. Do not maintain another per-host flag list.
- Fixed prefix arguments remain immutable. The host supplies semantic values, not invented flag
  names. `--cwd` remains invalid; this correction introduces no convenience alias.
- Carry already established explicit, continued or deictic current-repository target evidence into
  both target fields. A bare skill invocation or cwd does not establish that evidence. Omit both
  target fields when no target is established; preserve the existing terminal target clarification.
- Do not add a heuristic that treats every direct skill invocation as work on the current folder.
  Multiple plausible targets still require clarification. Target/run decisions remain outside the
  transport owner and are revalidated by the existing resolver/evaluator.
- Keep working directory, primary target and run distinct. A successfully resolved target may still
  expose an earlier gate or ambiguous run and must not be represented as completed QA.
- Prefer host process APIs carrying executable, argv and environment separately. Existing shell
  transports must preserve argument boundaries and child-only environment on POSIX and Windows,
  including spaces, quotes, metacharacters and non-ASCII paths. Do not introduce `eval`, change
  global shell permissions or add a new native tool in this correction.

### Compatibility And Distribution

- Binding schema 2 is emitted coherently with matching skills and runtime consumers. New consumers
  reject unknown/incomplete versions; old binding context requires a coherent update and restart,
  never an agent-written adapter. Existing direct CLI v1 calls remain supported unchanged.
- Retain activation guards, route-source identity, request-activation fingerprint, consent-bound
  automatic checks, terminal host-action transfer and instruction-only capability boundaries.
- Generate canonical and derived skill entry blocks from one source. Put exact invocation guidance
  at the dispatch boundary, not into the request-activation kernel or every eager bootstrap.
- Enforce the current instruction-footprint budgets. This correction does not authorize restoring
  duplicated system instructions or silently increasing those budgets.
- Runtime-bearing Codex, Claude Code, Copilot and OpenCode profiles share the same binding owner.
  The public skills-only profile remains runtime-free and honestly instruction-only where applicable.
- Scope stays separate from `opencode-native-dispatch-tool`; no native tool, hook, remote service,
  permission expansion or new target policy is introduced.

### Codex, Claude Code And Copilot

The generated session runtime resolves its own plugin root through `import.meta.url` and emits the
exact absolute `agdf-local.js skill-dispatch` command prefix. This binding emission is read-only,
argument-free and always available when the plugin runtime is valid. It does not inspect a
repository and therefore does not consume automatic-runtime-check consent.

The existing optional automatic doctor/control inspection remains consent-gated and starts only
after binding emission. Consent receipts, capability identity and current repair behavior remain
unchanged.

### OpenCode

The plugin system transform emits the exact config-local `agdf/bin/agdf-local.js` dispatch prefix
and expected version through the shared binding owner after verifying runtime identity and launch
suitability. It emits executable guidance only under the existing repository-activation boundary.
Electron runtime metadata is handled by shared launch preparation, not a host-name-specific shell
fallback. The documented subagent hook limitation is retained.

### Skill-first instruction

Every generated/canonical skill begins with one compact dispatcher block:

1. use the supplied dispatch binding as the first operational action;
2. follow the supplied invocation grammar, preserve child environment and argv, and pass the current
   language plus established target evidence under the unchanged target-authority precedence;
3. consume terminal presentation and stop, or continue only with the returned packet;
4. do not search for alternate runtimes or contract files;
5. if no binding exists, report dispatcher unavailable with the supported install/restart action and
   retain `instruction_only` capability.

The normal skill body remains the source for judgement-bearing work after continuation.

## Timing Design

- Use a monotonic in-process clock with injected test clock.
- The wrapper passes an opaque monotonic start value only within the local child environment so
  `wrapper_ms` includes resolver and process-spawn overhead where supported.
- Phase timings cover input, target, control and render work; `total_ms` is measured, not summed from
  rounded phases.
- The dispatcher enforces no artificial delay and performs no network access.
- A local fixture fails when total process time exceeds 2 seconds under the defined environment.
- Loaded-host harness or transcript records invocation-to-tool-start and invocation-to-first-visible
  output separately. The dispatcher never claims these host/model durations itself.

## Presentation And Locale

- Dispatcher chooses no labels or prose.
- Requested locale flows into the existing complete locale resolution.
- `task_target_orientation`, `status_presentation` and `approval_presentation` are returned as owned
  renderer objects and transmitted verbatim.
- A renderer rejection stays a typed presentation failure with diagnostics; model reconstruction is
  forbidden.
- Canonical ids, paths and exact approval values remain untranslated.

## Authority And Security

- `authorizes` is always false at dispatcher level.
- The dispatcher performs no writes and exposes no mutation callback.
- Host technical permissions remain host-owned.
- Exact gate approval remains user text or a proven native value followed by fresh revalidation.
- Target resolution precedes all repository access.
- Runtime/provenance mismatch blocks before dispatch.
- No shell-string interpolation occurs inside the service; wrappers use argv arrays.
- Diagnostics exclude prompts, contents, secrets and hidden reasoning.

## Compatibility And Versioning

- Dispatcher contract starts at `contract_version: 1` and is additive to existing CLI behavior.
- Existing `target-check`, `doctor`, `gate-check`, `delivery-map` and Delivery Path Search outputs do
  not change.
- `skill-dispatch` is a new public local-runtime command and is listed in command/help and package
  conformance.
- Installed bindings include expected plugin and dispatcher contract versions.
- An unknown contract version fails closed; no downgrade negotiation or alternate executable search.

## Generation And Distribution

Canonical changes flow through the existing generation pipeline:

1. canonical plugin definition, skills, runtime sources and hooks;
2. `sync-plugin-runtime.js` builds the runtime bundle and manifest digest;
3. `sync-package-assets.js` projects canonical skills and bindings into Codex, Claude, Copilot and
   OpenCode layouts;
4. profile inventories, payload baselines, package contents and provenance are recomputed through
   existing release preparation;
5. local installers deploy only coherent generated profiles.

Generated files are never edited as primary owners.

## Testing Strategy

### Unit And Contract

- registry completeness/uniqueness derived from every `skillSet` entry;
- valid and invalid input, unknown skill/surface/version and unsafe path cases;
- injected resolver/evaluator/renderer/clock and strict output bounds;
- unresolved terminality with fail-if-called repository dependencies;
- resolved immutable continuation and stale identity cases;
- deterministic `gate-check` control result and `qa-gate` judgement continuation;
- all typed failure outcomes and one recovery action;
- no write, network or approval capability.

### CLI And Runtime

- parser/registry/help and option compatibility;
- wrapper provenance, digest and absolute-root checks;
- POSIX and native-Windows argv/path invocation;
- timing fields and two-second local process budget;
- malformed or oversized output failure;
- existing CLI regression tests unchanged.

### Generation And Package

- all canonical skills contain exactly one dispatcher-first block;
- all four projections match canonical behavior and reference their owned binding;
- no direct generated edits, missing runtime or stale registry;
- runtime integrity negative fixtures remove/tamper dispatcher and must fail;
- Copilot payload inventory/baseline, package build/contents, release prepare and complete smoke.

### Loaded-host

- one repo-less and one resolved-repository invocation for `gate-check` per surface;
- one repo-less and one QA-ready invocation for `qa-gate` per surface;
- record runtime version, OS, model, binding, tool-start latency, dispatcher duration, first-visible
  latency, locale, outcome, terminality and post-terminal activity;
- direct evidence remains per-host; unavailable or instruction-only results are preserved honestly.

## Failure And Recovery Matrix

| Failure | Result | Recovery | Forbidden fallback |
|---|---|---|---|
| No binding | `dispatcher_unavailable` | supported install/update and fresh restart | runtime file search |
| Missing runtime | `dispatcher_unavailable` | repair exact profile | registry `npx` during skill |
| Version/provenance mismatch | `dispatcher_unavailable` | coherent refresh and restart | older/newer local executable |
| Invalid invocation | `invalid_input` | correct named field | target or locale guessing |
| Target unresolved | `target_unresolved` | resolver-provided one action | repo activation or run selection |
| Ambiguous run | existing gate/control blocker | select one run | most-recent run inference |
| Renderer failure | `evaluator_error` with diagnostics | repair locale/renderer and retry | model-generated card |
| Host cannot execute first | `instruction_only` capability | use disclosed safe instruction path | executable-conformance claim |

## Rollout

1. Build and test canonical runtime and skill projections.
2. Validate generated profiles and release payload without installing them.
3. Install/restart each host only with explicit lifecycle authorization.
4. Capture loaded-host evidence separately, beginning with Copilot repo-less `gate-check` regression.
5. Release only after QA approval, UAT decision, Context Graph reconciliation and explicit delivery action.

### Revision 2 Acceptance And Evidence Additions

- For every supported runtime-bearing surface, assert the same binding schema, CLI grammar and
  target/authority behavior. Exercise both `gate-check` and `qa-gate` entry paths.
- Reproduce the Electron-Helper failure before correction and prove the exact generated launch
  tuple succeeds without a model-invented environment override or exploratory help call.
- Test Node, Electron and unsupported/failed runtime probes, child environment propagation,
  stale/missing/malformed binding, version skew, output/time bounds and no alternate-runtime search.
- Verify required flags, paired target preservation, explicit and continued targets, deictic repo
  references, unresolved and ambiguous targets, and no cwd-to-target substitution.
- Cover POSIX and Windows transport with hostile quoting/path fixtures. Native Windows and real
  Electron evidence remain separate from mocks or simulated platform paths.
- Verify all generated packages, instruction budgets, idempotent regeneration, provenance,
  runtime digest, existing consent/permission policy and unchanged CLI v1 regression suites.
- A fresh host matrix records installation, restart, host/OS/runtime identity and exact invocations
  separately. Until observed, a surface is unverified; another host's success is not parity proof.
- Update TP before code changes to map these obligations to executable tests and bounded host
  evidence. Existing SD1/TP1 test results remain historical evidence only for this correction.

## Rollback

- Restore the prior skill entry blocks, command registry and session binding projection together.
- Regenerate every profile and runtime manifest from the reverted canonical source.
- Validate package and profile coherence before reinstalling.
- Do not modify repository `.agdf/control/` state or user approvals during rollback.

## Context Graph Plan

After SD approval, create `CG-EXECUTABLE-SKILL-DISPATCH-AUTHORITY` with:

- dispatcher owns deterministic invocation validation, composition, terminality and timing only;
- Target, Gate, QA, Interaction and approval owners remain authoritative;
- session binding is runtime location evidence, never target or gate authority;
- loaded-host capability and latency remain per-surface evidence;
- relationships to `CG-TASK-TARGET-AUTHORITY` and `CG-NATIVE-INTERACTION-AUTHORITY`.

Until that update is complete, `context_graph_reconciliation` remains `open_gap` with warning effect.

## Design Decisions

- One new command, not a daemon or separate executable package.
- One derived registry, not per-host or per-skill slug lists.
- One orchestration service, not a second policy engine.
- Session-provided exact binding, not runtime path search.
- Always-visible safe binding metadata, but consent-gated automatic repository checks.
- Code-owned output and timing, but separately observed host/model latency.
- All shipped skills registered at release; `gate-check` and `qa-gate` are mandatory reference paths.
