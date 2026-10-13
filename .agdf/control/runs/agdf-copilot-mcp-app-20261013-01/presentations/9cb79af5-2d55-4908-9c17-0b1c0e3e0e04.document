# PRD: Plugin-Owned Canonical Artefact Templates

Status: draft
Gate: PRD
Gate approval: open
Based on: `.agdf/control/artefacts/agdf-copilot-mcp-app-20261013-01/UR.md`
Date: 2026-10-13
Owner: Repository maintainers
Traceability contract: criteria-chain-v1

## 1. Product Scope

Deliver one authoritative template-binding behavior for canonical AGDF artefact authoring:

- The installed, version-matched AGDF plugin is the sole authoring source for `UR.md`, `PRD.md`, `SD.md`, `TP.md`, `UX_INTENT_DEFINITION.md`, `BROWNFIELD_REVIEW.md`, `VERIFIED_CHANGE.md`, `QA_REPORT.md` and `OR.md`.
- One shared allow-listed resolver returns a validated absolute path for each supported canonical artefact template.
- Existing authoring continuations receive the corresponding plugin-owned `template_path`.
- Canonical artefacts without a direct authoring continuation use their existing lifecycle owner; no parallel dispatch surface is introduced.
- Repository copies under `.agdf/control/templates/` remain derived scaffold references and never override plugin-owned authoring resources.
- Missing, unsupported or unsafe template resources fail closed before authoring and without repository mutation.
- Existing Copilot and Codex MCP behavior, host compatibility and gate authority remain unchanged.

## 2. UX Intent And Success

- ui_ux_impact: none
- ux_intent_definition: justified `not_applicable`; Brownfield Review records no user-facing capability, decision, visible state, feedback or recovery change
- primary_user_intent: Repository maintainers and delivery agents receive deterministic canonical template provenance without choosing or discovering a template source.
- success_signal: Every applicable authoring owner receives exactly one validated plugin-owned template path, excluded scaffold/control files retain their current owners, and all focused host/package tests pass.
- primary_decision_or_action: No new user decision is introduced; existing gate approvals and authoring actions continue unchanged.

## 3. Working Modes And Effective State

| working_mode | effective_state | visible_state_types | effective_state_authority | primary_state_presentation_owner |
|---|---|---|---|---|
| Canonical artefact authoring continuation | The continuation is bound to one supported plugin-owned template or fails closed | Existing continuation result or explicit dispatcher recovery | Version-matched installed plugin plus canonical Core resolver | Existing skill continuation and host chat/card renderer |
| Repository scaffold installation or review | Derived template copies may be inspected or installed but cannot become runtime authoring authority | Existing repository files and installer output | Existing scaffold/control writer | Existing CLI and repository review surfaces |

## 4. Activation, Blockers, Recovery And Transitions

- activation_and_deactivation: Template resolution occurs only when an existing authoring continuation or existing canonical artefact owner needs one of the nine supported templates. No template binding is activated for control/scaffold files.
- blockers_and_visible_next_actions: Unsupported identifiers, absent trusted plugin roots, missing template files, non-regular files, symlink/path escape or containment failures block authoring with an explicit stable error and direct repair action.
- recovery_paths: Repair or reinstall the version-matched plugin and retry the same bound continuation. Recovery never falls back to repository scaffold copies and never creates or rewrites repository files.
- relevant_state_transitions: Existing gate and lifecycle transitions remain authoritative. Adding `template_path` is additive continuation metadata; failure leaves the current gate and run revision unchanged.

## 5. Acceptance Criteria

### AC-001 — Exact canonical template set

- criterion_id: AC-001

The shared resolver supports exactly the nine approved canonical artefact templates: `UR.md`, `PRD.md`, `SD.md`, `TP.md`, `UX_INTENT_DEFINITION.md`, `BROWNFIELD_REVIEW.md`, `VERIFIED_CHANGE.md`, `QA_REPORT.md` and `OR.md`. Unsupported identifiers fail explicitly.

Required evidence: resolver allow-list tests for every supported and representative unsupported identifier.

### AC-002 — Excluded control and scaffold ownership

- criterion_id: AC-002

`RUN_STATE.md`, `AGDF_RUN.md`, `MASTER_BACKLOG.md`, `CONTEXT_GRAPH.md`, `SOT_REGISTRY.md` and `AGENT_QUALITY_CONTRACTS.json` are never resolved through the artefact-authoring template resolver and retain their existing scaffold/control writers.

Required evidence: negative resolver and continuation tests plus unchanged control-writer ownership.

### AC-003 — Trusted plugin path and containment

- criterion_id: AC-003

