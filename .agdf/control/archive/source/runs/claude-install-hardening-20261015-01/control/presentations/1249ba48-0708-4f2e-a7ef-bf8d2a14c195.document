# PRD: Harden the Claude installer against stale and shadowed installations

Status: draft
Gate: PRD
Gate approval: open
Based on: UR
Date: 2026-10-15
Owner: Arndt Gold
Traceability contract: criteria-chain-v1

## 1. Product Scope

Deliver a Claude installation path that either reaches the AGDF state Claude Code sessions actually
load, verified by content provenance, or stops or degrades with an accurate, actionable report:

- review and integrate candidate fix `42c42850` (retirement of stale AGDF-owned package-private
  marketplace copies, SessionStart drift notice);
- refuse installation from inside a packaged app before any change;
- make the marketplace Claude loads identical for processes inside and outside packaged apps;
- follow the actual Claude Code loading model without uninstall/reinstall on every run;
- verify installed content by source and runtime digest, never reporting a mismatch as `healthy`;
- read installed state and version from machine-readable Claude Code output where available;
- deliver AGDF runtime facts to Claude sessions under the existing plugin-enablement consent and
  report runtime-check status accordingly;
- report failures after the marketplace commit truthfully without destructive recovery, and complete
  interrupted cleanup on the next run;
- automated regression tests for every criterion, plus native confirmation on Windows before UAT.

## 2. UX Intent And Success

- ui_ux_impact: medium
- ux_intent_definition: .agdf/control/artefacts/claude-install-hardening-20261015-01/UX_INTENT_DEFINITION.md (decision: ready)
- primary_user_intent: Install or update AGDF for Claude once and trust that every new Claude session (Claude Desktop or terminal Claude Code) runs exactly that installed state.
- success_signal: The install reports `healthy` only when the state Claude loads matches the installed content; every other outcome names its cause and one remedy; a new session shows no drift notice unless a mismatch exists.
- primary_decision_or_action: Run the Claude install from an ordinary terminal and act on the reported result.

## 3. Working Modes And Effective State

| working_mode | effective_state | visible_state_types | effective_state_authority | primary_state_presentation_owner |
|---|---|---|---|---|
| M1 install from an ordinary terminal | `healthy` when committed and loaded content digests match; otherwise `degraded` | install result status, evidence entries, remedy line | AGDF installer verification against installation provenance | AGDF install CLI output |
| M2 install started inside a packaged app | `refused`; nothing changed | error with cause and remedy | packaged-app preflight | AGDF install CLI output |
| M3 repeated install (unchanged or changed content) | unchanged: installed state kept, `healthy`; changed: new content verified as in M1 | install result status and evidence | AGDF installer verification | AGDF install CLI output |
| M4 install whose post-commit cleanup fails | `degraded`; new state committed; cleanup pending | install result status, recovery evidence, remedy line | marketplace transaction owner | AGDF install CLI output |
| M5 Claude session start (Desktop or terminal) | `matched` or `drift`; runtime facts present while the plugin is enabled | SessionStart context: dispatcher binding, runtime facts, drift notice | loaded root provenance versus installed record; Claude plugin enablement as consent | agent in the session, relaying the SessionStart context |
| M6 `runtime-checks status --surface claude` | `enabled` exactly when sessions receive runtime facts | status output | the same consent evaluation as M5 | runtime-checks CLI output |

## 4. Activation, Blockers, Recovery And Transitions

- activation_and_deactivation: `npm run install:claude` or `npx --yes @agdf/cli@latest claude` start M1–M4; any new Claude session starts M5; `runtime-checks status --surface claude` starts M6; `claude plugin disable agdf@agdf` deactivates the session check and runtime facts, `claude plugin enable agdf@agdf` reactivates them.
- blockers_and_visible_next_actions: install inside a packaged app → refused, "run the installation from a terminal outside <app>"; content digest mismatch → degraded, both digests shown, "restart <app>; reinstall from a terminal if it persists"; stale package copy that cannot be retired or foreign copy → degraded, package named, remedy shown; post-commit cleanup blocked by running sessions → degraded, sessions named, "close them and run the installation again"; Claude Code CLI missing → existing executable error.
- recovery_paths: rerun from an ordinary terminal; close or restart Claude Desktop and Claude Code sessions, then rerun; a rerun completes pending cleanup without reinstalling unchanged content; transient lock or busy failures are reported as retryable with the same rerun action.
- relevant_state_transitions: refused → (rerun outside the package) → healthy; degraded (mismatch or stale copy) → (restart or reinstall) → healthy; degraded (cleanup pending) → (next run) → healthy; session drift → (restart or reinstall) → matched; plugin enabled ↔ disabled switches runtime facts on and off; on every failure no previously working installation is removed.

