# SD: Installable AGDF Plugin for GitHub Copilot

Status: approved
Gate: SD
Gate approval: approved with exact `Approval: SD` on 2026-08-28
Based on: `.agdf/control/artefacts/agdf-copilot-plugin-integration/PRD.md`
Date: 2026-08-28
Owner: Arndt Gold

## 1. Solution Overview

Extend the existing release-built AGDF plugin bundle with a Copilot-native manifest and a
Copilot-specific derived skill projection. Do not create a second canonical plugin source, runtime,
installer model or approval contract.

The release-built plugin root remains `create-agdf/generated/plugins/agdf/`. It contains the existing
Codex and Claude manifests plus these derived Copilot components:

```text
agdf/
├── plugin.json
├── copilot-skills/
│   ├── agdf-gate-check/SKILL.md
│   ├── agdf-brownfield-analysis/SKILL.md
│   └── ...
├── hooks/copilot-hooks.json
├── runtime/
├── meta/
├── control/
├── .codex-plugin/plugin.json
└── .claude-plugin/plugin.json
```

The root `plugin.json` is selected first by Copilot and points `skills` to `copilot-skills/` and
`hooks` to `hooks/copilot-hooks.json`. Codex and Claude continue to consume their existing manifests
and unprefixed `skills/`. All variants are projections of `plugin/meta/agdf-plugin.definition.json`
and the canonical `plugin/skills/**` sources.

The initial supported product path is:

1. generate and verify the complete release-built bundle;
2. install that exact directory or an exact versioned published copy through a supported Copilot
   local, Git, GitHub-subdirectory or marketplace path;
3. verify package registration separately from loaded-session behavior;
4. start a fresh Copilot session and compare declared and loaded `agdf-` skills;
5. use the plugin skills while repository-owned `.agdf/control/` remains the governance authority.

Exact textual AGDF approvals remain the only Copilot approval transport in the initial release.

## 2. Ownership And Source Of Truth

| Concern | Canonical owner | Derived Copilot output |
|---|---|---|
| Product identity, version and surface metadata | `plugin/meta/agdf-plugin.definition.json` | root `plugin.json` and marketplace metadata |
| Workflow behavior | `plugin/skills/**/SKILL.md` and `plugin/meta/contracts/**` | `copilot-skills/agdf-*/SKILL.md` and copied contracts |
| Copilot naming | `pluginDefinition.copilot.skillPrefix` | `agdf-` skill names |
| Generation | `create-agdf/scripts/sync-package-assets.js` | complete Copilot component tree in the shared bundle |
| Packaged validator | `create-agdf/scripts/sync-plugin-runtime.js` | `runtime/agdf-local.js` and runtime manifest |
| Provenance and integrity | existing runtime provenance and release integrity owners | Copilot manifest, skill inventory and hook digest coverage |
| Lifecycle semantics | `create-agdf/lib/lifecycle/**` and installer transaction owners | Copilot adapter and truthful manual handoff when no CLI is callable |
| Automatic-check consent | `create-agdf/lib/runtime-check-consent/**` | content-bound `copilot` receipt and no-op default |
| Gate authority | `plugin/meta/contracts/interaction.md` and selected `RUN_STATE.md` | exact-text presentation only |
| Repository activation | repository `.agdf/control/` and project instructions | no plugin-owned mutation |

The source `plugin/` directory remains runtime-free and is not advertised as the installable Copilot
payload. Only the generated, integrity-checked bundle or an exact published copy is installable.

## 3. Architecture Decisions

### AD-CPI-01 — One shared generated bundle

Add the Copilot manifest and components to the existing generated AGDF plugin root. A separate
Copilot package is rejected because it would duplicate version, runtime and release ownership.

### AD-CPI-02 — Root Copilot manifest with explicit paths

Generate a root `plugin.json` because Copilot searches it before `.claude-plugin/plugin.json`. The
manifest uses the canonical name `agdf`, exact AGDF version and metadata, `skills:
"copilot-skills/"`, and an optional Copilot-specific hook path. It does not declare MCP, LSP,
extension or agent components in the initial release.

### AD-CPI-03 — Prefixed derived Copilot skills

Generate `copilot-skills/agdf-<slug>/SKILL.md` from the same transform already used for
`.github/skills/agdf-<slug>/SKILL.md`. The prefixed names avoid collisions with other AGDF surfaces
inside the shared bundle and preserve the current repository-local Copilot contract. Project and
personal skills still win according to Copilot precedence. Diagnostics report the effective source
without overwriting it.

