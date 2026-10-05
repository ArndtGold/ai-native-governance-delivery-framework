# UR: Controlled source revision after approved TP

Status: draft
Gate: UR
Gate approval: open
Requirements clarification: complete
Date: 2026-10-05
Owner: Arndt Gold
Run: late-source-revision-20261005-01
Language: en

## 1. Problem

A material requirement or design conflict may become apparent during implementation after
the Task Plan has been approved. AGDF currently supports reopening an approved PRD only at
the PRD-to-SD boundary before any downstream artifact is linked or approved. A valid sealed
run at CD+Tests has no supported route back to the source gate that must change.

The concrete trigger is sd-definition-separation-20261004-01. Its new dedicated design
author has a reviewed Copilot distribution cost of five files and 27,249 bytes. The proposed
baseline change conflicts with an unchanged-payload requirement already present in approved
UR and PRD, as well as SD and TP. The installed canonical run-revise operation rejects the
late revision with prd_revision_boundary_invalid. Editing only SD or changing the baseline
would leave the source requirement and its approval unresolved.

This forces a choice between abandoning an otherwise useful delivery or bypassing recorded
authority. Neither is an acceptable supported workflow. Integrity recovery for a damaged
run is a different operation and cannot substitute for revising a valid approved source.

## 2. Goal

Provide a supported, explicit source-revision path for an active, valid sealed run at
CD+Tests after approved TP. The maintainer can review the intended change and its impact,
return the same run to the earliest affected existing user gate, retain exact historical
content and approval evidence, and obtain fresh approval for revised sources and affected
downstream artifacts before implementation continues.

The outcome is a reusable governed revision capability, not approval of the specific payload
change and not a second same-scope run that evades the original requirement.

## 3. Affected Users

- Maintainers who must decide whether a late source change is justified and understand which
  existing approvals and results cease to authorize continuation.
- Delivery agents that encounter a confirmed requirement, product, design or planning
  conflict during implementation and need a supported route instead of manual control edits.
- Existing Core, CLI, dispatcher, contract and verification maintainers who own the common
  lifecycle and its supported consumer paths.

These are existing AGDF workflow roles; no new decision authority is introduced.

## 4. Scope

- Support explicit reopening of approved UR, PRD, SD or TP for a bound active run at CD+Tests
  after TP approval. Return to the earliest source gate whose approved meaning must change;
  never select a later gate merely because its artifact is easier to edit.
- Make the revision reason, intended source change, affected approvals, downstream artifacts,
  implementation evidence and next allowed step reviewable before the state transition.
  Inspection and impact preview remain read-only. Applying a revision requires explicit
  work intent for that exact target, run and current revision; discovery is not authorization.
- Supersede the changed source approval and dependent downstream approvals. Retain unaffected
  upstream approvals only when their exact source content and authority remain valid. Renew
  every affected existing gate approval through its current presentation and deliberate reply.
  Reopening grants no approval and no immediate implementation permission.
- Preserve exact historical approved artifact content, digests, approval/presentation provenance
  and source relationships. Old versions remain evidence of what was approved at the time,
  not current source or implementation authority. A changed source must never be silently
  resealed under its old approval.
- Mark affected downstream derivations, implementation and test/review evidence as requiring
  revalidation. Preserve existing work and observations as historical/reusable inputs without
  treating them as fresh completion evidence for the revised scope. Regenerate or revalidate
  through existing owners before the existing approved-TP implementation path resumes.
- Use the existing canonical state, lifecycle writers, source-binding registry and gate
  evaluators. Keep stale, foreign, invalid, ambiguous or concurrently changed bindings closed;
  interruptions and retries must not leave partial authority or duplicate effective revisions.
- Keep the existing early PRD-to-SD revision behavior compatible and make supported revision
  behavior consistent across canonical contracts, CLI, dispatcher and applicable MCP consumers
  and generated host distributions. This need does not preselect a new MCP write tool, skill,
  gate or command shape.
- Validate the capability with isolated run fixtures, including the actual UR-first conflict
  shape from the design-author delivery. Bind evidence to the tested candidate and distinguish
  source/package/protocol proof from installed runtime and fresh native-host observations.

## 5. Non-Goals

- Change the baseline or requirements of sd-definition-separation-20261004-01 in this run,
  transfer its approvals, or declare its blocked build or QA complete.
- Apply revision automatically to existing production runs, migrate unrelated runs, repair
  broken seals, delete existing implementation changes, or rewrite unrelated CI work.
- Extend the first capability beyond active CD+Tests into QA/UAT/OR, completed, released or
  historical runs; those lifecycle boundaries require separately justified scope.
- Add user gates, a parallel control store, separate acceptance authority, or a replacement
  workflow engine. Change existing exact gate-approval wording or semantics.
- Automatically approve regenerated artifacts, reuse an old reply for a new presentation,
  install plugins, perform Git actions or publish/release.

## 6. Acceptance Signals

1. A valid isolated active run with approved UR/PRD/SD/TP at CD+Tests can review and apply an
   explicitly requested source revision through a supported canonical lifecycle operation.
   It returns to the actual earliest affected gate and no implementation remains authorized
   by the superseded approvals.
2. A UR change supersedes UR and all dependent gate approvals; a PRD change preserves a valid
   unchanged UR but supersedes PRD and its dependents; SD and TP cases similarly preserve only
   unaffected approved upstream sources. Current routing and allowed actions agree with that
   effective authority.
