# SD: Modularize the create-agdf CLI Entry Point

Status: approved
Gate: SD
Gate approval: `Approval: SD` provided in session on 2026-07-16 after same-run, same-gate and revision revalidation
Based on: approved PRD revision 1
Date: 2026-07-16
Owner: agent

## 1. Solution Overview

Replace the monolithic executable implementation with a thin composition root and an
acyclic set of cohesive internal modules. Existing behaviour is moved responsibility by
responsibility; it is not rewritten into a framework and is never kept in parallel in the
old and new locations.

The executable becomes:

```text
bin/create-agdf.js
  -> import runCli from lib/cli/application.js
  -> await runCli(process.argv.slice(2), production adapters)
  -> assign returned exit code
  -> map only unexpected top-level failures to stderr/exit 1
```

`runCli()` loads the existing generated runtime context before parsing, obtains one
validated command request from the pure parser, resolves its handler through the command
registry and returns a numeric exit code. Handler modules retain current output ordering
through an injected `io` adapter and return rather than terminate the process.

## 2. Target Modules And Ownership

| Module | Sole responsibility | Existing code moved |
|---|---|---|
| `lib/cli/runtime-context.js` | Resolve package/generated paths and eagerly load/validate plugin definition and locale registry once per CLI invocation | Current module-level path/JSON initialization and derived skill/contract names |
| `lib/cli/command-registry.js` | Immutable command definitions, command groups, handler keys, usage examples and existing post-parse command constraints | `allowedTargets`, command lists in usage/error output and `--all-active`/run command constraints |
| `lib/cli/parse-args.js` | Pure option tokenization, value validation, defaults and path resolution | `parseArgs()` without output or process termination |
| `lib/cli/application.js` | Compose handlers, route one command, render parse failures/help and return exit code | `main()` and expected command-level catch/exit mapping |
| `lib/cli/delivery-path-search-command.js` | Adapt CLI options to existing Delivery Path Search libraries and render its current result | `executeDeliveryPathSearch()` only; core search remains unchanged |
| `lib/installers/plugin-installers.js` | Current Codex and Claude global plugin installation/version verification | Codex/Claude installer and shared plugin-list helpers |
| `lib/installers/opencode.js` | Current OpenCode global config/package/native-surface install and status evaluation/rendering | OpenCode-specific functions and npm command resolution |
| `lib/scaffold/plan.js` | Define target file manifests and produce the generated-file plan | File-list constants, language config, target planning and ownership-preservation decisions |
| `lib/scaffold/write.js` | Validate/apply a generated-file plan and remove owned legacy OpenCode agents | write/overwrite/cleanup functions |
| `lib/scaffold/presentation.js` | Render unchanged scaffold completion/next-step output | `printNextSteps()` |
| `lib/control-evaluation/shared.js` | Shared Markdown/backlog/run-selection/quality-contract parsing with no command output | Reused parsing and selection helpers currently local to the executable |
| `lib/control-evaluation/doctor.js` | Doctor evaluation and existing JSON/human rendering | `evaluateDoctor()` and `printDoctorReport()` |
| `lib/control-evaluation/verified-change.js` | Read and evaluate Verified Change records | Verified Change path/Git/baseline checks |
| `lib/control-evaluation/delivery-map.js` | Delivery relationships, analysis, quality outlook, backlog pointers and delivery-map output | `analyzeDeliveryMap()`, `evaluateDeliveryMap()` and renderer |
| `lib/control-evaluation/gate-policy.js` | Pure gate/artefact satisfaction and transition decision | `transitionDecisionForRunState()` plus direct helpers |
| `lib/control-evaluation/gate-check.js` | Combine doctor, run state, Verified Change, delivery analysis, gate policy and existing presentation into gate-check output | `evaluateGateCheck()` and gate-check renderers |

No barrel module or generic `utils.js` is introduced. `application.js` imports each command
owner explicitly so runtime wiring remains reviewable.

## 3. Dependency Direction

