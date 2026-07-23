# Solution Design: OpenCode Surface Hardening and Evaluator Parity

Status: approved
Gate: SD
Revision: 1
Date: 2026-07-23
Derived from: `.agdf/control/artefacts/opencode-surface-hardening-parity/PRD.md`
Gate approval: Exact `Approval: SD` accepted on 2026-07-23 after same-run, same-revision and durable-artefact revalidation.

## Design Summary

Extend the existing OpenCode lifecycle/status owner with deterministic installed-host and plugin-SDK
inspection, keep static global instructions as the fail-closed governance owner, defensively harden
the two existing dynamic hooks, and add one conforming OpenCode Delivery Path Search evaluator.

The evaluator uses an AGDF-owned global OpenCode agent, `opencode run --pure --agent
agdf-evaluator --format json`, an invocation-local deny policy supplied through
`OPENCODE_PERMISSION`, and the existing repository mutation guard. A bounded preflight runs before
the search core. Failure returns a typed `evaluator_unavailable` command result with no
recommendation and a pointer to the existing instruction-only workflow.

## Architectural Boundaries

### Unchanged canonical owners

- Search input, evaluation schema and enforcement vocabulary:
  `create-agdf/lib/delivery-path-search/contracts.js`
- Candidate legality and scoring:
  `candidate-policy.js`, `scoring.js`, `search-engine.js`
- Repository mutation detection:
  `transports/read-only-guard.js`
- OpenCode lifecycle and status:
  `create-agdf/lib/installers/opencode.js`
- OpenCode dynamic hooks:
  `create-agdf/opencode-plugin.js`
- Static global instructions and owned-surface generation:
  `installOpenCodeGlobalSurface()` and `sync-package-assets.js`
- Capability truth:
  `delivery-path-search/surfaces/capabilities.js`
- CLI dispatch and presentation:
  `cli/delivery-path-search-command.js`, `cli/validation-handlers.js`

No new scoring, gate, approval, repository-activation or interaction authority is introduced.

## Component Design

### SD-01 — Generic installed-package resolver

Refactor the private package resolution in `opencode.js` into a bounded resolver that:

1. resolves a package entry from the selected OpenCode config directory;
2. walks only toward that resolved package root until it finds a manifest whose `name` exactly
   matches the requested package;
3. reports `loadable`, resolved entry, manifest path, package root, version and typed error;
4. never invokes the registry or mutates the installation.

Reuse it for the current `create-agdf` package report and for `@opencode-ai/plugin`.

### SD-02 — OpenCode host and SDK capability probe

Add a pure status helper that:

- runs the configured `opencode` binary with `--version` using `execFileSync`, a bounded timeout and
  no shell;
- resolves `@opencode-ai/plugin` from the OpenCode config directory;
- resolves its declaration entry from the manifest's `types`/`typings` field, with a bounded
  package-local fallback to `dist/index.d.ts`;
- scans that one declaration file for the exact hook keys
  `experimental.chat.system.transform` and `experimental.session.compacting`;
- reports each hook as `declared_supported | declared_missing | uninspectable`;
- derives aggregate declaration state without converting it into live-execution evidence;
- derives host/SDK version state as `matching | divergent | unknown`.

The probe is read-only and returns typed evidence rather than throwing status evaluation.

### SD-03 — Additive status schema and presentation

Keep status schema version `1` and add:

```text
host: {
  name, executable, installed_version, inspectable, error
}
plugin_sdk: {
  name, loadable, resolved_path, manifest_path, declaration_path,
  installed_version, error
}
experimental_hooks: {
  evidence_level: "sdk_declaration",
  aggregate: "declared_supported | degraded | uninspectable",
  hooks: [{ name, state }],
  live_invocation_observed: false
}
host_sdk_version: {
  status: "matching | divergent | unknown",
  host_version, sdk_version,
  policy: "warn_only"
}
```

Existing fields and meanings remain unchanged. Human output adds compact Host, Plugin SDK, Hook
declarations and Host/SDK divergence lines. Findings and `next_step` prioritize uninspectable or
missing hook declarations, then version warnings, without suppressing existing installation or
activation findings.

Install verification consumes the same report and may return `partial`/degraded evidence when the
SDK is uninspectable or hook declarations are missing. Version divergence alone remains a warning
and never triggers package mutation.

