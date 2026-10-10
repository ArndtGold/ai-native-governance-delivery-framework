# UR: Compact documented approvals with truthful version links

Status: draft
Gate: UR
Gate approval: open
Requirements clarification: complete
Date: 2026-10-10
Owner: Arndt Gold
Run: cockpit-documented-approvals-20261009-01
Language: en

## 1. Problem

The existing stored-approval blocks occupy too much space and require users to interpret separate status, evidence and document actions. The initial compact proposal still used inline expanding evidence rows. In the subsequent discussion the user simplified the intended outcome: two columns, one document entry with an understandable state, and one action opening its document in the large reading view. There is no separate approval-evidence action or expanding entry.

The user also requested a visible indication when a draft check identifies problems. A draft that has not been checked, a checked draft awaiting approval, an unavailable check and a draft requiring revision must not look identical. A passed authoring check is not a human gate approval or final QA.

Existing MCP readers already supply registered documents, stored artefact states, gate approvals and Core control evaluation. They do not yet expose an explicit per-document confirmation that the actual readable bytes match the approved version. Approval wording must follow canonical source identity, not an approval flag, filename or document prose alone.

## 2. Goal

The user can scan the selected undertaking's documents, understand the evidenced state of each available version and open that document with one clearly named action. Concrete draft problems are visible before opening; their details and supported approval information are understandable inside the large document reading view. The Core owns the meaning and checks; the App presents those results.

## Affected Users

The repository owner and agents reading documents of the selected undertaking in the existing compact and expanded AGDF Cockpit. No new host or user population.

## 3. Scope

- Replace the tall approval blocks with a compact document overview containing two semantic columns: document with icon and short state text, and a document-reading action. At narrow widths retain equivalent readable rows and usable controls. No inline expanding document/approval entries and no separate Freigabe ansehen link.
- Include the selected Run's actually registered supported gate documents, including drafts and any supported later document types. Do not hardcode four approvals, fabricate missing documents or present approval records without readable documents as working document links. Explicitly explain unavailable documents where relevant. The section name/count must describe its actual contents rather than counting drafts as approvals.
- Use evidenced states: Freigegeben only when the readable version is canonically confirmed as approved; Entwurf for an unapproved document with no applicable completed check; Entwurf geprüft for a matching passed authoring check while approval is still pending; Überarbeitung nötig for a matching check with concrete authoring defects; Prüfung nicht verfügbar for an unavailable/inconclusive check. Icons accompany text and accessible names; color or an icon alone is insufficient.
- Show a documented earlier approval separately from uncertainty about the current file when needed: Freigabe dieser Fassung nicht bestätigt. A failed source-integrity check, missing approved-version identity, busy read service or transport error must not fabricate draft defects, erase a historical approval or turn an approved document into an unapproved draft merely to simplify its label.
- Use truthful contextual actions: Entwurf ansehen for an evidenced draft, Freigegebenes Dokument/Lösungskonzept/Taskplan ansehen only for the canonically confirmed approved readable version, otherwise Aktuelle Fassung ansehen. The exact document type may be named using existing readable labels. Missing/blocked sources have explicit unavailable feedback rather than working links.
- Open the selected registered document through the existing large reading experience, preserving close/back, initiating-action focus, selection, source/freshness guards, retry and expired/disabled behaviour. Compact-card activation uses the existing supported expansion/read path rather than a new host surface.
- Within document reading, show the corresponding evidence-bounded state, concrete applicable check findings and available documented approval information in understandable language. Keep original stored approval text available there without a separate approval-navigation target. Explain missing version/time/person/basis fields honestly; no guessed identity, signature or historical-version claim.
- Derive document state and approved-byte correspondence through existing canonical Core owners and expose the smallest necessary descriptive read result through the existing MCP/read path where a field is missing. Reuse artifact-readiness and approval/source-integrity owners; no App-side approval evaluator, internal-function signature discovery as a product dependency, new parallel validator or prose authority.
- A stored authoring-check result is applicable only to the exact target, Run, document/source digest and relevant revision it checked. A changed source or invalidated check loses the checked/defective claim until an applicable fresh result exists. Merely rendering or opening the list does not approve a document, write control or silently trigger a bulk checking workflow. Preserve existing deliberate Entwurf prüfen and recovery behaviour.
- Keep the increment limited to this document-state/reading presentation and necessary canonical descriptive projection. Protect unrelated Runs, approved historical sources, surrounding draft-check and backlog behaviours. Continue recording code-discovery/direct-Core-call MCP candidates without implicitly implementing those candidates.

