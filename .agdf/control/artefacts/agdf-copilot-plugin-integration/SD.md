# Solution Design: Plugin-Only AGDF Integration for GitHub Copilot

Status: approved
Gate: SD
Gate approval: exact `Approval: SD` accepted for revision 2 on 2026-08-30 after same-run, same-gate and revision revalidation
Revision: 2
Based on: `.agdf/control/artefacts/agdf-copilot-plugin-integration/PRD.md` revision 2
Date: 2026-08-28
Owner: Arndt Gold

## 1. Design Summary

Reuse the implemented Copilot plugin bundle and lifecycle without introducing another adapter.
Change the public command routing so `copilot` invokes that lifecycle directly. Remove the separate
`copilot-plugin` and `both` commands. Stop producing and packaging the Copilot repository projection
while preserving all existing files in user repositories.

The design keeps four evidence planes separate:

1. canonical source and generated package;
2. host-registered installed root;
3. fresh loaded Copilot session;
4. human UAT and publication state.

## 2. Architectural Decisions

### AD-CPI2-01 — `copilot` owns plugin installation

`create-agdf/lib/cli/application.js` maps `copilot` to the existing Copilot plugin installation
handler. The handler continues to call `installCopilotGlobalPlugin`, shared consent services and
shared lifecycle presentation. The old scaffold handler is not renamed or retained for Copilot.

### AD-CPI2-02 — Retire redundant public commands

`create-agdf/lib/cli/command-registry.js` removes `copilot-plugin` and `both`. Runtime-check option
validation accepts `copilot` alongside `codex`, `claude` and `opencode`. CLI usage, modularization
tests and error copy use the same command identity.

No hidden compatibility alias is added. The Copilot plugin work has not been released under the
competing command contract, and the approved product decision requires one supported path.

### AD-CPI2-03 — Preserve plugin generation, remove repository consumers

`create-agdf/scripts/sync-package-assets.js` continues to generate:

- the root Copilot `plugin.json` inside the shared plugin bundle;
- `copilot-skills/**` with the `agdf-` prefix;
- the Copilot hook;
- the exact-version runtime and shared contracts.

It stops generating the repository-only outputs:

- `generated/AGENTS.md` for the Copilot projection;
- `generated/.github/copilot-instructions.md`;
- `generated/.github/instructions/agdf-governance.instructions.md`;
- `generated/.github/skills/**`.

The sync step removes only these AGDF-owned derived paths inside `create-agdf/generated`. It never
removes corresponding files from a target repository.

### AD-CPI2-04 — Remove Copilot scaffold planning

`create-agdf/lib/scaffold/plan.js` removes Copilot instruction and skill planning, Copilot AGENTS
ownership detection and `both` composition. `generatedFilesForTarget` continues to support
`codex-repo`, `opencode-repo`, `init` and `config`. Unknown retired targets fail through normal CLI
command validation before any write plan exists.

`create-agdf/lib/scaffold/presentation.js` removes Copilot repository next steps and `both` copy.
Generic `.agdf/control/` creation remains available through `init`; it is not called automatically by
the plugin installer.

### AD-CPI2-05 — Non-destructive legacy boundary

No migration enumerates, modifies or deletes files in user repositories. Plugin install, update,
status, disable and uninstall remain global host lifecycle operations and retain `.agdf/control/**`,
`AGENTS.md`, `AGENTS.agdf.md` and `.github/**`.

Tests create legacy-file fixtures before lifecycle operations and compare their contents and hashes
afterward. Presence of legacy repository files is never accepted as plugin installation proof.

### AD-CPI2-06 — Shared lifecycle and consent remain authoritative

The existing installer, provenance, consent receipt and lifecycle result schemas remain unchanged.
Only their public command entry changes. Interactive `copilot` installation still requests
`enable`, `manual` or `cancel`; non-interactive execution remains manual unless explicit.

Hook output remains bounded JSON with `additionalContext` when authorized. Hook execution, Copilot
permissions and installation state cannot authorize AGDF gates.

### AD-CPI2-07 — Documentation ownership

- `README.md` owns the concise public overview and quick install command.
- `INSTALL.md` owns detailed lifecycle, consent, verification and support boundaries.
- `create-agdf/README.md` owns package command reference and links to INSTALL.
- `pages/src/data/site.ts` owns the public landing page installation and compatibility copy.

