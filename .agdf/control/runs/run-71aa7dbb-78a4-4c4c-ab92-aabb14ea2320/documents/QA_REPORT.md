# QA Report: Single Core reader for the companion event journal

Status: draft
Gate: QA
Gate approval: open
Based on: TP, implementation evidence, task-plan review
Date: 2026-11-27
Owner: Arndt Gold

## 1. QA Decision

Decision: `pass`

## 2. TP Coverage

- delivered_result: The companion event journal is now read and parsed only by Core `readCompanionEvents` (`packages/core/lib/companion/read-companion-events.js`). The read-only `run-view` command returns the root's event history with `--companion-data`, read before the runs; the Claude companion takes its events from that read and only watches the journal's size and modification time; the Codex card uses the same reader through the Cockpit and the same confirmation, sticky and date rules as the Claude pane; a contract test runs the reader and both consumers on shared journal fixtures.

All eight TP tasks (T-001 to T-008) are fully done and all thirteen scenarios (SCN-001 to SCN-013) are fulfilled (TP_REVIEW.md). The Code Review found four implementation gaps (CR-01, CR-03, CR-04, CR-06); all are fixed and re-verified (CODE_REVIEW.md). Clean Implementation Review: pass, no finding.

## 3. Evidence

- `node --test packages/core/test/companion-journal-contract-test.js`: 5 of 5 pass (template sources without parser; reader order, de-duplication, run and limit scope; bounds and rotation; junction alias and drive-letter case on Windows; reader vs. Claude run-view mapping vs. Cockpit observation on the same fixtures).
- `npm --prefix packages/cli run test:companion-run-view` (incl. `run-view-command-test.js` SCN-007): pass, 1 pre-existing symlink skip.
- `npm --prefix packages/cli run test:claude-companion` (logic, adapter incl. shared-read, oversized/missing journal, dated lines and transient-failure cases, integrity, parity, observer): pass.
- `node --test packages/core/test/cockpit-session-test.js`: 21 of 21 pass.
- packages/control-ui `npx vitest run`: 35 files, 442 tests pass; `npx tsc --noEmit` clean.
- `test:copilot-profile`, `test:package-contents`, `test:plugin-mcp-runtime`, `test:mcp-server` (warm dispatch p95 747 ms), `test:project-read`, `test:local-validator`, `test:cli-modularization`: pass.
- `npm run build:prepare` pass after the accepted Copilot payload growth (462 files, 4,875,947 bytes, rationale names this run); `npm run compatibility:record` and `npm run compatibility:check` pass on the final code: 56 scenarios, 0 failed, source fingerprint 6696b7fd...
- Reviews: TP Review pass (incl. UX Intent Fidelity rows AC-004 to AC-007 fulfilled with rendered module output), Clean Implementation Review pass, Code Review pass with CR-01, CR-03, CR-04 and CR-06 resolved (CR-01 and CR-03 shown failing on the previous code).

## 4. Missing Evidence

- qualification_limits: The live Claude desktop companion pane and the Codex app were not opened; visible behaviour is evidenced by rendering the real modules in the test hosts (Claude fake host, jsdom). `test:cockpit-core` has two failures that are host limits on this Windows machine, not results of this change (`cockpit-draft-check-test.js` cannot create a symlink without privilege; `cockpit-changes-test.js` hit a rename lock under parallel load and passes 2 of 2 in isolation). CI on the pull request has not run yet.

## 5. Risks

- delivery_risks: Every journal write, also from another project in the same plugin data root, now starts one run-view read in each open Claude companion (about 1.6 s here, in the background); accepted by the owner on 2026-11-27, a root filter in `companion-observe` is a possible follow-up. A run-view process failure (timeout, crash) delays events until the next good read. The native Claude CLI compatibility observations were already stale/mismatched before this run and stay so until native evidence is recorded again. The branch is stacked on `codex/companion-run-events` (PR #85), which currently conflicts with its base.

## 6. Required Next Step

Owner decision on this QA report with `Approval: QA`; then UAT and OR.

## 7. Gate Approval

Approve this QA decision only with:

`Approval: QA`

## AGDF Approval Summary (de; source=en)

- Ergebnis: Das Companion-Ereignisjournal wird nur noch vom Core-Leser `readCompanionEvents` gelesen; `run-view` liefert mit `--companion-data` die Ereignisse des Roots (vor den Runs gelesen), der Claude-Begleiter nutzt sie und beobachtet das Journal nur noch über Größe und Änderungszeit, die Codex-Karte nutzt denselben Leser und dieselben Regeln für Bestätigung, haftende Ereignisse und Datumsanzeige; ein Contract-Test prüft Leser und beide Verbraucher auf gemeinsamen Fixtures. Alle Tasks T-001 bis T-008 und Szenarien SCN-001 bis SCN-013 sind erfüllt, die vier Code-Review-Befunde behoben und nachgeprüft; alle Suiten des Testplans und `compatibility:check` (56/56) laufen durch.
- Grenzen: Die echte Claude-Desktop-Pane und die Codex-App wurden nicht geöffnet (Nachweis über gerenderte Module in Testhosts); zwei Cockpit-Core-Tests scheitern an Windows-Hostgrenzen (Symlink-Recht, Dateisperre unter Last) unabhängig von dieser Änderung; die CI des Pull Requests steht noch aus.
- Risiken: Jede Journaländerung, auch aus anderen Projekten, startet einen `run-view` je offenem Claude-Begleiter (vom Owner akzeptiert, Root-Filter im Observer als mögliche Folgeaufgabe); bei einem Prozessausfall von `run-view` kommen Ereignisse verzögert; die nativen Claude-CLI-Beobachtungen waren schon vorher veraltet; der Branch baut auf PR #85 auf, der derzeit Konflikte mit seiner Basis hat.
