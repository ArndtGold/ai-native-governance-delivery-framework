# PRD: Common AGDF MCP Lifecycle Across Coding-Agent Hosts

Status: approved
Gate: PRD
Gate approval: Exact `Approval: PRD` accepted on 2026-09-06 after same-target, same-run,
same-gate and run revision `575EE4E5-9B6E-43F0-AFAC-B264D22B27FF` revalidation.
Based on: approved UR Revision 1, passed Brownfield Review and ready UX Intent Definition
Revision: 1
Date: 2026-09-06
Owner: Arndt Gold

## 1. Product Scope

Deliver one explicit, project-first lifecycle for the existing local AGDF MCP server across GitHub
Copilot, Codex, Claude Code and OpenCode. A user can inspect, enable and disable the same
`agdf_dispatch` capability through one public command family while every host retains its native
configuration, trust, permission, precedence and fresh-session behavior.

This run extends the completed `agdf-mcp-dispatch-server` delivery. It does not create another MCP
server or redefine the tool. `create-agdf/lib/skill-dispatch/contract.js` remains the sole semantic
owner for the model-facing function name, description, input schema and output schema. The existing
MCP lifecycle remains the executable integration owner, and release capability metadata remains the
declarative projection of supported and evidenced facts.

The supported user-facing command shape is:

```text
npx --yes @agdf/cli@<version> mcp <status|enable|disable> \
  --surface <copilot|codex|claude|opencode> \
  --dir <absolute-repository-target> \
  [--scope <project|user>] \
  [--json]
```

`project` is the default. `user` is an explicit broader choice. A host that cannot represent the
requested scope must return a non-mutating result and must not choose a broader scope silently.

### Product decisions

- Plugin installation and MCP activation are separate explicit actions and separately observable
  states. Installing or enabling an AGDF plugin does not prove MCP registration, discovery or use.
- MCP is activated through the common lifecycle. This run does not add an automatically started,
  plugin-bundled MCP configuration to any host plugin.
- Each host uses one lifecycle-managed native configuration source for the requested scope. Exact
  file, CLI and transaction mechanisms belong to Solution Design.
- The common result exposes stable lifecycle vocabulary and also preserves host-native facts. It
  never flattens trust, policy, precedence or permission differences into a false parity claim.
- Support is qualified per exact host evidence tuple. One passing host does not authorize a claim
  for another host, client variant, version or operating system.
- The existing version-matched CLI and instruction path remains the named compatible path when MCP
  is unavailable, unsupported, unverified or deliberately disabled.

## 2. UX Intent And Success

- ui_ux_impact: `high`
- ux_intent_definition:
  `.agdf/control/artefacts/agdf-cross-host-mcp-integration/UX_INTENT_DEFINITION.md` (`ready`)
- primary_user_intent: Enable the same local AGDF MCP capability for one selected coding-agent host,
  understand its real effective state and scope, use it in a fresh session, and remove it cleanly.
- success_signal: One explicit lifecycle action reports the selected host, scope, exact server
  identity, native configuration source, capability and discovery state plus one next action; a
  fresh host session discovers `agdf_dispatch`, and disable restores the prior state.
- primary_decision_or_action: Inspect status, then explicitly enable or disable AGDF MCP for one
  named host and scope.

## 3. Working Modes And Effective State