```text
bin/create-agdf.js
  -> cli/application
       -> cli/runtime-context
       -> cli/command-registry
       -> cli/parse-args
       -> cli/delivery-path-search-command
       -> installers/*
       -> scaffold/*
       -> control-evaluation/doctor
       -> control-evaluation/gate-check
       -> control-evaluation/delivery-map

control-evaluation/gate-check
  -> doctor
  -> verified-change
  -> delivery-map (analysis helpers only)
  -> gate-policy
  -> existing control-state/*
  -> existing interaction-presentation.js

control-evaluation/{doctor,verified-change,delivery-map}
  -> control-evaluation/shared
  -> existing control-state/*

cli/delivery-path-search-command
  -> existing delivery-path-search/*
```

Binding rules:

- Existing domain libraries never import `cli/`, `installers/`, `scaffold/` or the bin.
- `shared.js` does not import any evaluator that consumes it.
- `gate-policy.js` is pure and receives parsed run/Verified Change state as arguments.
- `gate-check.js` may consume delivery-map analysis helpers, but `delivery-map.js` must not
  consume gate-check.
- Only `application.js` maps expected outcomes to CLI exit codes.

## 4. Command Registry Design

Each frozen command entry has this conceptual shape:

```js
{
  name,
  handler,
  groups,
  usage,
  validate(options),
}
```

- `name` is the public command token.
- `handler` resolves through an explicit handler map in `application.js`.
- `groups` drives preferred, scaffold-compatible and legacy usage sections.
- `usage` holds examples/suffixes without repeating the command name elsewhere.
- `validate` preserves only existing command constraints, including `--all-active` support
  and required `--run` selectors. It must not newly reject currently tolerated irrelevant
  options.

`renderUsage(registry)` and unsupported-command guidance derive names from this registry.
Option definitions remain in `parse-args.js`; command-specific post-parse constraints remain
in the registry. This avoids conflating token grammar with command policy.

## 5. Parser And Application Result Contract

`parseArgs(argv, { cwd, resolveLanguagePreference })` returns one of:

```js
{ kind: "help" }
{ kind: "command", options }
```

Invalid input throws `CliUsageError` containing:

```js
{ message, exitCode: 1, showUsage }
```

The parser performs no console, process, filesystem or subprocess mutation. Path resolution
uses the injected `cwd`. Language normalization is injected from runtime context so the
parser does not import presentation metadata.

`runCli()` owns expected result rendering and returns:

- `0` for current successful/help/open/recommendation outcomes where the existing CLI uses
  success;
- `1` for current usage/install/configuration failures;
- `2` for current doctor block, gate block, delivery-map block and non-recommendation search
  outcomes.

The exact per-command mapping is copied from current `main()` and covered by a table-driven
test. No handler calls `process.exit()` or assigns `process.exitCode`.

## 6. Runtime And Side-Effect Adapters

Production adapters are small plain objects, not a dependency-injection framework:

```js
{
  io: { log, error },
  fs: selected node:fs functions,
  execFileSync,
  env,
  platform,
  cwd,
  homedir,
}
```

Modules accept only the subset they use. Tests supply recording adapters. Installer calls
that currently use `stdio: "inherit"` continue to do so; the adapter records invocation
metadata in direct tests without pretending to capture inherited child output.

Runtime context is loaded before argument parsing, matching the current eager generated
metadata dependency even for `--help`. Environment-derived npm/test command resolution is
computed once per CLI invocation, matching current process-start behaviour.

## 7. Scaffold Architecture

`plan.js` returns immutable file-plan entries using the current shape:

```js
{ path, content, allowOverwrite, action, preserved }
```

It owns target manifests and language decisions but performs no writes. `write.js` performs
the existing preflight across the complete plan before the first write, applies entries in
the same order and performs OpenCode legacy cleanup only after successful writes. This
preserves the current no-partial-write intent and output ordering.

`presentation.js` consumes the completed plan and cleanup result. It must not rediscover
files from disk or become a second planning owner.

## 8. Control-Evaluation Architecture

- `doctor.js` remains the only owner that converts scaffold/control inconsistencies into
  doctor findings.
- `verified-change.js` remains fail-closed and exposes only its evaluation result.
- `gate-policy.js` is the only in-code owner of the transition decision tree; extraction
  must preserve every current literal action, prohibition and approval formula.
- `gate-check.js` composes existing owners and must not reproduce doctor or delivery-map
  logic.
- `delivery-map.js` owns relationship analysis and multi-run aggregation independently of
  gate-check.
