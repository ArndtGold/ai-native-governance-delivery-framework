# TP: Personal saved filter; team-sharing clarification pending

Status: draft
Gate: TP
Gate approval: open
Based on: SD
Date: 2026-10-15
Owner: TP author (Codex), with Test product owner and Test design owner
Traceability contract: criteria-chain-v1
Planning Decisions contract: tp-decisions-v1

## 1. Task List

| task_id | Task | Owner | Dependencies |
|---|---|---|---|
| T-001 | Identify the existing filter service entry points and local fixture runner; record exact invocation, fixture isolation and evidence output before implementation or verification. Do not add a parallel store. | Test design owner | PD-002 answer; approved-source clarification CL-001 resolved before dependent scope work |
| T-002 | Implement or reuse save and restore through the existing filter service for one named filter belonging to the saving user; keep existing user ownership. | Test design owner | T-001; approved TP; CL-001 resolution and any necessary renewed upstream approvals |
| T-003 | Add or adapt local fixture scenarios SCN-001 through SCN-003 at the existing filter service boundary, including isolation and failure observation. | Test design owner | T-001; T-002; approved TP |
| T-004 | Execute the local scenarios with the confirmed runner; retain command, exit result, fixture inputs and observed restored values in the run-local evidence directory. Report unavailable scenarios explicitly. | Local verification owner: Test design owner | T-003; PD-002 resolved |

These are future tasks. No implementation or verification has been performed by this plan.

## 2. Verification Traceability

| criterion_id | design_decision_id | task_id | scenario_id | expected_result | evidence |
|---|---|---|---|---|---|
| AC-001 | SDD-001 | T-003 | SCN-001 | For fixture user A, save a named filter with non-default supported values, change the active values, then restore; compare each restored value with the saved fixture snapshot and observe equality. | Run-local fixture report for SCN-001 containing saved and restored value snapshots, fixture identity and executed runner |
| AC-001 | SDD-001 | T-003 | SCN-002 | Repeat the save/change/restore protocol with the existing service's supported empty/default filter values; the restored snapshot equals the saved snapshot. This checks the boundary without defining new product behavior. | Run-local fixture report for SCN-002 with supported boundary input and before/after snapshots |
| AC-001 | SDD-001 | T-003 | SCN-003 | With distinct fixture users A and B, saving and restoring A's filter keeps the existing user-owned store boundary; B's fixture state remains unchanged and no shared record or permissions change is introduced. Exact service-supported cross-user error behavior must be confirmed in T-001, not invented here. | Run-local fixture report for SCN-003 including per-user store snapshots and actual service result; fail if a shared/permissions-changing path is introduced |

Acceptance authority remains AC-001 in the approved PRD. SCN-003 protects the explicit personal-only scope and SDD-001; it adds no shared-filter acceptance criterion.

## 3. Test Plan

| criterion_id | scenario_id | test_route | environment | prerequisites_permissions | owner | expected_evidence | unavailable_action |
|---|---|---|---|---|---|---|---|
| AC-001 | SCN-001 | Existing local fixture runner: save named fixture, mutate active values, restore and compare snapshots; exact supported invocation blocked on PD-002 | Local fixture environment stated by requester | Existing runner and fixture reset capability; no production credentials | Test design owner | Report and command log plus saved/restored snapshots under this run's artefact directory | Stop this scenario and obtain the runner invocation and supported fixture entry points from Test design owner; record the missing evidence, never a pass |
| AC-001 | SCN-002 | Same confirmed local route with supported empty/default values and snapshot comparison | Local fixture environment | T-001 confirms supported boundary values and reset | Test design owner | Boundary report, input snapshot and restored snapshot | Stop this scenario and have Test design owner identify the existing service-supported boundary fixture; record unavailable result |
| AC-001 | SCN-003 | Same confirmed local route with two isolated users; compare both users' store snapshots before and after A's restore | Local fixture environment | Two isolated fixture identities and observable per-user store state; no live accounts | Test design owner | Per-user snapshots and actual error/result output with runner invocation | Stop this scenario and have Test design owner supply an isolated fixture route; report missing ownership-boundary evidence |

Production access is unavailable. This plan promises no production execution or result and authorizes no account acquisition. The supplied PRD and SD contain no production-only acceptance obligation. If a later owner establishes a required production obligation, record a separate open evidence gap with its owner and obtain an explicitly authorized environment before executing it; local fixture results cannot establish production behavior.

## Planning Decisions

| Decision | Source | Status | Resolution | Owner |
|---|---|---|---|---|
| PD-001: Resolve teammate availability against approved personal ownership | TP | open | CL-001: Requester now asks to make the same saved filter available to teammates, contradicting approved personal-only scope. Confirm intended scope with the existing product owner before changing any source or scheduling shared-filter implementation. | Test product owner |
| PD-002: Confirm executable local fixture route | TP | open | CL-002: Requester confirms local fixture tests exist, but supplied sources contain no invocation or fixture entry points. Provide the existing runner command, fixture reset and per-user observation route; no guessed command or test result. | Test design owner |
| PD-003: Approved SD later_tp applicability | TP | resolved | SD has one resolved Store boundary decision and SDD-001; no later_tp decisions are declared. Existing filter service remains the owner. | Test design owner |
| PD-004: Production evidence applicability for current scope | TP | resolved | Current approved sources require same-user observable restoration and preserve personal ownership. Plan local fixture evidence; production access is unavailable and no production result is claimed. Reassess if approved sources add a production obligation. | Test product owner |

