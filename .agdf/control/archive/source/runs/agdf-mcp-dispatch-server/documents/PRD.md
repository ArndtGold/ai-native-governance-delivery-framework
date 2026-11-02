# PRD: Cross-Host AGDF Dispatch Through MCP

Status: approved
Gate: PRD
Gate approval: exact `Approval: PRD` accepted for Revision 4 on 2026-09-06 after same-target,
same-run, same-gate and run revision `334AE415-18B0-4A89-9035-06AFE6834F88` revalidation.
Revision: 4
Date: 2026-09-06
Owner: Arndt Gold

Approval history: Revision 1 was approved through exact `Approval: PRD` on 2026-09-06 after
same-target, same-run, same-gate and revision `08DD2076-EBD4-44B2-B57D-FDB2D52D8A19`
revalidation. Revision 2 was refined before approval. The historical Revision 1 approval does not
authorize Revision 3. Revision 3 was approved through exact `Approval: PRD` on 2026-09-06 after
same-target, same-run, same-gate and revision `4F63C7BE-6936-4E50-B4C6-0D875BF80E73`
revalidation. Revision 4 separates directly observable host evidence from deterministic
dual-protocol negotiation evidence. Revision 4 was approved through exact `Approval: PRD` on
2026-09-06 after same-target, same-run, same-gate and run revision
`334AE415-18B0-4A89-9035-06AFE6834F88` revalidation.

## Revision 4 Change

Revision 4 retains the approved SDK v2, Node.js 20-or-later, package, scope, authority and cross-host
boundaries. It corrects one evidence requirement exposed by direct OpenCode and Codex testing. Host
qualification now uses only facts observable at the host boundary. Dual-protocol compatibility is
proved separately with controlled MCP clients against the same production server definition. A host
does not need to expose its internally selected protocol generation, and server compatibility is not
inferred from a successful host call.

## 1. Product Problem

AGDF already has one bounded skill dispatcher, but coding-agent hosts reach it through generated
instructions and host-specific command bindings. Models can therefore reconstruct commands, paths
and parameters differently, and a safe read-only operation can inherit general shell permissions.
The same semantic function is not yet exposed as one discoverable tool across MCP-capable hosts.

## 2. Product Outcome

Provide one local AGDF MCP capability named `agdf_dispatch` as the preferred model-facing dispatch
interface on hosts with proven support. It gives every supported host the same semantic tool
definition, validated inputs and structured result while preserving all existing AGDF authority,
skill judgement and durable control-state boundaries.

The initial product is local, offline, read-only and non-authorizing. It requires no AGDF account or
hosted service. It starts on the official MCP SDK v2 package line and supports the current MCP STDIO
protocol generation while retaining negotiated compatibility with MCP `2025-11-25`. It is
distributed as a separately versioned but release-coherent `@agdf/mcp-server` package so its
Node.js 20 runtime and dependency closure do not become requirements of the Node.js 18 compatible
AGDF CLI. The existing CLI remains available for CI, deterministic validation, diagnosis and
compatible fallback behavior.

## 3. Users And Primary Journey

Primary users are developers applying AGDF through Codex, Claude Code, OpenCode or GitHub Copilot.

1. The user explicitly enables or installs the AGDF MCP capability through a supported host path.
   AGDF defaults to project-scoped registration where the host supports it and first verifies that
   the selected local MCP runtime is Node.js 20 or later.
2. The host discovers `agdf_dispatch` with its canonical semantic description and schema.
3. An explicitly selected AGDF skill or governed-request route invokes the tool.
4. AGDF validates target evidence and reads the applicable control state.
5. The host receives either a terminal canonical presentation or a bounded skill continuation.
6. Any gate approval remains a separate deliberate user decision under existing AGDF rules.

## 4. Product Principles

