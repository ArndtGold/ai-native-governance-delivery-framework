# QA Report: Chromium Companion continuation and duplicate-start prevention

Status: draft
Gate: QA
Gate approval: open
Based on: approved TP, CD+Tests, Code Review, TP Review and Clean Implementation Review
Date: 2026-11-22
Owner: Technical QA

## 1. QA Decision

Decision: pass

## 2. TP Coverage

- delivered_result: On the tested Chromium build, two simultaneous clicks on the same Run yield one outgoing request, one grant and one fixture reply. A reopened pending handoff keeps its original attempt. After a cancellation request the Companion preserves the lock and shows the reason until the matching end is confirmed.

All five tasks in the approved plan were completed. The TP Review links the six acceptance criteria to the observed interaction and identifies the clarification to SCN-009. No task is partially complete or missing within the browser scope.

## 3. Evidence

- The [corrected case records](../evidence/browser-continuation-after-interrupt-fix.json) cover twelve scenarios in 21 passing variants on independent disposable Runs. The SDK browser file passed 27/27 Chromium tests. Verified the evidence index SHA-256 12f39601eab99555188ebdce047d6ddf6ffd40168813751b738f43216cfaed1f, the fixture hash and the built UI digest against the current tree.
- Two competing views observed two gestures, one SDK send, one grant and one reply. Ordinary-first and Companion-first each yielded one grant. Replay and checking a pending handoff after reload produced no duplicate. Pointer and Enter both exercised the visible action at 360 CSS pixels.
- For the original failure, the corrected SCN-009 retains the interrupted state on reload, refuses the ordinary competitor and ignores a foreign Stop. A matching Stop restores the action. The previously failing result is retained in [the original index](../evidence/browser-continuation.json).
- The 26 Core/MCP checks passed again during review. The verified CD+Tests record includes successful typecheck, build and the serial suite of 441 UI checks. [Code Review](CODE_REVIEW.md), [TP Review](TP_REVIEW.md) and [Clean Implementation Review](CLEAN_IMPLEMENTATION_REVIEW.md) all passed. No open normalized finding or material implementation gap remains. The existing Core admission record continues to own the decision. The test harness observes that decision. The Brownfield review identifies no separate authority or documentation boundary.

## 4. Missing Evidence

- qualification_limits: Clicks were exercised in Chromium at 360 CSS pixels with a local SDK host, simulated recipient and injected lifecycle events. Native Codex Desktop delivery, a real receiving chat turn and native restart behavior are outside this Run.

## 5. Risks

- delivery_risks: One earlier parallel UI run missed a Reader session-expiry notice. All 48 tests in that file passed in isolation and all 441 UI tests passed serially. The timing observation is retained separately from the passing continuation scenarios.

## 6. Required Next Step

Present the technical QA decision for human review and deliberate QA approval.

## 7. Gate Approval

Approval: QA

## AGDF Approval Summary (de; source=en)

- Ergebnis: Der Browser-Test ist bestanden. Zwei gleichzeitige Klicks auf „Run fortsetzen“ lösen genau einen Auftrag aus. Nach einem Abbruch bleibt der Start gesperrt, bis das Ende desselben Versuchs bestätigt ist. Dann erscheint „Run fortsetzen“ automatisch wieder.
- Grenzen: Alle zwölf Szenarien wurden in Chromium geprüft. Der Empfänger und die Meldungen zu Abbruch und Ende waren simuliert. Die Prüfung in Codex Desktop gehört zum separaten Run.
- Risiken: Ein Reader-Test verpasste bei paralleler Ausführung einmal einen Hinweis. Alle 48 Tests der Datei und anschließend alle 441 UI-Tests im seriellen Lauf bestanden.