## 5. Acceptance Criteria

Each criterion lists its `criterion_id` and the observable fields used by SD, TP and QA.

- criterion_id: AC-001
  - title: Packaged-app refusal
  - working_mode: M2
  - source_state: any installed or uninstalled state
  - action: start the Claude install from a process inside a packaged app
  - expected_effective_state: refused; no marketplace, data-root or host-registration change
  - visible_feedback: one message naming the package, the cause and the remedy
  - blocker_behavior: the refusal is the blocker
  - recovery_next_action: run the installation from an ordinary terminal
  - observable_success: an install from inside a packaged app changes nothing and reports package, cause and remedy
  - required_evidence: automated test with simulated package context; native observation from a Claude Desktop session
- criterion_id: AC-002
  - title: Ordinary terminal install unaffected
  - working_mode: M1
  - source_state: no install, older install or current install
  - action: install from an ordinary terminal
  - expected_effective_state: healthy when verification passes
  - visible_feedback: result status and evidence entries
  - blocker_behavior: verification and cleanup failures follow AC-007 and AC-010
  - recovery_next_action: none on success
  - observable_success: the preflight does not refuse an ordinary terminal install, which reports healthy when verification passes
  - required_evidence: automated test; native install log
- criterion_id: AC-003
  - title: One marketplace for all processes
  - working_mode: M1 then M5
  - source_state: a previous install exists, possibly with a package-private copy
  - action: install from an ordinary terminal, then start a new Claude Desktop session and a new terminal Claude Code session
  - expected_effective_state: both sessions load the installed AGDF state
  - visible_feedback: no drift notice in either session
  - blocker_behavior: a remaining stale copy yields AC-004 or AC-011 feedback
  - recovery_next_action: as in AC-004 and AC-011
  - observable_success: a new Claude Desktop session and a new terminal session load the same installed state without drift notice
  - required_evidence: native observation on Windows of both sessions with their digests
- criterion_id: AC-004
  - title: Stale and foreign package copies
  - working_mode: M1
  - source_state: package-private marketplace copies exist
  - action: install from an ordinary terminal
  - expected_effective_state: stale AGDF-owned copies are retired; foreign copies stay untouched; degraded while any copy cannot be retired or is foreign
  - visible_feedback: one evidence entry per copy with package and state
  - blocker_behavior: a failed retirement keeps the copy and reports the reason
  - recovery_next_action: close the packaged app and rerun
  - observable_success: stale AGDF-owned copies are removed, foreign copies remain and are reported, and the result is degraded while any copy remains
  - required_evidence: automated tests including failure cases; native observation
- criterion_id: AC-005
  - title: Unchanged reinstall is quiet
  - working_mode: M3
  - source_state: current healthy install
  - action: rerun the install with unchanged content
  - expected_effective_state: healthy without uninstall or reinstall of the Claude plugin
  - visible_feedback: the result indicates unchanged content
  - blocker_behavior: verification failure follows AC-007
  - recovery_next_action: none
  - observable_success: a rerun with unchanged content issues no plugin uninstall or install command and stays healthy
  - required_evidence: automated test of the issued host commands
- criterion_id: AC-006
  - title: Changed content reaches sessions
  - working_mode: M3 then M5
  - source_state: healthy install of an older build
  - action: install a changed build, then start a new session
  - expected_effective_state: the new session loads the changed content on every supported Claude Code loading behaviour
  - visible_feedback: result healthy; no drift notice
  - blocker_behavior: AC-007 when the loaded content differs
  - recovery_next_action: restart the app
  - observable_success: changed content reaches new sessions on every supported Claude Code loading behaviour
  - required_evidence: automated test per supported loading behaviour; native observation
