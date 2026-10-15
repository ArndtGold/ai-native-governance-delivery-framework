# UR: Plugin-Owned Canonical Artefact Templates

Status: draft
Gate: UR
Gate approval: open
Requirements clarification: complete
Date: 2026-10-13
Owner: Repository maintainers

## 1. Problem

Canonical AGDF artefact authoring templates are not yet consistently bound to the installed, version-matched AGDF plugin across every existing authoring continuation. Repository scaffold copies can therefore be mistaken for authoring sources, individual skills can resolve templates differently, and missing or unsafe plugin paths can create fallback or source-of-truth drift.

## 2. Goal

Make the installed, version-matched AGDF plugin the sole source of truth for the nine canonical artefact authoring templates, with one shared typed and validated resolver that fails closed and is used by every existing authoring owner or continuation that needs one of those templates.

## Affected Users

- Repository maintainers who evolve AGDF skills, contracts, control scaffolding and host integrations.
- Copilot and Codex users who rely on deterministic, version-matched AGDF authoring behavior.
- Delivery agents that consume bound continuation data to author canonical artefacts.

## 3. Scope

- Bind only these canonical artefact templates to plugin-owned paths:
  - `UR.md`
  - `PRD.md`
  - `SD.md`
  - `TP.md`
  - `UX_INTENT_DEFINITION.md`
  - `BROWNFIELD_REVIEW.md`
  - `VERIFIED_CHANGE.md`
  - `QA_REPORT.md`
  - `OR.md`
- Generalize the existing UR-specific template resolution into one shared typed and validated artefact-template resolver.
- Reject missing, malformed, escaping or otherwise unsafe plugin template paths without a fallback chain.
- Keep repository copies under `.agdf/control/templates/` as derived, reviewable scaffold references that never override plugin-owned authoring templates.
- Wire each existing authoring continuation or contract to the corresponding plugin-owned template path.
- Where no direct authoring continuation exists, integrate the binding at the existing artefact owner rather than creating a parallel dispatch surface.
- Preserve scaffold/control-writer ownership for `RUN_STATE.md`, `AGDF_RUN.md`, `MASTER_BACKLOG.md`, `CONTEXT_GRAPH.md`, `SOT_REGISTRY.md` and `AGENT_QUALITY_CONTRACTS.json`.
- Preserve Codex MCP UI behavior and existing host compatibility.
- Update directly related contracts, documentation and focused tests.
- Validate affected dispatch continuations, plugin runtime isolation, Copilot payload and package contents, and Codex regression behavior.

## 4. Non-Goals

- Routing control-state or scaffold files through document-authoring skills.
- Introducing a repository-template fallback or allowing repository templates to override plugin templates.
- Creating new artefact-authoring skills, continuations or duplicate ownership surfaces solely to expose a template path.
- Changing gate authority, approval semantics, lifecycle routing or product behavior unrelated to canonical template ownership.
- Fixing the pre-existing package-boundary cycle or unrelated repository issues.
- Modifying or restoring user-owned deletions under `docs/architecture/mockups/`.
- Performing commits, pushes, branch changes, stashes, resets or unrelated reversions.

## 5. Acceptance Signals

- One shared resolver recognizes exactly the nine in-scope canonical artefact template identifiers and returns validated absolute paths within the trusted plugin template root.
- Every applicable existing authoring continuation or owner exposes or consumes the plugin-owned template path consistently.
- Missing plugin roots, missing templates, unsupported template identifiers and path-escape attempts fail closed with explicit errors.
- Repository scaffold copies remain packageable and reviewable but cannot become runtime authoring sources.
- The six excluded control/scaffold files retain their existing owners and are not routed through document-authoring continuations.
- Focused automated tests cover all nine templates, excluded files, runtime isolation, Copilot packaging and payload limits, package contents, and Codex behavior.
- Existing host compatibility and Codex MCP UI behavior remain unchanged.
- No unrelated user changes are reverted or overwritten.

## 6. Existing Source Of Truth

- The installed, version-matched AGDF plugin runtime and its trusted plugin root are the intended authoring source.
- `packages/core/lib/resources/context.js` and `packages/core/lib/resources/binding.js` expose template-root resource bindings.
- `scripts/core-projection.mjs` binds Copilot template resources to `AGDF_DISPATCH_PLUGIN_ROOT/control/templates`.
- `packages/cli/lib/mcp-lifecycle/plugin-runtime.js` propagates the trusted plugin root.
- `packages/core/lib/skill-dispatch/delivery-intake.js` contains the current UR-specific template resolution that should be generalized.
- `plugins/agdf/control/templates/artefacts/` contains the canonical plugin-owned artefact templates.
- `.agdf/control/templates/` contains derived scaffold references and is not an authoring authority.
- Existing authoring skills, gate-artifact preparation, quality/release owners, runtime contracts and focused tests remain the owners to extend rather than replace.

