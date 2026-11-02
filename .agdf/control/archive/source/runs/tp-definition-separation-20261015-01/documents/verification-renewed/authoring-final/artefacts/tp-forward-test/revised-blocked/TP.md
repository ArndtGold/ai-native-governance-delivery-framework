# TP: Personal named filter save and restore

Status: draft
Gate: TP
Gate approval: open
Based on: SD
Date: 2026-10-15
Owner: TP authoring agent (isolated fixture)
Traceability contract: criteria-chain-v1
Planning Decisions contract: tp-decisions-v1

This plan applies only to synthetic run `tp-authoring-test`. The canonical run has approved UR, PRD and SD; their unchanged draft/open document headers are not the approval authority. The synthetic approvals authorize no live-repository action. The PRD is product authority; the SD is design authority. Scenario results below are required future evidence unless expressly identified as baseline observations. No implementation or gate approval is performed by preparing this plan. Revision request: the user now wants saved filters available to teammates. That request conflicts with the still-approved no-sharing scope. This revision records a blocking clarification and preserves the useful personal-filter plan; it does not incorporate sharing as approved behavior.

## 1. Task List

| task_id | Task | Owner | Dependencies |
|---|---|---|---|
| T-001 | Inspect the approved PRD/SD, analytical input and existing `FilterService`, tests and package script; preserve service ownership and reuse the existing save/restore API. Baseline already inspected and executed; reconfirm unchanged inputs before later execution. No application change is currently indicated. | Fixture delivery agent | New deliberate TP approval before implementation or test changes; approved source bindings remain current |
| T-002 | After TP approval, retain the existing round-trip and empty-value tests and add an explicit restored-object mutation test in `filter-service.test.mjs`; keep nested values, deep equality and clone isolation observable. Reuse the existing service. | Fixture delivery agent | T-001; TP approval |
| T-003 | After TP approval, retain cross-user rejection and invalid-user tests; add missing-name restore and invalid-save boundary cases covering missing name, missing values and array values. Keep tests local with synthetic users; do not alter permissions or add sharing. | Fixture delivery agent | T-001; TP approval |
| T-005 | Obtain a substantive scope answer from Test product owner for CLAR-001 before planning team access. Reassess affected PRD/SD and every dependent task/scenario after the answer. Any source revision requires its separate existing owner and approvals; no source edit is authorized here. | TP authoring agent (isolated fixture) | CLAR-001 is open; approved sources remain protected |
| T-004 | Execute each SCN route and the complete test file after T-002/T-003, retain command, Node version, exit status and complete TAP output, compare source/application changes and review evidence against this plan. Escalate any mismatch to the existing owner before proceeding; no automatic QA decision. | Fixture verification agent | T-002; T-003 |

## 2. Verification Traceability

All existing execution tasks and scenarios below are retained baseline planning context, blocked from implementation by CLAR-001. They do not verify team availability. In particular SCN-003 expresses the still-approved personal boundary and must be reassessed if the scope changes. No team-sharing acceptance or design authority is invented here.

Acceptance authority is referenced through `AC-001` without introducing new acceptance IDs. Every scenario maps to the existing `SDD-001`; these boundary checks protect its reuse and personal ownership consequences.

| criterion_id | design_decision_id | task_id | scenario_id | expected_result | evidence |
|---|---|---|---|---|---|
| AC-001 | SDD-001 | T-002 | SCN-001 | Save user a's daily filter with nested tags, mutate the original input, then restore as a; deep equality shows the originally saved values. | Existing test `save and restore values independently of later mutation`; execution/SCN-001.tap and execution/commands.json |
| AC-001 | SDD-001 | T-002 | SCN-002 | Mutate a first restored nested array; a second restore by the same user still equals the saved values. | Planned test `restored values are isolated from later mutation`; execution/SCN-002.tap and execution/commands.json |
| AC-001 | SDD-001 | T-003 | SCN-003 | User b cannot restore user a's daily filter; RangeError is observed and no values are returned. | Existing test `personal ownership`; execution/SCN-003.tap and execution/commands.json |
| AC-001 | SDD-001 | T-002 | SCN-004 | An empty filter object saved and restored for the same user compares deeply equal to an empty object. | Existing test `empty/default values`; execution/SCN-004.tap and execution/commands.json |
| AC-001 | SDD-001 | T-003 | SCN-005 | Empty user or name, missing values and array values each cause TypeError; an existing valid saved filter remains restorable without change. | Existing `invalid input` test to be extended with explicit assertions; execution/SCN-005.tap and execution/commands.json |
| AC-001 | SDD-001 | T-003 | SCN-006 | Restoring an unknown name for user a causes RangeError while that user's daily filter still restores its saved values. | Planned test `missing named filter`; execution/SCN-006.tap and execution/commands.json |

Paths prefixed `execution/` in this plan mean `.agdf/control/artefacts/tp-authoring-test/execution/`. These files are future evidence obligations and do not currently exist. Existing baseline evidence is separately retained at `artefacts/tp-forward-test/02-baseline-tests.tap`.

