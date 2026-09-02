# create-agdf

Bootstrap AGDF into the coding-agent surface and repository where work actually happens. It installs or generates the surface-specific guidance, skills and optional durable control files that help teams make scope, approvals, evidence and delivery state visible.

AGDF is useful when AI-assisted work can affect an existing system and a team needs a traceable answer to: what is allowed next, who approved it and what evidence supports it. It is deliberately not a substitute for engineering judgement, security review, tests, product ownership or human acceptance. For the framework's fit, limits and examples, start with the [project overview](../README.md).

## Quick start

AGDF's normal operating model has three roles: chat/skills provide the user interaction,
`.agdf/control/` owns durable state and the CLI validates or renders that state. The CLI is not a
second gate system. Use `npx ...@latest` below for installation and explicit refresh; after
`npm install -g @agdf/cli`, prefer `agdf ...` for repeated local checks.

If you use Codex, this is the recommended first installation:

```bash
npx --yes @agdf/cli@latest codex
```

Fully restart Codex, open a fresh task in the repository you want to work in, and describe the intended change. Restoring a previous task can retain stale AGDF skills. AGDF starts with the smallest permitted governance step; it does not make implementation automatic.

Use a different target when Codex is not your agent surface:

| Surface or goal | Start with | What it gives you |
|---|---|---|
| Claude Code | `npx --yes @agdf/cli@latest claude` | The AGDF plugin for Claude Code. |
| GitHub Copilot | `npx --yes @agdf/cli@latest copilot` | The AGDF plugin with prefixed skills and a consent-bound session hook. |
| OpenCode, user-wide discovery | `npx --yes @agdf/cli@latest opencode` | The npm plugin and global native skills; repository governance remains opt-in. |
| OpenCode, one repository | `npx --yes @agdf/cli@latest opencode-repo` | Durable control configuration that activates the once-installed global runtime. |
| Durable control state in an existing setup | `npx --yes @agdf/cli@latest init` | Live `.agdf/control/` state when the repository explicitly needs it. |

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

For prerequisites, all surface-specific flows and operational boundaries, use the authoritative [installation guide](../INSTALL.md). Do not run `init` merely to ask a fresh question: an agent can first clarify the request and ask for `Approval: UR` when durable control state is needed.

## Command overview

The Quick Start above is the recommended entry point. For the exact current command and option reference, run `npx --yes @agdf/cli@latest --help`; the groups below explain the supported surfaces, validation paths and canonical run lifecycle.

Installation, activation and explicit lifecycle changes:

```bash
npx --yes @agdf/cli@latest codex
npx --yes @agdf/cli@latest codex-repo
npx --yes @agdf/cli@latest claude
npx --yes @agdf/cli@latest copilot
npx --yes @agdf/cli@latest opencode
npx --yes @agdf/cli@latest opencode-status
npx --yes @agdf/cli@latest opencode-repo
npx --yes @agdf/cli@latest status --surface codex
npx --yes @agdf/cli@latest disable --surface codex --scope repository
npx --yes @agdf/cli@latest disable --surface copilot --scope repository
npx --yes @agdf/cli@latest disable --surface copilot --scope repository --shared
npx --yes @agdf/cli@latest uninstall --surface codex --scope global
npx --yes @agdf/cli@latest init
npx --yes @agdf/cli@latest config --language en
```

Repeated operational validation and bounded planning use the installed, version-pinned local command:

```bash
agdf doctor
agdf gate-check --status-card
agdf gate-check --approval-envelope
agdf gate-check --json
agdf delivery-map --json
agdf delivery-path-search --surface codex --json
agdf delivery-path-search --surface claude --json
```

Canonical run lifecycle:

```bash
agdf run-create --run <run_id>
agdf run-migrate [--run <run_id>]
agdf run-render-legacy --run <run_id>
```

### Advanced / Compatibility

Backward-compatible scaffold usage:

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
- `copilot` registers the AGDF-owned local Marketplace and installs `agdf@agdf` through Copilot CLI; when `copilot` is not on `PATH`, it runs the pinned official `@github/copilot` CLI package through npm, then verifies AGDF in Copilot's own plugin list
- `opencode` installs the AGDF npm plugin and ten native skills as a user-wide OpenCode surface
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
that stable local path through the host CLI and verify the exposed version. Source `plugin/` therefore
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

