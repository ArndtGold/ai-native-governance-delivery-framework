# SD: Browser-only click tests for the Codex Companion

Status: draft
Gate: SD
Gate approval: open
Based on: PRD
Date: 2026-11-22
Owner: AGDF test integration and Companion maintainers
Traceability contract: criteria-chain-v1
Design Decisions contract: sd-decisions-v1

## 1. Solution Overview

Exercise the built Companion in its existing Chromium test host. Each case uses a designated disposable Run. Two browser views can share that Run and its admission service while retaining distinct view identities. An operator activates the real button. The test observes the outgoing SDK message. A separate, simulated recipient can claim the original attempt, read the fixture status and reply with its case marker.

The case record follows one attempt from input to disposition. For example, if the operator clicks once and the host withholds delivery to the receiver, the record can show one outgoing message, zero work grants if the receiver was fully observed, and a pending handoff after reopening. If receiver observation itself was unavailable, the grant count is unknown.

## 2. Ownership And Source Of Truth

The approved [PRD](PRD.md) defines acceptance. The [Brownfield Review](BROWNFIELD_REVIEW.md) and [UX analysis](UX_INTENT_DEFINITION.md) establish the existing owners. The browser spec in `packages/control-ui/test/browser/sdk-trace.spec.mjs` loads the built UI through `readCockpitUiBuild`. Its local SDK host in `sdk-trace-host.ts` receives the outgoing message. Core's `codex-continuation-binding.js` and `codex-continuation.js` own canonical eligibility and shared admission. The fixture dispatcher in `packages/mcp-server/test/companion-continuation.test.js` demonstrates how an ordinary continuation competes against the Companion.

The AGDF maintainer's brand source, registered in `.agdf/control/SOT_REGISTRY.md`, is `.agdf/control/BRAND.md` at SHA-256 `960aeb2f12e3e17fea2fb8309045c76fb7b4c6d037f6cd62d59ecbbcf204d6f9`. Decision clarity, Permitted next action and Calm information hierarchy apply to the card. Source visibility and Visible uncertainty apply to the report. The [linked continuation Run](../../run-4e2a3b9c-81a9-42e6-8d2f-00cf93c956b3/documents/TP.md) owns native qualification.

## 3. Architecture Decisions

- SDD-001: Use the built Companion in the existing Chromium SDK fixture with a test-owned workspace and admission root for each independent case; rationale: this exercises the shipped control while keeping test eligibility confined to disposable data; consequence: views competing in one case share the designated Run and admission root, and independent cases receive fresh ones.
- SDD-002: Count browser activations, actual outgoing host messages, send permits and successful receiver grants at their respective observation points; rationale: each measures a different step, and a permit or an acknowledgement cannot establish receipt of work; consequence: retain the source and its observation interval with every count and report an unavailable count as unknown.
- SDD-003: Drive the simulated receiver and the ordinary competing continuation through the existing fixture dispatcher attached to the same admission store as the Cockpit; rationale: the MCP fixture already demonstrates a shared claim across these paths; consequence: only the winning dispatch can produce the bounded fixture status read and case-marker reply, and each losing path has an observable disposition.
- SDD-004: Control delivery and lifecycle inputs at the fixture boundary and let Core evaluate the original attempt on reopen, status check, interruption and candidate change; rationale: the same production admission rules must decide when a retry is safe; consequence: a withheld response or unmatched terminal signal keeps the original disposition unresolved until supported evidence arrives.
- SDD-005: Reuse the Companion's existing action and feedback, and put case identification and source-labelled results in the test host and case report; rationale: the operator needs to identify the disposable Run, the next permitted action and the basis of each result; consequence: test controls stay outside the shipped card and reviewers can distinguish actual browser interactions from simulated host outcomes.

## 4. Integration Points

**Fixture setup and selection.** Create the disposable project, Run, candidate identity and case marker in the test runner. The loopback service resolves the selected Run from its registered fixture and canonical snapshot. Deliberately use a foreign selection or stale revision in negative cases and record the refusal. The test host identifies the active fixture and displays the built iframe. Each browser view opens its own Cockpit session against the shared service. Record the source commit and built UI digest once per candidate.