| working_mode | effective_state | visible_state_types | effective_state_authority | primary_state_presentation_owner |
|---|---|---|---|---|
| `unavailable_or_unsupported` | The selected host, version, policy or Node runtime cannot run the exact AGDF MCP package for the requested scope. | reason code, observed version, requested scope, compatible path, next action | native host capability and policy; AGDF package requirements | AGDF lifecycle result, with native policy detail retained |
| `compatible_not_configured` | No effective AGDF-owned registration exists and the compatible CLI path remains available. | host, scope, configuration source checked, runtime state, `not_configured` | native configuration plus AGDF ownership inspection | AGDF lifecycle result |
| `configured_pending_restart_or_trust` | The exact registration was written and verified, but host trust, policy acceptance or a fresh session is still required. | changed paths or native source, exact runtime identity, permission effect, restart or trust action | native configuration and host trust/policy | AGDF lifecycle result for registration; host for trust and policy |
| `configured_unverified` | Configuration and package identity match, but direct loaded-tool discovery has not been observed. | configuration match, version, digest, entrypoint, discovery `not_checked` or `unverified` | AGDF inspection for configuration; host session for discovery | AGDF lifecycle result |
| `discovered_ready` | A fresh directly observed host session exposes the exact canonical tool through the registered server. | exact host/version, tool name, invocation evidence, support tuple | directly observed host behavior plus canonical semantic contract | native host for tool state; evidence record for qualification |
| `degraded_or_foreign` | A conflicting, higher-precedence, malformed, mismatched or non-AGDF-owned registration prevents safe mutation or a valid support claim. | source, precedence, ownership, mismatch, diagnostic, recovery action | native effective configuration; AGDF ownership and provenance rules | AGDF lifecycle result |
| `disabled` | The exact AGDF-owned registration is absent and an unreferenced AGDF runtime has been removed; unrelated state matches its prior value. | removal result, preserved state, remaining references, compatible path | native configuration plus AGDF transaction verification | AGDF lifecycle result |

### Stable product vocabulary

The common envelope uses these independent state groups:

- capability: `supported | manual_compatible | unavailable | unsupported | unverified`
- registration: `absent | matched | foreign | owned_mismatch | precedence_conflict | invalid`
- discovery: `not_checked | pending_restart | discovered | not_discovered | unavailable`
- operation result: `not_configured | configured_pending_restart | configured_unverified |
  discovered_ready | unchanged | disabled | degraded | failed`

Solution Design may add structured host facts and diagnostic codes. It must not rename these product
meanings per adapter or use `supported` without the direct evidence required by this PRD.

## 4. Activation, Blockers, Recovery And Transitions

- activation_and_deactivation: The user names one host, absolute target and optional scope. Status
  reads without mutation. Enable presents the effective scope and inherited local-process permission
  effect, installs the exact release-coherent runtime only after the explicit action, writes one
  AGDF-owned native registration and verifies it. Disable removes only that owned registration and
  retires the runtime only when no AGDF lifecycle reference remains.
- blockers_and_visible_next_actions: Unsupported host/version, Node below the server minimum,
  absent host CLI, organization policy, project trust, a foreign or higher-precedence entry, invalid
  native configuration, version/digest mismatch, authentication unavailability and incomplete
  rollback each produce a stable diagnostic plus one precise non-authorizing next action.
- recovery_paths: Correct the named prerequisite and retry the same explicit operation; inspect the
  higher-precedence or foreign source without overwriting it; restart or open a fresh session;
  disable an exact owned entry; use the named version-matched CLI path when MCP cannot be qualified.
  Every recoverable transient failure exposes a visible retry action.
- relevant_state_transitions: `compatible_not_configured -> configured_pending_restart_or_trust`
  after a verified enable transaction; `configured_pending_restart_or_trust ->
  configured_unverified` after native acceptance; `configured_unverified -> discovered_ready` only
  after fresh direct evidence; any configured state may enter `degraded_or_foreign` after drift or
  precedence conflict; a successful retry restores the applicable prior state; disable moves an
  owned configured state to `disabled`; failed enable or disable restores the exact pre-operation
  state or reports a blocking rollback failure.

## 5. Functional Requirements

### CHMCP-01: One four-host lifecycle command

The existing public `mcp status | enable | disable` family accepts `copilot`, `codex`, `claude` and
`opencode`. It rejects omitted or unknown hosts and requires one explicit absolute repository target.

### CHMCP-02: Canonical semantic function owner

Every adapter launches the same exact-version MCP server and exposes the canonical `agdf_dispatch`
definition. Host manifests, configuration projections and lifecycle metadata must derive from the
existing semantic contract and cannot carry an independently maintained function description or
schema.

### CHMCP-03: Common profile, native effective state

One versioned integration profile defines the common state vocabulary, expected host capabilities,
scope semantics, runtime requirements, registration identity, recovery fields and evidence status.
Effective state is always read from the selected host's native source and precedence rules.

