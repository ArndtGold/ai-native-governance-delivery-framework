# Codex live validation — pending

Run: agdf-intake-continuation-repair
Date: 2026-09-27
TP obligation: T10 / V11
Status: evidence_gap

## Boundary

Automated synthetic approvals belong only to isolated regression fixtures. They do not prove a visible user interaction, approval timing, or automatic continuation in a real Codex session. A stored presentation proves prepared content, not human visibility. This current chat began with the old installed schema; replacing files does not prove a refreshed tool definition in this running session.

## Prepared procedure

Use a fresh Codex chat after loading the updated local AGDF installation. Use a disposable Git project with canonical control setup and two unrelated active runs. Preserve their state digests. Do not use MGDF production control data.

1. Request one bounded new documentation change with an explicit project path and AGDF. Observe `intake_mode: new` and an unused run id; the shipped validator must create the run and persist UR.
2. Observe `run-present` before the displayed gate text and before any user response. Retain presentation id, run id, gate, revision, content digest, exact displayed text, chat id and installed plugin provenance.
3. The user gives a deliberate response to that exact presentation. On approval, observe `run-approve --presentation` and the subsequent bound `continue_delivery: true` without another request to continue. Verify Brownfield Review and routing, then a stop at the next required user decision.
4. Ask status separately: compare control files before and after; no creation, approval or internal work.
5. Exercise revise/decline/cancel and a stale presentation in separate bounded fixtures. A changed revision must require a new presentation and a new user response. Do not reuse earlier answers.
6. Verify unrelated runs remained unchanged. Store observed chat/tool evidence here; mark only observed cases satisfied.

## Completion

Fill installed version/digest, chat reference, ordered tool/user events and V11 case outcomes. Until then QA cannot pass the visible UX claims. After evidence is complete, rerun TP Review and qa-gate; QA approval and UAT remain separate user decisions.

## Prepared disposable project

Path: /private/tmp/agdf-intake-live-sljh0dgq

Two foreign runs were created through the installed validator, without approvals. Their initial digests are in FOREIGN_RUN_BASELINE.json. The test change itself has not been started and no user reply has been simulated.

Suggested first request in a fresh chat after host restart:

> Nutze AGDF für ein neues Vorhaben in `/private/tmp/agdf-intake-live-sljh0dgq`: Erstelle ein kleines Node-CLI, das eine lokale JSON-Konfiguration validiert und verständliche Fehlermeldungen ausgibt. Behandle dies als neuen, getrennten Umfang neben den vorhandenen Runs. Bereite zunächst die UR vor.

Observe the real Mode/Slice decision rather than forcing a route; stop at its actual next user decision. A route without another user gate does not prove that part of V11 and needs a separate suitable fixture.