- criterion_id: AC-007
  - title: Content verification
  - working_mode: M1 and M3
  - source_state: install committed
  - action: verification after install
  - expected_effective_state: healthy only if source and runtime digests of the loaded root and of the recorded Claude install match the committed ones; otherwise degraded
  - visible_feedback: expected and observed digests with the remedy
  - blocker_behavior: a mismatch is reported and never healthy
  - recovery_next_action: restart the app; reinstall from a terminal if it persists
  - observable_success: the result is healthy only when loaded and installed source and runtime digests match, otherwise degraded with both digests and a remedy
  - required_evidence: automated tests for match and mismatch
- criterion_id: AC-008
  - title: Machine-readable host state
  - working_mode: M1 and M3
  - source_state: any
  - action: read installed state and version of agdf@agdf
  - expected_effective_state: values come from machine-readable Claude Code output where available, otherwise from a defined fallback reported as evidence
  - visible_feedback: evidence names the source used
  - blocker_behavior: unreadable output yields a non-healthy result with the reason
  - recovery_next_action: update Claude Code or rerun
  - observable_success: installed state and version come from machine-readable output or a reported fallback, and unreadable output is never healthy
  - required_evidence: automated tests with recorded host outputs
- criterion_id: AC-009
  - title: Runtime facts for Claude
  - working_mode: M5 and M6
  - source_state: plugin enabled, repository session
  - action: start a new Claude session; query runtime-check status
  - expected_effective_state: the session receives AGDF runtime facts and status reports enabled; after claude plugin disable agdf@agdf no session check runs
  - visible_feedback: runtime facts in the SessionStart context; status output
  - blocker_behavior: a failing check reports its finding without blocking the session
  - recovery_next_action: enable or disable the plugin
  - observable_success: with the plugin enabled Claude sessions receive runtime facts and status reports enabled; when disabled no check runs; no receipt or permission rule is written
  - required_evidence: automated session-check tests for Claude; native observation
- criterion_id: AC-010
  - title: Truthful post-commit failure
  - working_mode: M4
  - source_state: install committed, backup cleanup fails
  - action: complete the install
  - expected_effective_state: the new state stays installed and registered; result degraded; cleanup pending
  - visible_feedback: recovery evidence and remedy; no entry claims a restoration that did not happen
  - blocker_behavior: no uninstall, rollback or reinstall is triggered
  - recovery_next_action: close the named sessions and rerun
  - observable_success: after a post-commit cleanup failure the new state stays installed, the result is degraded without a false restored entry, and the next run completes the cleanup
  - required_evidence: automated fault-injection test
- criterion_id: AC-011
  - title: Drift notice
  - working_mode: M5
  - source_state: loaded state differs from or matches the installed record
  - action: start a new Claude session
  - expected_effective_state: drift or matched
  - visible_feedback: a drift notice with cause and remedy, naming the package when a package-private copy is loaded; nothing when matched
  - blocker_behavior: the notice never blocks the session
  - recovery_next_action: restart the app or reinstall from a terminal
  - observable_success: a drift notice appears only when the loaded state differs from the installed one, including after an unchanged reinstall without reinstall cycle
  - required_evidence: automated tests; native observation
- criterion_id: AC-012
  - title: Relocation migration, only if SD relocates the marketplace
  - working_mode: M1
  - source_state: existing Claude and Codex installations at the old location
  - action: install from an ordinary terminal
  - expected_effective_state: both hosts use the new location without manual steps; uninstall removes or reports the new location
  - visible_feedback: migration evidence entries
  - blocker_behavior: a failed migration keeps the previous working installation
  - recovery_next_action: rerun
  - observable_success: if relocated, existing Claude and Codex installations migrate without manual steps and keep working on failure
  - required_evidence: automated migration tests; Codex regression evidence
- criterion_id: AC-013
  - title: Other hosts unchanged
  - working_mode: not_applicable, installer regression for Codex, Copilot and OpenCode
  - expected_effective_state: Codex, Copilot and OpenCode install behaviour is unchanged except AC-012; the Copilot payload stays byte-identical
  - observable_success: Codex, Copilot and OpenCode installers behave unchanged except AC-012 and the Copilot payload is byte-identical
  - required_evidence: existing host suites and payload budget checks pass unchanged
