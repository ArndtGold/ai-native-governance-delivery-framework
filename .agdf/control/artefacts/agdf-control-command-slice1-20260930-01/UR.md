# UR: One Governed Control Command From Decision To Durable Transition

Status: draft
Gate: UR
Gate approval: open
Date: 2026-09-30
Owner: user / agent
Run: agdf-control-command-slice1-20260930-01

## 1. Problem

AGDF already has shared gate evaluators, revision-bound approval recording, presentation bindings and recoverable Run writers. However, a consumer does not yet have a single explicit contract covering a concrete controlled action from current-state evaluation through authority verification to its durable effect. Human-readable allowed-action text is not itself an executable action contract. A prepared presentation and a caller-supplied approval reply do not independently prove that a human saw and approved that presentation.

Adding a new Control Kernel package or MCP endpoint without clarifying these boundaries would risk duplicating policy, overclaiming enforcement and leaving the same bookkeeping and trust gaps in a different interface.

## 2. Goal

Demonstrate one complete, narrowly scoped governed state transition through existing AGDF owners, with an explicit action and authority contract, current-revision binding, recoverable persistence and auditable evidence. The user can understand what was decided, which exact action occurred and which guarantee was technically demonstrated, with fewer manual control steps.

## 3. Scope

- Select one existing approval-related Run transition during Brownfield Review and product/design preparation; define its exact user outcome, inputs, authority requirements, observable result and failure behavior.
- Reuse the canonical control-evaluation, control-state, interaction and tool-contract owners. CLI and any selected MCP consumer must use the same decision and mutation service; neither adapter acquires its own policy or state store.
- Distinguish a status query, an action eligibility decision, a human decision and execution of the concrete state-changing command. Structured action identifiers and conditions must remain projections of the existing policy owner.
- Bind decisions and effects to the exact target, Run, current revision and relevant artefact/presentation digests. Re-evaluate eligibility when executing or accepting the result; an earlier status response is not a durable authorization.
- Define the trusted producer and verification boundary of human-decision evidence. Reject agent-authored assertions as independent human proof. If a selected host cannot supply independently verifiable evidence, expose that limitation explicitly and retain only the accurately described cooperative-host behavior; do not fabricate a trusted receipt or claim the stronger guarantee.
- Cover stale input, concurrent consumers, retries and interrupted writes for the selected transition using existing writer, lock and recovery responsibilities where applicable.
- Record a baseline and the resulting consumer workflow, including required tool/shell calls, presentation repetition and manual state corrections. Separate repository, protocol, installed-runtime and human-visible host evidence.
- Document the relationship to existing intake, MCP inspection, recovery and product-maturity work without transferring their approvals or expanding their scopes.

## 4. Non-Goals

- A wholesale kernel extraction, a universal agent runtime, a generic state-setting API, new gate semantics or removal of deliberate human decisions.
- Moving all write operations to MCP or introducing a predetermined catalogue of six tools.
- Preventing arbitrary shell/file changes merely by adding an authorization function. Protected merge/release execution and a separately permissioned control service require their own explicitly selected scope.
- MGDF product changes, shared mortgage/software business policy, organisation-wide role management or a new identity platform.
- Repairing historical approvals or unrelated Runs; changing installations, releasing, publishing, committing, pushing or opening a PR automatically.

## 5. Acceptance Signals

1. One selected user-facing transition has a precise command contract and one canonical policy/persistence path, with existing interfaces preserved or an explicit compatibility decision.
2. A status query and a prepared presentation do not create a gate approval or permit an unrelated mutation.
3. An agent-generated approval assertion cannot be represented as independently verified human authority. The selected evidence producer, trust assumption and demonstrated enforcement level are explicit.
4. Changing the bound revision or relevant artefact after evaluation/presentation invalidates the earlier binding; execution rejects it without a partial authoritative transition.
5. Concurrent requests do not overwrite each other's accepted state or produce contradictory accepted outcomes.
6. Retrying or recovering an interrupted command does not duplicate its logical effect or invent a new approval; the outcome and resulting revision are observable.
7. The same complete scenario demonstrates these boundaries through the selected consumer path. Source tests alone do not count as proof of a fresh host or of human visibility.
8. The workflow measurement shows whether manual control work decreased; a negative or unavailable result is reported rather than hidden by an architectural success claim.

