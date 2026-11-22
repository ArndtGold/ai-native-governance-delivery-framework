# TP: Browser-only click tests for the Codex Companion

Status: draft
Gate: TP
Gate approval: open
Based on: SD
Date: 2026-11-22
Owner: AGDF test integration and QA
Traceability contract: criteria-chain-v1
Planning Decisions contract: tp-decisions-v1

## 1. Task List

| task_id | Task | Owner | Dependencies |
|---|---|---|---|
| T-001 | Prepare the built Companion and the disposable fixture. Give each case a private workspace, admission root and case marker. Bind selection to the test inventory. Open independent views on the same case when needed. | Test integration | Approved SD |
| T-002 | Extend the existing SDK test host and fixture dispatcher. Keep a case journal outside the page, observe sends and grants at their sources, and release the simulated recipient at a named checkpoint. The only assigned work is a fixture status read and a reply with the case marker. | Test integration and Core | T-001 |
| T-003 | Make the pointer and keyboard cases reproducible. Exercise two competing views and a browser view competing with ordinary fixture dispatch. Capture the losing route in each order. | Companion test maintainer | T-001, T-002 |
| T-004 | Exercise reopen, status check, stale selection, deliberate retry, interruption and candidate change. Retain the same store for the life of each attempt. | Companion and Core test maintainers | T-001, T-002 |
| T-005 | Check the case journal against the browser and service evidence. Run the suite on the identified build and hand the source-labelled results and gaps to the linked continuation Run. | QA | T-001 through T-004 |

## 2. Verification Traceability

| criterion_id | design_decision_id | task_id | scenario_id | expected_result | evidence |
|---|---|---|---|---|---|
| AC-001 | SDD-001 | T-001 | SCN-001 | The current designated fixture is eligible. Selecting an unrelated Run or executing an old binding yields a refusal and zero grants. A fresh independent case cannot inherit the selection. | Fixture inventory, selected Run and revision, canonical refusal and grant journal |
| AC-001 | SDD-005 | T-001 | SCN-002 | At 360 CSS pixels the host identifies the fixture and the card shows the permitted action. Keyboard users can reach it. On stale selection the visible recovery leads back to the current fixture. | Rendered name, action, focus and recovered selection in Chromium |
| AC-002 | SDD-002 | T-003 | SCN-003 | A mouse click and focused Enter, in separate ready cases, each produce one activation, one permit and one observed outgoing bound request. The card shows a pending handoff while delivery is held. | Browser input and rendered state, service permit, actual SDK message and bound attempt in each case |
| AC-002 | SDD-003 | T-002 | SCN-004 | Delivering the original request to the simulated recipient produces one fresh grant, one matching readback and one marker reply. Replaying the same request produces no second grant or reply. | Dispatcher dispositions, fixture status read and recipient reply joined to the original attempt |
| AC-003 | SDD-001 | T-003 | SCN-005 | Both ready cards activate on the same fixture. One permit and one message survive contention. On delivery there is exactly one grant. Both cards can inspect the same handoff. | Two view IDs and input events, same admission root, external sends, grant and losing disposition |
| AC-003 | SDD-003 | T-003 | SCN-006 | If ordinary dispatch wins, the click sends zero messages. If the Companion publishes first, it sends once. In either order only the winning path gains work and the losing route is identified. | Ordered checkpoints, SDK messages, ordinary and receiving dispatcher results, winner's fixture readback |
| AC-004 | SDD-002 | T-004 | SCN-007 | Withhold receiver delivery, reopen the card and activate “Übergabe prüfen”. The attempt stays pending with the same identity. Reopen and inspection add zero sends and grants during observation. | Before/after card state and external cumulative journal spanning both pages |
| AC-004 | SDD-004 | T-004 | SCN-008 | A confirmed pre-publication non-start permits a fresh deliberate retry once ready. A lost response after publication stays unresolved. Refreshing a stale view causes no send, and retry is unavailable while an attempt is unresolved. | Service disposition, visible recovery or retry, binding and count deltas at each action |
| AC-005 | SDD-004 | T-004 | SCN-009 | Matching simulated Stop and Interrupt settle their respective active attempt. Foreign or missing signals leave its status unresolved and produce zero additional starts. The card offers the action appropriate to the resulting eligibility. | Simulated session/turn, attempt correlation, admission result, UI state and additional sends or grants |
| AC-005 | SDD-004 | T-004 | SCN-010 | After a simulated candidate change an old view cannot start work. The new view can offer a fresh start only when its binding is current, its predecessor is settled and the fixture is ready. An unresolved or unobserved predecessor grants zero additional starts. | Old/new identities, shared store, predecessor evidence or gap, UI and admission deltas |
| AC-006 | SDD-002 | T-005 | SCN-011 | The reporting control counts two injected message observations for one attempt as two sends. A disconnected observer yields unknown. An active observer covering an empty interval yields zero. A foreign candidate's observation cannot fill a gap. | Synthetic journal controls compared to counts, source coverage and rejected foreign record |
| AC-006 | SDD-005 | T-005 | SCN-012 | A reviewer can reconstruct a successful case and a partial case, identify the tested build, and distinguish the browser gesture, message, grant and simulated response. | Candidate-scoped report, source labels, attempt aliases, explicit gaps and evidence references |

