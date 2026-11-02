# UR: Fix four AGDF approval-chain defects found in the MCP ergonomics run

Status: draft
Gate: UR
Gate approval: open
Requirements clarification: complete
Date: 2026-10-17
Owner: Arndt Gold

## 1. Problem

While closing run `mcp-ergonomics-baseline-20261016-01` on 2026-10-16/17, four AGDF core defects surfaced. That run is completed separately; its artefacts, approvals and receipts remain historical evidence and are not changed here.

D1 — Late failure of the localized approval summary. `readAuthoredContent(text, 'localized', …)` in `packages/core/lib/control-evaluation/report-decision.js` stops reading the `## AGDF Approval Summary (de; source=en)` block at the first line whose key is outside `summaryFields` or does not match its key pattern. The observed line was `Problem (Messlücke): …`; every later field, including `Ziel`, was lost. The UR approval-summary validator in `packages/core/lib/control-state/run-presentation-render.js` does not use this reader, so the UR was presented and approved with that summary. Only UAT preparation (`decision-content-readiness.js`) failed with `localized_content_missing:ziel` and `AGDF_DECISION_CONTENT_INCOMPLETE`. Recovery required a full UR source revision and a renewed approval chain.

D2 — Misleading Quality Readiness. `statusFromReviewArtefact` in `packages/core/lib/control-evaluation/gate-check.js` only recognises the words pass, revise, block and warn in a review row's status and notes. The canonical writer (`run-steps.js`) records a passed internal review result as status `done` with neutral notes. A finished Code Review therefore rendered as `Code-Qualität: Nachweis fehlt`. TP Review and Clean Implementation Review rows recorded the same way are affected identically.

D3 — Run write lock stuck after an abandoned approval worker. An `agdf_approve` call returned `effect_unknown` / `dispatch_worker_termination_unconfirmed`. The MCP server runs dispatch in an in-process worker thread, so the lock records `RUN_STATE.md.lock` and `MASTER_BACKLOG.md.lock` carried the live server PID as owner. Stale-lock recovery only checks whether the owner PID is alive, so every retry got `run_write_locked` until the server process was killed. The CLI `run-approve` then reclaimed the stale lock and succeeded. Related MCP interface review findings: F02 (worker maps exceptions to one failure code) and F09 (per-call worker).

D4 — Closeout dead end without TP Review and Clean Implementation Review (added by owner decision on 2026-10-17 through a UR source revision). `evaluateCloseoutReadiness(..., { prepared: true })` in `packages/core/lib/control-evaluation/closeout-readiness.js`, which `closeout.record` always uses (`run-steps.js`), requires `TP Review` and `Clean Implementation Review` rows with status `done`, a current evidence association and a pass decision. `internalStepEligibility` in `packages/core/lib/control-state/run-operation-proof.js` allows recording those internal steps only while the current gate is CR or QA and refuses them once QA or UAT is approved. In the observed run, gate-check routed CR to QA, QA (qa-gate and `Approval: QA`) and `Approval: UAT` were accepted without either review, and only the derived Quality Readiness showed `Planabdeckung` and `Lösungsintegrität` as `Nachweis fehlt`. After UAT approval no source revision is allowed, so the run can never record its OR.

## 2. Goal

Each defect is either detected at the earliest point where it can be corrected cheaply, or it no longer occurs:

- A localized approval summary whose fields a later gate needs cannot be read is rejected during authoring readiness and presentation, before `Approval: UR`, with a recovery message that names the unreadable field and the expected form.
- Quality Readiness shows the actually recorded decision of every recorded review.
- A lock left behind by a dispatch worker that the MCP server has abandoned no longer blocks later writes for the lifetime of the server, while a lock held by a live writer stays protected.
- A structured run can no longer be approved past QA into a closeout it can never record; the review requirement is consistent between QA/UAT readiness and OR closeout, and a run already in that state has a governed way to record the missing reviews and close.

## Affected Users

- Users approving AGDF gates, who should not have to renew an approval chain because of a format defect that AGDF could have detected earlier.
- Coding agents that author approval summaries and recover from uncertain MCP operations.
- AGDF maintainers who rely on Quality Readiness and on write-lock safety.