### SD-04 — Static instruction ownership and defensive hooks

Extend only the generated global-instruction owner so the static surface includes:

- durable repository-activation guard;
- gate-check-first routing for new changes;
- exact approvals as the sole gate authority;
- version-matched local validator guidance;
- fail-closed prohibition of later artefacts and implementation;
- status command for inspecting hook/version/evaluator capability.

Dynamic hook bodies call one local helper that appends the same active/inactive reminder only when
the expected output container exists. Missing, null or non-array containers produce a bounded
warning through the existing plugin logger when available and return without throwing. Hooks never
claim that injection was observed by `opencode-status`.

### SD-05 — Owned evaluator agent

Install one collision-safe global agent at `agents/agdf-evaluator.md` with an AGDF ownership marker.
The installer:

- creates it only when absent or ownership-proven;
- refuses to overwrite an unowned same-name agent;
- includes it in global-surface completeness/status evidence;
- removes it only through existing ownership-validated global uninstall planning;
- gives it evaluation-only instructions and a defense-in-depth deny-all permission profile.

The agent does not contain scoring policy. It receives the same bounded prompt built by Codex and
Claude evaluator adapters.

### SD-06 — Invocation-scoped permission profile

The evaluator transport supplies an exact environment overlay:

```json
{
  "*": "deny",
  "read": "deny",
  "edit": "deny",
  "bash": "deny",
  "task": "deny",
  "external_directory": "deny",
  "webfetch": "deny",
  "websearch": "deny",
  "skill": "deny",
  "question": "deny",
  "lsp": "deny",
  "todowrite": "deny"
}
```

It is serialized into `OPENCODE_PERMISSION` for both preflight and evaluation without mutating
global or repository configuration. The child environment inherits model/provider credentials but
overrides only this permission variable. `--auto` is forbidden.

### SD-07 — Bounded evaluator preflight

Add `preflightOpenCodeEvaluator()` beside the adapter. On every invocation it:

1. resolves `opencode` without a shell and reads `--version`;
2. verifies `opencode run --help` exposes `--pure`, `--agent`, `--format` and `--dir`;
3. runs `opencode agent list --pure` under the exact deny environment;
4. verifies the owned `agdf-evaluator` agent is discoverable;
5. verifies the effective agent projection contains the injected terminal deny-all rule and no
   later allow/ask rule for mutation-capable tools;
6. records concrete evidence strings for the current invocation.

Preflight is process-local, uncached and bounded separately from the evaluator model timeout.
Authentication and output validity are proven by the subsequent actual invocation, not guessed by
the static preflight.

### SD-08 — OpenCode evaluator adapter

Add `evaluators/opencode.js` following the existing adapter interface:

- reuse a shared evaluator prompt builder extracted from Codex/Claude without changing prompt
  semantics;
- invoke `opencode run --pure --agent agdf-evaluator --format json --dir <cwd>`;
- pass the optional configured model through `--model`;
- parse newline-delimited JSON events and accept exactly one final assistant text payload;
- parse that payload as JSON and call existing `validateEvaluation`;
- run through `guardedExecFileSync` so success and failure compare repository state;
- map transport failures to typed evaluator failure codes;
- return metadata containing host version, agent name and current preflight evidence.

No OpenCode generator adapter is added.

### SD-09 — Fail-closed CLI command result

`executeDeliveryPathSearch` preflights OpenCode before constructing an enforcement-bearing search
input or calling `runDeliveryPathSearch`.

When preflight or transport setup fails, return and render:

```text
{
  contract_version: "1",
  status: "evaluator_unavailable",
  surface: "opencode",
  recommendation: null,
  enforcement: {
    level: "instruction_only",
    evidence: []
  },
  executable_evaluator: {
    attempted: false | true,
    preflight: "failed",
    failure_code,
    evidence
  },
  next_action: "Repair the reported OpenCode capability and retry, or use the existing instruction-only Delivery Path Search workflow."
}
```

The validation handler returns exit code `2`. The result is not passed to the search engine and is
not persisted as a search recommendation. Mutation detection throws the dedicated hard failure
`opencode_mutation_detected`; it uses the same exit code but a next action that forbids fallback
until the mutation is investigated.

### SD-10 — Runtime capability projection

Change the static OpenCode baseline in `capabilities.js` only to express conditional availability,
not unconditional `tool_enforced`:

