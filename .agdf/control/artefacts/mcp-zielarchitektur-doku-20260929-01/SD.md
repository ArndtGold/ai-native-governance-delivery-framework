# SD: Fachliche MCP-Schnittstellen als Zielbild

Status: draft
Gate: SD
Gate approval: open
Based on: PRD
Date: 2026-09-29
Owner: Arndt Gold (AGDF maintainer)
Traceability contract: criteria-chain-v1

## 1. Solution Overview

Add a separate German discussion document at `docs/architecture/mcp-target-architecture.md` and
link it from `docs/architecture/README.md`. The document will explain the current MCP boundary,
propose candidate capability families, assign authority and source-of-truth boundaries, compare
MCP Tools/Resources/Prompts as possible primitives, and describe a staged path for future decisions.

The discussion document remains non-normative. It will not define production schemas or change the
meaning, availability, or authorization of any existing operation. Each section will visibly label
claims as `implemented`, `decided`, `candidate`, or `open` and link to the owner of any implemented
behavior.

Candidate capability families to discuss:

1. **Auftrag und Bindung:** prepare or inspect the explicit target/run binding required for a
   delivery request. The host retains request activation and user interaction; target binding must
   not be inferred from a working directory.
2. **Kontrollabfrage:** read a bound run's current gate, revision, blockers, and relevant evidence
   through existing evaluators.
3. **Entscheidungsvorbereitung:** present a gate decision for an exact artefact and revision. This
   operation remains read-only and does not record consent.
4. **Zustandsänderung:** a future conditional family for evidence or human decisions. The document
   states prerequisites and risks; it recommends no implementation until a canonical service and a
   host-verifiable, exact decision binding exist.

Candidate primitive mapping:

- **Tools:** bounded operations with explicit target/run context and a typed result.
- **Resources:** stable read-only contracts or documentation when the host can preserve source
  identity and freshness.
- **Prompts:** reusable interaction guidance only; they never own authorization or decision policy.

## 2. Ownership And Source Of Truth

- `plugin/meta/contracts/` remains the normative owner of AGDF interaction, target, gate, and
  authority rules.
- `create-agdf/lib/skill-dispatch/contract.js` remains the semantic owner of `agdf_dispatch`.
- `create-agdf/lib/control-inspect/contract.js` and `selection.js` remain the owners of the current
  read-only `agdf_inspect` contract.
- `create-agdf/lib/control-evaluation/` owns deterministic gate/control evaluation; the MCP adapter
  adds no policy.
- `create-agdf/lib/control-state/` owns canonical run state and revision handling.
- The human retains gate-approval authority. Host tool visibility, permissions, and displayed
  interaction remain host responsibilities.
- This document owns no runtime contract, schema, persisted state, or approval meaning. It links to
  existing owners and carries candidate material only.

## 3. Architecture Decisions

- SDD-001: Keep the target model in a separate, linked, non-normative architecture document; rationale: the current architecture overview describes the implemented system and normative contracts have separate owners; consequence: reviewers can compare the target with the baseline, but no proposal becomes executable policy by appearing in documentation.
- SDD-002: Organize the target around the four candidate capability families and show an explicit authority/source-of-truth owner for each; rationale: MCP consumers need an intent-level view while AGDF must retain one owner per policy and state domain; consequence: capability grouping is a proposal and may not map one-to-one to final tool names.
- SDD-003: Show Tools, Resources, and Prompts as alternatives by interaction role, not as committed registrations; rationale: host support and freshness requirements differ by primitive; consequence: the document must not imply that any candidate is discoverable or qualified on a live host.
- SDD-004: Treat state-changing MCP operations as conditional future work with explicit prerequisites and a separate approved scope; rationale: transport invocation alone does not prove authority or deliberate human consent; consequence: the target document describes the required binding and evidence without inventing a current write API.

## 4. Integration Points

- New documentation: `docs/architecture/mcp-target-architecture.md`.
- Navigation link: `docs/architecture/README.md`.
- Read-only references: existing MCP function definitions, request-activation and gate contracts,
  control/evaluation services, and the `CG-MCP-DISPATCH-ADAPTER` context entry.
- No MCP server, CLI, host adapter, generated payload, schema, or persisted runtime state is changed.

## 5. Constraints And Compatibility

- The current MCP tools and their contracts remain as implemented.
- No proposal may be presented as a tool available through `tools/list`.
- The MCP server remains an adapter to canonical services; it does not become a parallel policy or
  run-state owner.
- No target or run may be inferred from `working_directory` alone.
- Gate evaluation, human approval, and terminal presentation remain separate responsibilities.
- State-changing candidates must name exact target, run, gate, revision, digest, idempotency,
  provenance, host-verifiable user action, and recovery requirements before any future design is
  approved.
- Documentation links must point to canonical source files; generated payloads and historical
  snapshots do not become source-of-truth owners.

## 6. Test And Evidence Strategy

- Review the document against the nine approved PRD criteria and verify its claims against the
  linked canonical contracts and source files.
- Verify the relative link from `docs/architecture/README.md` and all internal links in the new
  document.