- One semantic function owner, one dispatcher owner and one durable governance owner.
- MCP standardizes invocation. It does not redefine AGDF policy or approvals.
- Target evidence is explicit. Working directory is execution context only.
- Tool enablement is deliberate, reversible and separate from gate approval.
- A new MCP integration starts on SDK v2. SDK v1 is not introduced as a temporary production base.
- The optional MCP runtime requirement is separate from the existing CLI runtime requirement.
- Package installation, runtime dependency resolution and process startup preserve that separation.
- Project-scoped registration is the default; broader registration requires an explicit choice.
- Unsupported or unverified hosts retain a named compatible path without a parity claim.
- Repository, package, installed-host, operating-system and human-UAT evidence remain distinct.

## 5. Functional Requirements

### MCP-01: Single First Capability

The first server release exposes exactly one model-facing AGDF tool named `agdf_dispatch`. Additional
tools require separately approved semantics and permission boundaries.

### MCP-02: Canonical Semantic Definition

Tool name, description and input schema derive from
`SKILL_DISPATCH_FUNCTION_DEFINITION`. MCP, CLI grammar and skill guidance must not become independent
semantic owners. SDK v2 consumes the canonical input and output JSON Schemas directly through the
public `fromJsonSchema()` adapter from `@modelcontextprotocol/server`. AGDF must not maintain a
parallel Zod schema, hand-built Standard-Schema wrapper or MCP-specific field vocabulary.

### MCP-03: Strict Model Inputs

The tool accepts only the canonical skill identifier, presentation language, absolute working
directory, paired target evidence and optional explicit run identifier. It rejects additional
properties and cannot accept an executable, shell command, module path, runtime path or arbitrary
operation.

### MCP-04: Trusted Server Context

Surface identity, expected AGDF version, plugin/package root, skill registry and locale registry come
from the trusted installed server context. The model cannot set or override them.

### MCP-05: Existing Dispatcher Reuse

The server calls the existing dispatcher service. It must not duplicate target resolution, gate
evaluation, status projection, locale rendering, run selection, skill judgement or approval logic.

### MCP-06: Structured Result Contract

The result preserves dispatcher schema and contract versions, `outcome`, `terminal`,
`authorizes: false`, skill, runtime, target, control, presentation, continuation, recovery,
`host_action`, timing and bounded diagnostics. Structured content and compatibility text represent
the same result.

### MCP-07: Controlled Failure Semantics

Valid AGDF outcomes, including unresolved target and evaluator recovery, remain structured tool
results. Malformed MCP requests and unrecoverable protocol/server failures remain distinct. Raw
exception text, environment secrets and uncontrolled stack traces are not exposed to the model.

### MCP-08: Local And Offline Initial Operation

The initial server performs no outbound network request, requires no AGDF account and stores no
remote state. It reads only the repository and packaged sources required by the existing dispatcher.

### MCP-09: Read-Only And Non-Authorizing Boundary

The tool cannot mutate repository files, `.agdf/control/`, host settings or approvals. MCP
registration, host permission, tool execution and a successful result never count as
`Approval: <GateName>`.

### MCP-10: Existing Activation Boundary

The tool is invoked only after existing request-activation routing selects an AGDF skill or governed
operation. MCP registration alone does not activate AGDF for unrelated prompts or select a target.

### MCP-11: Terminal And Continuation Behavior

For terminal results, the host-facing contract requires transfer of `host_action.text` without
surrounding interpretation and then stopping. For `skill_continuation`, the model may continue only
the returned skill using the returned governance target, run and control snapshot.

### MCP-12: Explicit Host Lifecycle

Installation or registration presents the capability, effective scope, read-only/offline behavior,
permission effect, inherited process access, disable path and rollback. Existing user configuration
is preserved. Project-scoped registration is the default where the host provides that scope. A
user-wide or global registration requires a separate explicit choice. Automatic permission widening
is prohibited.

### MCP-13: Evidence-Based Host Support

The product maintains a per-host status of `supported`, `unsupported` or `unverified`, backed by
named host version, configuration and direct evidence. A protocol or schema declaration alone cannot
establish AGDF host support. Protocol compatibility is a separate release property proved by direct
negotiation tests for every claimed generation against the production server definition.

### MCP-14: Compatible Fallback

