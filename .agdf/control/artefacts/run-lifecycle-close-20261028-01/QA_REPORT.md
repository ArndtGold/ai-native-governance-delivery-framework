# QA Report: Close Active Runs as Superseded or Abandoned

Status: draft
Gate: QA
Gate approval: open
Based on: TP revision 15, CD+Tests, Code Review, TP Review, Clean Implementation Review
Date: 2026-10-29
Owner: Arndt Gold

## 1. QA Decision

Decision: pass

## 2. TP Coverage

- delivered_result: Active runs can now be ended as `superseded` (verified run id or unverified free reference plus reason) or `abandoned` (reason) through `run-close` and the `agdf_closeout` kinds `closure.preview` and `closure.apply`; a stored preview with digest is applied only with the owner's exact `Close runs: <preview_id>`, each unchanged eligible run gets its own sealed `lifecycle_close.record` receipt with Git identity, a pending recovery blocks the whole closure, ended runs reject every further write, approval, presentation, revision, recovery and continuation, readers show them as history, backlog rows move to the archive, and contracts, READMEs and the handbook describe it.

All tasks T-001 to T-009 are fully done (TP Review). All 28 scenarios SCN-001 to SCN-028 have passing tests or recorded evidence; UX Intent Fidelity is fulfilled for AC-001 to AC-015.

## 3. Evidence

- CD+Tests: `.agdf/control/artefacts/run-lifecycle-close-20261028-01/CD_TESTS.md` with the suite results on the final tree.
- SCN-012 negative-first: `evidence/scn-012-before.txt` (writer accepted a write to a superseded run) and `evidence/scn-012-after.txt`.
- Native observation SCN-019: `evidence/scn-019-native-observation.md`, `scn-019-before.png`, `scn-019-after.png`, `scn-019-preview-68826cf4.json` (Claude Code Desktop on Windows, MCP preview and apply, owner's typed phrase, both fixture runs ended with valid seals and receipts, companion shows no open run).
- Code Review: `CODE_REVIEW.md`, independent reviewer; CR-F01 to CR-F07 resolved, each fix proven by a test that fails without it.
- TP Review: `TP_REVIEW.md`; Clean Implementation Review: `CLEAN_IMPLEMENTATION_REVIEW.md`, two resolved residual notes.
- After the review corrections: `npm run build:prepare` pass, `compatibility:check` 56/56, `eval:skills` 113/113, the rebuilt MCP server suite pass (performance test exceeded p95 once under load and passed twice alone), community-health pass.

## 4. Missing Evidence

- qualification_limits: Native behavior was observed only in Claude Code Desktop on Windows; Codex, Copilot and OpenCode rely on the MCP protocol tests, and the full pull-request CI lanes have not run yet.

## 5. Risks

- delivery_risks: About 100 bytes of headroom remain in the MCP command tool budget; older AGDF runtimes in the same repository fail closed on the new receipt kind; the closure confirmation keeps the cooperative limit of approvals, so a party that can write the preview file could change it, which the shown digest prefix makes visible but does not prevent.

## 6. Required Next Step

Request `Approval: QA`; after approval request `Approval: UAT`, then produce the OR and the delivery closeout. No real run of this repository is closed by this delivery.

## 7. Gate Approval

Approve this QA decision only with:

`Approval: QA`

## AGDF Approval Summary (de; source=en)

- Ziel: Runs, die nicht weitergehen, mit einer geprüften Entscheidung sauber und nachvollziehbar beenden, damit die Listen offener Runs nur echte Arbeit zeigen.
- Ergebnis: Aktive Runs lassen sich über `run-close` und die `agdf_closeout`-Vorgänge `closure.preview` und `closure.apply` als `superseded` (geprüfte Run-ID oder ungeprüfter Verweis, mit Grund) oder `abandoned` (mit Grund) beenden; eine gespeicherte Vorschau mit Digest wird nur mit deinem genauen Satz `Close runs: <Vorschau-ID>` angewendet; jeder unveränderte Run erhält einen eigenen versiegelten Beleg mit Git-Identität; eine offene Wiederherstellung blockiert alles; beendete Runs lehnen jeden weiteren Schritt ab, erscheinen als Historie, und ihre Backlog-Zeile wandert ins Archiv; Verträge, READMEs und Handbuch beschreiben das. Alle neun Aufgaben und 28 Szenarien sind erfüllt, das unabhängige Code-Review ist nach Korrektur von sieben Befunden bestanden, die native Probe in Claude Code war erfolgreich.
- Grenzen: Nativ beobachtet nur in Claude Code Desktop unter Windows; Codex, Copilot und OpenCode stützen sich auf die MCP-Protokolltests; die volle CI im Pull Request steht noch aus.
- Risiken: Im MCP-Byte-Budget bleiben etwa 100 Byte Luft; ältere AGDF-Laufzeiten lehnen die neue Belegart ab; wer die Vorschaudatei schreiben kann, könnte sie ändern, was der angezeigte Digest sichtbar macht, aber nicht verhindert.