## 3. Test Plan

Use the available local Node v22.22.3 executable `/usr/local/Cellar/node@22/22.22.3/bin/node` as NODE below. Each command runs from the bound fixture root. After TP approval, the named tests must exist and the evidence must show the named test actually ran; a zero exit caused by an unmatched pattern is insufficient. Synthetic strings a and b are test user identities, not accounts. All checks use the in-memory service in a fresh local process with no network or production permissions.

| criterion_id | scenario_id | test_route | environment | prerequisites_permissions | owner | expected_evidence | unavailable_action |
|---|---|---|---|---|---|---|---|
| AC-001 | SCN-001 | NODE --test --test-name-pattern='^save and restore values independently of later mutation$' filter-service.test.mjs | Isolated local fixture, Node 22.22.3 | Read fixture; later test execution; existing case; no account access | Fixture verification agent | execution/SCN-001.tap shows that exact case passes; commands.json has command, version and exit 0 | Stop this verification; retain error and ask Fixture delivery agent to restore the local prerequisite; no success claim |
| AC-001 | SCN-002 | NODE --test --test-name-pattern='^restored values are isolated from later mutation$' filter-service.test.mjs | Isolated local fixture, Node 22.22.3 | TP approval and T-002 test addition first; local file/test permissions only | Fixture verification agent | execution/SCN-002.tap shows the exact case and deep-equality assertion pass; commands.json records exit 0 | Missing test is an evidence gap; complete T-002 after approval or block QA evidence; do not substitute SCN-001 |
| AC-001 | SCN-003 | NODE --test --test-name-pattern='^personal ownership$' filter-service.test.mjs | Isolated local fixture, Node 22.22.3 | Existing case; synthetic users; no production account needed | Fixture verification agent | execution/SCN-003.tap shows the cross-user RangeError assertion passes; commands.json records exit 0 | Retain failure and route to Fixture delivery agent; ownership-design change goes to Test design owner |
| AC-001 | SCN-004 | NODE --test --test-name-pattern='^empty/default values$' filter-service.test.mjs | Isolated local fixture, Node 22.22.3 | Existing case; local test execution only | Fixture verification agent | execution/SCN-004.tap shows empty-object equality passes; commands.json records exit 0 | Retain error and stop the affected claim until Fixture delivery agent resolves it |
| AC-001 | SCN-005 | NODE --test --test-name-pattern='^invalid input$' filter-service.test.mjs | Isolated local fixture, Node 22.22.3 | TP approval and T-003 expanded assertions first; local test permissions | Fixture verification agent | execution/SCN-005.tap plus reviewed test assertions cover every listed invalid input and retained valid filter; commands.json records exit 0 | The current one-input test is insufficient for this obligation; complete T-003 after approval or block QA evidence |
| AC-001 | SCN-006 | NODE --test --test-name-pattern='^missing named filter$' filter-service.test.mjs | Isolated local fixture, Node 22.22.3 | TP approval and T-003 test addition first; local test permissions | Fixture verification agent | execution/SCN-006.tap shows missing-name rejection and preserved daily values; commands.json records exit 0 | Missing test stays a gap; complete T-003 after approval or block QA evidence |

T-004 additionally runs `NODE --test filter-service.test.mjs`, retaining `execution/full-suite.tap`. All six named scenarios must run with zero failures and no relevant skip. The test review must verify that each asserted result matches the table, rather than treating TAP counts as semantic proof. No local result establishes production integration, durable persistence, UAT, QA approval or release readiness.

## Planning Decisions

| Decision | Source | Status | Resolution | Owner |
|---|---|---|---|---|
| Local verification applicability and execution route | TP | resolved | The approved SD has no later_tp rows. Its existing filter-service boundary is fully available in this fixture. Use local Node unit tests and synthetic users for all six scenarios; no external permissions are required. The retained personal-only test routes remain locally executable; missing planned tests are post-approval tasks. This execution decision does not resolve or authorize the separately requested team-sharing scope. | TP authoring agent (isolated fixture) |
| Team availability scope conflict | TP | open | CLAR-001: The new teammate-access request changes the approved no-sharing scope and may change ownership, permissions, acceptance and SDD-001. Test product owner must answer the UR scope question before dependent planning is valid. No sharing tasks or tests can become an approved plan on the unchanged sources. | Test product owner |

## Clarification Requests

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CLAR-001 | requirements_gap | UR | open | changed scope and changed user intent: the new raw request says saved filters should additionally be available to teammates, whereas approved UR Scope says One user-owned saved filter, no sharing.; approved UR Non-Goals says No shared filters or permissions change.; PRD Product Scope likewise excludes sharing and permissions change, and SDD-001 has consequence no shared filters. This changes the earliest user scope, so it cannot be handled as local test detail. | Ask Test product owner for the substantive changed-UR-scope answer recorded in Clarification Details before any sharing planning or source revision. |

## Clarification Details

