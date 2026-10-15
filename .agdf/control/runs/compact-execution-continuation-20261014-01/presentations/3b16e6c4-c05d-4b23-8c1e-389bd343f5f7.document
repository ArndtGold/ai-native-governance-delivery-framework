# UR: Continue permitted Quick Task and Verified Change execution

Status: draft
Gate: UR
Gate approval: open
Requirements clarification: complete
Date: 2026-10-14
Owner: Arndt Gold
Run: compact-execution-continuation-20261014-01
Language: en

## 1. Problem

The user requested: "Fix den Ablauf für Quick Task Execution und Verified Change sauber und prüfe es im installierten Plugin."

Static inspection of the installed AGDF 0.14.5+codex.local-2459f4dd156c found that canonical compact runs can reach a permitted implementation state but return a terminal status instead of an executable continuation. The dispatcher explicitly continues structured CD+Tests. Quick Task Execution has no equivalent continuation. Verified Change has a preparation continuation for its missing compact record, but no equivalent implementation continuation for its eligible record. Terminal responses instruct the coding agent to show the status and stop.

This can leave the user coordinating already permitted internal work with further prompts. The inspected Core files were byte-identical to the repository. These observations are static code evidence; a complete installed-runtime before/after execution remains to be demonstrated.

## 2. Goal

Within an explicitly requested, exactly bound canonical compact run, the coding agent continues permitted Quick Task or eligible Verified Change implementation, performs the required checks and records its evidence until the next genuine decision, concrete blocker or completed compact outcome. A further user continuation prompt is unnecessary solely because the compact implementation state was reached. The corrected behavior is verified through the actually installed plugin runtime.

## Affected Users

- Coding agents consuming canonical control and dispatcher continuations.
- The user directing delivery and deciding on material scope or required approvals.
- Reviewers assessing compact scope, execution evidence and truthful completion.

## 3. Scope

- Repair execution handoffs for canonical Quick Task Execution and eligible Verified Change, using existing Core policy, dispatcher, skills and canonical recording owners.
- Preserve the existing Verified Change preparation and eligibility boundary; preparation must not itself start implementation.
- Preserve route-specific approved scope, declared files, baseline and validation obligations, evidence, required review and compact closeout. Continue only work the current canonical state permits.
- Distinguish active delivery continuation from read-only status, missing approval, ineligible records, ambiguous/stale/foreign bindings, invalid control and completed runs. Stop at the real boundary and report the concrete reason.
- Keep affected contracts, generated distribution and installed runtime consistent. Update the local Codex plugin through its supported installer and verify the exact resulting build.
- Demonstrate fixed positive and negative scenarios, including before/after dispatcher outcomes and installed-runtime invocation. Separate source, package, installed protocol and native host observations.

## 4. Non-Goals

- Changing Request Activation, gate meaning, exact approvals, compact eligibility, scope authority or release authority.
- Automatic gate approval, selecting a foreign run or treating progress/status text as execution permission.
- Repairing or completing other live runs, transferring their approvals, or changing their approved requirements.
- Optimizing the separately identified duplicate Delivery Map calculation.
- Public publication, version release, commit, push, PR or deployment.

## 5. Acceptance Signals

- AC-001: A valid bound active continuation at Quick Task Execution produces an executable handoff for the approved compact scope without an extra user prompt. Required checks, evidence and compact closeout remain applicable.
- AC-002: A missing/draft Verified Change record stays in preparation; an eligible record permits a bounded execution handoff. Invalid, unproven or escalated records cannot enter that execution handoff.
- AC-003: Read-only status, missing/stale/foreign approval, ambiguous/stale/foreign target or run, invalid integrity, incompatible runtime and completed runs do not enter compact execution. Relevant scope or baseline changes cause fresh validation or an explicit blocker.
- AC-004: Canonical recording and re-evaluation retain exact revision and evidence binding. Finished work is not repeated, and compact completion does not trigger an extra execution or implicit VCS action.
- AC-005: Structured continuation and existing Verified Change preparation retain their behavior. Changed execution/status presentations are truthful; affected localized output is verified in every registered language.
- AC-006: The corrected local Codex plugin is installed through the supported path. The observed build/digests and installed CLI/MCP outcomes for both compact paths and refusal scenarios are recorded. Any unobserved native host behavior is explicitly identified rather than inferred from source tests.

## 6. Existing Source Of Truth

- This chat: static code assessment, bounded effort estimate and the explicit repair/install-verification request.
- `packages/core/lib/control-evaluation/gate-policy.js`: compact permission and semantic operations.
- `packages/core/lib/control-evaluation/gate-check.js`: validated current operation and status.
- `packages/core/lib/skill-dispatch/service.js` and `delivery-continuation/service.js`: handoff and bounded continuation.
- `packages/core/lib/control-state/`: canonical recording, exact approval, source/evidence binding, review and closeout.
- `plugins/agdf/meta/contracts/modes.md`, `gate-transition.md` and `interaction.md`: existing compact and terminal semantics.
- `packages/cli/scripts/skill-dispatch-test.js`, `packages/mcp-server/test/` and supported Codex installer/distribution tooling: relevant verification and installation paths.
- Existing scopes remain separate: `quick-task-closeout-status-20261002-01` explicitly excludes the Quick Task execution stop; `agdf-intake-continuation-repair` owns post-UR review/routing; `gate-internal-continuation-recovery-20261008-01` owns prerequisite and QA-revise handoffs. Their approvals do not authorize this increment.

