# SD: Recoverable Codex continuation leases

Status: draft
Gate: SD
Gate approval: open
Based on: PRD
Date: 2026-11-27
Owner: Arndt Gold
Traceability contract: criteria-chain-v1
Design Decisions contract: sd-decisions-v1

## 1. Solution Overview

The admission record in `packages/core/lib/companion/codex-continuation.js` gains a last-write time and phase-specific bounds; an ended or expired record counts as absent and is removed under the record lock. Only the Companion attempt claim, reservation and publication still evaluate the Companion start eligibility; ordinary and owner claims check only for a live conflicting admission. The dispatch runtime in `packages/cli/lib/mcp-dispatch-runtime.js` remembers the owners it admitted and writes the owner into the `agdf_dispatch` next call that a canonical write returns for the same Run, while the admission still runs for that owner. An ordinary continuation whose record cannot be read or locked proceeds without an admission. Turn ends scan every live record without a fixed maximum.

## 2. Ownership And Source Of Truth

| Area | Owner | Change |
|---|---|---|
| Admission record, bounds, cleanup | `packages/core/lib/companion/codex-continuation.js` | time field, expiry, removal, claim rules, `holds` |
| Companion start eligibility | `packages/core/lib/companion/codex-continuation-binding.js` | unchanged; used only for reservation, publication and attempt claims |
| Dispatch admission and owner continuity | `packages/cli/lib/mcp-dispatch-runtime.js` | ordinary fail-open, owner memory, next-call owner injection in `postprocessToolResult` |
| Hook observation | `packages/core/lib/companion/codex-activity.js` | passes the hook time to the admission |
| Bound next calls after canonical writes | `packages/core/lib/control-state/run-command-service.js` via `continueDeliveryCall` | unchanged; the owner is added by the dispatch runtime after the result is produced |
| Dispatch input schema | `packages/core/lib/skill-dispatch/contract.js` | unchanged; `continuation_owner` already exists |

## 3. Architecture Decisions

