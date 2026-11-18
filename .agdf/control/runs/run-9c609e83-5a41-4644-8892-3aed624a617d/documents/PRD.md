# PRD: Companion shows planned URs instead of an empty state

Status: draft
Gate: PRD
Gate approval: open
Based on: UR
Date: 2026-11-16
Owner: Arndt Gold
Traceability contract: criteria-chain-v1

## 1. Product Scope

The Claude companion pane gains one new visible state, "UR planning", for a planned UR under `.agdf/control/planned/` that has not been handed over to a Run. Deliverables:

- The read-only run view the companion consumes lists planned URs that are not transferred (plan id, title, coverage, goal in the display language where available, last change time). An unreadable planning store yields an empty list and never hides Runs.
- Selection: when the pane shows no Run, it shows the newest planned UR if that UR changed in the current session or if no Run is open at all. Otherwise the existing Run behaviour stays unchanged.
- The planned-UR state shows: state line, title, route line "UR planning · no run yet", goal, a who-is-next block, a gate bar with only the UR planning step, the details entry, a note with the number of completed Runs and of further planned URs, and the plan id as reference line.
- Figure, status line and terminal view match that state.
- The pane reads the run view again when a planned UR appears or changes.
- All texts in the interaction catalog in `de` and `en`.

## 2. UX Intent And Success

- ui_ux_impact: medium
- ux_intent_definition: directly defined in this PRD from the approved UR and the owner-reviewed mock images of 2026-11-16 (three panels: draft while Claude works, draft resting, ready for handover). Brownfield Review requested a UX Intent Definition; Core routed directly to PRD, so the UX semantics are defined here in sections 3 to 5. No interactive preview is required (UR: `Preview requirement: none`).
- primary_user_intent: See at a glance what AGDF work is under way in this project, including a need that is still being written as a planned UR, and what happens next.
- success_signal: The pane never claims that all work is done while a planned UR is open; the user can read the UR title, its goal and the next step without opening any file.
- primary_decision_or_action: For a ready planned UR, tell Claude in the chat to hand it over into a Run; for a draft, continue drafting in the chat; for an unclear planned UR, ask Claude in the chat to clarify it. The pane itself offers no write action.

## 3. Working Modes And Effective State

| working_mode | effective_state | visible_state_types | effective_state_authority | primary_state_presentation_owner |
|---|---|---|---|---|
| UR planning, draft, Claude turn active | planned UR coverage `draft`, main-loop turn running | state line "drafting the UR", who-is-next "One moment", figure writing on the UR clipboard, status "AGDF · UR planning" | Core planned inventory (coverage) and host turn events | Claude companion pane |
| UR planning, draft, idle | coverage `draft`, no turn running | state line "UR draft is next" (resting colour), who-is-next "Up next" with hint to continue in the chat, figure resting with the clipboard | Core planned inventory | Claude companion pane |
| UR planning, ready | coverage `ready` | state line "UR ready for handover", who-is-next "Handover to a run" with hint to say so in the chat, figure resting | Core planned inventory | Claude companion pane |
| UR planning, unclear | coverage `recovery_required`, `unconfirmed` or `unavailable` | state line "UR planning needs clarification", who-is-next names the coverage ("Recovery required", "Assignment unclear", "Source unavailable") with hint to ask in the chat | Core planned inventory | Claude companion pane |
| Run shown (unchanged) | an assigned or open Run selected by the existing rules | existing Run views from PRs #73/#75 | Core run state | Claude companion pane |

## 4. Activation, Blockers, Recovery And Transitions

- activation_and_deactivation: The planned-UR state activates when the pane shows no Run and the newest non-transferred planned UR either changed in this session or no Run is open. It deactivates when that UR is transferred into a Run (it leaves the planned list and the Run is shown by existing rules), when the planned UR is removed, or when an open Run is selected instead.
- blockers_and_visible_next_actions: The pane has no blocker of its own. Unclear coverage is shown as "needs clarification" with the coverage name and the hint to ask in the chat.
- recovery_paths: An unreadable planning store yields an empty planned list; the pane falls back to the existing Run or empty views and recovers on the next refresh once the store is readable. A failed run-view read keeps the existing "unreadable" handling.
- relevant_state_transitions: (1) no planned UR to draft: trigger new planned UR file, refresh shows the planned-UR state; (2) draft to ready: trigger planned UR change, refresh shows "ready for handover"; (3) ready to Run: trigger handover in the chat, planned UR leaves the list, the Run appears; (4) idle to working: trigger main-loop turn start, figure writes and line reads "drafting the UR"; back to idle on turn end. Failure on any read keeps the last known view and retries on the next refresh.

## 5. Acceptance Criteria