## 7. Risks And Unknowns

- Brownfield Review must identify every existing authoring owner and continuation so no template consumer is missed and no parallel dispatch surface is introduced.
- Resolver validation must distinguish the trusted installed plugin root from repository or ambient environment paths and prevent path escape.
- Packaging and runtime tests must prove that recursive control-template inclusion remains within the Copilot payload budget.
- Codex behavior must remain compatible even where its UI does not expose the same plugin resource-binding mechanism as Copilot.
- Existing uncommitted repairs overlap the intended implementation and must be integrated without replacing user-owned work.
- The active run and unrelated mockup deletions must remain preserved through canonical control updates and implementation.

## 8. Next Step

Review this UR and approve only with:

`Approval: UR`

## AGDF Approval Summary (de; source=en)

**Problem:** Die kanonischen AGDF-Artefakt-Templates sind noch nicht über alle bestehenden Authoring-Fortsetzungen hinweg einheitlich an das installierte, versionsgleiche Plugin gebunden. Dadurch könnten Repository-Scaffold-Kopien irrtümlich als Authoring-Quelle dienen, Skills unterschiedliche Auflösungswege verwenden oder fehlende beziehungsweise unsichere Plugin-Pfade zu Fallback- und Source-of-Truth-Drift führen.

**Ziel:** Das installierte, versionsgleiche AGDF-Plugin wird für genau neun kanonische Artefakt-Templates zur alleinigen Authoring-Quelle. Ein gemeinsamer typisierter und validierter Resolver bindet alle bestehenden zuständigen Owner und Fortsetzungen, validiert absolute Pfade innerhalb des vertrauenswürdigen Plugin-Template-Roots und schlägt bei fehlenden oder unsicheren Pfaden explizit fehl.

**Betroffene Nutzer:** Repository-Maintainer, Copilot- und Codex-Nutzer sowie Delivery Agents, die kanonische Artefakte über gebundene Fortsetzungen erstellen.

**Scope:** Erfasst werden ausschließlich `UR.md`, `PRD.md`, `SD.md`, `TP.md`, `UX_INTENT_DEFINITION.md`, `BROWNFIELD_REVIEW.md`, `VERIFIED_CHANGE.md`, `QA_REPORT.md` und `OR.md`. Der bestehende UR-spezifische Resolver wird zu einer gemeinsamen Lösung erweitert. Alle vorhandenen Authoring-Owner werden angebunden, direkt zugehörige Verträge, Dokumentation und Tests werden aktualisiert, und Copilot-Paketierung, Runtime-Isolation, Payload-Grenzen, Paketinhalt sowie Codex-Regressionen werden validiert.

**Nicht-Ziele:** Die Control- und Scaffold-Dateien `RUN_STATE.md`, `AGDF_RUN.md`, `MASTER_BACKLOG.md`, `CONTEXT_GRAPH.md`, `SOT_REGISTRY.md` und `AGENT_QUALITY_CONTRACTS.json` bleiben bei ihren bisherigen Writern. Es gibt keinen Repository-Fallback, keine neuen parallelen Dispatch-Flächen, keine Änderungen an Gate-Autorität oder Lifecycle-Semantik und keine Bearbeitung der benutzereigenen Löschungen unter `docs/architecture/mockups/`.

**Abnahmesignale:** Genau die neun erlaubten Templates werden aus dem vertrauenswürdigen Plugin aufgelöst; fehlende, nicht unterstützte oder aus dem Root ausbrechende Pfade schlagen geschlossen fehl; Repository-Kopien können die Plugin-Quelle nicht überschreiben; die ausgeschlossenen Control-Dateien behalten ihre Owner; fokussierte Tests decken Fortsetzungen, Isolation, Paketierung, Payload und Codex-Kompatibilität ab; bestehende Benutzeränderungen bleiben erhalten.

**Bestehende Source of Truth:** Der installierte Plugin-Root, die bestehenden Resource-Bindings und Projektion in Core/CLI, die vorhandene UR-Auflösung in `delivery-intake.js`, die plugin-eigenen Templates sowie die heutigen Skill-, Gate-, QA- und Release-Owner werden erweitert statt ersetzt.

**Risiken und offene Punkte:** Die Brownfield Review muss alle tatsächlichen Authoring-Owner vollständig erfassen, Pfadvalidierung und Runtime-Isolation müssen sicher nachgewiesen werden, und die bereits uncommitteten Reparaturen müssen ohne Überschreiben integriert werden. Es besteht keine offene Anforderungsentscheidung; die technischen Details werden in den nachfolgenden internen und freizugebenden Artefakten geklärt.

**Nächster Schritt:** Diese UR prüfen. Erst die exakte Antwort `Approval: UR` erlaubt die Brownfield Review und Mode/Slice-Entscheidung; sie erlaubt noch keine Implementierung.