### CHMCP-04: Read-only status

Status performs no package installation, configuration write, permission change, login, restart or
tool call. It reports every checked source needed to explain the effective result, including a
higher-precedence or foreign source when the host exposes one.

### CHMCP-05: Explicit project-first enable

Enable defaults to the narrowest supported project-targeted scope. A broader user scope requires
the explicit `--scope user` choice. Before mutation, output or structured intent names the selected
host, requested scope, effective scope, local process access and removal path.

### CHMCP-06: Plugin and MCP state separation

AGDF plugin install, enabled and loaded states remain separate from MCP registered, discovered and
supported states. Existing host installation output may name `mcp status` or `mcp enable` as a next
action, but it must not enable MCP automatically or claim tool discovery.

### CHMCP-07: Copilot native adapter

Copilot gains the same project and user lifecycle outcomes through directly supported Copilot MCP
configuration. The adapter preserves unrelated entries, respects project trust, organization
registry or allowlist policy and native precedence, and distinguishes CLI, app and cloud-agent
evidence. Plugin-provided MCP is not an automatic fallback or a second active source.

### CHMCP-08: Existing host parity without false uniformity

Codex, Claude Code and OpenCode keep their native configuration and scope rules. Their common fields,
diagnostics and state meanings align unless a named host contract requires a difference. The result
contains the observed host-specific variant rather than hiding it.

### CHMCP-09: Exact runtime and provenance

Every matched registration resolves to the release-coherent `@agdf/mcp-server` entrypoint, exact
version, digest and selected Node executable. No adapter searches PATH for an alternate runtime,
uses `npx` at host startup, downloads dependencies silently or accepts an unowned entry.

### CHMCP-10: Idempotency and preservation

Repeated status and enable operations do not duplicate configuration or runtime references.
Unrelated native settings preserve their exact values and ordering where the format makes ordering
meaningful. A matching registration returns an unchanged result.

### CHMCP-11: Transactional failure and rollback

Partial package or registration failure restores the exact prior AGDF-owned and unrelated state.
Foreign, ambiguous, invalid or higher-precedence conflicts fail before mutation. An unsuccessful
rollback is a blocking result and never a support claim.

### CHMCP-12: Ownership-safe disable

Disable removes only an exact AGDF-owned registration for the selected host and scope. It restores
an originally absent configuration container when safe, retains shared runtimes while any valid
reference remains and removes the runtime after the final reference disappears.

### CHMCP-13: Permission and approval boundary

The lifecycle does not widen general shell, edit, file or network permissions. A host trust choice,
MCP registration, permission grant, discovered tool or successful call has `authorizes: false` and
never counts as `Approval: <GateName>`.

### CHMCP-14: Honest support qualification

`supported` requires direct evidence for the exact host client, version, operating system, scope,
configuration source, Node runtime, AGDF version, entrypoint and fresh session. Documentation,
fixtures, plugin installation, protocol negotiation or another host can establish only
`unverified`, compatibility or a bounded negative state.

### CHMCP-15: Direct four-host matrix

Copilot, Codex, Claude Code and OpenCode each receive an independent direct evidence record covering
initial absence or prior state, enable, native registration, fresh-session discovery, one bounded
dispatch, lifecycle status, disable, runtime reference cleanup and exact post-removal comparison.
Missing authentication or host availability remains an explicit blocking evidence gap for that host.

### CHMCP-16: Separate protocol, package, host, OS and UAT evidence

Existing controlled dual-protocol negotiation and package integrity remain separate regression
lanes. Host qualification uses only directly observable host facts. macOS results do not prove
Windows or Linux behavior. Human UAT does not replace deterministic lifecycle or cleanup evidence.

### CHMCP-17: Compatible path

Unavailable, unsupported, unverified and deliberately disabled states name the existing
version-matched AGDF CLI skill-dispatch path. The lifecycle does not execute that path silently.

### CHMCP-18: OpenCode permission question

The direct OpenCode matrix records whether MCP invocation removes repeated general shell approval
for bounded dispatch while unrelated shell and edit permissions keep their prior values. Only that
evidence can support retirement of `opencode-native-dispatch-tool`; this run does not pre-approve or
silently close the separate draft.

