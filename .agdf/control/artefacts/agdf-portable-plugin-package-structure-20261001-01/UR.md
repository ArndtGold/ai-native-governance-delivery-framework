# UR: Align AGDF Package Structure with OpenAI's Portable Plugin Model

Status: draft
Gate: UR
Gate approval: open
Date: 2026-10-01
Owner: Arndt Gold
Run: `agdf-portable-plugin-package-structure-20261001-01`
Language: en

## 1. Problem

AGDF's plugin content, runtime, installation logic and distribution projections are spread across
`plugin/`, `create-agdf/`, `agdf/` and `agdf-mcp-server/`. The current OpenAI manifest generator
produces the supported Codex compatibility format, while the public candidate deliberately excludes
MCP and app configuration. Maintainers need a package structure that makes the installable plugin,
its runtime dependencies and host-specific projections easy to understand and maintain.

The user specifically requests alignment of the directory and package structure with OpenAI's
plugin model. This is a packaging and software-boundary requirement, not a staffing reorganization.

## 2. Goal

Make AGDF a clearly organized portable plugin with one shared identity and explicit component
boundaries. Adopt the current OpenAI-recommended portable package entry point first; subsequently
separate control-core, CLI/installation and MCP responsibilities where dependency analysis shows a
durable benefit. Preserve AGDF's canonical rules, controlled state and existing supported delivery
paths throughout the migration.

The result should reduce the effort to locate a component, understand its ownership, build a
complete package and evolve host integration. It should leave a clear extension point for future
MCP UI without claiming that panels or remote services already exist.

## 3. Scope

- Define and deliver a portable plugin package with root `plugin.json`, root `skills/`, assets,
  and correctly declared optional MCP connections and lifecycle hooks. OpenAI-specific presentation,
  registered app mappings and hook settings belong in `extensions.com.openai` where applicable.
- Use the Agent Plugins schemas and fixed component paths. A portable `mcp.json` must declare its
  transport correctly; renaming an existing `.mcp.json` is insufficient.
- Keep one canonical source for plugin identity, skills, governance contracts and profile metadata.
  Generate any necessary compatibility manifests and host projections from those owners.
- Review source, generated distribution and installed-runtime boundaries. The discussed
  `plugins/agdf/` and `packages/{core,cli,mcp-server}/` layout is a candidate for later design;
  OpenAI mandates neither that repository layout nor separate npm publications.
- Plan migration in stages: portable plugin format first, then justified runtime modularization.
  Extract an independent runtime package only if its consumers, dependency direction, versioning
  and release obligations justify the added boundary.
- Preserve the required Codex, Claude Code, OpenCode and GitHub Copilot integration behavior,
  exact-version runtime binding, hook trust and consent boundaries, update/recovery ownership,
  relative resource references and offline validation where currently supported.
- Distinguish local/runtime and public-submission profiles. Changing the public skills-only profile
  requires an explicit capability and distribution decision; portable formatting alone does not
  make a local MCP server publicly supported in ChatGPT.
- Update affected build, package validation, installation documentation and compatibility evidence
  for the selected migration slice.

## 4. Non-Goals

- Creating new teams, changing maintainer authority or redesigning the organization.
- Implementing a ChatGPT panel, file editor, MCP Events, remote hosting, authentication service or
  a general MCP approval/write API as part of this package-structure scope.
- Changing gate semantics, approval authority, request activation, canonical run state or technical
  permission policy. Project control remains in the target repository's `.agdf/control/`.
- Publishing multiple npm packages solely to reproduce a directory diagram, or assuming a specific
  folder rename is already an approved implementation design.
- Transferring approvals or closing unrelated runs, rewriting historical evidence, or treating a
  package-format migration as proof of fresh-host support.
- Installing into the user's active plugin cache, submitting or publishing a plugin, deploying,
  releasing, committing or pushing without the applicable separate instruction.

## 5. Acceptance Signals

1. The final plugin's root manifest validates against the selected portable schema; all declared
   skills, MCP configuration, hooks, app mappings and assets are present and resolvable in the
   actual distributed package, including the intentional absence of optional capabilities.
2. Portable identity and OpenAI extensions have one authoritative source. Generated compatibility
   outputs do not introduce independently maintained manifests, skills or governance rules.