Every successful resolution returns an absolute path to a regular file inside the trusted installed-plugin `control/templates/artefacts` root. Missing roots/files, unsafe components, symlink escape, non-file targets and containment failures are rejected.

Required evidence: focused resolver safety tests including missing, unsupported and unsafe path cases.

### AC-004 — No fallback and no mutation

- criterion_id: AC-004

Authoring never falls back to `.agdf/control/templates/`, generated repository scaffold copies or another ambient path. A resolution failure does not create, overwrite or repair repository control files.

Required evidence: runtime-isolation tests with absent or invalid plugin template resources and unchanged repository fixtures.

### AC-005 — Existing owner and continuation coverage

- criterion_id: AC-005

The existing owners for UR, PRD, SD, TP, UX Intent Definition, Brownfield Review, Verified Change, QA Report and OR each receive or consume the corresponding plugin-owned template path. Where no direct authoring continuation exists, the current owner is extended without a new skill or parallel dispatch surface.

Required evidence: focused continuation/owner tests covering all nine mappings and proving no new dispatch route.

### AC-006 — Repository copies remain derived references

- criterion_id: AC-006

Copilot and package payloads include reviewable canonical control template copies sourced from `plugins/agdf/control/**`, but these copies cannot override the installed plugin path used for authoring.

Required evidence: payload inventory source mapping, package-contents assertions and runtime resolution from the installed plugin root.

### AC-007 — Host compatibility and UI preservation

- criterion_id: AC-007

Copilot continues to expose the existing seven MCP tools and its current presentation behavior. Codex retains its private cockpit behavior and existing authoring/control compatibility. Continuation additions are backward-compatible and do not change gate authority.

Required evidence: Copilot profile/tool inventory tests, Codex regression tests and real or fixture stdio continuation checks.

### AC-008 — Deterministic packaging and payload budget

- criterion_id: AC-008

All nine plugin-owned artefact templates are included exactly once in generated Copilot and npm package contents, inventory digests remain deterministic, and the explicit Copilot payload budget reflects the reviewed package.

Required evidence: package sync, Copilot payload validation and npm dry-run package-contents tests.

### AC-009 — Contracts and documentation state the authority boundary

- criterion_id: AC-009

Directly related authoring contracts and installation documentation state that `template_path` is absolute and plugin-owned, repository copies are derived references, unsupported or unsafe paths fail closed, and only the nine approved artefacts use this resolver.

Required evidence: contract-content assertions and documentation review.

## 6. Non-Goals

- Changing gate order, approval syntax, lifecycle authority, QA/UAT behavior or release semantics.
- Creating a new template registry outside the existing Core resource owner.
- Routing control-state or scaffold files through document-authoring skills.
- Adding a repository or generated-resource fallback.
- Creating new authoring skills or dispatch phases for Verified Change or any other artefact.
- Changing product-facing Copilot/Codex UI behavior.
- Repairing the pre-existing package-boundary cycle.
- Modifying unrelated user-owned changes, including deletions under `docs/architecture/mockups/`.
- Performing commits, pushes, branch changes or other VCS publication actions.

## 7. Users And Roles

- Repository maintainers own the approved template set, compatibility requirements and release acceptance.
- Core resource and skill-dispatch code owns typed template identity, validation and continuation metadata.
- Existing skills and lifecycle owners remain responsible for artefact semantics and canonical recording.
- CLI projection and plugin runtime code own trusted plugin-root propagation and package isolation.
- QA owns evidence that every mapping and host/package surface behaves as specified.

## 8. Constraints

- The installed plugin and Core runtime version must match existing provenance checks.
- Successful paths must be absolute, contained, regular files and derived only from the trusted plugin root.
- The resolver must accept only an internal allow-listed identifier, never a caller-supplied path fragment.
- Failures must be explicit and must not become success-shaped fallback results.
- Continuation changes must remain additive for existing hosts and clients.
- Existing repository naming, error handling, frozen-result and test conventions are binding.
- Generated assets must continue to derive deterministically from canonical repository plugin sources.
- No implementation may overwrite unrelated dirty worktree content.

## 9. Evidence Requirements

- Unit tests for the shared resolver across all nine supported identifiers and unsafe/missing/unsupported cases.
- Skill-dispatch tests for UR, PRD, SD, TP, UX Intent Definition, Brownfield Review, QA Report and OR continuation metadata.
- Existing-owner evidence for Verified Change without a new continuation.
- MCP stdio continuation tests against the assembled version-matched plugin.
- Plugin runtime isolation tests proving resolution through `AGDF_DISPATCH_PLUGIN_ROOT`.
- Copilot profile inventory and payload-budget tests for all canonical templates.
- npm package dry-run contents tests for all canonical templates.
- Existing Codex regression/profile tests proving private cockpit and host compatibility remain unchanged.
- Build/type/package validation required by the repository's current scripts.