- criterion_id: AC-014
  - title: Native Windows qualification
  - working_mode: M1 to M6 on Windows
  - expected_effective_state: AC-001, AC-003, AC-006, AC-009 and AC-011 are confirmed natively before UAT
  - observable_success: a native Windows run with Claude Desktop and terminal Claude Code confirms AC-001, AC-003, AC-006, AC-009 and AC-011 before UAT
  - required_evidence: recorded native observations bound to the installed source and runtime digests

## 6. Non-Goals

- `bigint` file identities and splitting `local-marketplace.js`.
- Codex, Copilot and OpenCode installer behaviour beyond AC-012 and AC-013.
- Reconciling package-private copies of `runtime-checks`, `mcp` or `packages` data.
- MCP server, dispatcher or gate behaviour; version bump, release or publication.
- Investigating the working-tree reset of 2026-10-15; other open runs.

## 7. Users And Roles

- AGDF users installing or updating AGDF for Claude Code or Claude Desktop on Windows (and the same
  installer on macOS/Linux, where packaged-app virtualization does not apply).
- AGDF maintainers diagnosing installations from install evidence and SessionStart context.
- Coding agents in Claude sessions that consume the dispatcher binding, runtime facts and drift notice.
- Codex users of the shared marketplace when AC-012 applies.
- Decision owner: Arndt Gold.

## 8. Constraints

- Preserve fail-closed ownership: nothing without a valid AGDF ownership marker is deleted.
- No permission rule or runtime-check receipt is written for Claude; consent remains plugin enablement.
- Host-owned directories (Claude Code plugin cache and registrations) are changed only through the
  Claude Code CLI.
- Behaviour on macOS and Linux must not regress; packaged-app logic applies only where virtualization exists.
- Existing installations must keep working when any step fails.

## 9. Evidence Requirements

- Automated regression tests for AC-001 to AC-013 in the smoke-test chain.
- Review of candidate commit `42c42850` as part of Code Review.
- Native Windows observations for AC-014 bound to the installed source and runtime digests.
- Codex regression evidence when AC-012 applies.

## 10. Risks And Open Questions

- In-package detection before any private copy exists (SD).
- Claude Code loading behaviour across supported versions; reconciling the drift comparison once the
  reinstall cycle is removed (SD).
- Relocation target and its Codex/uninstall consequences (SD).
- Availability of machine-readable plugin listing and its fallback (SD).
- Runtime-fact cost at each session start must stay within the existing consent disclosure (SD/TP).

## Approval Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Runtime facts for Claude | before_prd | resolved | Deliver runtime facts to Claude sessions under plugin-enablement consent; status reports `enabled` accordingly (user decision 2026-10-15). | Arndt Gold |
| Native Windows confirmation | before_prd | resolved | Required before UAT for AC-001, AC-003, AC-006, AC-009 and AC-011 (user decision 2026-10-15). | Arndt Gold |
| Install inside a packaged app | before_prd | resolved | Refuse before any change with cause and remedy (approved UR scope). | Arndt Gold |
| Accountable owner and release scope | before_prd | resolved | Arndt Gold; no release or publication in this run. | Arndt Gold |
| Marketplace location: relocate or preflight plus reconciliation | later_sd | open | Decided in SD with Codex and uninstall consequences. | Arndt Gold |
| In-package detection signal | later_sd | open | Decided in SD. | Arndt Gold |
| Loading-model handling and drift reconciliation | later_sd | open | Decided in SD. | Arndt Gold |
| Machine-readable listing fallback | later_sd | open | Decided in SD. | Arndt Gold |
| Exact message wording | later_tp | open | Fixed in TP with tests. | Arndt Gold |

## 11. Next Step

Present this PRD only after every `before_prd` row is `resolved` with a concrete answer and
the named PRD Owner is filled. Then review and approve only with:

`Approval: PRD`

## AGDF Approval Summary (de; source=en)