When a host lacks proven MCP support or the server is deliberately disabled, AGDF retains the
existing compatible CLI/instruction path and names that effective path. Runtime failure must not
silently search for or execute an alternate installation.

### MCP-15: Version And Provenance Safety

The server and dispatcher must be version-coherent. Missing, mismatched or unowned runtime evidence
produces terminal recovery and no downstream control evaluation. The observed MCP SDK package set,
protocol revision and Node runtime are part of the versioned server evidence.

### MCP-16: Reversible Delivery

The MCP entrypoint and every host registration can be disabled or removed without damaging the CLI,
skills, repository control state or unrelated host settings.

### MCP-17: SDK v2 Baseline

The first production MCP server uses the official SDK v2 split packages. Its required production
dependency is `@modelcontextprotocol/server`. `@modelcontextprotocol/core` is permitted only when a
reachable production import needs its public protocol schema constants. `@modelcontextprotocol/client`
may be a development dependency for contract tests but must not enter the shipped server dependency
closure. HTTP framework, remote transport, authentication and compatibility-shim packages are
excluded unless a later approved scope requires them.

The server uses the SDK v2 API for tool registration, structured output, input/output schema and
STDIO serving. It uses `fromJsonSchema()` for the canonical AGDF schemas and does not add SDK v1 as
a production or fallback dependency.

### MCP-18: Separate Node And Protocol Compatibility Boundary

The MCP server requires Node.js 20 or later. This requirement applies to the optional MCP process and
does not by itself raise the existing AGDF CLI minimum from Node.js 18.

Enablement and status must detect the actual executable used by the host before registration. An
older runtime produces `manual_compatible` with the existing CLI path and one actionable Node update
instruction. It must not download Node, select another executable from `PATH` or fall back to SDK v1.

STDIO serving must use the SDK v2 dual-era serving path with one server definition. The first release
supports MCP `2026-07-28` as its primary generation and MCP `2025-11-25` as its required legacy
baseline. Additional protocol versions are supported only when the exact release configuration and
direct host evidence name them. A direct `McpServer` connection to `StdioServerTransport`, which
serves only the 2025 era, does not satisfy this requirement. Support claims must name the protocol
generation observed on the tested host.

### MCP-19: Isolated MCP Package Boundary

The server is delivered as `@agdf/mcp-server` with its own manifest, `engines.node` requirement of
Node.js 20 or later, entrypoint and locked SDK dependency graph. Its release version must exactly
match the AGDF package and plugin version that supplies the dispatcher contract and runtime
provenance.

`create-agdf` remains the installation and host-lifecycle owner, but its Node.js 18 compatible path
must not import, resolve, download or execute `@agdf/mcp-server` or SDK v2 unless the user explicitly
enables MCP with a suitable Node.js 20-or-later executable. The existing CLI must remain installable
and usable without the MCP package.

### MCP-20: Least-Scope Host Registration

Where a host supports project-local MCP configuration, AGDF registers the server at project scope by
default. User-wide or global registration is an explicit alternative that identifies its broader
effective scope before mutation. A host that cannot express the selected scope returns an
actionable non-mutating result rather than silently choosing a broader scope.

### MCP-21: Cross-Host Release Qualification

Codex, Claude Code and OpenCode remain implementation targets. A first-release cross-host claim
requires direct registration, discovery, invocation, controlled-failure and removal evidence on
OpenCode plus at least one of Codex or Claude Code. Each host is qualified independently, so an
unverified adapter is omitted from the corresponding support claim without blocking a correctly
qualified core server or another host adapter.

GitHub Copilot remains `unverified` for the first release and cannot satisfy the two-host minimum
without installed-host evidence added through a later approved revision.

### MCP-22: Honest Local Process Access Boundary

The local MCP process inherits the operating-system identity and filesystem permissions of the host
that launches it. The first release does not claim process sandboxing. Its application contract
instead exposes no generic file, shell or network operation and permits reads only through the
existing dispatcher for the explicitly resolved governance target and the exact version-matched
AGDF package/runtime roots. It must not enumerate or inspect unrelated directories.