## 6. Acceptance Criteria

| criterion_id | working_mode | source_state and trigger/action | expected effective state and visible feedback | blocker/failure and recovery/next action | observable success and required evidence |
|---|---|---|---|---|---|
| CHMCP-AC-01 | all | Invoke the public lifecycle with each of the four supported surface names and an absolute target. | The same command family accepts every surface and emits the same envelope version and state groups. | Missing/unknown surface or non-absolute target fails before lifecycle execution and names the correction. | CLI contract tests cover all accepted and rejected forms. |
| CHMCP-AC-02 | `compatible_not_configured` | Run status against an unconfigured supported host and scope. | Result is `not_configured`; capability, registration, discovery, scope, checked source and compatible path are visible; no file or runtime changes occur. | Inspection failure returns `failed` with one retry or repair action. | Before/after filesystem and command-spy evidence plus per-host tests. |
| CHMCP-AC-03 | `unavailable_or_unsupported` | Run status or enable with absent host, unsupported version, policy denial or Node below requirement. | The exact cause maps to `unavailable`, `unsupported` or `manual_compatible`; no broader scope or alternate runtime is selected. | Recovery names the required host, policy or Node action and the existing CLI path. | Negative fixtures and direct available-host observations. |
| CHMCP-AC-04 | `compatible_not_configured` | Run enable without `--scope`. | Project-targeted scope is selected and shown before mutation; one exact runtime and native registration are prepared. | An unavailable project scope fails without switching to user scope. | Per-host scope tests and direct configuration observation. |
| CHMCP-AC-05 | `compatible_not_configured` | Run enable with explicit `--scope user`. | The broader effect is visible and the user-scoped native source is used. | Unsupported user scope fails without project mutation. | CLI tests, adapter tests and direct user-scope observation where authorized. |
| CHMCP-AC-06 | `configured_pending_restart_or_trust` | Complete a successful enable transaction. | Result is `configured_pending_restart`; exact Node, entrypoint, version, digest, native source, permission effect and next host action are visible. | Partial failure restores the exact prior state and returns a stable diagnostic and retry. | Transaction tests and direct before/after evidence. |
| CHMCP-AC-07 | `configured_unverified` | Run status after native registration but before fresh-session proof. | Configuration is `matched`, discovery is `not_checked` or `pending_restart`, support remains `unverified`. | The product does not convert matched configuration into `supported`. | Result-contract tests and direct pre-restart status capture. |
| CHMCP-AC-08 | `discovered_ready` | Start a fresh host session and invoke one bounded AGDF dispatch. | The host exposes the canonical `agdf_dispatch` tool and the result retains `authorizes: false`, terminal or bounded continuation semantics and exact target/run evidence. | Missing tool or failed call records `not_discovered` or a controlled failure and one recovery action. | Separate Copilot, Codex, Claude Code and OpenCode direct-host records. |
| CHMCP-AC-09 | configured modes | Repeat enable and status for an exact matching registration. | No duplicate entry or runtime is created; result is `unchanged` or the same read-only status. | Drift is classified as owned mismatch or foreign rather than overwritten. | Idempotency tests and exact configuration snapshots. |
| CHMCP-AC-10 | `degraded_or_foreign` | Inspect a foreign, ambiguous, malformed or higher-precedence AGDF-named entry. | Source, precedence and ownership conflict are visible; no mutation occurs. | Recovery identifies the source the user must resolve; AGDF does not delete it. | Negative adapter fixtures for every host format and direct evidence where available. |
| CHMCP-AC-11 | configured modes | Cause a failure after runtime preparation or native registration begins. | The transaction restores the exact prior configuration, directory presence and runtime references. | Rollback failure is explicit and blocks a clean result. | Fault-injection tests cover every mutation phase and shared-runtime case. |
| CHMCP-AC-12 | configured modes | Run disable for an exact AGDF-owned registration. | Only the selected registration is removed; unrelated settings remain; final runtime disappears only after its last reference; result is `disabled`. | Foreign or ambiguous entries are preserved and produce a recovery action. | Per-host removal tests plus direct post-removal snapshots. |
| CHMCP-AC-13 | `disabled` | Run status after disable and compare with the captured baseline. | Registration is absent, compatible path remains usable and no temporary runtime or AGDF-created empty container remains. | Any residue is a failed cleanup and blocks host qualification. | Independent cleanup command/file inspection for each direct host run. |
| CHMCP-AC-14 | all | Install or enable the AGDF host plugin without running MCP enable. | Plugin state may change; MCP remains separately `not_configured` or retains its prior state. | Output must not claim MCP discovery or support and names the explicit next lifecycle action when useful. | Installer regression tests and direct Copilot plugin-plus-MCP state observation. |
| CHMCP-AC-15 | all | Compare adapter metadata and discovered tool definition with the canonical semantic contract. | Name, description and schemas originate from the one semantic owner with no divergent host copy. | Any duplicated or mismatched definition fails package or integration validation. | Source ownership test, generated-payload checks and direct discovery metadata where hosts expose it. |
| CHMCP-AC-16 | all | Exercise permission, trust and a successful MCP call. | General shell/edit settings remain unchanged and every result remains non-authorizing. | Any permission widening or approval persistence is a blocking failure. | Configuration diff tests, direct host permission observation and control-state comparison. |
| CHMCP-AC-17 | all | Produce host support metadata after the direct matrix. | Each host has an independent exact evidence tuple and only complete tuples become `supported`. | Absent Copilot CLI, Claude authentication, OpenCode 2.x or OS evidence remains `unverified` for that tuple. | Versioned capability metadata plus linked direct evidence records. |
| CHMCP-AC-18 | all | Run the controlled protocol, package, lifecycle and host suites. | Dual-protocol negotiation, SDK v2 package integrity, lifecycle behavior and direct host results remain separate and all applicable lanes pass. | Passing one lane cannot fill another lane's missing evidence. | Controlled client logs, package tests, lifecycle tests, direct host reports and QA mapping. |
| CHMCP-AC-19 | `discovered_ready` | Observe OpenCode MCP invocation with its existing general shell and edit permission settings captured. | Bounded MCP dispatch uses the MCP tool path; unrelated permission settings are unchanged; repeated shell-prompt behavior is reported factually. | Incomplete evidence leaves `opencode-native-dispatch-tool` open; no retirement claim is made. | Direct OpenCode session evidence and exact before/after permission state. |
| CHMCP-AC-20 | all | Render human-readable and JSON lifecycle results for common and host-specific states. | Both forms communicate the same effective result, one next action and exact non-authorizing boundary. | Unknown or misleading state combinations fail contract validation. | Snapshot/contract tests for all stable states and German/English presentation where applicable. |