### AD-CPI-04 — Repository bootstrap remains complementary

The `create-agdf` Copilot repository target continues to own checked-in instructions,
`.github/skills/**` and deliberate `.agdf/control/` setup. Plugin install, update, disable and
uninstall never write or remove those files. A repository may deliberately use plugin-only,
bootstrap-only or both; collision diagnostics make the effective source visible.

### AD-CPI-05 — Exact local runtime only

The Copilot projection carries the existing packaged validator. Skills and lifecycle diagnostics
must resolve `runtime/agdf-local.js` from the installed plugin payload or report it unavailable.
PATH lookup, registry access, `@latest`, cache globs and older-runtime fallback are forbidden.
`--resolve-only --json` exposes expected and observed version, provenance, digest and evidence plane
before doctor or gate-check output is treated as machine evidence.

### AD-CPI-06 — Copilot lifecycle adapter with truthful manual mode

Extend the existing lifecycle operation model with `copilot`. When a supported `copilot` executable
is callable, the adapter uses documented `copilot plugin install`, `list`, `enable`, `disable` and
`uninstall` operations and validates their result. When only the Copilot app UI is available, AGDF
generates and validates the exact payload, then presents its absolute path or pinned source and the
single required host action. It does not automate the GUI or infer installation, activation or
loaded-session success.

The adapter never reads or mutates Copilot's internal installation registry as a substitute for
host commands. Managed policy remains host authority and is reported as managed or unavailable.

### AD-CPI-07 — Transaction and rollback boundary

Generation and source verification complete before any host mutation. The Copilot host owns its
installation transaction. AGDF records the prior host-reported version, performs one requested
operation, re-queries host state and reports success only when identity and version match. On a
failed update, AGDF invokes only a documented host rollback or reinstall of the previously pinned
source; otherwise it reports the previous state as unverified and gives one manual recovery action.
It never deletes Copilot cache directories directly.

### AD-CPI-08 — Consent-bound optional session hook

Generate a Copilot hook file using the official version `1` schema and `sessionStart` event. The
command references `${PLUGIN_ROOT}/runtime/agdf-session-check.js`, sets `AGDF_SURFACE=copilot`, accepts
no arguments, performs no network access or writes and emits only bounded additional context.

The hook is no-op unless the existing content-bound consent system contains a valid `copilot`
receipt for the exact runtime, source digest and command. Manual is the default. A changed bundle,
command or capability identity requires renewed consent. Hook execution is claimed only for Copilot
surfaces with direct evidence; the GitHub Copilot app, CLI and cloud agent remain separate evidence
planes.

### AD-CPI-09 — Exact-text approval baseline

The generated interaction contract for Copilot continues to render the canonical two-card approval
envelope followed by exact text. Copilot permissions, plans, hooks, elicitation, extension UI and
plugin operations have technical authority only. A future native adapter requires a separate
approved design proving exact option values, deliberate waiting, fallback and same-run, gate and
revision revalidation.

### AD-CPI-10 — Publication is a separate authorized operation

Release preparation may generate and validate local marketplace metadata pointing to an exact
bundle. It must not register a marketplace, publish a release asset, change a default marketplace or
update a portal. Direct local and pinned test sources prove package behavior; public availability
requires a separately authorized publication action and retained publisher evidence.

## 4. Integration Points

| Integration | Change |
|---|---|
| `plugin/meta/agdf-plugin.definition.json` | Add Copilot plugin manifest, lifecycle and consent projection fields without duplicating shared metadata. |
| `create-agdf/lib/public-plugin/manifest.js` | Add one Copilot manifest renderer with schema and field validation. |
| `create-agdf/scripts/sync-package-assets.js` | Generate the root manifest, prefixed Copilot skill tree, shared contracts and Copilot hook into the release-built plugin. |
| `create-agdf/scripts/sync-plugin-runtime.js` | Recognize `copilot` for expected-root and consent identity without changing validator semantics. |
| `create-agdf/lib/runtime-check-consent/**` | Add `copilot` as an explicit supported surface and preserve manual default plus content-bound renewal. |
| `create-agdf/lib/installers/**` | Add a focused Copilot command adapter and a non-mutating manual handoff result. |
| `create-agdf/lib/lifecycle/**` | Reuse install, update, repair, status, disable and uninstall result semantics for Copilot. |
| `create-agdf/scripts/install-local-plugin.js` and package scripts | Accept `copilot`, build first, resolve one exact payload and invoke only the supported adapter. |
| release and integrity validation | Cover root manifest, prefixed skills, contracts, runtime, hook schema, version coherence and package contents. |
| repository scaffold | Preserve current `.github` Copilot projection and add no silent migration. |
| documentation and capability matrix | Replace repository-only assumptions with evidence-qualified plugin, bootstrap and support states. |