## 6. First-Release Host Boundary

- Codex, Claude Code and OpenCode are implementation targets because installed local clients expose
  MCP management and current official documentation supports local MCP servers. The cross-host
  release threshold requires OpenCode plus at least one of Codex or Claude Code.
- GitHub Copilot remains `unverified` in the first release. Current official documentation supports
  MCP in Copilot CLI and cloud-agent contexts, but no local Copilot CLI evidence exists in this run.
- A host is listed as supported only after directly observable registration, discovery, invocation,
  failure, terminal or continuation behavior where applicable, and disable/rollback evidence passes
  for the named host version, environment, Node runtime, AGDF version, SDK package set and exact
  registered entrypoint or configuration identity.
- Protocol support is qualified separately by controlled clients that request and confirm MCP
  `2026-07-28` and `2025-11-25` against the same production server definition. A host-selected
  generation is recorded only when the host exposes it through a stable supported interface; its
  absence does not invalidate otherwise complete host evidence.
- Support and release readiness are recorded per host. One unverified adapter does not create a
  parity claim and does not invalidate a separately qualified adapter.
- The existing public OpenAI plugin candidate remains skills-only and no-MCP in this delivery.

## 7. MCP Runtime And Protocol Baseline

- Official SDK family: MCP TypeScript SDK v2.
- Distribution package: `@agdf/mcp-server`, version-matched to the AGDF release.
- Required production package: `@modelcontextprotocol/server`.
- Conditional production package: `@modelcontextprotocol/core` only for directly imported public
  protocol schema constants.
- Development-only package: `@modelcontextprotocol/client` when required for contract tests.
- Forbidden shipped server roles: MCP client, Streamable HTTP, SSE, WebSocket, authentication and
  framework adapters.
- Minimum MCP runtime: Node.js 20.
- Existing AGDF CLI baseline: unchanged by this PRD revision.
- Primary protocol generation: MCP `2026-07-28`.
- Required compatibility generation: MCP `2025-11-25` through the same SDK v2 STDIO serving path.
- Additional protocol generations: absent unless named in exact release and controlled negotiation
  evidence against the production server definition.
- Schema rule: `SKILL_DISPATCH_FUNCTION_DEFINITION` remains canonical and is adapted losslessly
  through `fromJsonSchema()`.
- Upgrade rule: an SDK major or protocol-generation change requires explicit compatibility review,
  exact dependency updates and direct retest of every claimed host.

## 8. UX Requirements

- The tool description states its purpose, non-authorizing behavior, terminal transfer requirement
  and continuation boundary before invocation.
- Users can distinguish configured, available, unavailable, unsupported and manual-compatible states.
- Project-scoped registration is presented as the default. A broader effective scope is shown before
  the user explicitly chooses it.
- Target, activation, configuration, startup, version and input failures each produce one actionable
  next step and a visible retry where recovery is possible.
- Node-runtime failure identifies the observed major version, requires Node.js 20 or later for MCP
  and keeps the existing CLI path visible as `manual_compatible`.
- Host permission prompts identify the bounded AGDF tool rather than imply general shell authority
  where the host supports tool-specific permission.
- Lifecycle status states that the local server inherits the launching process identity and does not
  claim operating-system sandboxing.
- Gate requests continue to use existing canonical AGDF interaction and exact approval values.

## 9. Acceptance Criteria