Copilot staging uses the independent path `<AGDF data directory>/marketplaces/agdf-copilot`. This
prevents Copilot updates and rollbacks from replacing the shared Codex and Claude payload while the
host-facing Marketplace identity remains `agdf` and the install identity remains `agdf@agdf`.

The Copilot installer does not create, rewrite or remove repository files. Existing `AGENTS.md`, `.github/` and `.agdf/control/` content remains untouched. Use `init` separately when a repository should own surface-neutral durable AGDF control state.

Use the `codex-repo` target when AGDF should be available only inside one repository instead of being installed as a personal/global Codex plugin.

After `npm create agdf@latest -- codex-repo`, restart Codex in that repository, open `/plugins`, select `This repository` and install `agdf`.

`codex-repo` is a generated runtime-complete repository projection. It is distinct from this
runtime-free source checkout and is validated before lifecycle status treats `agdf@agdf-repo` as
active.

Use the `opencode` target to install the AGDF npm plugin as a user-wide OpenCode hook:

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
The global skills load on demand through OpenCode's native `skill` tool. Use `agdf-global-gate-check` first for new build/change intent or unclear approval. Existing local `.opencode/` assets remain supported as a compatibility path and are not deleted.
The built-in `question` tool can present a gate choice, but `.agdf/control/` and exact post-response validation remain authoritative; technical permission and auto-mode outcomes never approve an AGDF gate. Explicit `permission.question: deny` remains unchanged and uses exact-text fallback.
The global layer makes the ten native AGDF skills discoverable, but does not activate repository governance by itself. Global skills fail closed until the current repository has valid `.agdf/control/config.json`. Use `opencode-repo` to create the durable activation marker.

## Control scaffold

The generated `.agdf/control/templates/` files are reusable starting points for durable AGDF state:

- `runs/<run_id>/RUN_STATE.md` for each canonical current run dashboard
- `MASTER_BACKLOG.md` for active delivery pointers
- `templates/artefacts/` for durable UR, PRD, SD, TP and QA report artefact templates
- `SOT_REGISTRY.md` for one source of truth per domain
- `CONTEXT_GRAPH.md` for durable Brownfield findings, decisions, risks, evidence and exit criteria
- `AGENT_QUALITY_CONTRACTS.json` for reusable block, revise and warning conditions

Use `init` to promote those templates into live control files when the repository should own durable AGDF control state:

```bash
npm create agdf@latest -- init
```

This writes:

- `.agdf/control/runs/<run_id>/RUN_STATE.md`
- `.agdf/control/MASTER_BACKLOG.md`
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

Use an installed `agdf gate-check --approval-envelope` to print deterministic ready-gate cards and the
exact-text request without a fresh registry lookup. Use `gate-check --status-card` for compact
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

- `plugin/meta/agdf-agent-router.md`
- `plugin/meta/agdf-plugin.definition.json`
- `plugin/skills/`
- `plugin/meta/agdf-runtime-contract.md`
- `plugin/control/`

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
npm --prefix create-agdf run smoke-test
npm --prefix create-agdf run eval:skills
npm --prefix create-agdf run eval:skills:record -- --surface codex --case gate-check-normal
```

`eval:skills` is the credential-free deterministic CI lane. The recorder is an explicit supporting-evidence lane; it uses a disposable repository, records live provenance and refuses to persist a failing or mutation-violating result.

The repository is licensed under [Apache-2.0](../LICENSE). No separate public `CONTRIBUTING.md`, `SECURITY.md` or private security-reporting channel is currently published. Do not treat a public issue as a private vulnerability disclosure.

## Publishing

The repository publishes this package and the primary user-facing `@agdf/cli` wrapper as one coupled AGDF release.
See the root `RELEASE.md` for the sequenced `agdf-v<version>` workflow and npm token requirements.

## Trademark Notice

AGDF(TM) and AI Governance & Delivery Framework(TM) are marks of Arndt Gold.
Use of the AGDF name and marks is governed by the project trademark guidelines.