**From a click to an observed fixture grant.** Capture pointer or keyboard activation on the rendered control, the Cockpit publish result, and the SDK bridge's outgoing user message separately. Relate the outgoing message to the original bound context published by that view. The fixture runner validates candidate, target, Run, revision, operation and attempt against its case. Deliver the original bound continuation to the simulated receiving dispatch once. Record an actual fresh work grant from the dispatch result. The receiver performs only the fixture status read and returns the case marker. Record the read result and the reply separately. A grant without a reply remains a partial observation. A held case can pause between send and claim without holding the admission lock.

**Two routes and two views.** Open two independent cards on one ready Run before either acts. Observe both activations and the losing route's outcome. For the mixed case, drive ordinary continuation through the existing dispatcher without an originating Companion attempt. The winner is the route granted work. If ordinary dispatch wins first, the Companion can have zero sends despite an observed user click. If Companion publication wins, ordinary dispatch sees the outstanding work. Capture the appropriate counts in both orders. If an integrated path cannot be exercised on the candidate, identify the missing route and retain any narrower service-level result with its own source.

**Recovery and candidate identity.** The test runner retains case observations across page reloads so a cleared in-page trace cannot turn missing history into a zero. Before and after reopening or checking status, compare the original attempt and cumulative sends. Exercise confirmed cancellation before publication separately from loss of a response after publication. For interruption, associate the simulated session and turn with an admitted fixture attempt and deliver matching and unrelated terminal events in separate cases. For candidate change, invalidate old view bindings, retain the prior admission store, and label any injected generation change as simulated. A new view reevaluates the case against the current candidate and the predecessor's disposition. A missing predecessor observation stays visible as a gap. No wait or UI refresh settles an attempt.

**Evidence handoff.** Use one case record with commit or candidate ID, UI digest, case, fixture and attempt aliases, view/route, event source, observed order, count and final disposition. Distinguish browser gesture and rendered state, SDK message observation, service permit or grant, and simulated receiver or lifecycle input. Record grant identities once even if later reads return the same attempt. Keep cumulative counts of distinct sends, including any duplicates, independently of the number of distinct attempts. The report needs no unrelated chat content. Reviewers of the linked Run receive the browser scope, results and gaps.

## 5. Constraints And Compatibility

Use the existing test SDK, browser runner and admission service. This design needs no new dependency, production qualification switch, installed Desktop profile, persistent schema or public API. A test session exposes only its own fixture. A receiving case uses an agent-owned, read-only fixture task, and the test runner never follows a returned mutation or approval action.

Keep the current action text, typography, keyboard focus and reading order of the built card. Use the fixture's display name in the test context. In a pending case the operator can inspect the original handoff. A stale selection offers reload. A confirmed non-start can offer an explicit retry once the same selection is ready. Report source and missing observations in plain text as well as any visual status.

## 6. Test And Evidence Strategy

Reuse the 360-pixel Chromium baseline at aa73dfba for its observed keyboard, pointer, two-view and reopen outcomes. The prior pointer and contention variants were exploratory. Retain reproducible coverage with the existing browser suite. Pair browser assertions with the local service observations for each subsequent case. Existing Core and MCP tests establish lower-level behavior, including conflicting claims, lost publication and stale binding. They provide diagnostic evidence when a browser case fails.

Before CD+Tests can pass, run the approved plan on the identified candidate and inspect the effect at each required source. Cover a positive click, a withheld response, independent pointer and keyboard cases, competing views, the mixed dispatcher path where available, a bounded receiving reply, stale and confirmed non-start cases, an interrupted attempt, and candidate-change uncertainty. For competing and reopened views, reconcile the cumulative send count and the original attempt. For the simulated receiver, require a grant and matching case marker to claim the readback. Include an unavailable-observation control so a missing source cannot produce a passing zero. Prefer the existing CI browser and service lanes for repeatable cases. A supplemental periodic repeat can detect timing drift without changing acceptance. Document any unsupported case and its consequence under the PRD's evidence rules.