- Ziel: Eine Claude-Installation erreicht nachweislich den AGDF-Stand, den Claude-Sessions tatsächlich laden, oder stoppt beziehungsweise meldet sich als eingeschränkt, jeweils mit Ursache und einer Abhilfe.
- Umfang: Fix 42c42850 prüfen und übernehmen; Installation aus einem App-Paket vor jeder Änderung ablehnen; derselbe Marketplace für Prozesse innerhalb und außerhalb von App-Paketen; tatsächliches Ladeverhalten ohne Deinstallieren und Neuinstallieren bei jedem Lauf; Inhaltsprüfung über Source- und Runtime-Digest; maschinenlesbarer Host-Zustand; Runtime-Facts für Claude-Sessions unter dem Plugin-Consent; wahrheitsgemäße Meldung von Fehlern nach dem Commit; Regressionstests für alles und ein nativer Windows-Nachweis vor UAT. Nicht enthalten: bigint, Aufteilung von local-marketplace.js, andere Host-Installer außer AC-012/AC-013, private Kopien von runtime-checks/mcp/packages, MCP-Server, Dispatcher, Gates, Release.
- Entscheidungen: Runtime-Facts werden an Claude-Sessions geliefert, der Status meldet „enabled“ entsprechend. Ein nativer Nachweis unter Windows ist vor UAT Pflicht. Installation aus einem App-Paket wird abgelehnt. Verantwortlich ist Arndt Gold, kein Release. Marketplace-Ort, Erkennungssignal, Ladeverhalten mit Drift-Abgleich und Fallback der Plugin-Liste entscheidet das SD; die genauen Meldungstexte legt der TP fest.
- AC-001: Eine Installation aus einem App-Paket ändert nichts und meldet Paket, Ursache und Abhilfe (Installation aus einem normalen Terminal).
- AC-002: Eine Installation aus einem normalen Terminal wird vom Vorab-Check nicht blockiert und meldet „healthy“, wenn die Prüfung besteht.
- AC-003: Nach einer Installation aus dem Terminal laden eine neue Claude-Desktop-Session und eine neue Terminal-Session denselben Stand, ohne Drift-Meldung.
- AC-004: Veraltete AGDF-eigene Paketkopien werden entfernt, fremde bleiben unangetastet und werden gemeldet; solange eine Kopie bleibt, ist das Ergebnis eingeschränkt.
- AC-005: Eine erneute Installation mit unverändertem Inhalt deinstalliert und installiert nichts und bleibt „healthy“.
- AC-006: Geänderter Inhalt erreicht neue Sessions bei jedem unterstützten Ladeverhalten von Claude Code.
- AC-007: „healthy“ nur bei übereinstimmenden Source- und Runtime-Digests von geladenem Verzeichnis und Claude-Installation; sonst eingeschränkt mit beiden Digests und Abhilfe.
- AC-008: Installationsstatus und Version kommen aus maschinenlesbarer Claude-Code-Ausgabe, sonst aus einem gemeldeten Fallback; nicht lesbare Ausgabe ist nie „healthy“.
- AC-009: Bei aktiviertem Plugin erhalten Claude-Sessions die Runtime-Facts und der Status meldet „enabled“; nach claude plugin disable agdf@agdf läuft kein Check; kein Receipt, keine Permission-Regel.
- AC-010: Scheitert das Aufräumen nach dem Commit, bleibt der neue Stand installiert, das Ergebnis ist eingeschränkt, nichts meldet eine nicht erfolgte Wiederherstellung, und der nächste Lauf räumt auf.
- AC-011: Eine Session, die einen anderen als den installierten Stand lädt, zeigt eine Drift-Meldung mit Ursache und Abhilfe; bei Übereinstimmung erscheint keine, auch nicht nach einer erneuten Installation ohne Neuinstallation.
- AC-012: Nur falls das SD den Marketplace verlegt: bestehende Claude- und Codex-Installationen migrieren ohne Handarbeit, die Deinstallation behandelt den neuen Ort, ein Fehlschlag lässt die alte Installation funktionsfähig.
- AC-013: Codex-, Copilot- und OpenCode-Installer bleiben außer AC-012 unverändert; die Copilot-Payload bleibt byte-gleich.
- AC-014: Vor UAT bestätigt ein nativer Lauf unter Windows mit Claude Desktop und Claude Code im Terminal AC-001, AC-003, AC-006, AC-009 und AC-011, gebunden an die installierten Digests.