3. Every superseded approval and artifact has durable exact-version history and remains
   attributable to its original target, run, content and presentation. Revised content cannot
   acquire an old approval, and historical source mappings do not masquerade as current ones.
4. Before renewed implementation, changed sources and affected downstream artifacts have
   passed existing readiness and fresh deliberate gate approval. Retained code, tests and
   reviews are assessed against the revised task scope and recorded as current only with
   sufficient revalidation.
5. Read-only inspection changes no run state. Wrong target/run, stale revision, missing or
   invalid integrity/source proof, unsupported lifecycle, ambiguous impact and concurrent
   edits are rejected without partial authority changes. Defined interruption/retry cases
   produce one recoverable valid state and no duplicate effective revision.
6. The original early PRD-to-SD revision path and unaffected delivery routes remain compatible.
   Supported CLI/dispatcher/protocol consumers agree on the same revision eligibility,
   impact and result, without another control authority.
7. The UR-first payload-conflict shape is exercised with synthetic fixture approvals and
   exact current-candidate evidence. The original design run and independent dirty CI/source
   paths remain unchanged by this delivery unless separately authorized through the newly
   validated mechanism after its own approvals.

PRD and TP must turn these signals into explicit acceptance criteria, boundary cases and
evidence. Fixtures and cooperative author attestations are not independent human approval
or fresh installed-host proof.

## 7. Existing Source Of Truth

- User direction in this chat: prepare the controlled payload revision, followed by “leg los”
  after the supported late-revision gap was reported.
- The sealed design-author run and its PAYLOAD_REVISION_PROPOSAL-01.md,
  PAYLOAD_REVIEW-01.json and PAYLOAD_REVISION_ATTEMPT-01.json: trigger and bounded evidence,
  not authority to change its approved requirements here.
- packages/core/lib/control-state/run-revision.js: current early PRD revision owner;
  existing control-state writer/seal, source-binding and presentation/approval owners.
- packages/core/lib/control-evaluation/ and packages/core/lib/skill-dispatch/:
  current eligibility, earliest-gate routing, source ownership and delivery continuation.
- plugins/agdf/meta/contracts/gate-transition.md, control-scaffold.md and focused author
  contracts; shared CLI transport and applicable packages/mcp-server consumers.
- .agdf/control/runs/late-source-revision-20261005-01/RUN_STATE.md: this canonical run state, with existing backlog
  projection and run-local artifacts/evidence.

## 8. Risks And Unknowns

Brownfield Review must establish the existing reusable transaction, audit/history, artifact
binding and consumer owners. PRD must define the impact boundary and observable handling
of retained implementation, analyses and evidence. SD must settle how exact prior bytes and
proofs survive artifact replacement, how active mappings are invalidated, and how locks,
interruption and replay stay coherent. This UR does not predetermine the storage or API design.

The working tree already contains design-author implementation and independent CI work.
Neither belongs to this revision capability; capture and preserve them before implementation.
No existing run approval can stand in for the approvals of this separate capability.

Existing instruction/context, integrity and performance guards remain effective. Distribution
growth, if necessary, must be measured and reviewed explicitly in this run's later artifacts
and recorded only as an exact final-candidate baseline with no spare headroom. This does not
grant advance permission for an unspecified payload increase or weaken a check to obtain green.

## 9. Next Step

Review this bound UR and decide with a new deliberate Approval: UR. Only that approval permits
the existing Brownfield Review and Mode/Slice Decision for this capability; PRD, SD, TP and
implementation remain subject to their own existing prerequisites and approvals. The design
run retains its current approved sources and payload conflict meanwhile.

## AGDF Approval Summary (de; source=en)

Ziel ist ein unterstützter Revisionsweg für einen aktiven AGDF-Lauf während Umsetzung und Tests
nach freigegebenem TP. Wenn sich UR, PRD, Design oder Taskplan fachlich ändern müssen, soll derselbe
Lauf zum frühesten betroffenen bestehenden Gate zurückkehren. Vorher werden Änderungsgrund,
betroffene Freigaben und Auswirkungen auf Artefakte und Nachweise sichtbar.

Die Änderung muss alte freigegebene Inhalte und ihre Nachweise exakt erhalten, betroffene
Freigaben nachvollziehbar ablösen und unveränderte vorgelagerte Freigaben bewahren. Geänderte
Quellen und abhängige Artefakte brauchen frische Prüfung und menschliche Freigabe. Bereits
erstellter Code und Tests bleiben erhalten, gelten aber erst nach belegter Neubewertung für
den geänderten Auftrag. Veraltete Antworten oder Revisionen dürfen nichts freigeben.

Die Abnahme verlangt einen überprüfbaren kanonischen Ablauf, passende Rückkehr für Änderungen
an UR, PRD, SD und TP, exakte Historie sowie sichere Ablehnung falscher, veralteter oder
konkurrierender Vorgänge. Abbruch und Wiederholung dürfen keinen teilweise freigegebenen Stand
hinterlassen. Bestehende frühe PRD-Revisionen und angrenzende Abläufe bleiben kompatibel.

Der erste Umfang endet bei aktiven Läufen während Umsetzung und Tests. Spätere QA-, UAT-,
Abschluss- oder veröffentlichte Zustände sind ausgeschlossen. Dieser Auftrag ändert noch
keine Paketgrenze und setzt den Design-Lauf nicht zurück. Seine Freigaben und die unabhängigen
CI-Änderungen werden nicht übernommen oder verändert. Die UR-Freigabe erlaubt zunächst
Brownfield Review und die Wahl des weiteren Vorgehens, noch keine Implementierung.