- criterion_id: AC-001
  - working_mode: UR planning, draft, idle
  - source_state: project with one planned UR in coverage draft and no open Run
  - trigger: pane refresh
  - expected_effective_state: the pane shows the planned-UR state, not an empty-state message
  - visible_feedback: title of the UR, route line "UR planning · no run yet" (de: "UR-Planung · noch kein Run"), goal, who-is-next "Up next" with the hint to continue in the chat, gate bar "●UR planning", plan id as reference line
  - failure_behavior: no "All runs across the line", "Starting grid empty" or "No run assigned" text appears beside the planned UR
  - next_action: continue the draft in the chat
  - observable_success: the drawn pane and the terminal view contain the title, route line and plan id in de and en
  - required_evidence: companion view-model, drawn-pane and terminal tests in de and en
- criterion_id: AC-002
  - working_mode: UR planning, draft, Claude turn active
  - source_state: as AC-001 while a main-loop turn runs
  - trigger: turn start
  - expected_effective_state: the planned UR is shown as being drafted
  - visible_feedback: state line "drafting the UR", who-is-next "One moment", figure writes on the UR clipboard; on turn end the figure rests and the line returns to "UR draft is next"
  - observable_success: figure markup carries the UR clipboard with the writing animation only while the turn runs
  - required_evidence: adapter test across turn start and turn end
- criterion_id: AC-003
  - working_mode: UR planning, ready
  - source_state: planned UR with coverage ready
  - trigger: pane refresh
  - expected_effective_state: the planned UR is shown as ready for handover
  - visible_feedback: state line "UR ready for handover", who-is-next "Handover to a run" with the hint "Tell me in the chat when I should hand the UR over."
  - next_action: ask Claude in the chat to hand the UR over
  - observable_success: view model and pane show the ready texts in de and en
  - required_evidence: Core run-view test for a ready planned UR and companion view tests
- criterion_id: AC-004
  - working_mode: UR planning, unclear
  - source_state: planned UR with coverage recovery_required, unconfirmed or unavailable
  - trigger: pane refresh
  - expected_effective_state: the planned UR is shown as needing clarification
  - visible_feedback: state line "UR planning needs clarification", who-is-next names the coverage and gives the hint to ask in the chat
  - observable_success: each of the three coverage values yields its own localized label
  - required_evidence: companion view-model tests for the three coverage values
- criterion_id: AC-005
  - working_mode: Run shown
  - source_state: planned UR transferred into a Run
  - trigger: handover in the chat, then pane refresh
  - expected_effective_state: the transferred UR is no longer listed as planned; the Run is shown by the existing rules
  - visible_feedback: Run title and route as in PRs #73/#75
  - observable_success: the run view lists no planned entry for the transferred plan
  - required_evidence: Core run-view test with create-from-planned handover
- criterion_id: AC-006
  - working_mode: any
  - source_state: planning store unreadable
  - trigger: pane refresh
  - expected_effective_state: the planned list is empty and Runs are still shown
  - visible_feedback: existing Run or empty views, no error text caused by the planning store
  - failure_behavior: the run view does not fail
  - observable_success: run view returns its Runs with an empty planned list
  - required_evidence: Core run-view test with an unreadable planning store
- criterion_id: AC-007
  - working_mode: UR planning (all variants)
  - source_state: planned UR shown
  - trigger: pane refresh or turn change
  - expected_effective_state: status line, figure and note match the planned-UR state
  - visible_feedback: status line "AGDF · UR planning" (de: "AGDF · UR-Planung"); note "Completed runs: n" and "More URs in planning: n" when counts are non-zero; texts in the chat language without mixed languages
  - observable_success: status line and note texts in de and en; German view contains no English catalog text
  - required_evidence: companion tests for status line, note and language purity
- criterion_id: AC-008
  - working_mode: any
  - source_state: pane open, project unchanged except the planning folder
  - trigger: a planned UR appears or its file changes
  - expected_effective_state: the pane reads the run view again on the next refresh tick; an unchanged project is not read again
  - visible_feedback: the new or changed planned UR appears without reopening the pane
  - observable_success: one additional run-view read per change, none without change
  - required_evidence: adapter test counting run-view reads
- criterion_id: AC-009
  - working_mode: Run shown and project without AGDF
  - source_state: projects with open Runs not changed in this session, or projects without AGDF
  - trigger: pane refresh
  - expected_effective_state: behaviour identical to before this change
  - observable_success: existing companion test suites pass unchanged
  - required_evidence: existing companion, run-view and catalog test suites

## 6. Non-Goals

- No writing from the companion: no create, edit, prioritise or handover of planned URs and no Run start.
- No change to planning semantics, readiness rules or `run.create_from_planned`.
- No selection UI between several planned URs.
- No change to the cockpit or other hosts (Codex, Copilot) beyond the shared Core read.
- No translation of UR titles.

## 7. Users And Roles

- Users of AGDF in Claude Code with the companion pane open who capture needs as planned URs.
- Owner and decider: Arndt Gold.

## 8. Constraints

- The companion stays read-only and launches only the existing read-only `run-view` command.
- The run-view output change is additive; existing consumers keep working.
- Catalog changes follow the existing chain (MCP UI build, asset sync, exact Copilot payload baseline, host compatibility record).
- Texts exist in `de` and `en`; the catalog validation lists every companion status state.

