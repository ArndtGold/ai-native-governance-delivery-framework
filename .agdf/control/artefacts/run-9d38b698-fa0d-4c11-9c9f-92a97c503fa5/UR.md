# UR: Parallel delivery without central backlog conflicts

Status: draft
Gate: UR
Gate approval: open
Requirements clarification: complete
Preview requirement: none
Date: 2026-10-31
Owner: Arndt Gold
Run: run-9d38b698-fa0d-4c11-9c9f-92a97c503fa5
Language: en

## 1. Problem

Independent AGDF Runs repeatedly change the same versioned MASTER_BACKLOG.md, producing merge conflicts between otherwise unrelated changes. The user reports this recurring cost. Run state, registered artefacts and recorded approvals already belong to individual Runs; the seals detect changes to their recorded basis but do not establish completion or prevent Git conflicts.

The current Cockpit can directly open and evaluate a named Run without backlog membership. Its overview still obtains membership, sections and saved facts from MASTER_BACKLOG.md. Replacing only this reader would leave normal control writers updating the shared backlog and would not remove the reported cause. Worktree placement also lacks the requested common convention.

## 2. Goal

Users and agents can find and continue AGDF work from authoritative Run records, while independent delivery no longer requires maintaining a shared backlog file. New worktrees used for AGDF delivery follow one project-local location under .agdf/worktrees/. Deliver both outcomes within this one Run without disturbing the currently running CI repair.

## Affected Users

Repository maintainers, agents working on independent changes, and users of the existing expanded and compact Cockpit views who need a reliable overview and deliberate navigation to a specific Run.

## 3. Scope

- Replace the Master Backlog as the source of Cockpit overview membership and Run orientation with the existing canonical Run store and Core read/evaluation owners. Apply the same meaning to compact and expanded views and their HTTP/MCP adapters. Preserve current direct Run/document navigation and read-only authority.
- Derive Run lifecycle, phase, concrete open work, next allowed action and source provenance from their authoritative owners. Keep stored facts, current evaluation, missing evidence and integrity observations distinguishable; a valid seal is not completion or approval.
- End mandatory MASTER_BACKLOG.md maintenance in the ordinary Run lifecycle, including applicable creation, recording, approval and closeout paths. Adapt dependent validation, initialization, templates, contracts and documentation coherently so an absent, stale or conflicted legacy backlog does not become a substitute control authority or block otherwise valid Run work. Preserve Run locking, revisions, receipts, source bindings, recovery and approvals.
- Account explicitly for existing planned ideas without Runs and historical backlog-only entries. Preserve their information and traceability through a bounded compatibility/transition policy; do not silently discard them, fabricate Runs or transfer approvals. Detailed representation and any necessary human transition decisions belong to Brownfield Review and PRD/SD. No new mandatory shared planning file may recreate the same per-Run write contention.
- Define the normative placement rule for new AGDF delivery worktrees: .agdf/worktrees/INITIATIVE/ under the owning project root, with the container ignored by the parent checkout. One coherent initiative uses its assigned worktree; one writer continues its Run there. Reuse an already assigned worktree instead of recursively creating nested worktrees. Explain project ownership versus checkout-local execution and how explicitly chosen exceptions are handled; location itself grants no authority.
- Document the rule in the existing canonical instruction/documentation owners and affected projections. Existing worktrees may remain where they are; this Run does not relocate or clean them. Automatic worktree creation, switching and cleanup are outside this first scope.
- Execute this change in the already created isolated branch agdf/run-overview-worktree-convention, rooted at .agdf/worktrees/run-overview-worktree-convention, from main commit 8e57078d2a7cbe0f8c071d1c27eac8e0c0a14f52. Preserve other worktrees, branches, staged files and ongoing processes. In particular, do not modify the concurrent CI repair, its compatibility evidence, baseline changes or workflows. Select checks proportionate to each stage and avoid unnecessary competing full suites. Reconcile integration with the completed CI fix later; do not overwrite its results.

## 4. Non-Goals

No new gate order, automatic approval, transferred approval or weakened integrity controls. No new host integration, dashboard redesign or independent status evaluator. No shared symlinked control store, separate governance repository/branch or automatic aggregation across all worktrees. No worktree orchestration service or claim that placement alone enforces cross-checkout mutual exclusion. No blanket promise to eliminate all Git conflicts. No fixing CI, changing its baselines, moving existing worktrees, deleting historical records, committing, pushing, merging or releasing without separately applicable authority. No required preview was requested.

## 5. Acceptance Signals

