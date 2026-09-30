# PRD: Fachliche MCP-Schnittstellen als Zielbild

Status: draft
Gate: PRD
Gate approval: open
Based on: UR
Date: 2026-09-29
Owner: Arndt Gold (AGDF maintainer)
Traceability contract: criteria-chain-v1

## 1. Product Scope

Create a German-language, non-normative target-architecture discussion document at
`docs/architecture/mcp-target-architecture.md` and link it from `docs/architecture/README.md`.
Describe the existing MCP boundary and propose candidate domain-facing capability groups, their
authority boundaries, a possible Tools/Resources/Prompts mapping, open design decisions, and a
bounded evolution path. Clearly label every statement as implemented, decided, candidate, or open.
Candidate interface names are examples, not committed API.

## 2. UX Intent And Success

- ui_ux_impact: none
- ux_intent_definition: not_applicable — documentation for architecture discussion; no host or user
  interaction changes.
- primary_user_intent: AGDF maintainers and implementers can discuss a future MCP facade without
  confusing proposals with the current contract.
- success_signal: A reviewer can find the current interface owners, the proposed capability groups,
  their authority boundaries, and unresolved decisions from the linked document.
- primary_decision_or_action: Review the target architecture and decide which open questions merit a
  separately scoped contract change.

## 3. Working Modes And Effective State

| working_mode | effective_state | visible_state_types | effective_state_authority | primary_state_presentation_owner |
|---|---|---|---|---|
| Reading or reviewing the MCP target architecture | Proposal status is explicit; the existing runtime contract remains effective | Labels for `implemented`, `decided`, `candidate`, and `open`; links to current owners | Existing canonical code/contracts determine current behavior; an approved future scope determines any new decision | `docs/architecture/mcp-target-architecture.md`, linked from `docs/architecture/README.md` |

## 4. Activation, Blockers, Recovery And Transitions

- activation_and_deactivation: The document is available through the architecture overview. Reading
  it has no runtime effect and does not activate or register MCP capabilities.
- blockers_and_visible_next_actions: Missing evidence about the current baseline or an unresolved
  ownership/authority question is labeled `open`; the document must not present a candidate as
  decided. Resolve actual interface or policy changes in a separately approved scope.
- recovery_paths: Correct a factual mismatch against the linked canonical owner, restore the proposal
  label, and keep the implementation contract unchanged.
- relevant_state_transitions: `candidate` may become `decided` only through an explicitly approved
  scope that assigns the canonical contract owner and defines migration/evidence. The discussion
  document alone never changes effective runtime behavior.

## 5. Acceptance Criteria

- criterion_id: AC-001; Status clarity — The document visibly separates the current implementation,
  accepted decisions, candidate proposals, and open questions.
- criterion_id: AC-002; Current owners — It identifies `agdf_dispatch` and `agdf_inspect` as current
  MCP tools and links to their canonical contracts and services.
- criterion_id: AC-003; Capability proposals — It describes candidate capability groups by user
  intent and specifies for each its purpose, binding inputs, returned information, side effects, and
  failure behavior at discussion level.
- criterion_id: AC-004; Authority boundaries — It states that MCP adapts invocation; existing
  canonical services own policy and run state; the human remains the approval authority; the host
  owns tool visibility and interaction.
- criterion_id: AC-005; Write boundary — Any future MCP state-changing operation is conditional and
  records the required binding to target, run, gate, revision, digest, and deliberate human decision.
  The document does not claim that a safe write mechanism already exists.
- criterion_id: AC-006; MCP primitives — It compares candidate Tools, Resources, and Prompts roles
  without treating that mapping as an implemented contract.
- criterion_id: AC-007; Evolution path — It preserves current interfaces until a separately approved
  scope updates the canonical owner, contract, compatibility plan, and evidence.
- criterion_id: AC-008; Navigation and ownership — The existing architecture overview links to the
  new document and states that its target proposals are non-normative; current contracts remain the
  source of truth.
- criterion_id: AC-009; Scope integrity — No tool schema, runtime, gate policy, control-state owner,
  host setup, or release behavior changes in this slice.

## 6. Non-Goals

- Implementing, renaming, removing, or registering MCP tools.
- Finalizing target tool names or binding candidate proposals as policy.
- Adding approval-recording or generic filesystem-write capabilities.
- Changing Skills, CLI, host lifecycle, runtime, gate logic, or run-state storage.
- Updating unrelated historical architecture or Context Graph entries.
- Claiming current host behavior from repository architecture alone.

## 7. Users And Roles

- **Primary readers:** AGDF maintainer, architecture reviewers, and implementers considering MCP
  integration.
- **Decision authority:** The human maintainer and any owners named by a later approved scope.
- **Canonical contract owner:** AGDF runtime/semantic owners, currently represented by the runtime
  contracts and the existing `skill-dispatch` and `control-inspect` definitions.
- **Host responsibility:** The connected coding-agent host controls discovery, permissions, and
  visible interaction.

## 8. Constraints

- Write in German, consistent with the existing architecture overview and this governance discussion.
- Keep technical identifiers and exact protocol terms unchanged.
- Existing runtime contracts, tool definitions, and control/evaluation services remain authoritative
  for implemented behavior.
- The target document is explanatory and non-normative; candidate operations must not be described as
  available.