- No automated runtime tests, build, or host UAT are planned because this slice changes documentation
  only. Do not claim live-host support from this evidence.

## 7. Acceptance Traceability

| criterion_id | design_response | source_of_truth | design_decision_ids | compatibility_risk |
|---|---|---|---|---|
| AC-001 | A status legend and per-section labels distinguish implemented, decided, candidate, and open claims. | `docs/architecture/README.md`; normative owners in `plugin/meta/contracts/` | SDD-001 | `none — labels are explanatory and do not change current behavior` |
| AC-002 | The current-tools section names `agdf_dispatch` and `agdf_inspect` and links each exact owner. | `create-agdf/lib/skill-dispatch/contract.js`; `create-agdf/lib/control-inspect/contract.js` and `selection.js` | SDD-002 | `none — existing tools and schemas are unchanged` |
| AC-003 | A capability matrix gives purpose, binding, output, side effects, and failure notes for each candidate family. | Approved PRD; canonical services linked from each row | SDD-002 | `none — candidate matrix has no executable effect` |
| AC-004 | A boundary diagram or table maps host, human, MCP adapter, policy evaluator, and run-state owners without moving authority. | `plugin/meta/contracts/`; `control-evaluation/`; `control-state/`; `CG-MCP-DISPATCH-ADAPTER` | SDD-002 | `none — existing authority boundaries remain unchanged` |
| AC-005 | Conditional write discussion lists exact-state binding and host-verifiable deliberate action as prerequisites; no current write tool is claimed. | `plugin/meta/contracts/`; `create-agdf/lib/control-state/`; `create-agdf/lib/skill-dispatch/contract.js` | SDD-004 | `none — no state-changing operation is introduced; future write design remains a separate scope` |
| AC-006 | A comparison table shows candidate roles for Tools, Resources, and Prompts and labels every mapping provisional. | MCP capability discussion in the approved PRD; canonical current tool contracts for implemented facts | SDD-003 | `none — no new host primitive is registered or qualified` |
| AC-007 | A migration section keeps current tools stable until a separately approved scope updates canonical contracts, compatibility, and evidence. | `plugin/meta/contracts/`; `create-agdf/lib/skill-dispatch/contract.js`; `create-agdf/lib/control-inspect/contract.js` | SDD-001, SDD-004 | `none — the path is advisory; no migration occurs in this slice` |
| AC-008 | The overview receives one link and a clear non-normative description of the target document. | `docs/architecture/README.md`; this SD; the new document | SDD-001 | `none — additive documentation navigation only` |
| AC-009 | Scope is restricted to Markdown documentation and the overview link. | Approved PRD; canonical runtime and control owners | SDD-001 | `none — runtime, schema, policy, state, setup, and release are untouched` |

## 8. Risks And Open Questions

- Candidate capability groupings may be split or combined after consumer and host needs are examined.
- The target-to-run binding UX and interface must preserve explicit target authority without exposing
  arbitrary filesystem paths as a public contract.
- MCP Resources may have freshness and provenance limits; the document will label those as open
  unless the existing host/runtime evidence supports them.
- A future approval/write operation requires a host-verifiable human decision channel and canonical
  server-side enforcement; neither is designed or implemented here.
- The architecture overview is dated; the new document will cite the repository baseline actually
  inspected and distinguish it from released or live-host evidence.

## 9. Next Step

Review this solution design and approve only with:

`Approval: SD`

## AGDF Approval Summary (de; source=en)

- Lösung: Ein separates deutsches, nicht-normatives Zieldokument wird aus der aktuellen Architekturübersicht verlinkt. Es beschreibt den vorhandenen MCP-Stand, vier mögliche Fähigkeitenfamilien, Zuständigkeiten, MCP-Primitiven und einen bedingten Entwicklungspfad.
- Verantwortung: Runtime-Verträge, vorhandene Tool-Schemas, Gate-Auswertung und Run-Zustand behalten ihre bestehenden kanonischen Eigentümer. Der Mensch behält die Freigabehoheit; der Host besitzt Sichtbarkeit und Interaktion.
- Entscheidungen:
  - SDD-001: Zielbild bleibt in einem getrennten Vorschlagsdokument.
  - SDD-002: Fähigkeiten werden nach Nutzerabsicht und Autoritätsgrenze gruppiert.
  - SDD-003: Tools, Resources und Prompts bleiben diskutierte Möglichkeiten.
  - SDD-004: Zustandsänderungen bleiben an Voraussetzungen und eine separate Freigabe gebunden.
- Integration: Eine neue Markdown-Datei und ein Link; Server, CLI, Schemas, Generated Payloads und Runtime bleiben unverändert.
- Abnahmekriterien: Die Tabelle ordnet AC-001 bis AC-009 jeweils genau einer technischen Antwort, einer Quelle, einer Designentscheidung und einer Kompatibilitätsaussage zu.
- Offene Fragen: Die endgültige API-Gruppierung, Host-Unterstützung, Resource-Frische und ein host-verifizierbarer Freigabekanal benötigen spätere Evidenz und eine separate genehmigte Entscheidung.
