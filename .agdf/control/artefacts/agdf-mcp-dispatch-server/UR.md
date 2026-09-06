# UR: Cross-Host AGDF Dispatch Through MCP

Status: draft
Gate: UR
Gate approval: open
Date: 2026-09-05
Owner: Arndt Gold

## 1. Problem

AGDF skill preflight is currently exposed to coding agents through generated instructions,
host-specific bindings and a local CLI invocation. The shared dispatcher already centralizes target
resolution, control evaluation and presentation, but each host still has to launch it through its
own command or tool path. This creates avoidable differences in command construction, path handling,
permission prompts, error recovery and model adherence.

The repository now has a canonical semantic function definition for `agdf_dispatch`. It is not yet
exposed through a standard tool protocol that supported coding-agent hosts can discover and call in
the same way.

## 2. User Need

As an AGDF user working with different coding agents, I need one clearly described and narrowly
bounded AGDF dispatch tool so that supported hosts can invoke the same governance preflight without
reconstructing shell commands or duplicating AGDF semantics.

## 3. Intended Outcome

Provide an AGDF MCP server whose first model-facing capability is the existing `agdf_dispatch`
function. The server should make MCP the preferred agent-to-AGDF dispatch interface where a host
supports it, while preserving the CLI as an internal validation, automation and compatibility path.

The server must reuse the existing dispatcher, target resolver, control evaluator, locale renderer
and durable `.agdf/control/` state. It must not become a second governance engine.

## 4. Scope

The first bounded capability should:

- expose one discoverable MCP tool named `agdf_dispatch` from the canonical semantic function owner;
- validate a strict schema for skill, language, execution context, target evidence and optional run;
- bind runtime version, surface identity, skill registry and locale registry from trusted server
  configuration rather than model-supplied executable or package paths;
- invoke the existing version-matched dispatcher directly without accepting arbitrary commands;
- return the existing structured terminal or continuation result, including `authorizes: false` and
  canonical `host_action` behavior;
- remain local, offline, read-only and non-authorizing for the initial delivery;
- support thin host registration adapters without host-specific policy forks; and
- keep repository, generated-package, installed-host, native-OS and human-UAT evidence separate.

Initial transport, package entrypoint, host registration format and compatibility matrix remain
design questions for Brownfield Review and later approved artefacts. Local MCP `stdio` is the leading
transport candidate because the dispatcher needs bounded access to the user's repository state.

## 5. Acceptance Criteria

1. A supported host can discover `agdf_dispatch` through MCP tool discovery with the canonical name,
   purpose, safety boundary and input schema.
2. MCP calls cannot provide an arbitrary executable, shell command, module path, runtime path or
   unrestricted filesystem operation.
3. `working_directory` remains execution context only. It never becomes target authority by itself.
4. `target_source` and `primary_target` retain their canonical paired meanings and validation.
5. The MCP adapter calls the existing dispatcher owner and does not duplicate target, gate,
   presentation, locale or approval logic.
6. Valid AGDF outcomes preserve the dispatcher result fields and distinguish terminal presentation
   from bounded skill continuation.
7. Every tool result remains non-authorizing. Tool registration, host permission and tool execution
   never count as `Approval: <GateName>` and cannot persist an approval.
8. The initial server performs no network request and no repository mutation.
9. Existing CLI verification and package workflows continue to work while MCP becomes the preferred
   model-facing transport on proven compatible hosts.
10. Deterministic contract tests cover tool discovery, schema validation, result mapping, failure
    behavior, version mismatch and prohibited input.
11. Direct loaded-host evidence covers each claimed host separately. Unsupported or unverified hosts
    are reported honestly and retain their existing compatible path.
12. Native Windows and Linux process, path and packaging behavior are either directly verified or
    recorded as explicit evidence gaps before QA can pass.

## 6. Non-Goals

- Replacing `.agdf/control/`, the gate model, skill judgement or exact approval semantics.
- Providing mutation, implementation, approval, commit, push, release or arbitrary command tools.
- Removing the CLI, build scripts, test scripts or deterministic CI interfaces in the first scope.
- Adding a hosted AGDF service, account, telemetry, remote repository upload or remote fallback.
- Adding MCP to the current public plugin candidate without a separately approved distribution and
  privacy decision.
- Claiming that MCP itself forces a model to obey terminal `host_action` instructions.
- Claiming cross-host parity from schema or repository tests alone.

## 7. Ownership And Related Work

- `create-agdf/lib/skill-dispatch/contract.js` is the intended semantic function-definition owner.
- `create-agdf/lib/skill-dispatch/service.js` remains the dispatcher execution owner.
- `.agdf/control/` remains the durable governance and approval authority.
- `cross-surface-executable-skill-dispatcher` owns the current dispatcher contract and its open host
  evidence. This run may consume that owner but must not rewrite its approved scope or QA evidence.
- `opencode-native-dispatch-tool` is a related draft OpenCode permission scope. Brownfield Review must
  decide whether MCP satisfies, narrows or remains separate from that need. It is not superseded by
  this draft.
- `agdf-public-plugin-distribution` retains its current skills-first, no-MCP boundary unless a later
  approved scope changes it.

## 8. Risks And Open Questions

- MCP registration and permission behavior differ by host even when the wire protocol is shared.
- A local server process still needs trustworthy package provenance and version matching.
- Host-provided repository roots and working directories may have different semantics.
- Returning a terminal instruction through MCP does not by itself guarantee verbatim model transfer
  or stopping behavior.
- The first implementation must decide whether one package entrypoint can serve every host without
  widening environment or filesystem access.
- Remote publication may require a different transport, authentication and privacy scope than local
  coding-agent use.

## 9. Evidence Sources

- Current `agdf_dispatch` semantic definition, dispatcher service and binding implementation.
- Current AGDF control state and cross-surface dispatcher evidence.
- MCP specification for tool discovery, tool calls, schemas and standard transports.
- Existing installed-host observations for Codex, Claude Code, Copilot and OpenCode.

## 10. Next Step

Review or refine this intent. After exact `Approval: UR`, perform Brownfield Review to map existing
owners, current host MCP capabilities, transport and packaging constraints, permission behavior and
the relationship to the OpenCode-native dispatch proposal. Then record the smallest safe Mode/Slice
Decision.

No MCP server implementation, host registration, permission change, installation or public-plugin
change is authorized by this draft.

Exact approval required:

`Approval: UR`
