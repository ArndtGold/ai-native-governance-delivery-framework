# UR: Compact documented approvals with truthful version links

Status: draft
Gate: UR
Gate approval: open
Requirements clarification: complete
Date: 2026-10-09
Owner: Arndt Gold
Run: cockpit-documented-approvals-20261009-01
Language: en

## 1. Problem

The user supplied an actual Cockpit screenshot and a concrete proposed replacement, then requested implementation. The expanded stored-approvals section uses a tall block per document, repeating a status, document action and disclosure. Four approvals consume substantial reading/scrolling space. The proposed compact overview separates document, recorded approval evidence and document version, keeping details behind an explicit disclosure.

Current WorkStep.tsx renders evaluation.approvals with status approved and opens the selected Run's registered gate resource through onOpen. The current DTO provides gate, status and evidence text. Neither that UI row nor the existing generic resource action establishes that the opened bytes are the exact approved version. A link labelled approved version must not imply version identity from a current file path or the presence of an approval record alone. Similarly, evidence text must not be promoted to independently verified approver identity.

The preceding backlog-status-flow-clarity Run addresses saved phase, outstanding work and revision/source comparison; its approved scope and QA presentation are not authorization for this new approvals-specific layout and version-link behaviour. The adjacent active-list and embedded-Cockpit Runs provide reusable reading/UI owners, not this product requirement.

## 2. Goal

The user can scan documented approvals in a compact, comparable overview, open the stored evidence on demand and understand which document version a link actually opens. The existing read-only Cockpit remains the surface; canonical Core approval/read sources retain authority.

## Affected Users

The repository owner and agents inspecting documented approvals in the existing compact and expanded Cockpit. No new user population or host is introduced.

## 3. Scope

- Replace the tall approvals presentation with a compact section labelled Dokumentierte Freigaben and its actual recorded count. At a sufficiently wide reading width use the proposed columns Dokument, Freigabenachweis and document version. At narrow widths retain the same information and actions in readable per-document rows, without horizontal overflow or compressed controls.
- State once that evidence refers to the recorded approved version and that the current control evaluation determines current state. Do not confuse historical evidence with permission to continue work now.
- Show one row per documented approval, including any supported later gate when recorded; do not hardcode four approvals or create approvals for missing gates. Use readable existing document names.
- Offer an explicit evidence disclosure (for example Dokumentiert) in the row. Reveal the stored version/date/approval/source/scope fields only where the existing canonical evidence supports them; retain original evidence and show unavailable information honestly. Display an approver identity only if actually supported by the evidence, without implying independent identity verification.
- A link labelled Freigegebene Fassung ansehen must open a readable source demonstrably bound to that recorded approval's exact version. Reuse existing receipt, revision, digest and registered-read owners to establish the match where supported. If that exact approved source is unavailable or unconfirmed, identify the limitation; an available current document link must be labelled Aktuelle Fassung ansehen. Do not hide disagreement or present the current file as a recovered historical version.
- Preserve existing document open/close, selection, source/freshness guards and disabled/expired states. Evidence disclosure and document reading remain keyboard accessible and read-only; preserve focus and list/scroll behaviour.
- Keep changes confined to this approvals presentation and any smallest necessary canonical descriptive read projection. Review existing owners and version-evidence availability before choosing representation or implementing; do not invent a second approval evaluator, prose authority or archive.

## 4. Non-Goals

No approval writer or approval by click; no new gate, altered QA/human approval semantics, signature or independent identity proof. No new approval archive/storage service or automatic reconstruction of missing historical documents. No redesign of backlog phases/search, global dashboard, bulk Run migration, other Run's findings or approved sources. No new host, public publication, deployment, Git commit/push/PR or global plugin/configuration changes authorized by this UR. Any actual installed-host claim uses explicit supported current observation and separately authorized operational prerequisites.

## 5. Acceptance Signals

1. The approvals section is a compact, scan-friendly overview matching the proposed information hierarchy, with the real recorded count and one comparable row per approval. Document, evidence and version action are distinct.
2. Details appear only on deliberate disclosure. Available provenance fields and original evidence are inspectable; missing date/version/identity/source remains explicit rather than fabricated. Current control evaluation and recorded historical approval are understandable as separate statements.
3. Every approved-version action demonstrably opens the version bound to its approval. Current-only or uncertain sources use current-version wording and explain why the approved version is unavailable/unconfirmed. A moved or changed source never silently inherits an approved-version label.
4. The same information and actions are usable at narrow/wide widths through the existing Cockpit surfaces. Keyboard disclosure/open/close, readable long names/evidence, focus restoration and disabled/stale handling are verified with meaningful visible evidence.
5. Reading or expanding these rows does not mutate control, approve gates or switch an unrelated Run. Existing selected-target/Run/source/freshness checks and other Cockpit areas retain their behaviour.
6. Relevant source/version cases, presentation and regression checks are recorded with their actual proof boundaries. Automated/browser/source results are distinguished from any fresh supported native-host observation. Earlier backlog QA and foreign approvals/findings are unchanged by this scope.