## Clarification Requests

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CL-001 | requirements_gap | UR | open | Evidence of changed user intent and changed scope: the current request adds teammate availability; approved PRD Product Scope says No sharing or permissions change, and Saved-filter ownership resolves to Only the saving user owns the filter. SD SDD-001 has consequence no shared filters. | Test product owner obtains a substantive requester decision on personal-only versus teammate scope at the existing UR owner before previewing any source revision |
| CL-002 | plan_gap | TP | open | Local fixture availability is stated, but approved inputs supply no executable invocation or fixture entry points for SCN-001 through SCN-003. | Test design owner supplies the exact existing local fixture invocation, reset and per-user observation route for this plan |

## Clarification Details

| finding_id | planning_decision | question | blocking_reason | required_answer | owner | source_ref | resolution_evidence |
|---|---|---|---|---|---|---|---|
| CL-001 | PD-001: Resolve teammate availability against approved personal ownership | Should the capability remain personal-only, or should the approved scope change to teammate availability; if changed, who may access or modify whose saved filter? | Answer changes product intent, acceptance and ownership; this TP cannot silently add shared storage or permissions. | Product owner's substantive requester-confirmed scope and ownership decision, recorded through existing evidence; changed intent then requires source revision preview, separately confirmed apply and renewed affected approvals. | Test product owner | PRD: No sharing or permissions change. @ sha256:6885474fee584743baf19a1968d4e421da596b94368e0c328af71a1de94b11c2 | pending |
| CL-002 | PD-002: Confirm executable local fixture route | What exact existing runner command and fixture entry points support save/restore and isolated users, and where can its output be retained? | Required local scenarios are not executable from the supplied inputs; guessed commands would create false readiness. | Exact supported invocation, reset protocol and per-user observation route supplied by Test design owner, recorded as run-local evidence linked to current source bindings. | Test design owner | SD: SDD-001 @ sha256:b1bfbd7fbada77761ff5ac89bfeb8895b4767ac62c3bb6f9e799b9ffa6a48189 | pending |

CL-001 is an upstream changed-intent question and takes precedence over local TP correction. Open decisions and findings block approval; no answer is inferred from this draft. Approved source files remain unchanged.

## 4. Brownfield Scope

Inspect the existing filter service owner, save/restore entry points, user-owned persistence boundary, supported filter schema, and the existing local fixture runner in T-001. The supplied Brownfield Review identifies a synthetic existing filter owner and requires no UX Intent Definition. No new store, shared-filter owner or permission system is approved.

## 5. Out Of Scope

Team sharing, cross-user access, permission changes, production account acquisition, implementation before TP approval, and any alteration of approved PRD/SD are outside this draft's authorized scope. Team availability remains an explicit unresolved request, not a discarded requirement.

## 6. Risks And Blockers

CL-001 blocks product/design-dependent planning until the existing source owner resolves scope. CL-002 blocks executable verification readiness. Local results, when collected, prove only the stated fixture scope. Missing production access is recorded and is never a successful test. No tests have run and no task is complete.

## 7. Next Step

Resolve CL-001 first at the existing product/UR owner; then reassess affected PRD, SD, tasks and scenarios. Resolve CL-002 with source-linked run-local evidence. Any changed source needs its existing revision process and renewed approvals. Obtain a fresh TP presentation after permitted draft recording and only request deliberate `Approval: TP` once all material open questions are resolved. This draft is not approvable now.

## AGDF Approval Summary (de; source=en)

- Ziel: Einen benannten persönlichen Filter über den bestehenden Filterservice speichern und wiederherstellen; AC-001 bleibt die fachliche Prüfreferenz.
- Umfang: Vier geplante Aufgaben und drei lokale Szenarien prüfen Wiederherstellung, unterstützte Grenzwerte und bestehende persönliche Eigentümerschaft. Es wurde nichts implementiert oder getestet.
- Entscheidungen: Teamverfügbarkeit widerspricht dem freigegebenen persönlichen Umfang und ist bei der bestehenden Produktverantwortung offen. Die genaue lokale Fixture-Ausführung ist bei der Designverantwortung offen. Beide offenen Punkte verhindern eine TP-Freigabe.
- Evidenz: Geplante lokale Berichte enthalten Aufruf sowie gespeicherte und wiederhergestellte Werte. Produktionszugang fehlt; es wird kein Produktionsnachweis behauptet und keine Zugangsbeschaffung autorisiert.
- Nächster Schritt: Zuerst den gewünschten Teamumfang fachlich klären, anschließend betroffene Quellen gegebenenfalls separat revidieren und neu freigeben sowie den lokalen Testaufruf bestätigen. Danach den Plan erneut vorlegen.