1. With valid Runs and no MASTER_BACKLOG.md, the existing compact and expanded Cockpit views list the actual relevant Runs and can deliberately open each selected Run. New Runs become discoverable without creating backlog rows. Lifecycle, displayed orientation and source provenance agree across both views for the same observation.
2. Missing, malformed, unsealed or changed Run sources, stale observations, incomplete inventory and read limits produce explicit diagnostics/coverage rather than fabricated completion, silent omissions or selection of another Run. Search, counts, order and grouping have a declared deterministic contract. Reading writes no canonical state and remains bounded to the existing permitted sources.
3. Representative normal creation, recording, gate approval, internal continuation and closeout flows work without mandatory backlog synchronization. Tests of two independent Run changes show no required writes to a common MASTER_BACKLOG.md. Existing revision, approval, transaction and recovery guarantees remain effective; an unrelated legacy backlog defect does not veto a valid Run operation.
4. Existing planned and historical backlog-only information remains inspectable or has an explicit, documented transition result. Tests cover legacy and fresh projects. Transition never manufactures historical evidence or silently migrates/abandons another Run.
5. Canonical guidance and affected generated/project surfaces consistently state .agdf/worktrees/INITIATIVE/ for new AGDF delivery worktrees. The parent ignores their contents, existing worktrees remain usable, and instructions distinguish one assigned writer/Run from unenforced cross-checkout locking. An already assigned worktree is reused without recursive nesting. Rule checks use disposable fixtures rather than mutate other live worktrees.
6. The implementation diff and recorded evidence demonstrate that the concurrent CI-fix worktree, its index, files, branch and processes were not changed by this Run. No shared baseline is regenerated merely to conceal unrelated failures. Integration/testing distinguishes this change's evidence from the independent CI repair and from native-host observations.
7. Tests, readable narrow/wide UI verification and documentation substantiate the changed behavior. Existing automated, protocol, browser and actual native-host evidence retain their distinct qualification limits. Any required native-host action that would alter the concurrent setup is deferred explicitly rather than inferred or performed silently.

## 6. Existing Source Of Truth

- The user's request combines Cockpit Run discovery, ending central backlog conflict pressure and the worktree placement rule in one Run, with an explicit requirement not to interfere with the current CI fix.
- .agdf/control/runs/RUN_ID/RUN_STATE.md and registered artefacts own each Run's control state and evidence. packages/core/lib/control-state/run-state-reader.js owns Run discovery; run-seal.js and run-seal-compute.js own integrity checks.
- packages/core/lib/control-inspect/cockpit.js owns scoped reads and selected-Run evaluation; cockpit-backlog.js and cockpit-list.js currently own backlog projection/list policy. packages/core/lib/control-read/ owns read boundaries. Existing HTTP/MCP mediation and packages/control-ui/src/Overview.tsx, BacklogRows.tsx and mcp/CompactCockpit.tsx own presentation/transport.
- packages/core/lib/control-state/run-backlog.js, run-backlog-writer.js and run-step-transaction.js participate in current backlog writes. Applicable command, initialization, evaluation and closeout dependencies must be inventoried before redesign. Reuse existing Run policy and summary ownership.
- plugins/agdf/meta/contracts/, canonical skills/templates, existing handbook and docs/architecture/06-agdf-cockpit.md own relevant rules and documentation. Brownfield Review must identify their exact projections and validators. .gitignore currently has no worktree-container rule; a local ignored container was created solely to isolate this Run.
- The earlier cockpit-active-backlog-core-ui and backlog-status-flow-clarity URs define adjacent backlog-based behavior; they are compatibility and reuse evidence, not approval for replacing that design. Their Run records remain untouched.

## 7. Risks And Unknowns

Brownfield Review must inventory every normal writer, required-file check, command and reader that assumes a backlog, plus migration and compatibility expectations. PRD/SD must settle bounded inventory/search, grouping/order, partial results, source freshness, useful titles and planned/historical-only information. A naive full gate evaluation of every Run may exceed existing read limits; use the existing Core owners without creating a second rule system or an unbounded dashboard scan.

Worktree paths create distinct checkout-local target identities. The convention must not imply portable live commands or cross-checkout locks. Worktree-contained tracked files and untracked Run evidence have different handoff behavior; seals do not back up untracked files. The current CI fix may change the later integration baseline, so recheck the exact finished baseline before integration and retain this Run's evidence limits. These are downstream design/integration decisions, not missing user intent.

## 8. Next Step

Present this concrete, unapproved UR for a new deliberate Approval: UR. After approval, perform the existing Brownfield Review and Mode/Slice routing, followed by applicable UX/product/design/task planning and implementation gates. Do not treat the instruction to start as approval of this newly authored document. Keep all work isolated from the concurrent CI fix.

## AGDF Approval Summary (de; source=en)

- Problem: Unabhängige Runs schreiben dieselbe versionierte Masterbacklog-Datei und verursachen dadurch wiederholt Mergekonflikte. Das Cockpit kann einzelne Runs bereits direkt öffnen; seine Übersicht hängt noch am Backlog. Ziel sind eine Übersicht aus den maßgeblichen Run-Daten und unabhängige Run-Arbeit ohne verpflichtende Pflege dieser Sammeldatei. Betroffen sind Maintainer, ausführende Agenten und Nutzer beider Cockpit-Ansichten.

- Ziel: Runs bilden die maßgebliche Cockpit-Übersicht; unabhängige Vorhaben benötigen keine verpflichtende gemeinsame Backlog-Pflege. Neue AGDF-Arbeits-Worktrees liegen unter .agdf/worktrees/. Beide Änderungen gehören zu diesem einen Run.

