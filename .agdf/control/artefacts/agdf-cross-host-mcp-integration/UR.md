# UR: Cross-Host MCP Integration Contract

Status: approved
Gate: UR
Gate approval: Exact `Approval: UR` accepted on 2026-09-06 after same-target, same-run, same-gate and run revision `AE03DD51-A43A-4C50-AF8C-1E5A2F9B3266` revalidation.
Revision: 1
Date: 2026-09-06
Owner: Arndt Gold

## 1. Problem

AGDF now provides one local SDK v2 MCP server and project-first lifecycle adapters for Codex,
Claude Code and OpenCode. GitHub Copilot remains outside that lifecycle, and the supported hosts do
not yet share one explicit integration contract for capability detection, registration, status,
scope, provenance, rollback and removal.

The wire protocol and `agdf_dispatch` semantics are already shared. Installation and host behavior
remain fragmented enough that each new host or version can acquire different result fields, support
claims, recovery behavior and documentation. Treating all host configurations as identical would
hide real differences; leaving every adapter independent would recreate the drift that MCP was
introduced to reduce.

## 2. User Need

As an AGDF user working with Copilot, Codex, Claude Code and OpenCode, I need one predictable way to
enable, inspect, use, disable and remove the same AGDF MCP capability while retaining each host's
native configuration, permission and scope semantics.

## 3. Intended Outcome

Establish one versioned cross-host MCP integration contract above the existing server and below the
host-specific configuration mechanisms. The contract defines the common lifecycle, result schema,
capability vocabulary, provenance rules and evidence requirements. Thin adapters translate that
contract into each host's supported native mechanism.

The completed `agdf-mcp-dispatch-server` run remains the server and semantic baseline. This run adds
the missing Copilot integration and aligns all four supported coding-agent adapters without creating
a second MCP server, installer, dispatcher, policy engine or approval authority.

## 4. Scope

The bounded delivery should:

- define one canonical host-integration profile for `copilot`, `codex`, `claude` and `opencode`;
- express host capability, supported scope, effective configuration, executable identity, runtime
  requirement, permission effect, discovery state, recovery and removal through one result contract;
- route `mcp status | enable | disable` through the existing lifecycle owner for all four surfaces;
- add a Copilot adapter using only a directly supported Copilot MCP registration mechanism;
- align the existing Codex, Claude Code and OpenCode adapters where their observable contracts
  differ without a host-owned reason;
- preserve native TOML, JSON, CLI or plugin configuration formats behind thin host adapters;
- use the same release-coherent `@agdf/mcp-server` entrypoint and canonical `agdf_dispatch`
  definition on every supported surface;
- default to the narrowest supported project or repository scope and require an explicit choice for
  broader scope;
- preserve unrelated host configuration and provide exact rollback for partial failures;
- expose honest `supported`, `manual_compatible`, `unavailable`, `unsupported` and `unverified`
  states with stable diagnostic codes;
- keep request activation, target selection, gate evaluation, presentation and exact approval
  semantics in their existing canonical owners; and
- verify every support claim with direct host evidence, then remove all temporary registrations and
  runtimes created for testing.

Brownfield Review must determine whether the common profile belongs in the existing MCP lifecycle
module, the canonical plugin definition, or another existing release-owned registry. It must also
resolve the relationship to `opencode-native-dispatch-tool` and the current Copilot plugin path
before any design is selected.

## 5. Acceptance Criteria

1. One public lifecycle command family accepts all four named surfaces and returns the same stable
   top-level status, enable, disable and recovery vocabulary.
2. Every enabled adapter resolves to the same version-coherent `@agdf/mcp-server` production
   entrypoint and canonical `agdf_dispatch` semantic definition.
3. Each adapter retains its host-native storage and scope rules; the common layer does not claim a
   scope or permission that the host cannot directly prove.
4. Status reads effective host state and reports the observed configuration, executable identity,
   server version, scope and capability state without mutating configuration.