## 6. Existing Source Of Truth

The user's two supplied Ist/Soll screenshots and explicit fix request define the intended layout and truthfulness. packages/control-ui/src/WorkStep.tsx owns the current approvals section and resource action; documentName/presentation.ts, existing style sheets and document readers supply reusable presentation/navigation. packages/control-ui/src/types.ts currently describes approval rows as gate/status/evidence. packages/core/lib/control-inspect/cockpit.js projects canonical control approvals and registered resources. Existing control-state approval receipts, presentations, seals and revision readers and the scoped control-read services are the candidate authority for exact version identity; their actual available contract and readable historical source must be established by Brownfield Review. Canonical Run state/registered artefacts and normative AGDF contracts remain authoritative. docs/architecture/06-agdf-cockpit.md describes existing read-only ownership. The prior three Cockpit Runs are adjacent context, not transferred approval authority.

## 7. Risks And Unknowns

A current registered document can differ from the approved source; stored evidence may expose only partial digest or unstructured original text. Brownfield Review must establish which existing verified source facts and historical read capabilities are available. Absence is an accepted explicit limitation, not permission to build a new archive. Product intent and fallback wording are resolved here; PRD/SD refine the bounded behaviour/contract if required by routing. Dense columns must not compromise narrow-width reading, keyboard actions or disclosure semantics. The checkout contains other changes; protect existing implementation, approved sources and unrelated Runs and verify only the scoped increment. Earlier local installation evidence does not become proof that this future UI is installed or rendered.

## 8. Next Step

Review this concrete UR and provide a new deliberate Approval: UR. Then perform the existing Brownfield Review/Mode Slice decision, choose the smallest justified route and satisfy its implementation prerequisites. No earlier UR/PRD/SD/TP/QA response approves this new scope.

## AGDF Approval Summary (de; source=en)

- Problem und Ziel: Die vier dokumentierten Freigaben nehmen heute viel Platz ein. Dein Soll-Vorschlag wird als kompakte, vergleichbare Übersicht umgesetzt: Dokument, Freigabenachweis und tatsächlich verfügbare Dokumentfassung; Einzelheiten erst beim Aufklappen. Betroffen sind Nutzer und Agenten des bestehenden Cockpits.
- Darstellung: Dokumentierte Freigaben mit tatsächlicher Anzahl; breite Ansicht als kurze Tabelle, schmale Ansicht als lesbare Zeilen mit denselben Angaben und Aktionen. Spätere dokumentierte Gates werden ebenso berücksichtigt; vier Einträge werden nicht fest einprogrammiert. Ein gemeinsamer Hinweis erklärt den Bezug zur damaligen Fassung und zur heutigen Kontrollauswertung.
- Nachweis und Links: Vorhandene Fassung, Zeitpunkt, Freigabe, Grundlage und belegte Identität bleiben einsehbar; fehlende Angaben werden ausdrücklich benannt. Freigegebene Fassung ansehen öffnet nur eine nachweislich passende Version. Ist nur die heutige Datei verfügbar, heißt der Link Aktuelle Fassung ansehen und die fehlende oder unbestätigte freigegebene Fassung bleibt erkennbar.
- Abnahme: Kompakte Übersicht, zutreffende Versionslinks einschließlich geänderter/fehlender Quellen, verständliche aufgeklappte Angaben und schmale/breite Tastaturbedienung mit stabilem Fokus. Lesen und Aufklappen schreiben keinen Kontrollzustand. Quellen-/Browser-/Testnachweise und gegebenenfalls frische native Darstellung werden getrennt benannt.
- Grenzen und Verantwortliche: Bestehende UI-, Core-, Freigabe- und Lesedienste bleiben zuständig. Keine neue Freigabehoheit, Identitätsbehauptung, Archivablage, automatische Zustimmung, Massenmigration, fremde Finding-Schließung oder Git-/Veröffentlichungsaktion. Die vorangegangene Backlog-QA bleibt davon getrennt.
- Risiken: Die vorhandenen Freigabenachweise und Lesedienste müssen eine exakte historische Fassung tatsächlich belegen und öffnen können; sonst gilt die ausdrückliche aktuelle-Fassung-Alternative. Brownfield Review prüft diese Wiederverwendung und wählt die kleinste passende Route vor Umsetzung.
- Nächster Schritt und Freigabegrund: Für den neuen Umfang verlangt der Skill [gate-check](/Users/arndtgold/.codex/plugins/cache/agdf/agdf/0.14.5+codex.local-a1f9519ca2ce/skills/gate-check/SKILL.md) ausdrücklich „new scope needs durable UR approval“. Deshalb ist zuerst eine neue bewusste Approval: UR für diesen konkreten Entwurf erforderlich. Danach folgen Brownfield Review und die passend gerouteten Umsetzungsschritte; der UI-Code ist noch nicht geändert.