- SDD-001: Records keep `schema_version: 1` and gain an optional `updated_at` (integer milliseconds since the epoch); every write sets it from the admission's clock, `createCodexContinuationAdmission(dataRoot, { now = Date.now })`. A record without `updated_at` (written by the PR #84 version) is aged by the modification time of its file, which `readRecord` takes from the same `fstat` it already performs. The bounds are module constants: `reserved` 2 minutes, `pending` 10 minutes, `running` 60 minutes, each counted from `updated_at`; rationale: one optional field keeps old and new builds able to read each other's records, and the file time gives old records a defined age without a migration step; consequence: `validateRecord` accepts `updated_at` only as a non-negative safe integer, and the 60-minute value is defined locally (equal to `codexTurnBound`, pinned by a test) because `activity.js` does not ship in every runtime profile.
- SDD-002: `status(record, now)` reports `ready` for a missing, settled or expired record; otherwise it keeps the current projections (`pending`, `running`, `running` with `interrupt_requested`, and `ready` for an ended record that `canRelease` confirms). Inside `change()` an expired or settled old record is passed to the transition as absent, and a transition that previously wrote `phase: 'settled'` (cancelled reservation, stale publication, Stop with a clean release) now removes the record file instead; an expired or settled record is removed whenever `change()` touches it and the transition writes nothing new. A record that cannot be read blocks as today unless its file is older than the running bound, in which case `change()` treats it as absent and `inspect` reports `ready`; rationale: removal under the existing per-record lock keeps the one-writer rule, and treating ended records as absent reuses every existing transition unchanged; consequence: `publish` after a removed reservation still returns `ready` without a send permit, and the directory holds only live or not yet visited records.
- SDD-003: `settleTurn(turn, event)` lists the directory without a count limit and visits every record name: a running record of this turn is observed as today; a settled, expired or aged-out unreadable record is removed through a locked helper that re-reads the record before unlinking. The check against the record name pattern and the read size bound of 4096 bytes stay; rationale: once finished records are removed the directory is small, and visiting each name once per turn end is the simplest way to find the turn's record without a second index; consequence: the first turn end after the update also removes records left by the PR #84 version.
- SDD-004: `claim(scope, { attemptId, owner }, eligible)` evaluates `eligible` only for an attempt claim. An owner claim is admitted while the record is `running`, not ended and not interrupted and has that owner: at an unchanged binding it returns the same attempt and owner with `admitted: true` and refreshes `updated_at`; at a new binding it rebinds as today and refreshes `updated_at`. An ordinary claim is admitted when `status` is `ready` and otherwise returns the live state. `associateTurn` refreshes `updated_at` as part of its write. A new public `holds(scope, owner)` reads the record without a lock and returns `true` only for a `running`, not ended, not interrupted record with that owner; rationale: AC-003 and AC-005 make only a live foreign admission a reason to refuse, and the owner token already proves the caller's admitted work; consequence: an owner whose record expired but was not replaced can still continue, while a record replaced by another claim refuses the old owner.
- SDD-005: `admitCodexContinuation` treats a claim without `continuation_attempt_id` and without `continuation_owner` as ordinary: a decision with state `unavailable` returns the dispatch result unchanged (no `work_admission`, no stop), a live `pending` or `running` decision stops with the existing sentences. Attempt and owner claims keep stopping on every non-admitted decision. The eligibility callback passed to `claim` is used only for attempt claims; rationale: the PRD decision that an unreadable or locked record never stops an ordinary continuation; consequence: an ordinary continuation that proceeds without an admission is not visible to the Companion as `running`.
- SDD-006: `createMcpDispatchRuntime` keeps a map from target id and Run id to the owner of the last admission it granted. `postprocessToolResult` for `agdf_run`, `agdf_record`, `agdf_revise` and `agdf_approve` looks at each `next_calls` entry with `tool: 'agdf_dispatch'`, `arguments.continue_delivery === true` and a `run_id`; when the result's `binding.target_id` and that `run_id` have a remembered owner and `holds` confirms it, the entry gets `continuation_owner` set to that owner; otherwise the entry is left unchanged and a remembered owner that no longer holds is forgotten. The server builds `next_action` from `next_calls` after this hook, so the returned next action carries the owner; rationale: canonical write inputs carry no owner, and the serving process is the only place that knows which owner it admitted, so no write contract changes; consequence: the owner never appears for another Run or target, and a process serving two chats of the same Run would give both the owner (PRD risk).
- SDD-007: `observeContinuation` in `codex-activity.js` creates the admission with `{ now: () => now }` from the hook's time, so association and settlement use the same clock as the activity record; the Cockpit session and the dispatch runtime use the default clock; rationale: tests drive hooks with fixed times, and the admission bounds must age consistently with them; consequence: no other caller changes.

## 4. Integration Points

- `agdf_dispatch` with `continue_delivery` (Codex surface, qualified runtime with a companion data root): `admitCodexContinuation` and the owner memory of SDD-005 and SDD-006.
- `agdf_run`, `agdf_record`, `agdf_revise`, `agdf_approve` results: next-call owner injection of SDD-006 in `postprocessToolResult`, before the MCP server projects the result and builds `next_action`.
- Cockpit `agdf_cockpit_continue` (`status`, `reserve`, `publish`, `cancel`): unchanged calls into the admission; their results follow SDD-002 and SDD-004.
- Codex hooks (PostToolUse, Stop, Interrupt) through `observeCodexActivity`: SDD-003 and SDD-007.

## 5. Constraints And Compatibility

- No new dispatch or tool input field; `continuation_owner` already exists in the `agdf_dispatch` schema with its dependent rules.
- Records stay one file per target hash and Run below the companion data root; the PR #84 version can read records written by this version (it ignores `updated_at`), and this version reads and ages its records.
- Admissions stay non-authorizing; the Companion still never records an approval.
- Changes under `packages/core` and `packages/cli` follow the contract text change chain: `npm run build:prepare`, the Copilot payload baseline, `npm run compatibility:record`, then `npm run compatibility:check`.
- Any change to the admission code changes the server digest, so a native continuation qualification record must be recorded again on a real Codex host after this run.