## 7. Acceptance Traceability

| criterion_id | design_response | source_of_truth | design_decision_ids | compatibility_risk |
|---|---|---|---|---|
| AC-001 | Bind the visible selection to the fixture inventory and the current canonical snapshot. Observe the selectable next action and refusal for an unrelated or stale Run. | Test integration owns the case and Core owns eligibility. | SDD-001, SDD-005 | An old view can still show the prior action. Recheck the binding at execution. |
| AC-002 | Capture mouse and keyboard sends independently and let a simulated dispatch claim the original attempt for a bounded readback. | SDK host for sends, Core dispatcher for work grants, fixture recipient for the marker. | SDD-002, SDD-003 | The SDK message can exist with no receiving claim or reply. Report those facts independently. |
| AC-003 | Drive both ready views and the ordinary fixture dispatcher against the same per-Run store, observing winner and losing route. | Core admission lock and per-route browser or dispatcher observations. | SDD-001, SDD-003 | Independent stores would yield a false pass. Assert shared case identity before contention. |
| AC-004 | Retain cumulative observations across view replacement and compare status inspection with pre-publication cancellation and stale recovery. | Core attempt disposition and the card's existing recovery action. | SDD-002, SDD-004 | A reset page log can hide a duplicate send. Preserve the external case trace. |
| AC-005 | Exercise matching and foreign terminal events and reevaluate a new candidate view against the preserved previous attempt. | Core admission and case-bound simulated lifecycle and candidate evidence. | SDD-004 | Losing the prior record makes continuity unknown. Withhold an additional start from the unresolved state. |
| AC-006 | Assemble a candidate-bound case record with counters per source, separate event classes, and explicit unknowns. | Test integration evidence owner and linked Run reviewer. | SDD-002, SDD-005 | Different candidates and simulated outcomes can be confused. Bind and label each result. |

## 8. Risks And Open Questions

Duplicated host messages for the same attempt, a stale view, or a missing receiver trace can distort the result in different ways. The report preserves each observation and mismatch. The tested baseline supports one outgoing request in the scenarios it exercised. A bounded receiver reply, interruption and candidate-change results still need their own tests. No material architectural decision remains open.

## Design Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Source of each observation and fixture wiring | before_sd | resolved | Use the browser and SDK bridge for actual UI and sends, the shared fixture dispatcher for grants, and the bounded test receiver for labelled simulated results. Bind every case to the same candidate and Run. | AGDF test integration |
| Recovery observation across views | before_sd | resolved | Keep the admission store and case-level evidence independent of the browser page lifetime. Verify candidate and attempt identity before interpreting any status change. | AGDF Core and test integration |
| Reproducible scenario execution | later_tp | deferred | Specify the fixture preparation, scheduling checkpoints, evidence files and exact regression commands per scenario in the task and test plan. | AGDF QA |

## 9. Next Step

Review the renewed design. SD approval permits the browser-only task and test plan.

## AGDF Approval Summary (de; source=en)

- Der Test öffnet den gebauten Begleiter in Chromium. Zwei Browseransichten können denselben Wegwerf-Run auswählen. Jede hat ihre eigene Ansicht, beide nutzen dieselbe Doppelstartsperre.
- Der Bericht beantwortet drei Fragen getrennt. Wurde der Knopf betätigt? Hat der Begleiter eine Anfrage gesendet? Hat der simulierte Empfänger den Testauftrag übernommen und die Fallkennung zurückgemeldet?
- Bleibt eine Übergabe offen, prüft „Übergabe prüfen“ den ursprünglichen Versuch. Auch nach dem Wiederöffnen lässt sich erkennen, ob eine weitere Anfrage gesendet wurde. Eine fehlende Beobachtung wird als „unbekannt“ ausgewiesen.
- Mit deiner Freigabe entsteht der Aufgaben- und Testplan für die Browserfälle, einschließlich konkurrierender Starts, Abbruch und Wechsel der geprüften Fassung.