- baseline without invocation evidence: `instruction_only`;
- successful current preflight evidence passed explicitly by the command:
  `tool_enforced`;
- missing, stale or invalid evidence: `instruction_only`.

The function validates evidence provenance and must not accept arbitrary non-empty strings as proof.
Codex, Claude, Copilot and generic behavior remain unchanged.

## Failure Taxonomy

| Code | Meaning | Outcome |
|---|---|---|
| `opencode_cli_unavailable` | Binary cannot be resolved or executed | stop, instruction-only recovery |
| `opencode_cli_incompatible` | Required stable flags are absent | stop, instruction-only recovery |
| `opencode_agent_unavailable` | Owned evaluator agent is absent, shadowed or unowned | stop, repair or instruction-only recovery |
| `opencode_permission_preflight_failed` | Effective deny profile cannot be proven | stop, instruction-only recovery |
| `opencode_authentication_failed` | Model/provider authentication failed | stop, repair and retry or instruction-only recovery |
| `opencode_timeout` | Preflight or evaluation exceeded its budget | stop, retry or instruction-only recovery |
| `opencode_output_invalid` | Event stream or evaluator payload violates the contract | stop, repair and retry or instruction-only recovery |
| `opencode_mutation_detected` | Repository state changed during the transport | hard failure; no fallback execution |

## Data Flow

```text
opencode-status
  -> installed package resolver
  -> host probe + SDK declaration probe
  -> additive status report
  -> human/JSON output

delivery-path-search --surface opencode
  -> current invocation preflight under deny environment
  -> failed: evaluator_unavailable, no recommendation, exit 2
  -> passed: enforcementForSurface(opencode, validated preflight evidence)
  -> OpenCode evaluator through shared mutation guard
  -> shared validateEvaluation
  -> unchanged search engine/scoring
  -> recommendation or no_safe_recommendation
  -> canonical gate-check remains independent
```

## Source And Derived Asset Plan

Primary edits belong under:

- `create-agdf/lib/installers/opencode.js`
- `create-agdf/opencode-plugin.js`
- `create-agdf/lib/delivery-path-search/evaluators/`
- `create-agdf/lib/delivery-path-search/surfaces/capabilities.js`
- `create-agdf/lib/cli/delivery-path-search-command.js`
- `create-agdf/lib/cli/command-registry.js`
- `create-agdf/scripts/sync-package-assets.js`
- `plugin/meta/agdf-plugin.definition.json` when the owned agent descriptor is centralized
- existing focused tests, Runtime Integrity, INSTALL, package README and Pages sources

Generated `create-agdf/generated/**` and installed caches remain derived and must not be edited
directly.

## Verification Design

- Unit tests: package-root resolution, declaration states, version-state derivation, capability
  evidence validation, event-stream parsing and failure mapping.
- Lifecycle/smoke tests: installed SDK fixtures, additive status JSON/human output, owned-agent
  installation/collision/preservation/uninstall, explicit permission preservation and defensive
  hook shapes.
- Shared evaluator contract: OpenCode fixture adapter produces the same validated evaluation as
  Codex/Claude.
- Negative transport tests: every failure code, no search-core call, no recommendation, exit `2`,
  no persistence and mutation hard failure.
- Instruction tests/evals: static-only governance remains fail-closed with both dynamic hooks absent.
- Runtime Integrity: source/derived docs, capability copy, agent ownership and generated surfaces
  remain synchronized.
- Live bounded evidence: installed SDK probe and one authenticated OpenCode evaluator invocation
  under the deny profile with zero repository mutation.

## Compatibility And Security

- Status additions are backward-compatible and do not rename current fields.
- Host/SDK drift is warning-only and non-mutating.
- No shell interpolation is used for binary execution.
- Child-process prompts contain only the bounded existing evaluator input.
- Explicit OpenCode user configuration is never overwritten.
- Deny policy is invocation-local and more restrictive than normal OpenCode operation.
- Failed preflight never yields an executable recommendation.

## Design Exit Criteria

The design is ready for Task/Test Plan drafting when:

1. ownership remains within the named existing modules;
2. the additive status and failure schemas are accepted;
3. the invocation-local deny policy and preflight boundary are accepted;
4. no candidate-generation, gate, interaction, release or auto-alignment scope is introduced.