All surfaces use `AI Governance & Delivery Framework (AGDF)`, `agdf@agdf`, category `Productivity`,
the public `copilot` command and the local `npm run install:copilot` contributor command.

### AD-CPI2-08 — Verification follows owner boundaries

Update existing test owners rather than creating a separate Copilot-only suite:

- CLI modularization and command validation for supported names and options;
- local development install tests for `copilot` handler routing;
- smoke tests for supported scaffold targets and absence of Copilot repository writes;
- routing and Agent Skills conformance against `copilot-skills/**`, not generated `.github/skills/**`;
- package contents and build tests for absence of retired derived assets;
- lifecycle and consent tests for unchanged behavior and non-deletion fixtures;
- Pages tests for the public command and plugin capability statement;
- full `release:prepare`, Runtime Integrity, smoke and `git diff --check`.

## 3. Component Changes

| Component | Change | Preserved owner |
|---|---|---|
| CLI command registry | Replace two Copilot commands with `copilot`; remove `both` | Existing registry and usage renderer |
| CLI application | Bind `copilot` to existing plugin handler; remove scaffold bindings | Existing installation handler and lifecycle |
| Runtime-check validation | Permit `--runtime-checks` on `copilot` | Existing consent service |
| Scaffold plan and presentation | Remove Copilot and `both` repository paths | Existing Codex, OpenCode, init and config paths |
| Asset synchronization | Stop and clean owned repository projections; keep plugin outputs | Existing canonical definition and plugin generator |
| Local install orchestration | Keep `install:copilot`; expect public handler `copilot` | Existing local installer script |
| Documentation and Pages | One install path and corrected capability matrix | Existing documentation owners |
| Tests | Refactor assertions around plugin-only contract | Existing focused and aggregate suites |

## 4. Command And State Flow

```text
npx @agdf/cli@latest copilot
        |
        v
installConsentDecision("copilot")
        |
        +-- cancel -> no mutation
        |
        v
installCopilotGlobalPlugin
        |
        +-- verified install/update -> persist consent -> restart action
        +-- declarative configuration -> pending restart
        +-- host unavailable -> bounded manual handoff
        +-- failure -> preserve prior proven installation
```

The command never invokes `runScaffold`, `generatedFilesForTarget` or repository writes.

## 5. Failure And Recovery Design

- Unsupported or unknown command names fail before mutation and show current help.
- `copilot-plugin` and `both` do not silently redirect.
- Failed plugin update retains the previous proven plugin according to the existing transaction.
- Declarative app configuration reports `configured_pending_restart`, not loaded-session success.
- Missing Copilot CLI uses the existing explicit manual handoff and does not claim installation.
- Stale legacy repository files receive no automatic cleanup prompt or mutation.
- Documentation gives `codex-repo` plus `copilot` as the explicit replacement for former `both` use.

## 6. Security And Authority

- No new network endpoint, account, credential, telemetry or durable store.
- No broad shell permission or host trust modification.
- The runtime check remains argument-free, read-only and offline.
- The installer does not traverse or delete repository paths.
- Copilot host permission and hook results remain technical controls, not AGDF gate approval.
- `.agdf/control/` remains the only durable delivery-state authority.

## 7. Compatibility And Release

Codex, Claude Code and OpenCode commands retain their behavior. `codex-repo`, `opencode-repo`,
`init` and `config` remain supported scaffolds. Removing `both` changes only the combined Copilot
repository convenience path. Package and help tests must prove that no stale public route remains.

The release claim remains bounded to directly tested Copilot versions and operating systems.
Repository tests do not prove live app loading, UAT or marketplace publication.

## 8. Acceptance Mapping

| PRD criteria | Design decisions |
|---|---|
| CPI2-AC-01, AC-02 | AD-CPI2-01, AD-CPI2-06 |
| CPI2-AC-03 | AD-CPI2-02, AD-CPI2-07 |
| CPI2-AC-04 | AD-CPI2-03 |
| CPI2-AC-05, AC-06, AC-07 | AD-CPI2-03, AD-CPI2-04, AD-CPI2-05 |
| CPI2-AC-08, AC-09 | AD-CPI2-06 |
| CPI2-AC-10 | AD-CPI2-07 |
| CPI2-AC-11, AC-12 | AD-CPI2-08 |

## 9. Next Step

Review Solution Design revision 2. Approval permits drafting the revised Task and Test Plan. It does
not permit implementation.

Approve only with:

`Approval: SD`