- Umfang: Kompakte und große Übersicht verwenden den Run-Bestand und bestehende Core-Verantwortlichkeiten. Run-Phase, konkrete Restarbeit, nächster erlaubter Schritt und Herkunft bleiben nachvollziehbar; Siegel, fachliche Fertigstellung und Freigabe bleiben getrennt. Auch die verpflichtenden Backlog-Schreibzugriffe und abhängigen Prüfungen, Initialisierung, Vorlagen und Regeln werden abgelöst. Eine reine Änderung der Anzeige genügt nicht. Geplante Ideen ohne Run sowie historische reine Backlog-Einträge erhalten eine ausdrückliche, informationsbewahrende Übergangsregel. Die genaue Darstellung entscheidet die folgende Produkt-/Designarbeit; historische Freigaben werden nicht erfunden.

- Worktree-Regel: Neue AGDF-Arbeits-Worktrees liegen unter `.agdf/worktrees/VORHABEN/` des zugehörigen Projekts. Der übergeordnete Checkout ignoriert diesen Ordner. Ein Vorhaben verwendet seinen zugeordneten Worktree; derselbe Run hat einen zuständigen Schreiber. Bereits zugeordnete Worktrees werden wiederverwendet statt rekursiv verschachtelt. Bestehende Worktrees bleiben an ihrem Ort. Die Regel wird in den kanonischen Vorgaben und betroffenen Projektionen konsistent dokumentiert. Automatisches Anlegen, Wechseln und Aufräumen gehört nicht dazu; die Platzierung ersetzt keine technische Sperre zwischen Checkouts.

- Schutz des CI-Fixes: Dieser Run arbeitet auf dem eigenen Branch `agdf/run-overview-worktree-convention` im gleichnamigen Worktree unter `.agdf/worktrees/`, ausgehend von `main` bei `8e57078d`. Fremde Worktrees, Branches, vorgemerkte Dateien und laufende Prozesse bleiben unangetastet. Insbesondere werden die parallele CI-Reparatur, ihre Kompatibilitätsnachweise, Baselines und Workflows nicht geändert. Prüfungen bleiben stufengerecht; unnötige konkurrierende Volltests entfallen. Der fertige CI-Fix wird bei der späteren Integration berücksichtigt.

- Abnahme: Beide Ansichten finden und öffnen Runs auch ohne Masterbacklog. Neue Runs brauchen keinen Backlog-Eintrag. Fehlende, ungültige, veränderte oder veraltete Quellen und Teilbestände bleiben sichtbar begrenzt; Suche, Zähler, Sortierung und Gruppierung haben einen eindeutigen Vertrag. Normale Run-Erstellung, Erfassung, Freigabe, interne Fortsetzung und Abschluss funktionieren ohne verpflichtende Backlog-Aktualisierung. Zwei unabhängige Runs benötigen keine Schreibzugriffe auf diese gemeinsame Datei. Sperren, Revisionen, Freigaben und Recovery bleiben wirksam. Alte Planungs-/Historieninformationen bleiben zugänglich oder erhalten einen dokumentierten Übergang. Worktree-Regel und Ignore-Verhalten werden konsistent geprüft; fremde Arbeitsstände bleiben erhalten. Tests, lesbare schmale/breite Darstellung und Dokumentation belegen das Ergebnis. Automatisierte, Protokoll-, Browser- und echte Hostnachweise werden getrennt ausgewiesen.

- Grenzen und Quellen: Keine neuen Gates, automatische Freigaben, zweite Statushoheit, neue Hostintegration, umfassende Neugestaltung oder gemeinsame verlinkte Kontrollablage. Kein Worktree-Verwaltungsdienst, Verschieben alter Worktrees, Löschen historischer Daten oder Versprechen, sämtliche Git-Konflikte zu verhindern. Kein Commit, Push, Merge oder Release durch diese UR. Maßgeblich bleiben Run-State, registrierte Artefakte und bestehende Core-Owner; die heutigen Backlog-Schreiber und Verbraucher sind gezielt umzustellen. Frühere Backlog-URs liefern Abgrenzung und Wiederverwendung, keine übertragene Freigabe.

- Risiken und nächster Schritt: Brownfield Review ermittelt sämtliche Abhängigkeiten von Backlog-Datei und Schreibtransaktionen. PRD/SD klären begrenztes Laden, Aktualität, sinnvolle Titel, Bereichsbildung und Altinformationen. Unterschiedliche Checkout-Pfade bleiben unterschiedliche Ausführungsziele; Siegel sichern keine unversionierten Dateien. Vor Integration wird der dann fertige CI-Stand erneut berücksichtigt. Jetzt diese UR prüfen und mit einer neuen bewussten `Approval: UR` freigeben, überarbeiten lassen oder ablehnen. Danach folgen die bestehenden Analyse- und Planungsschritte; Produktcode wird erst nach den erforderlichen Freigaben geändert.