- Distinguish repository evidence from loaded-host/runtime evidence.
- Avoid duplicating complete schemas or policy tables owned elsewhere.

## 9. Evidence Requirements

- The new document links to the current contracts and implementation owners it describes.
- The architecture overview contains a working relative link and the non-normative status.
- A manual review confirms all nine criteria and checks that candidate names are not represented as
  available tools.
- No runtime test or host claim is required because runtime and host behavior do not change.

## 10. Risks And Open Questions

- Candidate capability groups may not map one-to-one to MCP tools; the document must compare semantic
  tool calls with reusable read-only Resources and interaction-oriented Prompts.
- Human approval over MCP needs an exact and host-verifiable decision-binding mechanism before any
  state-changing approval tool can be considered.
- The architecture overview has a dated development baseline; the new document must identify the
  repository/source status it actually inspected and avoid asserting release or live-host support.
- Compatibility and migration requirements for future interfaces need a separate implementation
  decision.

## Approval Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Is this slice a non-normative discussion document, with candidate names excluded from the current API? | before_prd | resolved | Yes. The document proposes capability groups and labels them as candidates; only existing canonical owners define available behavior. | Arndt Gold (AGDF maintainer) |
| Which candidate capabilities should become actual MCP contracts, and how should Tools/Resources/Prompts divide? | later_sd | open | Discuss alternatives in the target document; decide implementation scope, compatibility, and evidence only in a separately approved design. | AGDF maintainer and runtime-contract owner |
| What host-verifiable mechanism would authorize a future MCP state-changing decision? | later_sd | open | The target document records requirements and risks; it does not choose or implement an approval mechanism. | AGDF maintainer and interaction/runtime owners |

## 11. Next Step

Review this PRD, then approve only with:

`Approval: PRD`

## AGDF Approval Summary (de; source=en)

- Nutzerziel: Eine Zielarchitektur prüfen und diskutieren, bevor über künftige MCP-Schnittstellen entschieden wird.
- Umfang: Ein nicht-normatives deutsches Zieldokument beschreibt den aktuellen MCP-Vertrag, mögliche fachliche Fähigkeiten, Verantwortungsgrenzen, eine vorläufige Tools/Resources/Prompts-Zuordnung, offene Entscheidungen und einen Entwicklungspfad. Es wird aus der bestehenden Architekturübersicht verlinkt.
- Entscheidungen:
  - Status des Dokuments (geklärt): Es ist ein Diskussionsvorschlag. Kandidatennamen sind keine verfügbaren oder beschlossenen API-Aufrufe; die bestehenden kanonischen Eigentümer bestimmen das aktuelle Verhalten.
  - Künftige Fähigkeiten und MCP-Primitiven (offen): Eine spätere, eigens genehmigte Designentscheidung wählt tatsächliche Verträge, Kompatibilität und Nachweise.
  - Freigaben über MCP (offen): Der Vorschlag beschreibt Anforderungen; eine spätere Entscheidung muss eine explizite, host-verifizierbare menschliche Freigabe an den exakten Kontrollstand binden.
- Abnahmekriterien:
  - AC-001: Ist-Zustand, beschlossene Regeln, Kandidaten und offene Fragen sind klar getrennt.
  - AC-002: Die Dokumentation nennt `agdf_dispatch` und `agdf_inspect` als bestehende Werkzeuge und verlinkt ihre kanonischen Verträge.
  - AC-003: Jede vorgeschlagene Fähigkeitenfamilie beschreibt Zweck, Bindung, Ergebnis, Nebenwirkungen und Fehlerverhalten.
  - AC-004: Host, Mensch, MCP-Adapter sowie kanonische Policy- und Run-Eigentümer behalten klar zugewiesene Verantwortlichkeiten.
  - AC-005: Zustandsändernde MCP-Aufrufe bleiben bedingt und verlangen eine Bindung an Ziel, Run, Gate, Revision, Digest und bewusste menschliche Entscheidung; eine bereits vorhandene sichere Implementierung wird nicht behauptet.
  - AC-006: Tools, Resources und Prompts werden als mögliche MCP-Primitiven verglichen; die Zuordnung bleibt unverbindlich.
  - AC-007: Bestehende Interfaces bleiben bestehen, bis eine eigens genehmigte Scope-Änderung kanonischen Vertrag, Kompatibilität und Evidenz aktualisiert.
  - AC-008: Die Architekturübersicht verlinkt das neue Dokument als nicht-normatives Zielbild; aktuelle Verträge bleiben maßgeblich.
  - AC-009: In diesem Slice ändern sich weder Tool-Schema noch Runtime, Gate-Policy, Kontrollzustand, Host-Setup oder Release-Verhalten.
- Abgrenzung: Keine Implementierung, Umbenennung, Registrierung oder Entfernung von MCP-Werkzeugen; keine Festlegung endgültiger API-Namen; keine Änderung an Skills, CLI, Runtime, Host-Lifecycle, Gate-Logik, Speicherung oder Release.
- Offene Entscheidungen: Welche Kandidaten später echte MCP-Verträge werden, welche MCP-Primitiven dafür passen und wie eine künftige menschliche Freigabe host-verifizierbar wird, bleibt einer separaten genehmigten Architekturentscheidung vorbehalten.