| finding_id | planning_decision | question | blocking_reason | required_answer | owner | source_ref | resolution_evidence |
|---|---|---|---|---|---|---|---|
| CLAR-001 | Team availability scope conflict | Should the approved no-sharing UR scope be replaced by personal filters with explicit team availability, and exactly which teammates may read or change which saved filters? | The new request contradicts approved intent and can change permissions, ownership, acceptance criteria, design and required verification; a TP cannot silently override UR/PRD/SD. | Confirm the replacement scope and describe who is eligible, whether access is read-only or editable, and who controls availability; alternatively withdraw the team-access request and retain the approved personal-only scope. An answer alone does not edit sources or renew approval. | Test product owner | UR: One user-owned saved filter, no sharing. @ sha256:ada74f10a4c173134cf21752cfc0a7655c1efe0a801967bbd361a65c9d955e7a | pending |

## 4. Brownfield Scope

Inspect `filter-service.mjs`, `filter-service.test.mjs` and `package.json`, together with the exact dispatched PRD, SD and Brownfield Review. The analytical input only identifies the existing owner and says UX intent definition is not required; it does not establish test coverage. Actual inspection found a user-keyed Map, named save/restore, structured cloning at both boundaries, TypeError for invalid save input and RangeError for unavailable restoration. Four existing tests passed locally on Node v22.22.3, exit 0: input mutation isolation, personal ownership, empty values and one invalid-user case. This baseline is narrower than the six future scenario obligations.

Use the existing service as the only implementation owner. No alternative store, sharing API, authentication system or duplicate source of truth is planned. If later evidence requires a behavior or ownership change beyond the approved PRD/SD, stop and clarify with Test product owner or Test design owner as appropriate before altering a source.

## 5. Out Of Scope

Sharing filters and permission changes remain outside the currently approved scope, now explicitly disputed by CLAR-001; they may not be silently added through this TP. New authentication, multiple-filter product expansion, UI work, external integrations, production accounts, network access, host changes, durable storage across process restarts, deployment and release are outside this plan. The existing in-memory design is the approved boundary; this TP adds no persistence guarantee. Approved UR/PRD/SD and analytical source bytes remain protected. No application or test code is changed during TP preparation.

## 6. Risks And Blockers

CLAR-001 is an open material planning question and blocks TP approval. Resolve it first with Test product owner at UR scope; keep approved sources unchanged in this revision. The six retained scenarios must be reassessed against any separately revised and renewed source approvals. This is a synthetic fixture and supplies no live-system delivery authorization. The unimplemented SCN-002/SCN-006 tests and incomplete SCN-005 coverage are explicit later tasks; current baseline success does not close them. At execution time, absent Node/test access, unmatched test names, failed or skipped relevant scenarios, stale source bindings, or differences from approved semantics block the affected evidence and QA readiness until the responsible owner resolves them. Product or design uncertainty must be clarified at its earliest existing source owner, never hidden as an execution assumption. Retain test output and actual errors when blocked; do not acquire external access on this plan's authority.

## 7. Next Step

Ask the focused CLAR-001 scope question with its consequence and owner through the validated gate-check clarification handoff. Do not request TP approval, reuse the earlier presentation or implement any task while the question is open. Any later source revision requires its existing owner and separately confirmed preview/apply and renewed approvals. This authoring request authorizes no source change. After the substantive answer, reassess every affected dependent task and scenario before further planning.

## AGDF Approval Summary (de; source=en)

- Anlass: Die neue Anforderung verlangt zusätzlich verfügbare Filter für Teamkollegen. Sie widerspricht dem genehmigten persönlichen Umfang ohne Teilen oder Berechtigungsänderung.
- Planstand: T-001 bis T-004 und die sechs Szenarien zu AC-001 und SDD-001 bleiben als persönliche Ausgangsplanung erhalten. T-005 klärt zuerst den geänderten Umfang. Insbesondere die bisherige Ablehnung fremder Nutzer muss danach neu bewertet werden.
- Offene Entscheidung: CLAR-001 ist ein requirements_gap mit Rückfrage an die UR-Verantwortung Test product owner. Zu klären sind der neue Umfang, die berechtigten Kollegen, Lese- oder Änderungsrechte und die Kontrolle der Verfügbarkeit.
- Konsequenz: Der Aufgaben- und Testplan ist mit dieser offenen materiellen Frage nicht freigabereif. Teamfreigabe kann auf den unveränderten genehmigten Quellen nicht als zulässiges Verhalten geplant werden. Die Antwort allein ändert keine Quelle und ersetzt keine neue Freigabe.
- Nachweise und Grenzen: Vier vorhandene persönliche Tests bestehen aus der unveränderten Baseline. Für Teamverfügbarkeit liegt weder eine genehmigte Akzeptanzgrundlage noch ein Testnachweis vor. Es wurden keine Anwendungsdateien, genehmigten Quellen oder Berechtigungen geändert.
- Nächster Schritt: Die gebündelte Umfangsfrage an Test product owner beantworten; danach abhängige PRD-, SD- und TP-Inhalte über ihre bestehenden Verantwortlichen prüfen. Jetzt keine TP-Freigabe und keine Implementierung.