## 6. Test And Evidence Strategy

Reuse first, then targeted new proof:

- `packages/core/test/codex-continuation-admission-test.js`: existing cases stay (one send permit, shared authority, lost publication, cancel and stale, unreadable record, native turn settlement, Stop or Interrupt before the tool result). New cases with a controlled clock: expiry of each phase and of a record without `updated_at` (aged by file time), same-owner re-admission at an unchanged revision and refusal of other owners, ordinary claim of an ineligible Run, removal of record files after cancel, stale publication, settlement and expiry, `settleTurn` with 600 records, aged-out unreadable record, `holds`, and the local 60-minute bound equal to `codexTurnBound`.
- `packages/mcp-server/test/companion-continuation.test.js`: the existing scoped-action case stays. New cases through the real dispatch runtime: an admitted ordinary dispatch, a canonical write for the same Run whose returned next call carries the owner and is admitted; an ordinary continuation that proceeds when the record is unreadable; an ordinary continuation refused by a live foreign admission.
- Existing control-ui `companion-continuation.test.tsx` and the companion run-view suite stay unchanged.
- Build and compatibility: `npm run build:prepare`, Copilot payload baseline, `npm run compatibility:record`, `npm run compatibility:check`.

## 7. Acceptance Traceability

| criterion_id | design_response | source_of_truth | design_decision_ids | compatibility_risk |
|---|---|---|---|---|
| AC-001 | Optional `updated_at`, file-time fallback, 2 / 10 / 60 minute bounds, expired records reported as ready | `codex-continuation.js` | SDD-001, SDD-002 | Old records age by file time; a clock jump changes ages |
| AC-002 | Owner memory and next-call owner injection after canonical writes | `mcp-dispatch-runtime.js` | SDD-006, SDD-004 | Owner only for the same target and Run; shared server process risk |
| AC-003 | Same-owner claim at an unchanged binding admitted and refreshed | `codex-continuation.js` | SDD-004 | none beyond the PRD risk |
| AC-004 | Removal instead of settled records; unbounded scan in `settleTurn` | `codex-continuation.js` | SDD-002, SDD-003 | First scan after the update removes old records |
| AC-005 | Ordinary claims without eligibility; unreadable or locked record does not stop an ordinary continuation | `codex-continuation.js`, `mcp-dispatch-runtime.js` | SDD-004, SDD-005 | Continuation without admission is invisible to the Companion |
| AC-006 | Eligibility kept for reservation, publication and attempt claims; existing tests unchanged | `codex-continuation.js`, `cockpit-session.js` | SDD-004, SDD-007 | none |
| AC-007 | Regression suites, build preparation and compatibility record/check | existing suites and scripts | none — verification of the decisions above, no additional design decision | Native qualification needs a later refresh |

## 8. Risks And Open Questions

- A system clock change shifts all ages; a jump forward can end admissions early, a jump back delays expiry by the jump.
- Two dispatch runtimes in one process share no owner memory; a restarted MCP server forgets its owners, and the next call after a canonical write then carries none, so the ordinary rule applies.
- Removing records under the lock relies on the existing owned-file lock; the lock file name stays outside the record name pattern.
- The browser continuation cases cannot run on this Windows host; CI and the existing jsdom tests cover the Companion side.

