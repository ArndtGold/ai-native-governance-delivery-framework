# create-agdf

Bootstrap AGDF into the coding-agent surface and repository where work actually happens. It installs or generates the surface-specific guidance, skills and optional durable control files that help teams make scope, approvals, evidence and delivery state visible.

AGDF is useful when AI-assisted work can affect an existing system and a team needs a traceable answer to: what is allowed next, who approved it and what evidence supports it. It is deliberately not a substitute for engineering judgement, security review, tests, product ownership or human acceptance. For the framework's fit, limits and examples, start with the [project overview](../README.md).

GitHub Copilot and OpenCode are **experimentally supported in 0.20.x**. Both have adapters and
automated regression tests; native qualification is not currently claimed. Tests with simulated
hosts do not establish behavior in an actual Copilot or OpenCode session. See the
[host compatibility report](../../docs/compatibility/HOST_COMPATIBILITY.md) for dated evidence and gaps.

## Project setup diagnosis (development build)

For a confirmed existing Git root, CLI and installed validator share Core's read-only setup facts:

```bash
agdf project-state --dir /absolute/git/root --json
agdf operation-status --dir /absolute/git/root --module project.initialize/ORIGINAL_UUID --json
agdf status --surface codex --dir /absolute/git/root --native --json
```

The first two reads accept optional `--language TAG`; operation-status here supports project.initialize.
Exit 0 means a complete available result, including pending; 2 means blocked/unavailable/incomplete;
1 means invalid usage. Keep the original UUID and exact request after uncertainty. The existing
`agdf-project --command-file REQUEST.json` writer remains the explicit setup fallback.
Reads never initialize or create a Run. Missing evidence does not prove a past write never happened.

Codex status distinguishes installation/registration, configuration and actual owned-provider tools.
Without `--native`, it observes only relevant configuration, with no thread or model turn. Unsupported
settings/provenance remain unknown. Explicit catalog observation uses the existing per-invocation
startup wait override and stays within 45 seconds including cleanup; configuration observation has a
15-second ceiling. It changes no global settings or server timeout. This is no general speed guarantee.

An empty Doctor inventory explains `allow_no_active_runs`: default revise with zero findings;
explicit true preserves pass. Project health and delivery readiness remain separate. Preserve
specific missing-source, stale-revision and runtime causes, deleted state and original identity.

Run `npm run native:codex-project-setup -- --out /absolute/unused/report-directory` from the source
checkout for one finite independent session using the existing authenticated host and configured model.
It starts from an empty directory, supplies no identities or seeds, and audits native events, original
receipt and all 16 file hashes. A baseline installed tuple does not qualify an uninstalled candidate.

## Quick start

AGDF's normal operating model has three roles: chat/skills provide the user interaction,
`.agdf/control/` owns durable state and the CLI validates or renders that state. The CLI is not a
second gate system. Use `npx ...@latest` below for installation and explicit refresh; after
`npm install -g @agdf/cli`, prefer `agdf ...` for repeated local checks.

The development command groups also have CLI entries `agdf-prepare`, `agdf-record`,
`agdf-approve`, `agdf-revise` and `agdf-closeout`, each accepting the exact bounded JSON
envelope via `--command-file`. Read the selected contract first; retain the original UUID
after uncertainty. See [Core and MCP command flow](../../docs/architecture/core-mcp-command-flow.md)
for bindings, decision permissions, receipts, compatibility and qualification boundaries.

> [!IMPORTANT]
> **MCP and UI evidence:** The previously published AGDF 0.14.5 release did not include the MCP support
> described here. The MCP and MCP App details describe the repository development build, not a verified
> `@agdf/cli@latest` resolution or native-host qualification. The version alone does not identify
> the payload; compare payload digests and the loaded session. Runtime plugins for Codex, Claude Code
> and GitHub Copilot declare MCP themselves;
> the public OpenAI Skills-only candidate contains no MCP server.

If you use Codex, this is the recommended first installation:

```bash
npx --yes @agdf/cli@latest codex
```

Fully restart Codex, open a fresh task in the repository you want to work in, and describe the intended change. Restoring a previous task can retain stale AGDF skills. AGDF starts with the smallest permitted governance step; it does not make implementation automatic.