## 7. Non-Goals

- Changing the MCP protocol server, tool count, dispatcher semantics, request activation, target
  resolution, gate evaluation, presentation rules or `.agdf/control/` authority.
- Adding mutable, implementation, approval, Git, release or arbitrary shell/file/network MCP tools.
- Automatically enabling MCP during host plugin installation or adding plugin-bundled MCP manifests.
- Replacing native host configuration with one AGDF-owned cross-host file.
- Treating Copilot CLI, app, IDE or cloud agent as one proven surface.
- Raising the existing CLI minimum Node version or using `npx` as a registered host startup command.
- Remote MCP transport, authentication, telemetry, AGDF accounts or repository upload.
- Publishing a new marketplace version, npm release or public plugin in this run.
- Removing the compatible CLI/instruction path.
- Claiming OpenCode 2.x, Windows, Linux or any unobserved host/version parity.
- Closing or approving the separate OpenCode native-tool run without its required direct evidence.

## 8. Users And Roles

- Developer: inspects and explicitly changes MCP state for one host and target.
- Repository maintainer: decides whether shared project configuration is acceptable and reviews
  repository changes where a host stores project scope inside the repository.
- Host administrator or organization: owns allowlists, managed policy, trust and technical tool
  permission.
- AGDF release maintainer: owns exact package/profile version, deterministic validation and honest
  support metadata.
- AGDF run owner: alone supplies exact gate approvals. Host registration or permission never acts in
  this role.