The official GitHub Copilot plugin manifest, skill, hook, installation, file-location and precedence
contracts are external dependencies. Design and release checks must link and revalidate the current
official documentation rather than freezing one observed app implementation as policy.

## 5. Constraints And Compatibility

- Initial capability support is skills plus the exact-version validator. Hooks are optional and
  consent-bound. Agents, MCP, LSP and extensions are excluded.
- Plugin name is `agdf`; Copilot skill names retain `agdf-`.
- The generated root manifest must not cause Codex or Claude to select Copilot-prefixed skills.
- The Copilot app, Copilot CLI and cloud agent are separate support rows. Package compatibility does
  not prove each host loaded or executed a component.
- macOS is the first directly testable app host. Linux and native Windows claims require direct
  lifecycle evidence. Cloud-agent hook claims require ephemeral Linux evidence.
- Node.js availability is a runtime prerequisite for the validator and optional hook. An unavailable
  executable produces manual or degraded state, never active.
- Managed organization policy may prevent local enablement or repointing. The adapter must not try
  to override it.
- First-found skill precedence is accepted. AGDF never overwrites project or personal components.
- Installation state, enabled state, package integrity, loaded-session inventory and human UAT are
  stored and reported as distinct facts.
- No operation grants an AGDF gate approval or performs repository setup implicitly.
- Source, generated output, installation cache and host UI state must not be conflated.

## 6. Test And Evidence Strategy

### Deterministic package evidence

- manifest renderer positive and negative fixtures for required name, version, paths and unsupported fields;
- exact canonical-to-generated parity for every prefixed Copilot skill and required contract;
- hook schema fixtures for version `1`, cross-platform commands, no arguments, no network and no writes;
- release version coherence and package-content assertions including the root manifest;
- runtime provenance tests covering source digest, runtime digest and `copilot` surface identity;
- collision fixtures proving project and personal files remain unchanged;
- lifecycle command fixtures for install, list, update, enable, disable, uninstall, managed policy,
  missing executable, malformed output, version mismatch and failed update;
- repository preservation snapshots for plugin-only, bootstrap-only and combined modes;
- exact approval tests proving technical host outcomes cannot advance a gate.

### Executed host evidence

- local-path installation of the release-built bundle on the installed macOS Copilot app;
- host inventory before and after install, update, disable and uninstall;
- fresh-session observation that every declared `agdf-` skill is discoverable and sourced correctly;
- governed and ungoverned repository routing observations;
- one project-skill collision observation and recovery;
- manual-default and explicitly enabled consent observations where the host supports plugin hooks;
- exact-version validator execution from the installed payload;
- uninstall observation proving repository-owned files remain;
- separate Copilot CLI evidence when a callable supported executable is available;
- narrowed support claims or direct Linux and native-Windows evidence before release.

### Evidence classification

Each test or observation records one of: canonical source, generated bundle, marketplace/source,
installed root, host registry, loaded fresh session, human UAT or public publication. QA must reject
claims that cross these planes without direct evidence.

## 7. Risks And Open Questions

- The installed macOS Copilot app currently has no `copilot` executable on PATH. App installation,
  component inventory and loaded-session behavior therefore require direct UI evidence or an
  officially supported app control exposed later.
- `${PLUGIN_ROOT}` is documented for plugin component paths, but its exact availability in Copilot
  hook command expansion needs executed proof before the hook is claimed active.
- Copilot hook support differs by app, CLI and cloud agent. The initial release may ship the hook as
  CLI-supported while reporting it unavailable in the app.
- The exact output schema of host lifecycle commands is host-owned and may change. Parsing must be
  version-bound and fail closed.
- A generated bundle containing root, Codex and Claude manifests must be tested on all three hosts to
  ensure manifest search precedence does not alter existing behavior.
- Remote marketplace layout and publisher ownership remain undecided until an authorized
  distribution step. Local marketplace fixtures are sufficient for implementation QA, not public
  availability.
- Future Copilot versions require a documented compatibility policy based on manifest validation,
  deterministic fixtures and direct host evidence rather than a permanent pin to app 1.1.14.

These questions do not block task planning because every uncertain host behavior has a fail-closed
manual or unsupported state and a named evidence obligation. They do block stronger compatibility,
hook and public-distribution claims.

## 8. Next Step

Review this solution design and approve only with:

`Approval: SD`
