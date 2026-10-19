# PRD: Inspect the exact UI proposal before approving requirements

Status: draft
Gate: PRD
Gate approval: open
Based on: approved UR
Date: 2026-10-18
Owner: Arndt Gold
Traceability contract: criteria-chain-v1

## 1. Product Scope

Provide one complete review flow when the approved UR requires a UI preview before PRD agreement. A reviewer sees the concrete task, the applicable preview version, covered normal/error scenarios and their acceptance-criterion references, opens that version beside access to the exact PRD, and returns to the same undecided context. Core verifies the retained material before presentation and again before persisting the existing PRD approval. Missing, unsafe, foreign or changed required material cannot be silently replaced or approved using the old presentation.

Keep the preview versioned and reopenable in the owning run's artefact directory under `previews/`, using a short name/version directory and `index.html` with its required local assets. Preserve the inspected version rather than overwriting it. The machine-readable association identifies entry, local assets, their digests and approved UR source. Its technical representation and safe read/render transport belong to Solution Design.

The preview is illustrative evidence for agreement about behavior, scope and acceptance criteria. Confirmed findings are adopted into this PRD as criteria; unanswered product questions remain explicit. Visual details are binding only if the PRD adopts them expressly. Viewing, scenario selection, example actions and reading do not approve anything. One existing PRD action/formula records the actual deliberate decision.

### Review this proposal

Open the retained **prd-review-v1** prototype. Inspect the example with complete proofs, then the important missing-proof case. Return to the PRD decision and try the missing/changed review-basis scenarios. Judge whether the task, version, unresolved policy and consent effect are clear. The prototype covers the proposed review interaction for the criteria below; it does not implement Core validation.

- Retained entry: [Version 1](previews/prd-review-v1/index.html).
- Entry digest: `sha256:4c11a7be1385af7315108ad1127c1d519041c99c5f67bc47902a746cc1e01b2c`.
- Source UR digest: `sha256:9e0c79153e17b818574aa127ffa8b7e2e1616b6826870481a50627acfab72e1e`.
- Related source: `UX_INTENT_DEFINITION.md`, including agent observations, exact retained version and qualification limits.
- Current capability boundary: The present runtime binds the registered PRD and its existing sources. This prototype's file/hash reference is retained review evidence, not an assertion that the new machine enforcement or native preview button already exists.

## 2. UX Intent And Success

- ui_ux_impact: high
- ux_intent_definition: ready, UX_INTENT_DEFINITION.md, canonically recorded by operation df351f4d-de14-4c14-889e-a58f47656e84
- primary_user_intent: Understand and judge the proposed interaction before deliberately agreeing to its PRD requirements.
- success_signal: The reviewer can inspect the exact proposal, recognize the normal and missing-proof case, return to the same decision and distinguish illustrative behavior, unresolved policy, evidence availability and actual approval.
- primary_decision_or_action: Approve the intended product behavior, scope and acceptance criteria through the existing PRD action, or discuss requested changes while keeping the current decision open.

## 3. Working Modes And Effective State

| working_mode | effective_state | visible_state_types | effective_state_authority | primary_state_presentation_owner |
|---|---|---|---|---|
| PRD review | Current exact basis is reviewable and undecided | Task, version, criterion references, questions, consent effect | Core controls applicability and approval eligibility; PRD controls product promises | Existing decision presentation |
| Preview exploration | Illustrative state changes only, decision remains open | Version, scenario, example checks, assumptions and simulation labels | Preview controls local example state only | Isolated preview view |
| Document reading | Exact presented PRD is read without deciding | Document identity, source language, exact content | Existing immutable presentation/document owner | Existing document view |
| Missing or changed material | Old required basis cannot be approved | Specific gap/change and current owner recovery | Core evaluates current material and bound presentation | Existing decision/recovery presentation |
| Host access recovery | Required preview cannot yet be inspected through this access | Actual capability limit, supported alternate access or explicit open review | Existing Core/host contract reports actual capability | Existing decision surface and agent-assisted bound access |
| Deliberate decision | One matching saved effect or an explicit failure/uncertainty | Actual result distinct from simulated example actions | Existing approval transaction and receipt | Existing decision presentation |