| ID | Acceptance criterion |
|---|---|
| MCP-AC-01 | MCP tool discovery exposes exactly one `agdf_dispatch` tool whose name, description, input schema and output schema match the canonical semantic owner through the SDK v2 `fromJsonSchema()` projection. No parallel Zod schema, hand-built Standard-Schema wrapper or MCP field vocabulary exists. |
| MCP-AC-02 | Unknown fields, unpaired target evidence, invalid skill/run/language values and model-supplied executable or command data are rejected deterministically. |
| MCP-AC-03 | A resolved deterministic invocation returns the existing terminal control presentation with `authorizes: false` and the canonical host action. |
| MCP-AC-04 | An unresolved target returns one terminal localized orientation and performs no repository control evaluation. |
| MCP-AC-05 | A judgement skill returns one bounded continuation tied to the returned skill, target, run and control snapshot. |
| MCP-AC-06 | Node runtime mismatch, SDK/package mismatch, protocol negotiation failure, startup failure, malformed protocol input and internal evaluator recovery are distinguishable without raw exception or secret exposure. |
| MCP-AC-07 | Tests prove that every MCP tool path is read-only and performs no outbound network request. |
| MCP-AC-08 | MCP permission and execution cannot persist or simulate any AGDF approval. Exact approval and same-run/gate/revision revalidation remain unchanged. |
| MCP-AC-09 | CLI skill dispatch, doctor, gate-check, package generation and runtime-integrity behavior remain compatible, including the existing CLI Node.js 18 baseline. |
| MCP-AC-10 | Installation and update preserve existing user settings and provide explicit enable, status, disable and rollback behavior for each delivered host adapter. Project scope is the default where supported; broader scope requires a separate explicit choice. |
| MCP-AC-11 | Each supported host has direct evidence for registration, tool discovery, successful call, controlled failure and removal or disablement. |
| MCP-AC-12 | Unsupported or unverified hosts show the effective compatible path and are not described as MCP-supported. |
| MCP-AC-13 | Cold start, warm call, timeout, cancellation, output-size and clean shutdown evidence is recorded separately from model latency. Controlled protocol clients record requested and negotiated generations in an independent protocol lane. SD and TP set justified thresholds from measured baselines. |
| MCP-AC-14 | Native macOS, Linux and Windows behavior is directly verified or remains an explicit QA-blocking evidence gap for every corresponding support claim. |
| MCP-AC-15 | Public plugin validation continues to reject MCP content in the existing skills-only candidate. |
| MCP-AC-16 | Removing MCP registration and package entrypoint leaves CLI, skills and `.agdf/control/` intact and usable. |
| MCP-AC-17 | The shipped server production closure contains `@modelcontextprotocol/server`, contains `@modelcontextprotocol/core` only when directly imported, and excludes SDK v1, MCP client, HTTP, remote transport, authentication and compatibility packages. Test-only client dependencies do not enter the shipped closure. |
| MCP-AC-18 | Node.js 20 or later enables MCP; Node.js 18 produces a non-mutating `manual_compatible` result and leaves the existing CLI path usable. Controlled clients prove that one SDK v2 STDIO server definition negotiates both `2026-07-28` and `2025-11-25`. |
| MCP-AC-19 | `@agdf/mcp-server` has its own Node.js 20-or-later manifest and exact release version. Installing and running the existing Node.js 18 CLI does not import, resolve, download or execute that package or SDK v2 unless MCP enablement is explicitly selected. |
| MCP-AC-20 | Every host with project-local configuration defaults to project scope. Selecting user-wide or global scope shows the broader effect first, and an unavailable requested scope fails without mutating another scope. |
| MCP-AC-21 | A cross-host release claim has direct evidence for OpenCode and at least one of Codex or Claude Code. Support status remains independent per host, and GitHub Copilot remains `unverified` without installed-host evidence. |
| MCP-AC-22 | Tests prove that the tool exposes no generic filesystem, shell or network operation, reads only through the existing dispatcher within the resolved target and owned runtime roots, and makes no operating-system sandbox claim. |

## 10. Non-Goals

- A hosted AGDF MCP service, remote repository upload, custom account, authentication or telemetry.
- Mutable AGDF tools for implementation, approval, commit, push, release or arbitrary command use.
- Replacing skills that require model judgement, including QA and reviews.
- A new target resolver, gate evaluator, locale renderer, approval store or workflow state.
- Automatic activation for unrelated prompts.
- Immediate removal of CLI commands, build scripts or test scripts.
- Raising the minimum Node.js version for every existing AGDF CLI and agent-native operation as a
  side effect of introducing the optional MCP server.