3. Brownfield Review identifies existing owners and dependency consumers before selecting a
   migration slice. Later design explains the control-core, CLI/installation, MCP and build
   boundaries and justifies each proposed independently published package.
4. A staged migration and compatibility path covers existing commands, package identifiers,
   resource paths, installation, update and recovery. Any intentional behavior change is explicit
   rather than a side effect of moving files.
5. Package and integration checks establish completeness and absence of profile-inappropriate
   content. Repository, package, installed-payload and fresh-host evidence remain distinguishable;
   missing host evidence remains visible.
6. The approved governance behavior, revision-bound approvals and target-local control ownership
   are preserved. UI preparation does not create an additional state store or decision authority.
7. Maintainer documentation explains where plugin components and runtime responsibilities live,
   how their distributions are built and which consumer receives each profile.

## 6. Existing Source Of Truth

- `plugin/meta/agdf-plugin.definition.json`: shared identity and host/profile metadata.
- `plugin/skills/`, `plugin/meta/contracts/`, `plugin/control/templates/`: canonical workflows,
  governance semantics and control templates.
- `create-agdf/lib/control-state/` and `create-agdf/lib/control-evaluation/`: state, approval,
  integrity and deterministic gate owners.
- `create-agdf/lib/public-plugin/`, `create-agdf/scripts/sync-package-assets.js` and runtime
  generation: existing manifest, profile and distribution builders.
- `create-agdf/package.json`, `agdf/package.json`, `agdf-mcp-server/package.json`: current npm
  inventory, entry points and version-matched dependencies.
- `.agdf/control/SOT_REGISTRY.md` and `docs/architecture/`: existing source ownership and
  explanatory architecture documentation.
- Related runs retain their scopes: `agdf-public-plugin-distribution` owns submission/readiness,
  `agdf-npm-package-payload-cleanup` owns runtime payload selection, and
  `agdf-host-adapter-compatibility` owns host compatibility outcomes. Their evidence may be reused
  with its original limits; their approvals do not authorize this structural migration.
- Official OpenAI documentation, fetched on 2026-10-01:
  [Package your plugin](https://developers.openai.com/plugins/build/plugins), especially portable
  structure, OpenAI-specific metadata, path rules and bundled MCP configuration. This is external
  compatibility input, not a new owner of AGDF governance policy.

## 7. Risks And Unknowns

- Which minimal first slice provides a portable installable plugin without breaking existing
  profile consumers and runtime provenance?
- Which references assume today's folder layout, and which are derived rather than canonical?
- Does extracting the runtime from `create-agdf` reduce coupling enough to justify new package,
  release-order and exact-version compatibility obligations?
- Which hosts accept each portable component directly and which still require generated overlays?
  This requires evidence for the actual host variant and version.
- How should source manifests, generated profiles, public candidates and build-only material be
  organized without adding a second source of truth?
- How will related active work be reconciled before changes to shared package/build owners?

## 8. Next Step

Review this persisted UR and approve only with `Approval: UR` for its current presented revision.
Approval permits Brownfield Review and Mode/Slice Decision. Implementation and later gate artefacts
remain subject to their applicable approvals and readiness checks.

## AGDF Approval Summary (de; source=en)

- Problem: Plugin, Runtime, Installation und Paketgenerierung sind verteilt; das portable OpenAI-Format soll die Paketstruktur verständlicher machen.
- Ziel: Ein portables AGDF-Plugin mit gemeinsamer Identität und klaren Grenzen für Kontrollkern, CLI und MCP, bei unveränderten Governance-Regeln.
- Umfang: Zuerst Plugin-Format und erzeugte Hostvarianten vereinheitlichen; anschließend Runtime-Grenzen anhand der Abhängigkeiten festlegen. Eigene npm-Pakete und Verzeichnispfade werden im Design begründet.
- Abnahme: Das ausgelieferte Paket ist vollständig und schema-konform; Quellen bleiben eindeutig; Migration, bestehende Hostpfade und Nachweise werden geprüft.
- Offen: Kleinster erster Slice, Pfadabhängigkeiten, Nutzen eigener Runtime-Pakete, Host-Unterstützung und Abstimmung mit laufenden Vorhaben.
- Grenze: Diese UR umfasst keine Panel-Implementierung, Veröffentlichung oder Änderung der aktiven Installation. Die Freigabe erlaubt zunächst Brownfield Review und die Wahl des Delivery-Pfads.