## 4. Activation, Blockers, Recovery And Transitions

- activation_and_deactivation: A current PRD decision with a required preview exposes the review task and named version beside document access. Opening and closing preview/document preserves the run, document version and undecided decision. Closing a view never approves it.
- blockers_and_visible_next_actions: Missing entry or required assets, unsafe/foreign path, UR-source mismatch, changed bytes/version or unresolved before-PRD product decisions prevent an applicable approval. Name the actual condition and route correction to the existing UX/PRD owner. Required access that the host cannot provide remains visibly open until a supported bound route is supplied.
- recovery_paths: A transient read error allows visible retry of the same bound version. Correction or changed applicable evidence requires relevant source reassessment and a fresh presentation, followed by a new deliberate response. Supported standalone access is acceptable when bound to the same material; do not claim host functionality that is absent. No browsing telemetry or separate preview approval is required.
- relevant_state_transitions: Open review -> preview/document -> same review with preserved identity and restored focus. Example complete -> example missing-proof with explicit unconfirmed policy. Valid basis -> unavailable/changed basis with old approval unavailable. Corrected basis -> new presentation -> new deliberate response. Only the existing approval transaction changes the actual gate state.

## 5. Acceptance Criteria

- criterion_id: AC-001; working_mode: PRD review; source_state: current PRD awaiting decision with required preview; trigger_action: present the review; expected_effective_state: exact basis is identifiable and undecided; visible_feedback: concrete task plus PRD identity, preview version, normal/error scenarios and related criterion IDs, with unanswered policy visible; blocker_failure_behavior: missing required association prevents approval presentation; recovery_next_action: current UX or PRD owner completes the association; observable_success: reviewer can identify what to inspect and which requirements the proposal supports without opening a second authority; required_evidence: genuine decision-view and text-presentation assertions with the approval-screen example.

- criterion_id: AC-002; working_mode: preview exploration; source_state: valid retained required preview; trigger_action: open named version then return; expected_effective_state: same PRD context remains undecided and example actions stay local; visible_feedback: version and illustrative status remain clear, with an explicit return action and restored initiating focus; blocker_failure_behavior: unavailable read reports the actual failure and never substitutes another version; recovery_next_action: visible retry of the same bound version or supported bound alternate access; observable_success: reviewer exercises both complete and missing-proof examples and returns without approval, message transmission or source mutation; required_evidence: browser interaction at desktop and narrow widths plus read/decision integration proving no approval side effect.

- criterion_id: AC-003; working_mode: evidence agreement; source_state: inspected illustrative behavior and possible unanswered product question; trigger_action: derive PRD criteria or inspect a proposed policy; expected_effective_state: only expressly adopted behavior becomes a product promise; visible_feedback: confirmed findings map to verifiable criteria, while unconfirmed assumptions and unanswered policy remain labelled open; blocker_failure_behavior: an unresolved in-scope before-PRD decision prevents readiness, while an out-of-scope example question is not silently answered; recovery_next_action: clarify the relevant product decision through its current owner; observable_success: the example's missing-proof policy remains explicitly unconfirmed and visual details are binding only when adopted in the PRD; required_evidence: source/readiness checks and inspection of the example and actual PRD presentation.

- criterion_id: AC-004; working_mode: preview retention; source_state: required preview prepared from the approved UR; trigger_action: retain and associate a version for PRD review; expected_effective_state: reopenable run-local version with identifiable entry, required assets, digests and UR association; visible_feedback: current version is distinguishable from prior inspected versions; blocker_failure_behavior: a foreign run, outside or escaped path, symlinked path, incomplete asset set or mismatched source is unavailable rather than accepted; recovery_next_action: existing analytical owner supplies a contained complete version and refreshes its association; observable_success: the retained version can be reopened with all required local resources and no prior inspected version is overwritten; required_evidence: file-based tests covering entry/assets, run ownership, containment, symlinks and UR-source binding.