## 10. Risks And Open Questions

- A resolver placed under a skill-specific module would recreate ownership duplication; it must remain under the shared resource owner.
- Permitting generated or repository roots when the trusted plugin root is unavailable would violate the approved authority boundary.
- Generic judgement continuations need template metadata only for skills that actually author an in-scope artefact.
- Verified Change needs provenance at its existing gate-check/validation owner without inventing a direct authoring continuation.
- Additive response metadata must not alter Codex or Copilot UI rendering.
- No product-scope or acceptance question remains open; SD must choose the exact module/API and stable error codes within this PRD.

## Approval Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Canonical template set | before_prd | resolved | Exactly the nine artefacts listed in AC-001; no other file is eligible | Repository maintainers |
| Template authority and fallback policy | before_prd | resolved | The installed, version-matched plugin is the sole authoring source; failures are fail-closed with no fallback or mutation | Repository maintainers |
| Existing owner preservation | before_prd | resolved | Extend current continuation or lifecycle owners; do not create a parallel authoring surface | Repository maintainers |
| Host and release scope | before_prd | resolved | Preserve Copilot and Codex behavior; package the canonical templates deterministically without a separate rollout mechanism | Repository maintainers |
| Resolver API and error taxonomy | later_sd | open | SD must define the shared typed identifiers, containment algorithm and explicit unsupported/unavailable/unsafe errors | Core resource owner |
| Validation command matrix | later_tp | open | TP must name focused dispatch, runtime, payload, package and Codex commands | QA and task-plan owner |

## 11. Next Step

Present this PRD only after every `before_prd` row is `resolved` with a concrete answer and the named PRD Owner is filled. Then review and approve only with:

`Approval: PRD`

## AGDF Approval Summary (de; source=en)

- Ziel: Das installierte, versionsgleiche AGDF-Plugin wird zur alleinigen Authoring-Quelle für die neun kanonischen Artefakt-Templates. Ein gemeinsamer erlaubnislistenbasierter Resolver liefert validierte absolute Plugin-Pfade oder schlägt vor jeder Authoring-Mutation explizit fehl.
- Umfang: Erfasst werden ausschließlich die neun genehmigten Artefakte und ihre vorhandenen Authoring- beziehungsweise Lifecycle-Owner. Repository-Scaffold-Kopien bleiben abgeleitete Referenzen. Direkte Verträge, Paketierung, Runtime-Isolation und fokussierte Host-Tests werden aktualisiert.
- Entscheidungen: Die Template-Menge, alleinige Plugin-Autorität, Fail-Closed-Politik, Erhaltung vorhandener Owner sowie unverändertes Copilot-/Codex-Verhalten sind entschieden. SD definiert die genaue Resolver-API und Fehlercodes; TP definiert die Validierungsmatrix.
- AC-001: Der Resolver unterstützt genau die neun genehmigten kanonischen Artefakt-Templates und weist andere Identifikatoren explizit zurück.
- AC-002: Die sechs ausgeschlossenen Control- und Scaffold-Dateien behalten ihre bisherigen Writer und werden nie über den Authoring-Resolver aufgelöst.
- AC-003: Erfolgreiche Auflösungen liefern nur absolute reguläre Dateien innerhalb des vertrauenswürdigen installierten Plugin-Roots; fehlende oder unsichere Pfade werden abgelehnt.
- AC-004: Es gibt keinen Fallback auf Repository- oder generierte Scaffold-Kopien und keine Repository-Mutation bei Auflösungsfehlern.
- AC-005: Alle neun bestehenden Authoring- oder Lifecycle-Owner erhalten beziehungsweise verwenden den passenden Plugin-Pfad, ohne eine neue Dispatch-Fläche zu erzeugen.
- AC-006: Paketierte Template-Kopien bleiben überprüfbare abgeleitete Referenzen und können die installierte Plugin-Quelle nicht überschreiben.
- AC-007: Copilot behält sieben MCP-Tools und bestehende Präsentation; Codex behält Cockpit und Host-Kompatibilität; Gate-Autorität bleibt unverändert.
- AC-008: Alle neun Templates werden deterministisch genau einmal paketiert und innerhalb des überprüften Copilot-Payload-Budgets validiert.
- AC-009: Verträge und Installationsdokumentation beschreiben Plugin-Autorität, abgeleitete Repository-Kopien, Fail-Closed-Verhalten und den exakt begrenzten Template-Scope.