## 6. Existing Source Of Truth

- `plugin/meta/contracts/request-activation.md`, `gate-transition.md`, `interaction.md`, `control-scaffold.md` and `quality.md` own existing applicability, authority and delivery rules.
- `create-agdf/lib/control-evaluation/` owns deterministic gate and readiness evaluation.
- `create-agdf/lib/control-state/` owns Run persistence, approval/presentation bindings, revision checks, locking and recovery.
- `create-agdf/lib/control-inspect/`, `skill-dispatch/`, `mcp-dispatch-runtime.js` and `agdf-mcp-server/src/server.js` own current consumer contracts and transport composition.
- `.agdf/control/runs/<run_id>/RUN_STATE.md` and referenced artefacts remain the durable Run authority.
- `docs/architecture/mcp-target-architecture.md` is discussion input, not implementation authority. Existing active Runs retain their own scopes and decisions.

## 7. Risks And Unknowns

Brownfield Review must identify the smallest transition that exercises authority, freshness and persistence together, including overlap with the SD-routed approval-provenance gap noted by the recovery work. The available host may not provide a verifiable human-decision channel. CLI and MCP can share an evaluator while supplying different observations, so observation availability and freshness must be explicit. Existing file locks and transaction recovery do not by themselves protect against a writer operating outside the controlled path. The selected implementation must preserve proportional delivery and avoid increasing routine ceremony.

## 8. Next Step

Review this exact UR. A subsequent deliberate `Approval: UR` permits Brownfield Review and proportional routing for this Run; it does not approve a design or implementation.

## AGDF Approval Summary (de; source=en)

- Problem: AGDF besitzt bereits gemeinsame Auswertung und sichere Writer, aber noch keinen klar abgegrenzten Durchstich von einer konkreten Aktion über ihre Autoritätsprüfung bis zum gespeicherten Folgestand. Vorbereitete Darstellung und übergebener Antworttext beweisen keine unabhängig bestätigte menschliche Entscheidung.
- Ziel: Einen vollständigen, kleinen Kontrollübergang mit bestehenden Eigentümern umsetzen und belegen; Entscheidungsgegenstand, tatsächliche Wirkung und technische Garantie werden nachvollziehbar, manuelle Kontrollarbeit wird gemessen.
- Umfang: Einen bestehenden freigabebezogenen Übergang auswählen, einen gemeinsamen Aktionsvertrag definieren und Revision, Artefakte, menschliche Entscheidungsherkunft sowie Konkurrenz, Wiederholung und Wiederherstellung prüfen. CLI und gegebenenfalls MCP verwenden denselben fachlichen Service. Bestehende Gates und Zustandsquellen bleiben maßgeblich.
- Abnahme: Status erzeugt keine Freigabe; Agentenbehauptungen gelten nicht als unabhängiger menschlicher Nachweis; veraltete Bindungen werden abgelehnt; Konkurrenz erzeugt keinen widersprüchlichen Stand; Wiederholung und Recovery verdoppeln keine Wirkung. Workflow-Aufwand und Quellen-, Installations- sowie Host-Evidenz werden getrennt ausgewiesen.
- Offen: Brownfield Review bestimmt den kleinsten geeigneten Übergang und Überschneidungen. Ein verifizierbarer menschlicher Entscheidungskanal hängt vom Host ab; fehlt er, wird die Grenze sichtbar und es wird keine stärkere Garantie behauptet. Paketumbau, universelle Schreib-API, Merge-/Release-Durchsetzung und MGDF-Änderungen gehören nicht zu diesem Slice.