- criterion_id: AC-005; working_mode: presentation and approval validation; source_state: PRD with required associated preview; trigger_action: prepare the decision or persist actual approval; expected_effective_state: both operations validate the applicable required material and its exact digests against the same basis; visible_feedback: successful preparation names the version, while a failed validation names the concrete missing/invalid evidence and next owner action; blocker_failure_behavior: missing entry/assets, wrong run, unsafe path, source mismatch or changed required bytes cannot persist approval; recovery_next_action: correct evidence and create the required fresh review/presentation; observable_success: real approval-path tests reject each invalid condition and leave approvals unchanged, while an unchanged valid basis permits the existing deliberate approval if all other readiness checks pass; required_evidence: integration tests against real files, prepared records and approval persistence, including local asset changes.

- criterion_id: AC-006; working_mode: changed-basis recovery; source_state: exact version was presented but applicable evidence changes before decision; trigger_action: attempt the old approval or present a replacement version; expected_effective_state: old response cannot approve new or changed material; visible_feedback: changed basis and the new version are distinguishable with a clear review-again instruction; blocker_failure_behavior: old presentation/reply stays ineligible and cannot be rebound retrospectively; recovery_next_action: relevant reassessment followed by fresh presentation and a new deliberate response; observable_success: change-after-presentation and version-replacement tests reject the old decision and accept only an independently deliberate response to the current basis when otherwise ready; required_evidence: real transaction regression with unchanged approval state on rejection and fresh-presentation success.

- criterion_id: AC-007; working_mode: host access recovery; source_state: required preview exists but actual host cannot render or open it, or a read fails transiently; trigger_action: request preview access; expected_effective_state: unavailable access is accurately reported, with required review still open until a supported bound path exists; visible_feedback: accessible failure/capability explanation and a concrete retry or supported alternate route, without a false opened/reviewed claim; blocker_failure_behavior: neither a failed read nor unsupported renderer silently counts as successful review; recovery_next_action: retry the same material on transient failure or provide the same version through a supported bound standalone route, otherwise remain open; observable_success: supported access, transient failure and unsupported capability are distinguishable and no click tracking or extra approval gate is introduced; required_evidence: capability/read tests and actual-host evidence only for the hosts expressly claimed supported.

- criterion_id: AC-008; working_mode: deliberate decision; source_state: review basis is current and all required readiness checks pass; trigger_action: invoke the existing PRD approve action or exact Approval formula; expected_effective_state: exactly one existing PRD approval effect for the same material; visible_feedback: approval means intended behavior, scope and criteria and permits Solution Design, while example actions remain visibly simulated; blocker_failure_behavior: no viewing, example action, host permission or close operation approves a gate, and no separate preview checkbox/approval is required; recovery_next_action: use the existing uncertain-result and matched-receipt recovery rather than submit an invented second decision; observable_success: native and text paths share one authority and do not approve implementation or accept merely illustrative styling; required_evidence: existing approval/receipt regressions plus UI and text consent-effect checks.

- criterion_id: AC-009; working_mode: compatible existing delivery; source_state: existing run or historical presentation without the new preview requirement; trigger_action: inspect or use its existing supported decision path; expected_effective_state: prior proof retains its original interpretation and no preview requirement is silently invented or removed; visible_feedback: capability and historical/current applicability remain accurate; blocker_failure_behavior: a new required preview cannot be bypassed through an older record path, and historical receipts are not rewritten to claim new evidence; recovery_next_action: existing revision/presentation owner handles genuinely changed current requirements; observable_success: runs without required previews retain existing behavior and supported historical proofs stay verifiable while new required cases enforce the new checks; required_evidence: legacy/no-preview and new-required compatibility regressions across presentation and decision owners.