5. Enable is idempotent, preserves unrelated settings, rejects foreign or ambiguous AGDF ownership
   and restores the exact prior state after any partial failure.
6. Disable removes only the exact AGDF-owned registration and restores an originally absent
   configuration container when safe.
7. No adapter widens general shell, edit, file or network permissions automatically.
8. MCP registration, permission, discovery and invocation remain non-authorizing and never count as
   `Approval: <GateName>`.
9. Missing MCP capability or an unsupported host version yields an explicit compatible path without
   runtime search, silent installation or unverified parity claims.
10. Repository tests cover the shared profile, all adapter contracts, idempotency, preservation,
    rollback, version mismatch, scope rejection and stable cross-host result fields.
11. Direct loaded-host evidence covers Copilot, Codex, Claude Code and OpenCode separately for
    registration, discovery, one bounded dispatch, status and complete removal.
12. Protocol negotiation, package integrity, host behavior, operating-system behavior and human UAT
    remain separate evidence lanes.

## 6. Non-Goals

- Changing the MCP wire tool, dispatcher semantics, gate model or `.agdf/control/` authority.
- Adding mutation, approval, implementation, commit, push, release or arbitrary-command MCP tools.
- Replacing native host configuration with one AGDF-owned configuration file.
- Treating Copilot CLI, Copilot app and Copilot cloud agent as one proven surface without direct
  evidence for each claimed environment.
- Adding remote MCP transport, authentication, telemetry, accounts or repository upload.
- Publishing a new public marketplace entry or release in this run.
- Removing the compatible CLI and instruction paths.
- Claiming Windows, Linux or host-version parity from macOS repository evidence.

## 7. Ownership And Related Work

- `agdf-mcp-dispatch-server` owns the completed server, semantic contract and initial three host
  lifecycle implementations.
- `create-agdf/lib/mcp-lifecycle/` is the current shared lifecycle and result owner candidate.
- Existing host adapters and installers own native configuration mutation and rollback.
- `plugin/meta/agdf-plugin.definition.json` owns supported host identities and generated profiles;
  Brownfield Review must verify whether it should also own the integration profile.
- `agdf-copilot-plugin-integration` owns Copilot plugin discovery and target behavior, not this new
  MCP lifecycle contract.
- `opencode-native-dispatch-tool` remains a draft permission-experience scope until Brownfield Review
  establishes whether MCP satisfies or supersedes it.
- `.agdf/control/` remains the only durable governance and approval authority.

## 8. Risks And Open Questions

- Copilot app, CLI and cloud agent may expose different MCP registration and discovery behavior.
- A common result schema can become misleading if it erases host-specific scope or permission facts.
- Native host CLIs may change configuration formats or command output between versions.
- Shared package acquisition must not introduce PATH search, `npx` fallback or version drift.
- Temporary direct-host tests can leave registrations or runtime files behind unless cleanup is
  verified independently.
- The current OpenCode native-tool proposal may overlap with MCP permission behavior but cannot be
  closed from protocol evidence alone.

## 9. Evidence Sources

- Completed `agdf-mcp-dispatch-server` UR, PRD, SD, TP, CD+Tests, host evidence, QA, UAT and OR.
- Current `create-agdf/lib/mcp-lifecycle/` implementation and its Codex, Claude Code and OpenCode
  adapter tests.
- Current Copilot plugin installer, generated profile and direct host observations.
- Canonical semantic function definition and `@agdf/mcp-server` package contract.
- Official current host documentation and installed CLI/app capability probes during Brownfield
  Review; documentation alone cannot establish loaded-host support.

## 10. Next Step

Review or refine this intent. After exact `Approval: UR`, perform Brownfield Review over the existing
MCP lifecycle, host adapters, installer and plugin-profile owners. Record the smallest safe
Mode/Slice Decision before drafting PRD or implementation.

No adapter, installer, host configuration, permission, package or runtime change is authorized by
this draft.

UR Revision 1 was approved through exact `Approval: UR` on 2026-09-06. This permits Brownfield
Review and proportional routing. It does not authorize implementation.