## 4. Non-Goals

No approval by click, approval writer, new gate, altered human approval or QA semantics. No new archive, historical reconstruction, signature, independent identity proof, automatic document certification or parallel status authority. No global backlog/dashboard redesign, bulk control migration, automatic check of every document, new host, package installation/configuration change, deployment, publication or Git commit/push/PR. No transfer of previous Run approvals or native-host observations.

## 5. Acceptance Signals

1. The overview has two comparable columns, one understandable document/state entry and one reading action; narrow/wide layouts, zero/four/additional available documents and long names remain usable without expanding entries or a separate approval link.
2. Icons and short text distinguish evidenced approval, unchecked draft, checked draft pending approval, concrete authoring defects and unavailable checks. Missing/inconclusive/technical failure is never labelled as a defective draft; passed authoring checks never imply human approval or QA pass.
3. A released/approved-document label opens exactly the version confirmed by canonical approval/source identity. Unconfirmed or changed current bytes use current-version wording and explain the limitation. Drafts use draft wording only when that status is evidenced.
4. The document opens in the existing large reading view. Supported original approval information and applicable concrete check findings are understandable there; missing provenance remains explicit. Close/back and contextual keyboard focus return work in compact and expanded surfaces.
5. State and source identity come from the existing Core/MCP read/check authority, tied to target/Run/source/revision. Stale checks lose applicability; disabled/missing/expired reading and explicit retry follow existing owners. Reading does not mutate control, approve gates, switch another Run or silently bulk-check documents.
6. Relevant state/version/failure cases and surrounding navigation/draft-check regressions have meaningful visible and automated evidence. Test/browser/source observations remain distinct from fresh native-host evidence; foreign artefacts and previously archived approvals remain unchanged.

## 6. Existing Source Of Truth

The user's Ist/Soll screenshots, request to implement and subsequent answered discussion establish the revised two-column intent. packages/control-ui/src/WorkStep.tsx and the in-progress DocumentedApprovals.tsx own the selected undertaking presentation. Existing App/document readers, contextual focus callbacks and presentation labels are reuse candidates. packages/core/lib/control-inspect/cockpit.js currently projects evaluation.approvals, persisted.artefacts and registered resources; agdf_cockpit_read operations run/document read them. artifact_readiness and agdf_inspect artifact-readiness expose canonical authoring checks, not approvals. Existing canonical approval receipts, presentations, artefact bindings, seals and source-integrity readers own approval/version correspondence. Brownfield Review must verify the smallest projection and check-result applicability boundary instead of relying on App inference. docs/architecture/06-agdf-cockpit.md describes the read-only architecture.

## 7. Risks And Unknowns

The existing run-reader DTO has no explicit per-resource approved-byte confirmation. The current draft-check descriptor is bound to the selected current gate, not an implicit already-performed check for all documents. Brownfield Review and UX analysis must establish exact owner reuse and what findings/state can be exposed without creating competing authority. These are bounded design questions, not uncertainty about the requested outcome. Missing proof is an explicit accepted state. Prior inline-layout work and tests are retained as historical work in progress and must be reassessed against renewed approved sources; they do not fulfill this revised need. Native installation or fresh host proof is not implied by browser evidence.

## 8. Next Step

Present this revised UR and obtain a new deliberate Approval: UR. Reassess Brownfield Review/Mode Slice and UX intent, then draft/approve the required dependent PRD, SD and TP before implementation. No previous response approves this revised document-state/reading behaviour.