## Design Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Record time field and migration of PR #84 records | before_sd | resolved | Optional `updated_at` under `schema_version: 1`; records without it are aged by their file modification time (SDD-001) | Arndt Gold |
| Removal of finished records | before_sd | resolved | Settled, cancelled, stale and expired records are removed under the record lock; aged-out unreadable records are removed after the running bound (SDD-002, SDD-003) | Arndt Gold |
| Owner continuity mechanism | before_sd | resolved | The dispatch runtime remembers its admitted owners and adds `continuation_owner` to the `agdf_dispatch` next call of canonical write results while `holds` confirms the owner (SDD-006) | Arndt Gold |
| Where the Companion eligibility applies | before_sd | resolved | Only reservation, publication and attempt claims; owner and ordinary claims check only for a live conflicting admission (SDD-004) | Arndt Gold |
| Clock source for hooks | before_sd | resolved | The hook time is passed to the admission; other callers use the default clock (SDD-007) | Arndt Gold |
| Exact test file split and fixture sizes | later_tp | deferred | The TP lists the concrete cases per file; the cases themselves are fixed in section 6 | TP author (tp-definition) |

## 9. Next Step

Review this solution design and approve only with:

`Approval: SD`

## AGDF Approval Summary (de; source=en)

- Ziel: Die Fortsetzungssperre endet nach festen Grenzen, wird nach Abschluss gelöscht, weist nur noch bei einer fremden, gültigen Sperre ab und lässt Codex nach einem Schreibvorgang mit seiner Owner-Kennung weiterarbeiten.
- Zeitfeld und Grenzen (SDD-001, SDD-002): optionales Feld `updated_at` unter unveränderter Schemaversion 1; alte Sperren ohne Feld altern nach dem Änderungszeitpunkt ihrer Datei; Grenzen 2 / 10 / 60 Minuten; abgelaufene oder erledigte Sperren gelten als nicht vorhanden und werden unter der Sperrdatei-Lock gelöscht; unlesbare Sperren blockieren nur bis zur 60-Minuten-Grenze.
- Turn-Ende (SDD-003): `settleTurn` durchsucht alle Sperrdateien ohne feste Obergrenze und entfernt dabei erledigte, abgelaufene und gealterte unlesbare Dateien.
- Claims (SDD-004): Begleiter-Eignung nur noch für Reservierung, Veröffentlichung und Begleiter-Claim; derselbe Owner wird bei gleicher Bindung erneut zugelassen und die Zeit erneuert; gewöhnliche Claims scheitern nur an einer gültigen Sperre; neue Abfrage `holds` prüft, ob eine Sperre noch für einen Owner läuft.
- Dispatch (SDD-005, SDD-006): eine gewöhnliche Fortsetzung bei unlesbarer oder gesperrter Datei läuft ohne Sperre weiter; der Dispatch-Runtime merkt sich vergebene Owner und trägt `continuation_owner` in den `agdf_dispatch`-Folgeaufruf nach `agdf_run`, `agdf_record`, `agdf_revise` und `agdf_approve` ein, solange `holds` ihn bestätigt.
- Hooks (SDD-007): die Hook-Zeit wird an die Sperrlogik übergeben, damit Zuordnung und Abschluss mit derselben Uhr altern.
- Nachweis: neue Fälle in `codex-continuation-admission-test.js` (Ablauf je Phase, alte Datei, gleicher Owner, gewöhnlicher Claim, Löschen, 600 Dateien, `holds`, Grenze gleich `codexTurnBound`) und `companion-continuation.test.js` (Folgeaufruf mit Owner, unlesbare Datei, fremde Sperre); bestehende Tests bleiben; Build, Payload-Baseline und Kompatibilitätsnachweis.
- Entscheidungen: optionales Zeitfeld mit Dateizeit-Rückfall; Löschen statt Ablegen erledigter Sperren; Owner-Kontinuität über den Speicher des Dispatch-Runtimes; Begleiter-Eignung nur im Begleiter-Pfad; Hook-Zeit als Uhr. Die genaue Aufteilung der Testfälle legt der TP fest.
- Risiken: Uhrsprünge verschieben das Alter; ein Neustart des MCP-Servers vergisst die Owner, dann gilt die gewöhnliche Regel; ohne Sperre laufende Fortsetzungen sieht der Begleiter nicht.