## 3. Test Plan

Build from a recorded source revision with the repository's supported Node version, lockfile dependencies, Chromium and the existing fixture runtime. The local host requires loopback access and a writable private temporary directory. Record the built UI digest before starting. Assign a fresh disposable case to every variant except where the test explicitly reopens the same attempt. Retain each case journal and Playwright report outside the iframe for the duration of the run.

From the repository root, run `npm --prefix packages/control-ui run typecheck`, then `npm --prefix packages/control-ui run build:mcp`. Implement the browser cases in the existing SDK trace suite. Run them with `npm --prefix packages/control-ui run test:browser -- sdk-trace.spec.mjs`. The individual scenario IDs below identify the relevant assertions in that suite. Use a fresh evidence directory for each candidate. SCN-011 injects records only into a test observer. It never sends a duplicate request to a host.

| criterion_id | scenario_id | test_route | environment | prerequisites_permissions | owner | expected_evidence | unavailable_action |
|---|---|---|---|---|---|---|---|
| AC-001 | SCN-001 | SDK trace selection matrix | Chromium, local SDK fixture | Current, unrelated and obsolete bindings plus an active grant observer | Test integration | Selection, refusal and count per variant | Stop the case if fixture isolation cannot be established |
| AC-001 | SCN-002 | SDK trace focus and recovery | Chromium at 360 CSS px | Named fixture, keyboard focus and stale view | Companion | Visible action, focused control and selected Run after recovery | Record the specific focus, label or recovery failure |
| AC-002 | SCN-003 | SDK trace click and Enter | Two independent Chromium cases at 360 CSS px | Fresh ready attempt and observable SDK bridge for each input | Companion | One actual message for each activation and pending state | Mark the affected input or observation incomplete |
| AC-002 | SCN-004 | SDK trace plus fixture dispatch and replay | Chromium and local simulated recipient | Original bound request, grant observer and read-only status fixture | Test integration | Grant, fixture status and marker on the same attempt | Identify the first missing receipt, grant, read or reply |
| AC-003 | SCN-005 | SDK trace two-view race | Two Chromium pages on one service | Both cards ready before either acts, one shared store, receiving step released after publication | Companion | Two activations, one send, one grant and the losing view's disposition | Reject a race with separate stores or an unobserved competitor |
| AC-003 | SCN-006 | SDK trace mixed race in both orders | Chromium and ordinary test dispatcher | One shared fixture store and checkpoints at publication and claim | Core | Ordered per-route counts and the winning claim for each order | Identify any unavailable route and report narrower dispatcher evidence separately |
| AC-004 | SCN-007 | SDK trace reopen and status check | Chromium reload against retained service | Hold delivery after the observed send and keep the case journal attached | Companion | Original attempt and zero deltas across reopen/check | Mark the interval unknown if observation broke during reload |
| AC-004 | SCN-008 | SDK trace recovery variants | Chromium and controllable local publisher | Separate confirmed non-start, lost response and stale-binding fixtures | Core | Status, explicit retry input where eligible and send deltas | Do not enable a retry based on elapsed time or an absent reply |
| AC-005 | SCN-009 | SDK trace simulated lifecycle matrix | Chromium with a bound fixture attempt | Known matching, foreign and absent terminal signals tested separately | Core | Event provenance, visible action and per-attempt disposition | Record missing correlation and leave the case incomplete |
| AC-005 | SCN-010 | SDK trace change of candidate | Chromium with old/new views of one fixture | Preserve the admission store and vary predecessor disposition | Core | Identities and admission outcome for settled, pending and evidence-gap cases | Mark continuity unknown when predecessor evidence is unavailable |
| AC-006 | SCN-011 | Journal controls alongside SDK trace | Local test observer and Chromium case journal | Duplicate, missing-source, empty-interval and foreign records | QA | Actual count, unknown, measured zero and excluded record | Fail the reporting check if an unknown becomes zero |
| AC-006 | SCN-012 | Reconstruct the case from retained evidence | Browser report and external case journal | Build digest, scoped case records and separately labelled inputs | QA | Reproducible source-to-result chain for one complete and one partial case | Identify the precise unsubstantiated claim in the handoff |