## AGDF Approval Summary (de; source=en)

- Problem und Ziel: Die Dokumentübersicht soll einfacher werden. Zwei Spalten zeigen das Dokument mit verständlichem Status und genau eine Aktion zum Öffnen. Betroffen sind Nutzer und Agenten im vorhandenen Cockpit; die große Dokumentansicht erklärt Prüfergebnisse und vorhandene Freigabeangaben.
- Darstellung: Keine aufklappbaren Einträge und kein eigener Link Freigabe ansehen. Entwürfe und freigegebene Dokumente erscheinen als kompakte, vergleichbare Zeilen. Anzahl und Überschrift beziehen sich auf die tatsächlich dargestellten Dokumente; schmale und breite Ansichten behalten dieselben Informationen.
- Status: Icon plus Text kennzeichnen Freigegeben, Entwurf, Entwurf geprüft, Überarbeitung nötig und Prüfung nicht verfügbar. Entwurf geprüft bedeutet eine passende bestandene Entwurfsprüfung bei noch ausstehender Freigabe. Überarbeitung nötig setzt konkrete Prüfmängel voraus; eine fehlende Prüfung oder ein technischer Fehler zählt nicht als mangelhafter Entwurf. Eine frühere Freigabe wird bei unbestätigter heutiger Fassung als solche erkennbar gehalten.
- Lesen und Nachweise: Entwurf ansehen öffnet einen belegten Entwurf. Freigegebenes Dokument, Lösungskonzept oder Taskplan ansehen ist nur bei bestätigter Zuordnung der geöffneten Fassung erlaubt. Sonst heißt die Aktion Aktuelle Fassung ansehen mit dem Hinweis Freigabe dieser Fassung nicht bestätigt. Die große Leseansicht enthält passende Prüfhinweise und vorhandenen ursprünglichen Freigabetext; fehlende Fassung, Zeit oder Identität werden nicht erfunden.
- Abnahme: Zwei kompakte Spalten, zutreffende Status-/Versionsfälle einschließlich fehlender oder geänderter Quellen, verständliche Prüfmängel, schmale/breite Tastaturbedienung und Rückkehr zum auslösenden Link. Veraltete Prüfergebnisse gelten nicht für neue Dokumentbytes. Lesen schreibt keinen Kontrollzustand, bestätigt kein Gate und startet keine Sammelprüfung. Automatische/Browser-Nachweise und native Beobachtung bleiben getrennt.
- Zuständigkeit und Grenzen: Core und vorhandene MCP-Lese-/Prüffunktionen bestimmen den Zustand; die App zeigt ihn an. Eine fehlende ausdrückliche Bestätigung der freigegebenen Dokumentbytes wird über die kleinste notwendige kanonische Leseprojektion behandelt. Keine neue Freigabehoheit, parallele Auswertung, Archivablage, Massenmigration, Installation, Veröffentlichung oder Git-Aktion; andere Runs und frühere Nachweise bleiben geschützt.
- Risiken und nächster Schritt: Der aktuelle Leser bestätigt noch nicht ausdrücklich die freigegebenen Bytes pro Dokument und prüft nicht automatisch sämtliche Entwürfe. Brownfield Review und UX klären die vorhandenen Eigentümer und passenden Zustandsgrenzen. Danach werden PRD, SD und TP erneuert; Umsetzung folgt erst nach deren erforderlichen Freigaben.
- Freigabegrund: Die Bedienung und der Umfang wurden gegenüber der früheren UR geändert. Der Skill [ur-definition](/Users/arndtgold/.codex/plugins/cache/agdf/agdf/0.14.5+codex.local-f073a31fcaa1/skills/ur-definition/SKILL.md) verlangt „use its fresh presentation and wait“. Sein geladener UR-Vertrag verlangt eine neue bewusste Approval: UR für den geänderten Entwurf. Die alten Freigaben sind archivierte Historie und gelten nicht für diese neue Fassung.