## 7. Risks And Unknowns

Brownfield Review must reproduce the eligible compact states and establish the existing implementation/recording owner. It must determine the smallest safe path through execution, review and closeout without introducing another state authority. MCP eligibility may differ from CLI where a required baseline observation is unavailable; unavailable evidence must remain a blocker. Interrupted execution and changed baseline must not produce replayed work or stale permission.

The exact design, route depth and validation sequence remain downstream decisions. Installation evidence must distinguish the newly installed build from an already running older MCP generation or restored host session. New host observations are required where the changed runtime invalidates prior evidence.

## 8. Next Step

Review this bound UR and respond with `Approval: UR`, request revision or decline. UR approval permits Brownfield Review and Mode/Slice selection; it does not grant implementation permission or approve later gates.

## AGDF Approval Summary (de; source=en)

- Problem: Im geprüften installierten Code endet bereits erlaubte Quick-Task-Ausführung mit einer terminalen Statusausgabe. Verified Change bereitet seinen Nachweis vor, liefert für den danach ausführungsbereiten Zustand aber ebenfalls keine Implementierungsfortsetzung. Die bisherigen Befunde stammen aus statischer Codeprüfung.
- Ziel: Innerhalb eines ausdrücklich beauftragten, exakt gebundenen kompakten Runs erlaubte Arbeit bis zur nächsten echten Entscheidung, konkreten Blockade oder zum abgeschlossenen kompakten Ergebnis fortsetzen. Der Nutzer muss interne Ausführung nicht mit zusätzlichen Weiterarbeits-Prompts koordinieren.
- Nutzer: Coding-Agenten führen die Schritte aus; der Nutzer entscheidet über fachlichen Umfang und erforderliche Freigaben; Reviewer prüfen Ausführung und Abschluss.
- Umfang: Quick Task Execution und ausführungsbereite Verified Changes über bestehende Eigentümer weiterführen. Vorbereitung und Eignungsprüfung, Umfang, Dateigrenzen, Baseline, Prüfungen, Nachweise, erforderliches Review und kompakter Abschluss bleiben verbindlich. Betroffene Verträge und Pakete synchronisieren und das lokale Codex-Plugin über den unterstützten Installer aktualisieren.
- AC-001: Gültige aktive Quick-Task-Fortsetzung liefert einen ausführbaren Auftrag ohne weiteren Nutzerprompt; Prüfungen, Nachweise und Abschluss bleiben erhalten.
- AC-002: Fehlender Verified-Change-Nachweis bleibt Vorbereitung; nur ein geeigneter Nachweis führt zur begrenzten Ausführung. Ungültige, unbewiesene oder eskalierte Zustände starten diese Ausführung nicht.
- AC-003: Statusfragen, fehlende oder veraltete Freigaben, fremde oder unklare Bindungen, beschädigte Kontrolle, inkompatible Laufzeit und abgeschlossene Runs starten keine kompakte Umsetzung. Geänderte Baselines und Umfänge werden neu geprüft oder konkret blockiert.
- AC-004: Kanonische Aufzeichnung und erneute Bewertung erhalten Revisions- und Nachweisbindung. Erledigte Arbeit wird nicht wiederholt; Abschluss löst keine implizite Git-Aktion aus.
- AC-005: Strukturierte Fortsetzung und vorhandene Verified-Change-Vorbereitung bleiben korrekt. Betroffene Ausführungs- und Statusdarstellungen sind wahrheitsgemäß und in allen registrierten Sprachen geprüft.
- AC-006: Neu installierter Codex-Build und Digests sowie installierte CLI-/MCP-Ergebnisse für beide Wege und Ablehnungsfälle werden belegt. Nicht beobachtetes natives Hostverhalten bleibt ausdrücklich offen.
- Abgrenzung: Keine Änderung von Aktivierung, Gate-Bedeutung, exakten Freigaben oder kompakter Eignung. Keine fremden Runs oder übertragenen Freigaben; keine Delivery-Map-Optimierung, Veröffentlichung, Commit, Push, PR oder Deployment.
- Quellen: Bestehende Core-Policy, Gate-Auswertung, Dispatcher, kanonische Writer, kompakte Verträge, Tests und Installer bleiben maßgeblich. Andere Reparatur-Runs besitzen ihren bisherigen Umfang; ihre Freigaben werden nicht übernommen.
- Offen: Brownfield Review reproduziert die Zustände und bestimmt vorhandene Ausführungs-/Abschluss-Owner sowie den kleinsten sicheren Weg. Fehlende MCP-Baseline-Evidenz bleibt eine Blockade. Unterbrechung, Baseline-Änderung und alte laufende Plugin-Generationen müssen bei Prüfung und Wiederaufnahme berücksichtigt werden.
- Nächster Schritt: `Approval: UR` erlaubt Brownfield Review und Mode/Slice-Auswahl; die Umsetzung benötigt anschließend die dafür gültigen Freigaben.