- criterion_id: AC-010; working_mode: delivery verification; source_state: implementation is proposed as complete; trigger_action: assess acceptance; expected_effective_state: every claimed criterion is supported by applicable runtime/file/UI evidence with explicit limits; visible_feedback: separate automated source/integration results, browser observations, user feedback and actual host qualification; blocker_failure_behavior: stored replay observations and the current prototype cannot substitute for real Core enforcement or native-host evidence; recovery_next_action: collect the missing proof through the existing TP/QA evidence owners; observable_success: valid/missing/changed/wrong-run/unsafe-asset cases and the complete/missing-proof interaction have actual test evidence, including narrow views and no false approval effect; required_evidence: criterion-to-task/scenario mapping in TP and actual test/observation artifacts with qualifications in review and QA.

## 6. Non-Goals

No new user gate, separate preview approval or parallel source of product truth. No required view-tracking or click receipt. No implementation of the example product, general hosting/editor service, arbitrary file browsing, unrelated status repair, automatic messaging, merge, release or installation update. No guarantee of native rendering for hosts without direct evidence. No blanket requirement to create previews when the UR does not require one and they add no review value.

## 7. Users And Roles

Arndt Gold is the PRD owner and human decision maker for this proposal. Delivery agents prepare and retain source material and route uncertainty. Core remains the decision authority for exact current eligibility and persistence; the existing decision surface presents it. The preview's simulated actions have no gate or messaging authority.

## 8. Constraints

Use the existing analytical, presentation, decision-material, session and approval owners. Preserve the exact UR and its scope, historical evidence and current safeguards. Executable illustrative content must be isolated from approval controls and host authority and must not gain arbitrary filesystem or network access. Storage/schema/transport specifics and compatibility design are deferred to SD, with these behavioral requirements preserved. Keep pre-existing branch changes and the unrelated `.gitignore` edit.

## 9. Evidence Requirements

SD maps every criterion once to its design/owner/compatibility treatment; TP maps each to executable scenarios and expected results. File tests must cover exact bytes, required local assets, run/path/source binding, missing and changed material before presentation and immediately before actual approval. UI tests cover open/return, focus, read failure, scenario switching, visible consent and no gate side effects at desktop and narrow widths. Exercise supported native-host access separately before claiming that host supported. An independent user's understanding is distinct from agent browser inspection.

The current prototype passed 19 agent-operated browser checks with no console errors and no horizontal overflow at 736, 360 and 320px viewports. This supports the interaction proposal only. Core validation, live decision-session integration, historical compatibility, assistive-technology testing and actual native-host opening/teardown are not yet proven.

## 10. Risks And Open Questions

The precise machine-readable material representation, isolated read/render route, asset completeness rules, historical compatibility and host capability limits must be decided and tested in SD/TP. Until implementation, the current runtime does not provide the target preview binding. The prototype has no human observation or approval yet.

The example product's policy for an important missing proof remains unanswered: mandatory block versus a justified exception. This is outside the integration's product scope. This PRD adopts only the requirement to display that policy as unconfirmed in the example, not either policy answer. If implementation of that product is later requested, its own before-PRD decision must be resolved by its product owner.

## Approval Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| One PRD decision with required exact preview evidence | before_prd | resolved | Proposed product contract follows approved UR: one existing PRD approval, no extra gate, source/file checks before presentation and approval, and fresh review after change. This PRD itself still awaits human approval. | Arndt Gold |
| Meaning of preview observations and example policy | before_prd | resolved | Only expressly adopted criteria are binding. The example's missing-proof policy stays labelled unconfirmed and outside this integration's product scope. No human observation is fabricated. | Arndt Gold |
| Preview material representation, isolation and historical compatibility | later_sd | deferred | Design the smallest compatible extension of current Core presentation/material/session owners, with explicit trust boundary and old-record behavior. | Solution Design owner |
| Actual host access and qualification | later_sd | deferred | Decide supported access and capability/failure behavior without weakening the product contract, and name required host tests. No blanket host claim. | Solution Design owner |
| Concrete runtime, browser and host evidence plan | later_tp | deferred | Map every criterion and SD decision to scenarios, expected results and evidence, keeping automation and native/user observation distinct. | Task/Test Plan owner |

## 11. Next Step