## 9. Constraints

- Reuse the existing Node.js 18 compatible lifecycle and separately packaged Node.js 20-or-later
  MCP server boundary.
- Preserve exact AGDF package and plugin version coherence.
- Preserve host-native precedence, trust, managed policy and configuration validation.
- Avoid arbitrary shell construction, PATH runtime search and unversioned package execution.
- Treat project target and configuration scope as explicit values. Cwd alone is not target authority.
- Preserve unrelated user and repository configuration exactly.
- Keep status read-only and all lifecycle results non-authorizing.
- Maintain the public skills-only OpenAI plugin candidate boundary.

## 10. Evidence Requirements

### Deterministic repository evidence

- Common profile and result-schema contract tests across all four hosts.
- Copilot adapter tests for project/user scope, precedence, trust/policy diagnostics, preservation,
  foreign ownership, idempotency, rollback and removal.
- Renewed Codex, Claude Code and OpenCode lifecycle regressions with the same state vocabulary.
- Shared runtime-reference tests for several hosts and scopes.
- CLI grammar, text/JSON parity, diagnostic stability and exact non-authorizing assertions.
- Semantic-owner tests that prevent adapter or manifest schema drift.
- Installer tests proving plugin installation does not silently activate MCP.
- Release preparation, package contents, public-plugin boundary and complete regression suites.

### Direct host evidence

For each of Copilot, Codex, Claude Code and OpenCode, record separately:

1. exact host client, version, operating system, model/session and AGDF package identity;
2. baseline registration, configuration container, plugin and permission state;
3. explicit enable result and exact native configuration source;
4. fresh-session server and tool discovery;
5. one bounded `agdf_dispatch` call with target/run evidence;
6. status after discovery;
7. disable and runtime-reference result; and
8. independent comparison proving complete cleanup and unrelated-state preservation.

The direct host must expose the evidence itself. Repository fixtures, documentation or controlled
MCP clients cannot substitute for loaded-host facts.

### Separate evidence lanes

- Controlled clients negotiate every supported protocol generation against the production server.
- Package evidence proves SDK v2 dependency closure, Node boundary and exact provenance.
- Host evidence proves only the named client tuple.
- OS evidence proves only the directly executed operating system.
- Human UAT assesses the visible journey after deterministic and direct-host prerequisites pass.

## 11. Risks And Open Questions

- Copilot configuration precedence and organization policy may make a syntactically valid entry
  ineffective. SD must define fail-closed inspection and diagnostics for the selected native sources.
- Copilot CLI is not available in the current shell. Direct Copilot evidence may require a separately
  available authenticated client and remains blocking for Copilot support.
- Claude Code is installed but prior direct invocation stopped at authentication. That gap remains
  blocking for Claude support until direct execution is possible.
- OpenCode 1.x and 2.x use different configuration generations. Version detection and variant
  reporting must remain explicit.
- Several host registrations may share one exact runtime. Reference accounting and rollback must
  prevent both early deletion and stale package residue.
- Human-readable state vocabulary can drift from JSON. The same common state owner and contract
  tests must cover both outputs and supported languages.
- Host plugin specifications support bundled MCP on some hosts, but adding that path would duplicate
  explicit lifecycle activation and is excluded from this run.

No open product question blocks PRD approval. Exact configuration locations, parsers, transaction
composition and module boundaries are Solution Design decisions constrained by this PRD.

## 12. Next Step

PRD Revision 1 was approved through exact `Approval: PRD` on 2026-09-06 after same-target,
same-run, same-gate and run revision `575EE4E5-9B6E-43F0-AFAC-B264D22B27FF` revalidation.
The next allowed action is Solution Design drafting. This approval does not permit implementation, host
registration, installation changes, direct test mutations, publication or release.

## Sources

- `https://learn.chatgpt.com/docs/extend/mcp?surface=cli`
- `https://code.claude.com/docs/en/mcp`
- `https://code.claude.com/docs/en/plugins-reference`
- `https://opencode.ai/v2/docs/mcp-servers`
- `https://opencode.ai/docs/tools/`
- `https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-mcp-servers`
- `https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-plugin-reference`