## 9. Evidence Requirements

- Core run-view tests for draft, ready, transferred and unreadable planning store (AC-003, AC-005, AC-006).
- Companion view-model, drawn-pane, terminal and status-line tests in de and en (AC-001 to AC-004, AC-007, AC-009).
- Adapter tests for refresh on new or changed planned UR and for figure behaviour across a turn (AC-002, AC-008).
- Catalog, payload-budget, package-contents and host-compatibility checks pass.
- Rendered images of the pane from the real code path for the owner's review; the live Claude pane is not part of the evidence and stays a stated limit.

## 10. Risks And Open Questions

- Readiness follows the display language (Core rule, unchanged): a planned UR without a localized approval summary is shown as draft in German even if complete in English.
- "Drafting the UR" is shown for any main-loop turn, because the companion cannot see what the turn does.
- An uncommitted candidate implementation exists; it is input for TP and Brownfield Analysis, not approved work.

## Approval Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Which planned UR is shown when several exist or Runs are open | before_prd | resolved | As stated in the approved UR scope: only when the pane shows no Run; the newest planned UR if it changed in this session or no Run is open; otherwise Runs keep the pane. No selection UI. | Arndt Gold |
| Readiness of a planned UR in another display language | before_prd | resolved | Keep the existing Core readiness rule (UR non-goal: no change to readiness rules); record the effect as a known risk. | Arndt Gold |
| Wording for unclear coverage | before_prd | resolved | Show "needs clarification" with the coverage name and a hint to ask in the chat (UR scope: unclear coverage, clarify). | Arndt Gold |
| Shape of the additive planned field in the run view and change detection | later_sd | open | Defined in SD. | Arndt Gold |

## 11. Next Step

Review this PRD and approve only with:

`Approval: PRD`

The approval confirms the specified behavior, scope and criteria and permits the SD step.

## AGDF Approval Summary (de; source=en)

- Ziel: Der Begleiter zeigt eine geplante UR, die noch kein Run ist, mit Titel, Ziel und nächstem Schritt, statt zu behaupten, alle Runs seien fertig.
- Umfang: Die lesende Run-Ansicht listet nicht übergebene geplante URs (Plan-ID, Titel, Abdeckung, Ziel, letzte Änderung); ein unlesbarer Planungsordner ergibt eine leere Liste. Zeigt der Begleiter keinen Run, zeigt er die neueste geplante UR, wenn sie sich in dieser Sitzung geändert hat oder kein Run offen ist. Angezeigt werden Zustandszeile, Titel, „UR-Planung · noch kein Run“, Ziel, „Wer ist dran“, Gate-Leiste mit UR-Planung, Details, Hinweis auf abgeschlossene Runs und weitere URs, Plan-ID; Figur, Statuszeile „AGDF · UR-Planung“ und Terminal passen dazu; neues Lesen bei neuer oder geänderter UR; Texte in de und en.
- Entscheidungen: Auswahlregel wie in der UR festgelegt, ohne Auswahl-UI; die Bereitschaftsregel des Core bleibt unverändert (eine UR ohne deutsche Zusammenfassung erscheint auf Deutsch als Entwurf); bei unklarer Abdeckung „braucht Klärung“ mit Hinweis auf den Chat; Form des neuen Felds und Änderungserkennung legt das SD fest.
- AC-001: Entwurf ohne offenen Run zeigt Titel, „UR-Planung · noch kein Run“, Ziel, „Als Nächstes“, Gate-Leiste und Plan-ID, ohne Leer- oder „Alle Runs im Ziel“-Meldung, in Panel und Terminal, de und en.
- AC-002: Während eines Turns lautet die Zeile „schreibt am UR-Entwurf“, der Block „Einen Augenblick“, und die Figur schreibt auf dem Klemmbrett; danach ruht sie wieder.
- AC-003: Eine vollständige UR erscheint als „UR bereit zur Übergabe“ mit „Übergabe in einen Run“ und dem Hinweis, das im Chat zu sagen.
- AC-004: Abdeckung recovery_required, unconfirmed oder unavailable erscheint als „UR-Planung braucht Klärung“ mit eigenem Text je Abdeckung und Hinweis auf den Chat.
- AC-005: Nach der Übergabe verschwindet die UR aus der Planungsliste und der Begleiter zeigt den Run wie bisher.
- AC-006: Ein unlesbarer Planungsordner lässt die Run-Ansicht nicht scheitern; Runs bleiben sichtbar.
- AC-007: Statuszeile „AGDF · UR-Planung“, Hinweise „Abgeschlossene Runs: n“ und „Weitere URs in Planung: n“, alle Texte in der Chat-Sprache ohne Sprachmischung.
- AC-008: Eine neue oder geänderte geplante UR löst genau ein neues Lesen aus; ohne Änderung wird nicht neu gelesen.
- AC-009: Verhalten für Runs und für Projekte ohne AGDF bleibt unverändert; bestehende Testsuiten laufen durch.