**Claude Code and Codex share plugin-managed MCP, with different UI profiles.** The shared default
build enables Cockpit (`agdf-cockpit`) and the gate-decision MCP App in Codex. It does not enable
those UI paths in Claude Code. A separate Claude-specific Cockpit development build exists.
Rendering requires host MCP App support and separate native evidence; production gate-decision
click actions remain disabled pending qualification. See [MCP and UI by host](../../INSTALL.md#claude-code-and-codex-mcp-and-ui).

Use a different target when Codex is not your agent surface:

| Surface or goal | Start with | What it gives you |
|---|---|---|
| Claude Code | `npx --yes @agdf/cli@latest claude` | The AGDF plugin with MCP; the shared default build does not enable the Codex UI paths. |
| GitHub Copilot (**experimental in 0.20.x**) | `npx --yes @agdf/cli@latest copilot` | The AGDF plugin with prefixed skills and a consent-bound session hook. |
| OpenCode, user-wide discovery (**experimental in 0.20.x**) | `npx --yes @agdf/cli@latest opencode` | The npm plugin and global native skills; repository governance remains opt-in. |
| OpenCode, one repository (**experimental in 0.20.x**) | `npx --yes @agdf/cli@latest opencode-repo` | Durable control configuration that activates the once-installed global runtime. |
| Durable control state in an existing setup | `npx --yes @agdf/cli@latest init` | Live `.agdf/control/` state when the repository explicitly needs it. |

In the next AGDF version, an interactive runtime-bearing installer will first show the plugin state,
the invocation-directory target proposal and separate read-only MCP status for project and user
scope. It then offers **Complete setup**, **Plugin only** and **Cancel**. Complete setup is marked
recommended but is never preselected. Choosing it opens a second screen with **Project**, **User**
and **Back**. That screen also has no default. Back returns to the first choice without mutation.
Only the selected, available scope is passed to the existing MCP lifecycle owner. Plugin only
leaves every MCP registration unchanged.

Non-interactive use defaults to plugin only. Codex, Claude Code and Copilot already declare MCP
through the runtime plugin and reject `--with-mcp`. For OpenCode, separate MCP registration requires
an explicit absolute target:

```bash
npx --yes @agdf/cli@latest codex --plugin-only
npx --yes @agdf/cli@latest opencode --with-mcp --dir /absolute/path/to/repository
npx --yes @agdf/cli@latest opencode --with-mcp --scope user --dir /absolute/path/to/repository
```

Empty or unsupported answers never select a setup or scope; end of input cancels before mutation.
Native host priority remains authoritative, so a higher-priority project registration can make the
user option unavailable. The setup choice and the following automatic-check choice are separate.
Neither grants governance authority. A plugin failure prevents MCP mutation. A later MCP failure
keeps the verified plugin and returns a partial result with one recovery action. Restart the host
and start a fresh session before treating a matching configuration as discovered.

For OpenCode, an existing plugin-only command with `--dir` keeps its old meaning: the path is the
OpenCode configuration directory. Only `opencode --with-mcp --dir <absolute-project>` treats it as
the MCP target. `OPENCODE_CONFIG_DIR` or the normal default still selects the plugin configuration.
Installations performed only by a marketplace or host UI remain plugin-only because that path
cannot execute the guided CLI transaction.

For local wrappers such as `npm run install:codex`, npm's absolute `INIT_CWD` supplies the proposed
target. If it is absent, the wrapper uses the process working directory. It resolves and validates
that directory before host-specific preparation; an invalid value fails with
`AGDF_LOCAL_INVOCATION_DIRECTORY_INVALID` before package generation or host mutation. Human and
JSON results distinguish this invocation context from the native registration path and the source
that actually wins the host's MCP precedence rules.

The runtime-bearing `codex`, `claude`, `copilot` and `opencode` installers ask before enabling narrow automatic
local checks on an interactive terminal. The choices are `enable`, `manual` and `cancel`; enablement
is never preselected. Every interactive installation or update asks again. A previous choice is
shown only as intent, never as proof of effective host permission. The prompt shows the target AGDF
version and the result shows the verified installed version or transition. Matching capability
identity may preserve host-native trust, but it never
suppresses the installer choice. Non-interactive installation defaults to manual unless the exact
option is provided:

Interactive terminals accept `1` or `E` for enable, `2` or `M` for manual, `D` for technical
details and `Esc` for immediate cancel without Enter. The primary choice uses beginner-safe language,
keeps the material consent facts visible and has no preselected option. Manual mode explains that
AGDF remains available on request; invalid keys redisplay the valid choices.

```sh
npx --yes @agdf/cli@latest claude --runtime-checks enable
npx --yes @agdf/cli@latest runtime-checks status --surface claude --json
```

The check is argument-free, read-only and offline. Consent is content-bound, reversible and separate
from AGDF gate approval. A receipt alone never proves effective host permission. Codex native trust,
Claude deny/ask precedence and all explicit OpenCode permissions remain authoritative. The public
Skills-only OpenAI candidate has no runtime or hooks and therefore remains manual/external for this
capability.

For Codex, the installer and `runtime-checks status --surface codex` read native `hooks/list`
metadata through the local Codex CLI. A modified or untrusted AGDF session hook requires review
in `/hooks`. An enabled, trusted hook instead reports that verification in a fresh session is
pending; it does not ask you to grant the same trust again. Missing, ambiguous or unsupported
native metadata stays unverified. AGDF never writes Codex trust hashes, and native trust alone
does not prove that a session hook ran. After an update, fully restart Codex and open a fresh task.

For prerequisites, all surface-specific flows and operational boundaries, use the authoritative [installation guide](../INSTALL.md). Do not run `init` merely to ask a fresh question: an agent can first clarify the request and ask for `Approval: UR` when durable control state is needed.

## Command overview

### Current control format and installation

The only supported layout is explicit `run-folders-v1`, with version-4 Runs and
current wrapped records. Installation and startup inspect the selected repository
read-only. They report `absent`, `current`, `unsupported` or `repair_required`;
these results never grant delivery permission. Unsupported data remains unchanged.
There is no conversion, migration, reset, old-version reader or legacy projection.
The optional planning package requires this current Core capability; Core remains
usable without the extension.

Inspect through the installed version-matched runtime, without reinstalling:

```sh
node "<installed-plugin>/runtime/agdf-local.js" control-maintenance --dir /absolute/repository --json
node "<installed-plugin>/runtime/agdf-local.js" control-maintenance --dir /absolute/repository --details --language de
```

Use the actual runtime path supplied by the host. This operation only inspects;
guided migration/repair and installation-time control-migration flags are removed.
Current original-operation recovery uses its exact UUID, captured inputs, inspected
pending digest and current recovery revision. Foreign bytes or unknown ownership
stop recovery. Preserve unsupported stores separately and initialize a fresh
explicitly confirmed Git target for current work.

The Quick Start above is the recommended entry point. For the exact current command and option reference, run `npx --yes @agdf/cli@latest --help`; the groups below explain the supported surfaces, validation paths and canonical run lifecycle.

Installation, activation and explicit lifecycle changes:

```bash
npx --yes @agdf/cli@latest codex
npx --yes @agdf/cli@latest codex-repo --dir /absolute/project
npx --yes @agdf/cli@latest claude
npx --yes @agdf/cli@latest copilot
npx --yes @agdf/cli@latest opencode
npx --yes @agdf/cli@latest opencode-status
npx --yes @agdf/cli@latest opencode-repo --dir /absolute/project
npx --yes @agdf/cli@latest codex --with-mcp --dir /absolute/path/to/repository
npx --yes @agdf/cli@latest mcp status --surface codex --dir /absolute/path/to/repository --json
npx --yes @agdf/cli@latest mcp enable --surface codex --dir /absolute/path/to/repository
npx --yes @agdf/cli@latest mcp enable --surface copilot --dir /absolute/path/to/repository
npx --yes @agdf/cli@latest status --surface codex
npx --yes @agdf/cli@latest status --surface codex --dir /absolute/path/to/repository --scope project
npx --yes @agdf/cli@latest disable --surface codex --scope repository
npx --yes @agdf/cli@latest disable --surface codex --scope repository --dir /absolute/path/to/repository --with-mcp
npx --yes @agdf/cli@latest disable --surface copilot --scope repository
npx --yes @agdf/cli@latest disable --surface copilot --scope repository --shared
npx --yes @agdf/cli@latest uninstall --surface codex --scope global
npx --yes @agdf/cli@latest uninstall --surface codex --scope global --with-mcp --mcp-scope project --dir /absolute/path/to/repository
npx --yes @agdf/cli@latest init
npx --yes @agdf/cli@latest config --language en
```

### Optional local MCP dispatcher (unreleased development preview)

AGDF can register one local STDIO server for Codex, Claude Code, GitHub Copilot or OpenCode.
MCP tools: `agdf_dispatch`, `agdf_inspect`, `agdf_project`, `agdf_run`, `agdf_prepare`, `agdf_record`, `agdf_approve`, `agdf_revise`, `agdf_closeout`.
Dispatch projects the existing canonical skill-dispatch
contract; inspect provides read-only doctor, gate-check, delivery-map and contract operations.
Tool permission and successful execution never grant an
AGDF approval. The process is offline while serving and exposes no generic shell, filesystem or
network operation, but it inherits the operating-system permissions of the host user.

The CLI requires Node.js 22 or later. MCP enablement requires the actual registered executable
to be Node.js 22 or later and installs the exact matching `@agdf/mcp-server` package only after the
explicit `enable` command:

```bash
npx --yes @agdf/cli@latest mcp status --surface codex --dir /absolute/path/to/repository --json
npx --yes @agdf/cli@latest mcp enable --surface codex --dir /absolute/path/to/repository
npx --yes @agdf/cli@latest mcp disable --surface codex --dir /absolute/path/to/repository
```

Project scope is the default. Add `--scope user` only after choosing the broader effect explicitly.
After enablement, restart the host and verify tool discovery in a fresh session. OpenCode exposes
the qualified name `agdf_agdf_dispatch`; the server-level name is `agdf_dispatch`. Its adapter reads
the installed major version and writes the flat OpenCode 1.x or nested OpenCode 2.x MCP shape. `status` is
read-only, and `disable` removes only the owned registration plus an unreferenced owned runtime.
Foreign entries fail closed. Node.js versions below 22 are rejected by the CLI before application
loading and cannot acquire an MCP runtime. Upgrade Node.js before retrying. One runtime is shared by all
registrations in the selected project or user scope and is removed only after its last owned
reference is gone.

The adapters keep native configuration ownership and precedence visible:

- Codex uses project `.codex/config.toml` or user `$CODEX_HOME/config.toml`.
- Claude Code maps AGDF project scope to native `local` and user scope to native `user`.
- OpenCode reads project and user `opencode.json` / `opencode.jsonc`, plus custom and inline
  configuration. JSONC overrides conflicting JSON entries; updates retain comments and foreign
  servers in the existing owning file instead of creating a parallel registration.
- The GitHub Copilot CLI contract manages project `.github/mcp.json` or user `~/.copilot/mcp-config.json` and treats
  a project `.mcp.json` entry as higher priority. A higher-priority entry blocks mutation until the
  conflict is resolved. Copilot Desktop, IDE integrations and cloud agents are separate client
  variants and require their own direct evidence.

The manual Copilot adapter accepts both wrapped and bare project configurations and derives its
tool allowlist from the Core contracts. The normal Copilot installation remains plugin-managed.

Machine-readable lifecycle output separates capability, selected registration, effective source,
discovery and final result. A matched configuration is not reported as discovered. Plugin install,
MCP registration, tool permission and a successful tool call do not grant AGDF gate approval. MCP
registration occurs only after an explicit complete CLI setup choice or a separate `mcp enable`.

Host support is evidence-based and recorded independently. Configuration or protocol negotiation
alone does not establish support. Every tuple remains `unverified` until the exact host client,
client variant, operating system, architecture, scope, configuration source, Node runtime, server,
dispatcher, SDK and entrypoint identity have direct discovery, bounded dispatch, failure and
cleanup evidence. Controlled 2025-11-25 and 2026-07-28 protocol tests remain a separate server lane;
they do not fill a host tuple when the host does not expose its negotiated protocol. The public
OpenAI Skills-only candidate contains no MCP metadata or runtime.

Repeated operational validation and bounded planning use the installed, version-pinned local command:

```bash
agdf doctor
agdf gate-check --status-card
agdf gate-check --approval-envelope
agdf gate-check --json
agdf skill-dispatch --json --skill gate-check --surface codex --language de --working-directory /absolute/context
agdf delivery-map --json
agdf delivery-path-search --surface codex --json
agdf delivery-path-search --surface claude --json
agdf contract --module gate-transition
```

`contract --module <name>` prints one packaged runtime-contract module named by the plugin
definition. Skills read their modules this way after `skill_continuation`, because Claude Code grants
skills no read access to the plugin directory.

Installed AGDF sessions supply the exact version-matched `skill-dispatch` binding to canonical
skills. It resolves the target first and returns either a terminal canonical result or one bounded
continuation packet. The result's `host_action.text` carries the exact terminal presentation or
recovery text. For `terminal: true`, the entire assistant response must equal that text: no added
question, explanation, heading, citation, translation, choice or later tool call. It never grants
approval. Pass an explicit target pair only when the conversation has actually selected one; do not
substitute the working directory.

A governed delivery intake (`delivery.start`) adds `--intake` (MCP: `intake: true`). While no active
run exists or the selected run has no durable UR revision, gate-check then returns a non-terminal
`intake_continuation` whose ordered steps create the run, write the UR and record it with
`run-step --step ur`; the agent runs them and dispatches again instead of ending the turn. A ready
approval and every other state stay terminal.

When a resolved target contains several active runs, the gate evaluator returns one complete
canonical `candidate_runs` inventory. A QA continuation retains this inventory in
`control.candidate_runs`, including each run's identifier, objective, normalized current gate,
decision and revision. The QA skill filters these returned records by `current_gate: QA`; it does
not reconstruct the inventory by scanning run files itself.

For `skill-dispatch`, `--language` is required and carries one well-formed BCP 47 tag selected from
the latest natural-language request. An explicit response-language instruction wins; otherwise the
host supplies the dominant request language and uses `en` when the request is mixed or ambiguous.
The registry currently contains complete `de` and `en` packs. Regional variants such as `de-DE`
and `en-US` resolve to their complete primary-language pack. A valid unsupported tag uses the
complete English pack. Missing, wrong-type, padded, list, underscore, POSIX-suffixed and malformed
values stop before target or gate evaluation and are never repaired or inferred from the host or
runtime. This differs from detected CLI system locale input and from `config --language`, which
persists the project preference after a governance target is available. A target-unresolved result
cannot read project configuration safely because no project has been selected yet.

`agdf control-maintenance --dir /absolute/project --json` inspects current compatibility read-only; unsupported stores are preserved without migration or repair.

### Current Run commands

Current aliases share Core input normalization, captured configuration and original
operation replay with the fixed MCP command groups. Provide an operation UUID when
an exact retry may be needed; preserve the returned identity and inspected revision.
`run-create` derives its new Run ID from that UUID and requires an explicit title.

```sh
agdf run-create --dir /absolute/project --title 'Clarify one requirement' --operation <uuid>
agdf run-step --dir /absolute/project --run <id> --revision <uuid> --operation <uuid> --step ur --title 'Clarify one requirement' --evidence /absolute/reviewed-UR.md
agdf run-step --dir /absolute/project --run <id> --revision <uuid> --operation <uuid> --step artefact --gate PRD --evidence /absolute/reviewed-PRD.md --reviewer 'Source reviewer' --reviewed true --update-draft false
agdf run-present --dir /absolute/project --run <id> --revision <uuid> --gate UR --operation <uuid>
```

These are input examples; use actual inspected identities and reviewed files.
Show the exact prepared presentation before forwarding a new deliberate reply with
`run-approve --presentation <id> --response 'Approval: UR'`. A historical reply
cannot approve changed material. Staging grants no delivery or approval authority.

For full-text terminal delivery through Codex CLI, the optional `render-document`
frontend consumes `codex exec --json` output. Its `--request` mode generates the
matching read-only model request from an explicitly selected, validated canonical
presentation envelope. This supplies the verified target hash and original
historical selectors, the `structuredContent.report` path and a bounded loop over
all actual `next_cursor` values. It includes no document body or approval.
Use the same selectors for request generation and rendering; replace the quoted
placeholder IDs below with the real inspected selection (Bash example):

```sh
set -euo pipefail
selection=(--dir /absolute/project --run '<id>' --revision '<uuid>' --gate UR --presentation '<uuid>')
request=$(agdf render-document "${selection[@]}" --request)
codex exec --json "$request" | agdf render-document "${selection[@]}"
```

`--server` selects the exact Codex MCP server ID (default `agdf`); plugin server
names must be supplied explicitly. Use a read-only Codex tool profile for this
flow. The renderer rejects unexpected tool/write traffic, incomplete turns,
conflicting responses, changed bindings, missing pages, bad digests and unsafe
terminal control characters before printing any document text. It reads the
canonical presentation envelope and receives document bytes only through MCP.
The complete verified document is written to stdout without an extra newline;
an `AGDF_DOCUMENT_DELIVERY` receipt goes to stderr. This is a distinct terminal
delivery mode, not an agent-chat message, human-review proof or gate approval.
Stored JSONL can be replayed; the receipt alone does not attest a live model run.
Request generation reads only canonical metadata, grants no tool permission and
does not launch Codex. The generated request keeps progress metadata in model
context while the frontend receives the full original MCP frames directly.
Its tool call uses a literal name; dynamic `tools[match.name]` dispatch remains
outside the observer's proof. If necessary, discover the actual name separately
and replace only that literal, preserving all selected values and the read loop.

For internal results, explicit bounded recovery and complete typed inputs use the
fixed group routes `agdf-project`, `agdf-run`, `agdf-prepare`, `agdf-record`,
`agdf-approve`, `agdf-revise` and `agdf-closeout` with `--command-file <regular.json>`.
Only `--command-file` and `--json` are accepted on these routes; envelope fields
cannot be overridden by CLI flags. Read the current operation-contract for the exact
schema. No RECORD/REVIEW JSON input duplicates a reviewed source mapping.

### Late source revision

`agdf run-revise` uses the same current source-revision owner; read its contract for the exact proposal, preview digest and confirmation before applying.

The current source-revision owner retains policy 2: an actual eligible structured
pre-UAT phase, the earliest changed approved source, exact unchanged upstream
proof, reviewed analytical and quality impact, explicit preview and deliberate
confirmation. It does not widen eligibility or infer approval from tool consent.

Read the current `source_revision.preview`/`source_revision.apply` operation help
and reviewed proposal format (version 3). Preview changes no Run. The apply command
requires its exact preview digest and confirmation selector, the original operation
UUID and unchanged reviewed proposal. The resulting version-4 receipt and version-2
archive bind the historical sources below `runs/<id>/history/revisions/<operation>/`.
Affected downstream approvals and fulfillment require renewed work; code files stay
available without becoming current qualification evidence.

The current `run-revise --preview|--apply|--inspect|--recover` aliases use the same
owner. Early PRD reopening uses `run-revise --gate PRD` and its exact confirmation.
Unapproved draft replacement uses the inspected current recording operation; UR
replacement uses `ur_draft.replace`. Never edit a bound source or Run and reseal it.
Retired synchronization, migration, rendering and approval-reset commands are absent.

### Explicit local approval command (development)

The additive ESM export `create-agdf/control-command` and `run-approve --operation <uuid>` use
one shared approval path. Importing the export reads package-owned metadata; it does not select a
target, launch Git, initialize a host, print, exit or write. Existing package exports are unchanged.

```js
import {
  CONTROL_COMMAND_SCHEMA_VERSION,
  resolveControlCommandTarget,
  recordGateApprovalCommand,
} from "create-agdf/control-command";

const { root, target_id } = resolveControlCommandTarget("/absolute/path/to/repository");
const result = recordGateApprovalCommand(root, {
  schema_version: CONTROL_COMMAND_SCHEMA_VERSION,
  action: "record_gate_approval",
  target_id,
  run_id: runId,
  gate: "UR",
  expected_revision_id: presentedRevisionId,
  presentation_id: presentedPresentationId,
  response: verbatimDeliberateReply,
  operation_id: operationId, // a UUID retained with this exact request across retries
  assurance: "cooperative_local",
});
```

The command is closed: these fields are required and unknown fields are rejected. The caller
forwards the deliberate reply for the current durable presentation. Validation preserves existing
reply semantics, including surrounding-whitespace handling; request identity retains the original
response bytes. Neither caller roles, a presentation ID, a digest nor a successful tool call prove
that a human saw or approved the presentation. Every result reports cooperative assurance and
`independent_human_proof: unavailable`; stronger authority requests are rejected without mutation.
The canonical realpath target ID is a local binding, not a portable repository identity or token.

```bash
agdf run-approve --dir /absolute/path/to/repository --run <run_id> --gate UR \
  --revision <revision_id> --presentation <presentation_id> --response "Approval: UR" \
  --operation <uuid> --assurance cooperative_local
```

Omitting `--assurance` defaults to the same visible cooperative lane; stronger values are rejected.
An omitted `--operation` creates a fresh UUID and returns its receipt. Retain the original UUID
and input for exact repetition. The current command aliases share this normalization boundary.

The Run contains the append-only `Approval Operations` receipt and approval in one atomically
replaced, sealed revision. The service holds the owned Run lock across validation and commit.
An identical operation UUID and request returns `already_applied` without another revision;
a changed payload with the same UUID returns `operation_payload_conflict`. Receipt-bearing Runs
require this upgraded runtime. Legacy Runs retain byte-identical approval-seal semantics.
Other writers, PRD supersession and bounded recovery preserve existing receipts. Recovery can
preserve receipt history only while its recorded approval seal still verifies; it clears effective
approvals rather than adopting a historical receipt as a new decision.

Results separate `binding`, request identity, historical `effect`, observed `current` state,
`assurance` and commit/durability `observations`. `accepted` and `already_applied` are the only
successful command outcomes. `rejected` requires correcting the request or preparing a new current
presentation/reply. `retryable_failure` permits an identical retry after the live lock or transient
pre-commit failure resolves. `recovery_required` means the canonical effect or acknowledgement
cannot safely be concluded. After an interruption, retain and retry the identical command; a
valid canonical receipt is acknowledged with file/directory synchronization, without writing a
revision. Windows reports directory synchronization as unavailable. A replay after later changes
returns the old effect alongside current state and never restores an effective approval.

MCP exposes no mutating approval tool. This lane is cooperative local calling, not authenticated
human attestation or protection against arbitrary writes by an operating-system user. Qualification
of source, packed external consumers, generated validators, installed hosts and native platforms
must remain separate. The command test scripts use disposable targets and private fault harnesses;
they do not install or publish the package.

### Advanced / Compatibility

Alternative CLI invocation syntax:

```bash
npm create agdf@latest -- codex
npm create agdf@latest -- codex-repo
npm create agdf@latest -- claude
npm create agdf@latest -- opencode
npm create agdf@latest -- opencode-status
npm create agdf@latest -- opencode-repo
npm create agdf@latest -- init
npm create agdf@latest -- config --language en
npm create agdf@latest -- doctor
npm create agdf@latest -- gate-check
npm create agdf@latest -- delivery-map
npm create agdf@latest -- delivery-path-search --surface codex
npm create agdf@latest -- delivery-path-search --surface claude
```

Optional flags:

- `--dir <path>` write into a specific directory
- `--force` overwrite existing generated files
- `--language <tag>` or `--lang <tag>` persist a BCP 47 language tag such as `de`, `en` or `fr-CA`
- `--verbose` show captured host installer output and generated-file details after the concise lifecycle card
- `--scope <repository|global>` select an explicit lifecycle mutation scope
- `--confirm` apply a global uninstall after reviewing the default non-mutating preview
- `--shared` use commit-capable `.github/copilot/settings.json` for an explicit shared Copilot repository disable; without it Copilot uses ignored personal-local settings

If no language is provided, `create-agdf` derives the preference from the local system locale (`LC_ALL`, `LC_MESSAGES`, `LANG`, `LANGUAGE` or the Node.js runtime locale) and falls back to `en`.

Lifecycle cards and CLI-owned status labels are always English so they remain comparable across
machines and coding agents. `--language` continues to control project chat and artefact language;
it does not localize the CLI lifecycle card.

## Targets and existing AGENTS.md

- `codex` installs the AGDF plugin globally for Codex
- `codex-repo` writes a repository-local Codex marketplace under `.agents/plugins/` and a local AGDF plugin copy under `plugins/agdf/`
- `claude` installs the AGDF plugin globally for Claude Code
- `copilot` registers the AGDF-owned local Marketplace and installs `agdf@agdf` through Copilot CLI; when `copilot` is not on `PATH`, it runs the pinned official `@github/copilot` CLI package through npm, then verifies the plugin identity and all expected enabled plugin skills against the installed package content
- `opencode` installs the AGDF npm plugin and native AGDF skills as a user-wide OpenCode surface
- `opencode-status` reports OpenCode global config, package loadability, global native-skill completeness, installed host/plugin-SDK versions, declaration-level support for AGDF's two experimental hooks, durable repository activation, legacy compatibility and observable session signals
- `status` reports installation, repository activation and delivery separately without mutating state
- `runtime-checks status|enable|manual` reports the requested/effective automatic-check state or gives the exact reinstall route needed to change it
- `disable` keeps Codex repository behavior and supports Copilot personal-local opt-out by default; Copilot shared repository effect requires `--shared`
- `uninstall` previews and, only with `--confirm`, applies a selected global removal through supported native/owned operations
- `opencode-repo` writes durable AGDF control configuration and templates under `.agdf/control/`; it does not copy a second OpenCode runtime surface
- `config` writes or updates only `.agdf/control/config.json` for an already installed plugin or an existing repository

The `codex` and `claude` commands install the complete shared plugin built into the released
`create-agdf` package. The `copilot` command installs a dedicated generated profile containing only
the Copilot manifest, prefixed skills, hook, required contracts and exact-version runtime. Every profile
is rendered from the same canonical sources. The installers atomically stage their profile under an AGDF-owned user-data marketplace, register
that stable local source with the host and verify the exposed version. Source `plugins/agdf/` therefore
contains no generated runtime bytes and the source checkout exposes no installable root marketplace.

Repository lifecycle support is deliberately asymmetric:

| Surface | Personal repository opt-out | Shared repository opt-out | Repository activation | Global uninstall |
|---|---|---|---|---|
| Codex | supported by its existing local plugin state | no new `--shared` mode | `codex-repo` | supported |
| Claude Code | not supported without a verified host mechanism | not supported | no new mechanism | supported |
| GitHub Copilot | default in ignored `.github/copilot/settings.local.json` | explicit `--shared` in `.github/copilot/settings.json` | plugin discovery remains separate | supported |
| OpenCode | not supported as disable | not supported | `opencode-repo` | supported |

The personal Copilot command fails before mutation unless Git confirms the local settings path is
ignored. It never edits `.gitignore` or `.git/info/exclude`. Existing JSON must be strict JSON;
JSONC, comments, invalid types and symlinked paths fail closed. Only
`enabledPlugins["agdf@agdf"]` changes. Restart Copilot and inspect `/plugin list`; inspect
`/instructions` separately because plugin disablement does not disable `AGENTS.md`,
`.github/copilot-instructions.md` or other applicable instructions.
The staged plugin contains one installation-provenance marker and the shared exact-version runtime;
routine installed validation does not depend on the GitHub
checkout, npm cache, PATH or registry. Rerunning either command performs the explicit update and
migrates only the exact known legacy AGDF GitHub marketplace; foreign same-name registrations fail
closed and failed host operations restore the prior owned stage.

The shared installer recognizes exact packaged snapshots for the verified AGDF-owned four-profile
releases `0.13.6`, `0.13.7`, `0.13.8` and `0.14.1`, then rebuilds them from current canonical
package content. Current-shape `0.14.2` and `0.14.3` stay on ordinary current validation.
`agdf-v0.14.0` is not a release alias: its internal version is `0.13.8`, so it grants no
compatibility. Historical lookup uses no Git or network access and does not accept unknown versions,
partial contracts or tampered provenance. Claude's Windows-only contention recovery removes at most the one
contained `temp_local_*` directory named by the current install command's `EPERM` rename failure and
retries once; it does not enumerate or broadly clear the host cache.

Successful installation verifies the installed version but not an already loaded session. Fully
restart the host and start a fresh session or task. Restoring the previous session can retain stale
AGDF skills and must not be treated as current loaded-session evidence.

When a host exposes both plugin-root variables, runtime validation follows the active surface.
Codex prefers `PLUGIN_ROOT` and falls back to `CLAUDE_PLUGIN_ROOT`; Claude Code uses the reverse
order. Copilot accepts only `PLUGIN_ROOT`, and OpenCode has no plugin-root binding. Windows hooks
select the fallback with an explicit PowerShell `if` expression. They never concatenate both root
values. The generated runtime and SessionStart hook use the same resolver, so a compatibility
variable cannot override the native root of the active host.

**Copilot support remains experimental in 0.20.x.** Staging uses the independent path
`<AGDF data directory>/marketplaces/agdf-copilot`. This
prevents Copilot updates and rollbacks from replacing the shared Codex and Claude payload while the
host-facing Marketplace identity remains `agdf` and the install identity remains `agdf@agdf`.

Copilot uses Git transport from this same canonical staging root. The installer generates Git
metadata and a content-derived branch outside the plugin payload, registers the source through
Copilot's `extraKnownMarketplaces` settings and runs the native plugin installer. Git must be
available. Existing AGDF-owned directory registrations are migrated automatically; foreign
marketplaces are refused. Same-version source changes receive a new ref, and failures restore the
previous package and AGDF settings. There is no separate manual package snapshot to maintain.

Installation is healthy only when `copilot skill list --json` exposes every expected skill from one
enabled plugin installation with matching package content. Missing, disabled, shadowed or stale
skills produce a verification failure. This is host discovery evidence; restart the desktop app and
check a fresh session for rendered behavior.

The Copilot installer does not create, rewrite or remove repository files. Existing `AGENTS.md`, `.github/` and `.agdf/control/` content remains untouched. Use `init` separately when a repository should own surface-neutral durable AGDF control state.

Use the `codex-repo` target when AGDF should be available only inside one repository instead of being installed as a personal/global Codex plugin.

After `npm create agdf@latest -- codex-repo`, restart Codex in that repository, open `/plugins`, select `This repository` and install `agdf`.

`codex-repo` is a generated runtime-complete repository projection. It is distinct from this
runtime-free source checkout and is validated before lifecycle status treats `agdf@agdf-repo` as
active.

**OpenCode support remains experimental in 0.20.x.** Use the `opencode` target to install the
AGDF npm plugin as a user-wide OpenCode hook:

```bash
npx --yes @agdf/cli@latest opencode
```

Then verify the visible installation state:

```bash
npx --yes @agdf/cli@latest opencode-status --json
```

The status command reports global configuration, package loadability, global native-skill completeness, installed host/plugin-SDK version divergence, declaration-level support for both experimental hooks, durable repository activation, legacy local-surface compatibility and session signals. SDK declarations are not proof that a live host invoked a hook. Status is read-only and keeps divergence warning-only; the explicit `opencode` install command attempts to align the SDK only to the exact detected host version and returns a partial result when alignment is unavailable, fails or cannot be verified. The command does not infer an active OpenCode session from config alone.
In JSON schema version 1, `repository_surface.gate_check_agent` remains a deprecated compatibility alias for the native `gate_check_skill` path so existing status consumers keep working during the agent-to-skill migration.

Use the `opencode-repo` target when a repository should opt into the globally installed AGDF OpenCode runtime:

```bash
npm create agdf@latest -- opencode-repo
```

OpenCode loads the AGDF npm plugin and global native skills from global OpenCode config. Global adapters use the collision-safe `agdf-global-` prefix, including `agdf-global-gate-check`. `opencode-repo` adds the durable `.agdf/control/config.json` marker and control templates; it does not write `opencode.json`, `.opencode/AGDF.md`, copied contracts or copied skills.
The global skills load on demand through OpenCode's native `skill` tool. After positive Request Activation selects actual delivery work, use `agdf-global-gate-check` first. Unclear approval alone never activates AGDF. Existing local `.opencode/` assets remain supported as a compatibility path and are not deleted.
The built-in `question` tool can present a gate choice, but `.agdf/control/` and exact post-response validation remain authoritative; technical permission and auto-mode outcomes never approve an AGDF gate. Explicit `permission.question: deny` remains unchanged and uses exact-text fallback.
The global layer makes the native AGDF skills discoverable, but does not activate repository governance by itself. Global skills fail closed until the current repository has valid `.agdf/control/config.json`. Use `opencode-repo` to create the durable activation marker.

### Request activation and instruction loading

AGDF uses one two-stage instruction model across its generated surfaces. Before selection, generated
profiles provide one compact Request Activation kernel and short discovery descriptions. They make
detailed routing, gate, quality and closeout instructions available on demand only after the current
request has positively activated AGDF. OpenCode uses the same compact bootstrap and keeps the full
router available on demand instead of registering it as an eager instruction.

The versioned `instructionFootprint` contract defines UTF-8 byte budgets and structural conditions
for the kernel, discovery descriptions, SessionStart, OpenCode static and dynamic context,
compaction and the selected `gate-check` skill. Deterministic generation and package checks enforce
those limits. The `skillSet.discovery` metadata describes the intended discovery boundary; it is not
a claim that every host technically enforces that boundary.

Source, generated and package evidence do not prove what an installed host ultimately retains or
orders. Fresh loaded-host evidence remains separate. In particular, OpenCode keeps one bounded
kernel-only compaction recovery block until same-version and same-digest host observations prove
that the system transform is reapplied and the current dispatcher binding remains available. The
[Instruction Footprint Audit](../.agdf/control/artefacts/agdf-request-activation-boundary/INSTRUCTION_FOOTPRINT_AUDIT.md)
records the design evidence and its limits.

## Control scaffold

Initialization uses only `run-folders-v1`, with independent planned URs and derived
planned/Run inventory. It creates no Masterbacklog and no Run implicitly. Other
layouts and Run versions are unsupported and remain unchanged.
See [planned UR commands and optional Codex Planning](../../plugins/agdf/control/planned-urs.md).

The generated `.agdf/control/templates/` files are reusable starting points for durable AGDF state:

- `runs/<run_id>/RUN_STATE.md` for canonical authored facts and typed records; current views are derived
- `runs/<run_id>/documents/`, `evidence/`, `control/` and `history/` for all Run-owned files
- `planned/<plan_id>/UR.md` for each planned need (UR-only; created on explicit capture)
- `templates/artefacts/` for durable UR, PRD, SD, TP and QA report artefact templates
- `SOT_REGISTRY.md` for one source of truth per domain
- `CONTEXT_GRAPH.md` for durable Brownfield findings, decisions, risks, evidence and exit criteria
- `AGENT_QUALITY_CONTRACTS.json` for reusable block, revise and warning conditions

Use `init` to promote those templates into live control files when the repository should own durable AGDF control state:

```bash
npm create agdf@latest -- init
```

This writes:

- `.agdf/control/README.md` (Runs are created separately; no mandatory live backlog)
- `.agdf/control/config.json`
- `.agdf/control/templates/artefacts/UR.md`
- `.agdf/control/templates/artefacts/PRD.md`
- `.agdf/control/templates/artefacts/SD.md`
- `.agdf/control/templates/artefacts/TP.md`
- `.agdf/control/templates/artefacts/QA_REPORT.md`
- `.agdf/control/SOT_REGISTRY.md`
- `.agdf/control/CONTEXT_GRAPH.md`
- `.agdf/control/AGENT_QUALITY_CONTRACTS.json`

`config.json` stores `artifact_language` and `chat_language` for governed work in the target repository. Runtime rules stay English so all AGDF surfaces share the same control contract.

For a normal fresh request, `init` is not the required first move. The agent-native path can draft the minimal UR in the response and ask for the exact approval text `Approval: UR`. Write or initialize `.agdf/control` only when durable repository-owned control state is explicitly wanted, already in use, or needed for deterministic setup/CI evidence. Before Brownfield Review, later gates or implementation, AGDF still requires the persisted or linked artefacts named by the Runtime Contract.

For an existing repository where the plugin is already installed and only the language preference is missing or wrong, use the lighter config target:

```bash
npm create agdf@latest -- config --language en
```

Use `doctor` to check whether the live control state is actionable:

```bash
npm create agdf@latest -- doctor
npx --yes create-agdf@latest doctor --json
```

The doctor reports missing live control files, missing current gate, missing next allowed action, empty evidence, empty backlog pointer, empty source-of-truth registry, duplicate active SoT rows and invalid quality contracts. It exits non-zero only for blocking control failures.

Use `gate-check` to derive the next process decision from the selected canonical
`.agdf/control/runs/<run_id>/RUN_STATE.md`. Use `--run <run_id>` or `AGDF_RUN_ID` when several runs are active:

```bash
npm create agdf@latest -- gate-check
npx --yes create-agdf@latest gate-check --json
```

The gate check reports `open | blocked`, the current gate, blocking reason, missing exact approval, allowed outputs, forbidden outputs, next allowed action, evidence references and the embedded doctor report.

Use an installed `agdf gate-check --approval-envelope` for a read-only summary and link to the
current artefact. Prepare a bound approval with `run-present` before asking the user. Use `gate-check --status-card` for compact
operational detail and keep `gate-check --json` for native-adapter input, automation, CI, regression
evidence and audit trails. The CLI output validates and renders the selected run; it does not replace
the agent-native workflow or approve a gate.

Use `delivery-path-search` only for high-impact planning decisions with several materially different next steps:

```bash
agdf delivery-path-search --surface codex --json
```

The runtime uses bounded best-first Delivery Path Search, not MCTS. It is read-only and advisory: the result must be checked by canonical `gate-check`. Codex and Claude Code are executable, tool-enforced evaluator adapters and support opt-in `--generate-candidates`; generated proposals supplement the deterministic baseline and are deterministically validated before evaluation. OpenCode has an executable evaluator through `opencode run --pure --agent agdf-evaluator` only after the current invocation's capability preflight proves the command flags, owned agent and effective deny permissions. A failed preflight or evaluator transport returns `evaluator_unavailable`, reports `instruction_only` and directs the user to the existing instruction-only workflow. Copilot remains instruction-only.

Requirements and boundaries:

- run it only with selected canonical `.agdf/control/runs/<run_id>/RUN_STATE.md` state
- the current control state must expose legal next actions
- Codex CLI must be installed and authenticated for `--surface codex`
- Claude Code CLI must be installed and authenticated for `--surface claude`
- OpenCode must pass the per-invocation command, agent and effective-permission preflight for `--surface opencode`
- `--model <id>` optionally selects the Codex or Claude evaluator model
- `--persist` writes redacted `DELIVERY_PATH_SEARCH.json` and `.md` evidence under the current scope
- `--fixture <path>` is for deterministic contract tests, not a production evaluator
- OpenCode candidate generation is intentionally unavailable; Copilot has no executable native evaluator
- cost units are rubric values used for bounded comparison, not measured provider currency

The result reports the selected run/revision/objective, the phase that actually ran and candidate and
evaluation provenance. `input_unavailable`, `no_legal_candidates`, `evaluator_unavailable` and
`evaluator_error` are non-recommendation outcomes. `recommendation` and
`no_safe_recommendation` require at least one valid evaluation; only those evaluated outcomes may be
persisted. A result applies only to its selected run objective. Run canonical `gate-check` afterwards.

`gate-check --json` and `delivery-map --json` also expose a `status_card` object. It is a compact projection of the current control state: current gate, allowed and forbidden actions, blocker, next skill, next permissible step and `quality_outlook`. `next_step` is process permission; `quality_outlook` is the next meaningful quality-improvement focus and does not unlock gates.

Together, `init`, `doctor` and `gate-check --json` turn AGDF from an instruction layer into a repository control system when durable control state is needed. For normal fresh requests, keep the path lighter: draft the minimal UR in the response, request `Approval: UR`, and use CLI validators only when machine-readable proof is useful.

## Single source of truth

The repository-facing AGDF sources are maintained in:

- `plugins/agdf/meta/agdf-agent-router.md`
- `plugins/agdf/meta/agdf-plugin.definition.json`
- `plugins/agdf/skills/`
- `plugins/agdf/meta/agdf-runtime-contract.md`
- `plugins/agdf/control/`

Skill routing is rendered from `skillSet.slug`, `useFor`, `boundary` and the target surface `skillPrefix`; it is not maintained as separate Codex, Claude Code and Copilot routing tables.

The published package assets are generated from these repository sources only at pack/publish time. The package does not keep a second manually maintained template tree.

```bash
npm run sync-package-assets
```

To verify the rendered routing locally, run:

```bash
npm run test:routing
```

The routing test installs `both` into a temporary target repository and checks that plugin routing stays unprefixed while Copilot routing receives the configured `agdf-` prefix.

## Project, contribution and support

This README is the package guide. Keep framework rationale, limits and examples in the [project overview](../README.md); keep target-specific installation in [INSTALL.md](../INSTALL.md); and use [RELEASE.md](../RELEASE.md) only when maintaining a published AGDF release.

Non-sensitive feedback, examples and contributions are welcome through [GitHub Issues](https://github.com/ArndtGold/ai-native-governance-delivery-framework/issues). To validate a local package change before proposing it, run:

```bash
npm --prefix create-agdf run test:cli-gates
npm --prefix create-agdf run smoke-test
npm --prefix create-agdf run eval:skills
npm --prefix create-agdf run eval:skills:record -- --surface codex --case gate-check-normal
```

`test:cli-gates` runs the CLI against disposable repositories and prints each scenario's result and duration. During gate work, select one scenario with `npm --prefix create-agdf run test:cli-gates -- --case duplicate-prd` (`new-ur` and `bound-ur` are also available). Run the full smoke suite before release handoff.

`eval:skills` is the credential-free deterministic CI lane. The recorder is an explicit supporting-evidence lane; it uses a disposable repository, records live provenance and refuses to persist a failing or mutation-violating result.

The repository is licensed under [Apache-2.0](../LICENSE). No separate public `CONTRIBUTING.md`, `SECURITY.md` or private security-reporting channel is currently published. Do not treat a public issue as a private vulnerability disclosure.

## Publishing

The repository publishes this package, `@agdf/mcp-server` and the primary user-facing `@agdf/cli`
wrapper as one coupled AGDF release.
See the root `RELEASE.md` for the sequenced `agdf-v<version>` workflow and npm token requirements.

## Trademark Notice

AGDF(TM) and AI Governance & Delivery Framework(TM) are marks of Arndt Gold.
Use of the AGDF name and marks is governed by the project trademark guidelines.


### Approval preparation compatibility

New approvals require `run-present --run <id> --gate <gate> --revision <uuid>` before showing the
returned text and waiting for the user. The presentation links the exact current gate artefact and
shows its digest, run, gate and revision. Before the approval action it includes a short
gate-specific summary, bound by `summary_digest`; UAT summarizes and presents its existing evidence
rows. A missing summary is a presentation failure. Supply its `presentation_id` as
`run-approve --presentation`.
Only current wrapped approval records and exact presentation bindings are supported; old record formats are refused unchanged.
Never prepare a missing record after receiving an answer and reuse that answer. Read-only gate
previews are not preparation records. Install matching runtime and skills; older runtimes reject
new intake/continuation fields rather than silently dropping them.