## 3. Scope

1. D1: Approval-summary readiness and presentation for the UR gate read the summary with the same reader as the later consumer and reject a summary whose required fields (UR: `Ziel` / `Goal`) cannot be read, with a precise reason and recovery text. The same guard applies to the QA summary fields that UAT reads (`Ergebnis`, `Grenzen`, `Risiken` and their English equivalents), because the identical late failure exists there. The SD decides whether an unknown or qualified key such as `Problem (Messlücke):` ends the block or is only skipped. Tests use the exact failing shape of the observed UR.
2. D2: Map the canonical recorded review status (`done` for a recorded pass, `revise`, `block`) of CR, TP Review and Clean Implementation Review rows to the correct Quality Readiness value, and test it.
3. D3: Make the MCP server release or invalidate locks owned by a worker it abandons, or let recovery distinguish a live server from a live writer; the SD chooses. Test the abandoned-worker path, including that a lock held by a live writer is not removed.
4. D4: Make the TP Review and Clean Implementation Review requirement consistent between gate-check/QA readiness and OR closeout on structured routes. The SD decides whether QA presentation and approval are blocked while either review is missing, whether both reviews stay recordable before closeout after QA or UAT approval, or both. The owner intends to close run `mcp-ergonomics-baseline-20261016-01` with both reviews and its OR after this fix ships, so a run already past `Approval: UAT` without the reviews must have a governed way to record them and close without a source revision. Add a regression test for the dead end.
5. Implementation happens on the feature branch `fix/agdf-core-approval-defects-20261017` in its own worktree, not on `main`. The owner commits.

## 4. Non-Goals

- Changing the completed run `mcp-ergonomics-baseline-20261016-01`, its artefacts, receipts or approvals.
- Changing which fields UAT requires, the approval-summary heading format, or which gates require a localized summary.
- Implementing F02 (error classification) or F09 (warm worker) themselves; the D3 fix must stay compatible with both.
- A general lock redesign, cross-process lock leases, or a lock record format that older installed runtimes would misread.
- Migrating or rewriting existing runs; commits, push, pull request, release, or reinstalling the plugin.

## 5. Acceptance Signals

- The exact failing summary shape (a `Problem (Messlücke):` line before `Ziel:`) can no longer pass UR readiness and presentation and then fail only at UAT. A summary without a readable `Ziel` is always rejected before `Approval: UR`, and the message names the field.
- A CR, TP Review or Clean Implementation Review row recorded as `done` by the canonical writer renders as passed in Quality Readiness; `revise` and `block` render as such; an absent row still renders as missing evidence.
- In a test, a lock left behind by an abandoned in-process worker no longer yields `run_write_locked` for later writes in the same server process, while a lock held by a live writer is still respected.
- In a test, a structured run cannot reach a state where QA and UAT are approved and closeout is impossible because TP Review or Clean Implementation Review is missing: either the earlier gate refuses with a recovery naming the missing review, or the reviews can still be recorded and closeout then succeeds.
- `npm run test:verification`, the CLI smoke suite that carries the core tests, and the mcp-server suite pass; the change passes the run's CR and QA.

## 6. Existing Source Of Truth

- `packages/core/lib/control-evaluation/report-decision.js` (`readAuthoredContent`, `summaryFields`) and `decision-content-readiness.js` (UAT consumer).
- `packages/core/lib/control-state/run-presentation-render.js` (`validateLocalizedSummaryBlock`, `evaluateApprovalSummaryReadiness`, `renderApprovalSummaryIssue`) and the `ur-definition` runtime contract.
- `packages/core/lib/control-evaluation/gate-check.js` (`statusFromReviewArtefact`, `qualityReadinessForRunState`) and `packages/core/lib/control-state/run-steps.js` (canonical status mapping).
- `packages/core/lib/control-evaluation/closeout-readiness.js` (`evaluateCloseoutReadiness`), `packages/core/lib/control-state/run-operation-proof.js` (`internalStepEligibility`), `packages/core/lib/control-evaluation/qa-follow-up.js`, gate-check QA routing and the qa-gate route.
- `packages/core/lib/control-state/run-state-writer.js` (`withOwnedFileLock`, `ownerState`, `reclaimAbandonedLock`), `approval-command.js` (lock error mapping), `packages/mcp-server/src/worker.js` and `worker-entry.js` (in-process worker lifecycle), `packages/cli/lib/mcp-dispatch-runtime.js` (recovery texts).
- Existing tests under `packages/core/test` and `packages/mcp-server/test`.
- Evidence: run `mcp-ergonomics-baseline-20261016-01` (UR revisions, RUN_STATE, CODE_REVIEW.md) in the main checkout.