- Shipping SDK v1 as a temporary compatibility layer.
- Public plugin publication or privacy-policy expansion for MCP.
- Universal host-parity claims.
- An operating-system sandbox or protection from code already running with the user's local process
  identity.

## 11. Dependencies And Relationships

- The committed semantic function owner and dispatcher service are required reuse points.
- `cross-surface-executable-skill-dispatcher` retains ownership of dispatcher semantics and its
  separate open host evidence.
- `opencode-native-dispatch-tool` remains a related unapproved proposal until direct OpenCode MCP
  evidence determines whether its permission need is satisfied.
- Existing host-adapter, installer, runtime-provenance, package-generation and Runtime Integrity
  owners must be reused. `create-agdf` remains the lifecycle owner without taking an MCP runtime
  dependency on its Node.js 18 compatible path.
- The new `@agdf/mcp-server` package owns the Node.js 20 entrypoint and exact SDK v2 production
  closure. Its version is released coherently with the AGDF runtime that owns the dispatcher.
- `@modelcontextprotocol/server` is a production input. `@modelcontextprotocol/core` becomes one only
  if the implementation imports its public schema constants. Their exact package versions, licenses
  and shipped bytes require release evidence.

## 12. Evidence Plan

- Contract tests for discovery metadata, schema, mapping and output parity.
- Package-boundary tests proving that the Node.js 18 CLI neither resolves nor loads the separately
  versioned Node.js 20 MCP package before explicit enablement.
- SDK v2 dependency-closure tests proving that SDK v1, production client code and remote transports
  are absent, with `@modelcontextprotocol/core` present only when a reachable import requires it.
- Node.js 20 positive execution plus Node.js 18 `manual_compatible` behavior.
- Direct `serveStdio` negotiation evidence for MCP `2026-07-28` and `2025-11-25` without separate
  server definitions.
- Negative tests for forbidden inputs, mutation, network, version drift and raw-error leakage.
- Package and installed-layout tests for entrypoint identity and generated payload parity.
- Per-host configuration and permission tests using exact installed versions.
- Project-scope default, explicit broader-scope choice and unavailable-scope non-mutation tests.
- Fresh loaded-host observations for invocation, terminal transfer, continuation and recovery.
- Cross-host release evidence covering OpenCode plus at least one of Codex or Claude Code.
- Process-access tests proving bounded application behavior while recording that the process inherits
  the launching host's operating-system identity and filesystem permissions.
- Native operating-system evidence separated from fixtures and simulated path strings.
- Independent preservation check for the public skills-only candidate.

## 13. Risks

- Host-specific MCP configuration or permission behavior can force thin adapters and separate support
  states even with a shared protocol.
- MCP SDK or protocol changes can create package and compatibility drift.
- A server process can inherit more environment or filesystem access than intended unless SD defines
  a strict launch and provenance boundary.
- Models can still disregard terminal handling unless host and skill behavior are directly verified.
- Retaining MCP and CLI paths increases regression surface and demands contract parity checks.
- Keeping different minimum Node versions for CLI and MCP can confuse users unless lifecycle status
  reports the selected executable and effective path clearly.
- A separate server package adds release-order and version-skew risk unless publication, installation
  and provenance checks require an exact AGDF version match.
- SDK v2 and the `2026-07-28` protocol generation are newer compatibility surfaces and require exact
  controlled negotiation evidence. Host support independently requires direct observable host
  evidence rather than documentation-based parity claims.
- Project scope is not expressible on every host, so lifecycle handling must fail without silently
  widening configuration scope.
- The process inherits the user's local permissions, so documentation and tests must limit claims to
  the exposed application contract and never describe the first release as sandboxed.

## 14. Next Step

PRD Revision 4 is approved. Review SD Revision 3 and provide exact `Approval: SD`, request revision
or decline. TP Revision 2 remains a downstream draft and gains no authority until SD Revision 3 is
approved. Existing implementation, QA, UAT, release and VCS actions do not gain authority from the
PRD approval.