- Human presentation continues to use `interaction-presentation.js`; no copied locale pack
  or card builder is permitted.

## 9. Extraction Sequence

1. Add compatibility-focused direct test harness and freeze command/exit mappings.
2. Extract runtime context, command registry and pure parser; route current main through
   them while keeping behaviour green.
3. Extract Codex/Claude and OpenCode installers verbatim behind subprocess adapters.
4. Extract scaffold planning, writing and presentation in that order.
5. Extract shared control-inspection helpers, doctor and Verified Change evaluation.
6. Extract delivery-map evaluation and renderer.
7. Extract pure gate policy, then gate-check composition/rendering.
8. Extract Delivery Path Search CLI adapter and `application.js`; reduce the executable to
   its final composition-root form.
9. Run full package/runtime/packed-client validation and remove any now-unused imports or
   duplicate declarations.

Each stage moves one owner completely and runs its focused tests plus relevant subprocess
tests. No temporary compatibility shim or duplicate implementation may survive a stage.

## 10. Integration Points

| Integration | Design treatment |
|---|---|
| `create-agdf/package.json` | Keep `bin`, `exports` and `files` unchanged; add focused test script only. |
| `@agdf/cli` wrapper | No command-shape change; release-bootstrap smoke proves delegation still loads. |
| Generated package assets | Runtime-context/scaffold modules retain existing generated paths and load order. |
| Codex/Claude CLIs | Exact subprocess commands, ordering and stdio options move unchanged. |
| npm/OpenCode | Existing Windows npm-cli path and test override move unchanged. |
| Git | Verified Change Git queries remain synchronous and repository-scoped. |
| Control state | Existing `control-state/index.js` API remains authoritative. |
| Presentation | Existing interaction locale/presentation APIs remain authoritative. |

## 11. Test And Evidence Strategy

Add `create-agdf/scripts/cli-modularization-test.js` for direct, table-driven evidence:

- registry contains every current command exactly once and renders all usage groups;
- parser help/default/alias/value/boundary/error cases do not exit;
- registry preserves command-specific selector/`--all-active` constraints;
- application maps representative handler outcomes to exact exit codes/channels;
- installer adapters receive the exact current executable/arguments/options sequence;
- scaffold planning returns exact target file lists and overwrite metadata;
- extracted doctor, transition policy and delivery-map functions match fixed fixtures.

Retain and run:

- `test:control-state`
- `test:interaction-presentation`
- `test:verified-change`
- runtime-integrity layout and negative tests
- skill evaluation suites
- all Delivery Path Search suites
- `smoke-test.js` and routing tests
- release bootstrap smoke
- plugin Runtime Integrity
- packed-package file/load verification
- `git diff --check`

The aggregate `smoke-test` script must include the new focused test before end-to-end smoke.

## 12. Constraints And Compatibility

- No public output correction is bundled, including the known unsupported-command listing
  drift; registry derivation may remove that drift only where the output necessarily becomes
  generated from the canonical current command set, and tests must record the resulting
  intentional equivalence/correction explicitly.
- No Windows installer command-resolution or error-classification change is allowed.
- No new production dependency.
- No asynchronous conversion, retry, fallback, defaulting or catch-all error masking.
- Synchronous file/subprocess ordering stays unchanged.
- New modules use ESM and repository naming/style conventions.

## 13. Risks And Mitigations

| Risk | Mitigation |
|---|---|
| Output or exit drift during movement | Table-driven contract fixtures plus existing subprocess suite after every stage |
| Circular evaluator dependencies | Binding dependency rules and explicit imports; static import-direction assertion in focused test |
| Generic module becomes a relocated monolith | Ownership table, no `utils.js`, Clean Implementation Review and module-size/responsibility inspection |
| Generated context loads at a different time | Eager runtime-context load before parsing and missing-generated-assets regression fixture |
| Partial scaffold writes | Preserve whole-plan preflight and ordered application |
| Active installer-output work is absorbed | Move current implementation verbatim and reject behavioural delta in code review |
| Native Windows incorrectly claimed | Keep explicit unverified boundary in QA/OR unless independently proven |

## 14. Next Step

Draft the Task/Test Plan for staged extraction and compatibility proof. Implementation
remains forbidden until TP approval and pre-implementation Brownfield Analysis pass.