The existing reports for aa73dfba contain three passing Chromium cases. They cover keyboard and pointer activation, pending checks after reopening, and one outgoing message from two contending cards. The pointer and two-card variants were exploratory. Retain them as reproducible cases. Their earlier results establish a baseline for those interactions. Receiver grants, marker replies, mixed-route contention and recovery variants require their own observations on the delivery candidate.

For failure diagnosis, reuse the Core admission suite at `packages/core/test/codex-continuation-admission-test.js` and the MCP fixture suite at `packages/mcp-server/test/companion-continuation.test.js`. Record their results separately from browser observations. For the race cases, synchronize on observed readiness, publication and claim. Exercise each prescribed order on an independent fixture. Repeat on a fresh fixture after an intermittent failure and retain both results. A later pass does not erase an unexplained double start.

## Planning Decisions

| Decision | Source | Status | Resolution | Owner |
|---|---|---|---|---|
| Fixture scheduling, commands and retained evidence | SD: Reproducible scenario execution | resolved | Use the existing Chromium SDK trace command with cases SCN-001 through SCN-012, isolated fixtures, explicit publish/claim checkpoints and an external cumulative journal across reloads. Bind each report to its source revision and UI digest. | AGDF QA |
| Reporting unavailable observations | TP | resolved | Emit unknown with the source and missing interval. Record measured zero only for an observed interval. Keep lower-level diagnostics and simulated events attributed to their own sources. | AGDF QA |

## 4. Brownfield Scope

Reuse the built Companion, its existing action text and focus handling, the SDK trace host, and Core's admission and binding modules. Attach the ordinary fixture dispatcher to the same store used by the test service. Inspect the current Core and MCP fixtures before adding adapters. The scenario work belongs in the test host, fixtures and evidence collection. The linked continuation Run owns native qualification.

## 5. Out Of Scope

Native Codex Desktop click tests, a Desktop restart, actual user-chat messages or Codex turns, a production qualification override, production credentials, and writes to ordinary user Runs are outside this plan.

## 6. Risks And Blockers

A second work grant, a duplicate actual send from competing cards, a start on an ineligible binding, or a retry of an unresolved attempt fails the affected scenario and requires correction. An unobserved claim, a missing marker or a broken observation interval remains an evidence gap. Report the gap and its impact on the criterion before deciding CD+Tests. Redact unrelated chat data and private paths from the handoff. The linked Run receives evidence scoped to the tested browser build and fixture.

## 7. Next Step

Review this browser-only task and test plan. Approval permits implementation and execution of the twelve scenarios. The approval response is `Approval: TP`.

## AGDF Approval Summary (de; source=en)

- Der Plan umfasst zwölf Prüffälle für den gebauten Begleiter in Chromium. Alle Klicks erfolgen im Browser an eigens angelegten Test-Runs.
- Der Test verfolgt einen Klick auf „Run fortsetzen“ bis zur Antwort des simulierten Empfängers. Bei zwei gleichzeitigen Startversuchen muss genau ein Auftrag ankommen. Bleibt die Übergabe offen, darf „Übergabe prüfen“ auch nach dem Wiederöffnen keinen zweiten Auftrag auslösen.
- Drei frühere Browserfälle liefern erste Belege. Der neue Plan prüft zusätzlich den Empfang, den Abbruch und den Wechsel der getesteten Fassung. Fehlt ein Beleg, weist der Bericht die Lücke aus.