Review the prototype and this PRD. Approval confirms intended behavior, scope and criteria and permits the existing Solution Design stage. It neither approves a delivered implementation nor makes illustrative styling binding. Use the existing deliberate `Approval: PRD` only after the current presentation is prepared; requested changes remain in Chat and require fresh presentation if the basis changes.

## AGDF Approval Summary (de; source=en)

- Ziel: Die vorgeschlagene Bedienung vor der Implementierung beurteilen und bewusst dieselbe geprüfte PRD-Grundlage freigeben.
- Umfang: Erforderliche Vorschau versioniert beim Run erhalten, direkt aus der PRD-Prüfung zugänglich machen und ihre genaue Quelle und Dateien vor Präsentation und Freigabe prüfen. Prüfe den Bedienentwurf prd-review-v1: Normalfall, wichtiger fehlender Nachweis, Rückkehr zur PRD-Entscheidung und veränderte Prüfgrundlage. Die aktuelle Vorschau ist ein Entwurf; Core setzt diese neue Bindung noch nicht um.
- AC-001: Prüfaufgabe, genaue Fassung, Vorschauversion, Szenarien und zugehörige Kriterien stehen zusammen; offene Produktfragen bleiben sichtbar.
- AC-002: Vorschau und Dokument lassen sich öffnen und zur gleichen offenen Entscheidung verlassen. Beispielaktionen bleiben lokal; Lesefehler bieten eine versionsgebundene Wiederholung.
- AC-003: Bestätigte Erkenntnisse werden überprüfbare PRD-Kriterien. Unbestätigte Annahmen bleiben offen; offene erforderliche Produktentscheidungen sperren. Die fehlende-Nachweis-Regel des Beispielprodukts wird nicht entschieden.
- AC-004: Vorschau und erforderliche lokale Dateien bleiben als erkennbare Version beim eigenen Run erhalten und an die UR gebunden. Fremde, unsichere, unvollständige oder abweichende Quellen werden abgewiesen.
- AC-005: Vor Präsentation und tatsächlicher Freigabe prüft Core die erforderlichen Dateien, Prüfsummen und Zuordnungen. Fehlende oder veränderte Grundlagen verhindern eine gespeicherte Freigabe; der unveränderte gültige Fall bleibt möglich.
- AC-006: Nach Änderungen gelten alte Präsentation und Antwort nicht mehr. Eine neue relevante Prüfung und Präsentation verlangt eine neue bewusste Antwort.
- AC-007: Fehlender Host-Zugriff wird ehrlich angezeigt. Wiederholung oder unterstützter Zugang zu derselben Version ermöglicht die weitere Prüfung; ein Fehlschlag zählt nicht als erfolgreiche Prüfung. Kein zusätzliches Gate oder Klicknachweis.
- AC-008: Eine bestehende PRD-Aktion oder die exakte Chat-Freigabe entscheidet dieselbe Grundlage einmal. Lesen, Beispiele und Host-Berechtigungen geben nichts frei. Die Freigabe erlaubt Solution Design.
- AC-009: Bestehende Fälle ohne erforderliche Vorschau und historische Nachweise behalten ihre bisherige Bedeutung. Alte Pfade dürfen neue Vorschaupflichten nicht umgehen.
- AC-010: Echte Datei-, Freigabe- und Bedienungstests belegen die Umsetzung. Prototyp, Replay-Daten, Agentenbeobachtung und tatsächliche Host-/Nutzerprüfung bleiben als unterschiedliche Nachweise erkennbar.
- Entscheidungen: Umfang und Zustimmungswirkung folgen der freigegebenen UR; dieses PRD steht noch zur Entscheidung. Bindungsformat, Isolation, Kompatibilität und Host-Zugang werden vom SD-Verantwortlichen konkretisiert, Tests vom TP-Verantwortlichen. Ob das Beispielprodukt trotz wichtigem fehlendem Nachweis freigeben darf, bleibt ausdrücklich offen und außerhalb dieses Integrationsumfangs. Kein neues Gate, keine Implementierung des Beispielprodukts und keine Release- oder pauschale Host-Zusage.
