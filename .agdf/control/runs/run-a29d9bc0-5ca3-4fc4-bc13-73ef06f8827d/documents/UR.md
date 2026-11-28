# UR: Browser-only click tests for the Codex Companion

Status: draft
Gate: UR
Gate approval: open
Requirements clarification: complete
Preview requirement: none
Date: 2026-11-22
Owner: AGDF maintainers

## 1. Problem

A maintainer needs to verify what happens when someone activates “Run fortsetzen”, especially when a handoff is still open or two views address the same Run. The previous acceptance procedure required a click in Codex Desktop. The maintainer has chosen the browser as the sole surface for click testing in this Run.

## 2. Goal

A maintainer can exercise the built Codex Companion in a real browser against an isolated, explicitly designated disposable Run. The maintainer can tell which request was sent, whether another start was prevented, and what the Companion shows when the original handoff is reopened. The report identifies which receiving-host events the fixture simulated.

## Affected Users

AGDF maintainers who exercise the Companion and reviewers who use the results to assess handoff, recovery and duplicate-start behavior.

## 3. Scope

- Run all click acceptance cases in the browser with the built Companion and a local fixture host. Identify the selected disposable Run and test context. Bound the fixture action to reading its status and returning its case marker.
- Exercise pointer and keyboard activation, two competing browser views, and reopening an outstanding handoff. Where the fixture can represent the ordinary continuation path, test it as a competitor to the Companion against the same admission state.
- Check the available action after a confirmed non-start, stale selection, interruption or candidate change using controlled fixture events. Record the browser behavior and any part that the harness cannot observe.
- Record the candidate, case, original attempt, observed sends, fixture work grants and visible outcome. Keep the real browser interaction, server-side fixture observations and simulated host events identifiable in the handoff to the linked continuation Run.

## 4. Non-Goals

Native Desktop clicks, a real receiving Codex turn and production qualification are outside this Run's click acceptance. The test uses disposable data. Active delivery Runs, host permissions, gate decisions and release activation are outside its scope.

## 5. Acceptance Signals

- On a ready fixture, activating “Run fortsetzen” once with the mouse or the keyboard sends exactly one request bound to the selected Run and attempt.
- When two views compete on the same fixture, only one attempt obtains permission to start. Both views can observe the original disposition. Checking the status after reopening adds zero sends.
- A pending or uncertain handoff remains identifiable. A stale selection can be refreshed. A retry is offered only after a proven non-start and a fresh ready state.
- Reviewers can distinguish a browser click and an observed outgoing request from a fixture claim, simulated terminal event or unobserved host outcome. Results for a different candidate or Run cannot satisfy the case.

## 6. Existing Source Of Truth

The maintainer's confirmed revision sets the browser-only acceptance boundary. The [linked continuation plan](../../run-4e2a3b9c-81a9-42e6-8d2f-00cf93c956b3/documents/TP.md) owns continuation behavior and the separate decision about native qualification. The built Companion, its existing SDK browser harness and the shared per-Run admission service are the starting points for the revised Brownfield Review.

## 7. Risks And Unknowns

A simulated host can acknowledge a message that a real host might handle differently. A missing event can also make a duplicate-start test appear to pass. Review the fixture's ability to hold an outstanding handoff, observe each competing path and count grants separately from UI gestures. Carry any unobservable case forward as a named evidence gap.

## 8. Next Step

Review this revised user need. After UR approval, reassess the existing browser harness, admission paths and applicable UX analysis before drafting the revised product requirements.

## AGDF Approval Summary (de; source=en)

- Ziel: Wir prüfen „Run fortsetzen“ ausschließlich im Browser. Dafür verwenden wir den gebauten Codex-Begleiter und einen eigens angelegten Wegwerf-Run.
- Ein Mausklick oder die Eingabetaste soll genau eine Anfrage auslösen. Wenn zwei Ansichten denselben Run fortsetzen wollen, darf nur ein Auftrag starten. Nach erneutem Öffnen muss dieselbe Übergabe sichtbar bleiben.
- Der Prüfbericht zeigt, was im Browser passiert ist, welche Ereignisse der Test simuliert hat und wo ein Nachweis fehlt. Über eine Freischaltung in Codex Desktop entscheidet weiterhin der verknüpfte Begleiter-Run.
- Mit deiner Freigabe prüfen wir, welche vorhandenen Browsertests und Schnittstellen die überarbeiteten Produktanforderungen bereits abdecken.