## 7. Risks And Unknowns

- D1: Skipping unknown keys widens what the reader accepts; it must neither reopen a closed block nor accept duplicate fields. Stricter presentation checks can reject in-flight drafts and existing test fixtures; that is intended, but the recovery must be clear.
- D3: Removing a lock is safety-critical. Only a lock proven to belong to the dead worker may be removed. Worker termination itself can be unconfirmed; then the writer may still be live. Older installed runtimes read the same lock files, so the lock record must stay compatible. Whether the observed worker exited late or hung is unknown; Brownfield Analysis must clarify the reachable states.
- D4: Recording reviews after `Approval: QA` or `Approval: UAT` adds evidence after a human decision; the SD must keep that decision honest, for example a recorded non-pass review must not be hidden behind an earlier approval. Blocking QA without the reviews changes the gate order agents see and can affect existing fixtures and runs in flight.
- The installed plugin runtime 0.14.5 that governs this run does not contain these fixes; this UR's own summary therefore uses only keys the installed reader knows.

## 8. Next Step

Review this revised UR and approve only with `Approval: UR`. Then the Brownfield Review and Mode/Slice decision follow again. Nothing is implemented yet.

## AGDF Approval Summary (de; source=en)

- Problem: Beim Abschluss des Runs mcp-ergonomics-baseline-20261016-01 zeigten sich vier Kernfehler. Erstens liest `readAuthoredContent` die lokalisierte Freigabe-Zusammenfassung nur bis zur ersten unbekannten oder qualifizierten Zeile wie `Problem (Messlücke):`; alle späteren Felder, auch `Ziel`, gehen verloren. Die UR-Vorlage prüft das nicht, deshalb scheiterte erst die UAT-Vorbereitung mit `localized_content_missing:ziel` und erzwang eine neue Freigabekette. Zweitens zeigt die Quality Readiness für ein abgeschlossenes Code Review mit Status `done` „Code-Qualität: Nachweis fehlt“. Drittens behielt nach einer unsicheren Freigabe (`dispatch_worker_termination_unconfirmed`) die Sperre von RUN_STATE.md und MASTER_BACKLOG.md die PID des laufenden MCP-Servers; jeder weitere Versuch endete mit `run_write_locked`, bis der Server beendet wurde. Viertens ließen sich QA und UAT ohne TP Review und Clean Implementation Review freigeben, der OR-Closeout verlangt beide Reviews aber, und nach der QA- oder UAT-Freigabe lassen sie sich nicht mehr erfassen; der Run kann seinen OR nie aufzeichnen.
- Ziel: Jeder Fehler wird an der frühesten sinnvollen Stelle erkannt oder tritt nicht mehr auf. Eine Zusammenfassung, deren später benötigte Felder nicht lesbar sind, wird vor `Approval: UR` mit einer genauen Meldung abgelehnt. Die Quality Readiness zeigt die tatsächlich erfasste Review-Entscheidung. Die Sperre eines vom Server aufgegebenen Workers blockiert spätere Schreibvorgänge nicht mehr, die Sperre eines lebenden Schreibers bleibt geschützt. Ein strukturierter Run kann nicht mehr über QA hinaus in einen Closeout geführt werden, den er nie aufzeichnen kann; ein Run, der schon in diesem Zustand ist, hat einen geregelten Weg zum Abschluss.
- Betroffene: Nutzer, die AGDF-Gates freigeben; Coding-Agenten, die Zusammenfassungen schreiben und unsichere MCP-Operationen fortsetzen; Maintainer, die sich auf Quality Readiness und Schreibsperren verlassen.
- Umfang: D1: Die Prüfung der Zusammenfassung bei UR, und gleichartig bei QA für `Ergebnis`, `Grenzen` und `Risiken`, nutzt denselben Leser wie UAT und lehnt unlesbare Pflichtfelder mit genauer Meldung ab; das SD entscheidet, ob ein unbekannter Schlüssel den Block beendet oder übersprungen wird; Test mit der exakten fehlerhaften Form. D2: Die erfassten Review-Status `done`, `revise` und `block` für CR, TP Review und Clean Implementation Review werden korrekt abgebildet. D3: Der MCP-Server gibt Sperren eines aufgegebenen Workers frei oder macht sie ungültig, oder die Wiederherstellung unterscheidet einen lebenden Server von einem lebenden Schreiber; Test des Pfads. D4: TP Review und Clean Implementation Review werden zwischen QA-/UAT-Bereitschaft und OR-Closeout konsistent verlangt; das SD entscheidet zwischen Sperre der QA-Vorlage, Erfassbarkeit bis zum Closeout oder beidem; ein Run nach `Approval: UAT` ohne die Reviews kann sie ohne Quellrevision nachtragen und abschließen; Regressionstest. Umsetzung auf dem Branch `fix/agdf-core-approval-defects-20261017`; der Owner committet.
- Abnahme: Die exakte fehlerhafte Form kann nicht mehr die UR-Vorlage passieren und erst bei UAT scheitern; eine Zusammenfassung ohne lesbares `Ziel` wird immer vor `Approval: UR` abgelehnt, und die Meldung nennt das Feld. Ein mit `done` erfasstes Review erscheint als bestanden, `revise` und `block` entsprechend, ein fehlendes weiterhin als fehlender Nachweis. Im Test blockiert die Sperre eines aufgegebenen Workers spätere Schreibvorgänge im selben Serverprozess nicht mehr, die Sperre eines lebenden Schreibers bleibt bestehen. Im Test entsteht kein Zustand, in dem QA und UAT freigegeben sind und der Closeout an fehlenden Reviews scheitert. `npm run test:verification`, die Core- und mcp-server-Suites bestehen, ebenso CR und QA dieses Runs.
- Quellen und Abgrenzung: Zuständig bleiben `report-decision.js`, `decision-content-readiness.js`, `run-presentation-render.js`, `gate-check.js`, `run-steps.js`, `closeout-readiness.js`, `run-operation-proof.js`, `run-state-writer.js`, `approval-command.js` sowie `packages/mcp-server/src/worker.js` und `worker-entry.js`. Nicht enthalten sind Änderungen am abgeschlossenen Run mcp-ergonomics-baseline-20261016-01, an den von UAT verlangten Feldern oder am Überschriftenformat, die Umsetzung von F02 und F09 selbst, ein neues Sperrformat, Migrationen alter Runs, Git-Aktionen, Release und die Neuinstallation des Plugins.
- Risiken und Klärung: Das Überspringen unbekannter Schlüssel darf weder geschlossene Blöcke wieder öffnen noch doppelte Felder zulassen. Strengere Prüfungen können laufende Entwürfe und vorhandene Test-Fixtures ablehnen. Das Entfernen einer Sperre ist sicherheitskritisch: Nur eine nachweislich zum beendeten Worker gehörende Sperre darf entfernt werden, und ältere installierte Laufzeiten müssen das Sperrformat weiter lesen können. Ob der beobachtete Worker spät beendet wurde oder hing, klärt die Brownfield-Analyse. Nachträglich erfasste Reviews nach einer QA- oder UAT-Freigabe dürfen ein nicht bestandenes Ergebnis nicht hinter der früheren Freigabe verstecken; eine Sperre der QA-Vorlage ändert die Gate-Reihenfolge, die Agenten sehen. Die installierte Laufzeit 0.14.5, die diesen Run steuert, enthält die Korrekturen noch nicht.
- Nächster Schritt: Diese UR prüfen und nur mit `Approval: UR` freigeben. Danach folgen erneut Brownfield Review und Mode/Slice-Entscheidung; implementiert ist noch nichts.
