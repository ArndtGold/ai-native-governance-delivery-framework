# PRD: AGDF 0.20.0 release preparation and host qualification

Status: draft
Gate: PRD
Gate approval: open
Based on: UR
Date: 2026-10-20
Owner: AGDF maintainer
Traceability contract: criteria-chain-v1

## 1. Product Scope

Prepare one internally coherent AGDF 0.20.0 release candidate, with explicit intended support for Codex and Claude Code and experimental integrations for GitHub Copilot and OpenCode. Release preparation, completed native qualification and publication are distinct outcomes.

The mandatory native release matrix retains the existing Codex CLI Linux and native Windows requirements. Claude Code qualification runs on the other Windows computer identified by the user, with separate evidence for Claude CLI and the Claude Code coding surface in the Claude Desktop app. Desktop chat is not a substitute for Claude Code. Exact client/app versions, model, architecture and Node version are captured at execution and must be fixed for each observation; the description current is insufficient evidence. Codex's existing release policy supplies its required client/model tuple unless separately revised through an explicit design decision with justification and fresh evidence. A successful additional local macOS test may be reported only for its observed tuple; it cannot replace a required matrix row.

Qualify only capabilities demonstrated by that exact host surface. CLI, native hook execution and embedded MCP App rendering are separate claims. An untested embedded App or unrelated Desktop capability remains explicitly unverified and must not be advertised as part of qualified support. This preparation changes no product workflow, permission authority or approval semantics.

## 2. UX Intent And Success

- ui_ux_impact: low
- ux_intent_definition: Directly defined low-impact support labels and release-status semantics, sized in BROWNFIELD_REVIEW.md; no new interaction or required preview.
- primary_user_intent: Install or upgrade the declared supported integration and understand whether its exact release candidate and host environment have been qualified.
- success_signal: Guidance and the readiness report distinguish qualified evidence, pending native checks and experimental integrations and identify the concrete missing action.
- primary_decision_or_action: The maintainer reviews exact-candidate evidence before deciding whether the prepared candidate can proceed to release acceptance; users choose the correctly labelled host integration.

## 3. Working Modes And Effective State

| working_mode | effective_state | visible_state_types | effective_state_authority | primary_state_presentation_owner |
|---|---|---|---|---|
| Release preparation | Candidate may be coherent without being qualified or published | prepared; preparation_failed | Canonical version and package validation | Release readiness report |
| Native qualification | Each required host/surface/case is independently demonstrated or still open | pending; failed; qualified | Verified native observations matched to the candidate and required matrix | Host compatibility report and release readiness report |
| Remote Claude qualification | Windows evidence is produced on the other computer and checked on return | awaiting_external_evidence; rejected; qualified | Same evidence acceptance as local native execution | Candidate handoff and release readiness report |
| Experimental integration | Copilot and OpenCode remain available without 0.20.0 native qualification | experimental | Explicit host-support scope, not fixture test success | Installation guidance and compatibility report |

These are product meanings for existing reports, not a requirement to create another persistent state machine or duplicate canonical approvals.

## 4. Activation, Blockers, Recovery And Transitions

- activation_and_deactivation: Deliberate release preparation and native testing use existing installation, consent and removal paths with isolated test profiles where supported. No publication, active-profile replacement or consent inference follows from this PRD.
- blockers_and_visible_next_actions: Incoherent versions require canonical preparation repair. Missing native evidence requests the named host/surface/case. Wrong candidate or tuple requires a fresh matching observation. A failed test shows the actual failure and rerun action. Unsupported host capability stays unverified.
- recovery_paths: Correct the identified defect or prerequisite through its owner and rerun only the affected qualification scope against the final candidate. Candidate changes require renewed applicable evidence; prior failed observations remain historical. Return from the remote computer includes redacted evidence and candidate identity, not credentials.
- relevant_state_transitions: Valid package preparation makes the candidate prepared, without changing qualification. Receipt of matching native evidence closes only its required cases. A failed, missing or mismatched row keeps qualification pending/failed and prevents a successful release decision. Copilot/OpenCode remain experimental after green fixture tests. Publication remains a separate explicit action.

## 5. Acceptance Criteria

### AC-001 — Coherent 0.20.0 candidate

criterion_id: AC-001

All canonical and derived release versions and exact dependent package requirements consistently identify 0.20.0. Canonical release preparation, package integrity, packaging and affected regression checks pass without weakening version/history or payload checks. No package is published and no release tag is created by preparation.

### AC-002 — Accurate host scope and visible labels

criterion_id: AC-002

Public installation guidance, release notes, compatibility output and readiness reporting consistently identify Codex and Claude Code as intended qualified hosts, and Copilot/OpenCode as experimental. Existing experimental adapters and regression coverage remain available. Intended support is never displayed as completed qualification without matching native evidence.

- working_mode: Experimental integration and native qualification.
- source_state: Four integrations are described together while current native gaps remain open.
- trigger_action: Read installation guidance, compatibility results or the candidate report.
- expected_effective_state: Qualification reflects accepted native evidence; experimental status stays explicit.
- visible_feedback: Clear host/surface/OS scope and qualified, pending, failed or experimental status.
- blocker_failure_behavior: Missing or conflicting evidence cannot render qualified.
- recovery_next_action: Obtain the named matching observation or use the explicitly experimental integration with its stated limits.
- observable_success: The reader can distinguish support intent, observed qualification and experimental availability from each primary report.
- required_evidence: Source/generated documentation consistency checks and rendered/report inspection.

### AC-003 — Exact candidate and environment identity

criterion_id: AC-003

Every accepted native observation records exact tested candidate identity, AGDF version, clean source commit and/or equivalent verified candidate payload digests, actual host variant/version, OS, architecture, Node and model when applicable. Evidence must match the finalized candidate and declared tuple; a version string alone, dirty diagnostic run, historical session, model prose or fixture cannot establish qualification. Existing Codex clean-commit requirements remain intact. Duplicate, incomplete, failed, mixed-candidate or mismatched records are rejected with an actionable explanation.

### AC-004 — Codex native qualification

criterion_id: AC-004

Native Linux and native Windows Codex CLI evidence passes the existing mandatory release checks, including deliberate installation consent, discovery, actual non-authorizing MCP dispatch, controlled invalid input, skill continuation and clean removal. Add native evidence for effective upgrade and bounded recovery according to AC-006. Keep the current pinned client/model policy unless an explicitly justified SD decision renews that policy and its checks. A local macOS observation does not substitute for Linux or Windows; successful MCP does not assert trusted/executed hooks or Desktop rendering.

### AC-005 — Claude qualification on the separate Windows computer

criterion_id: AC-005

Provide a reproducible handoff for the exact 0.20.0 candidate and accept returned native Windows evidence only after validation. Record actual Claude CLI and Claude Desktop app identities. CLI evidence must demonstrate installation, host discovery, actual non-authorizing dispatch, controlled error, skill continuation and clean removal. Separately observe a fresh Claude Code coding session in the Windows Desktop app, identifying its loaded candidate and the claimed usable AGDF access path. CLI calls, generic Desktop chat and protocol negotiation cannot stand in for Desktop coding-session evidence. Upgrade/recovery follows AC-006. Do not require Claude execution or credentials on the preparation computer. Until matching results arrive, keep the affected Claude row open; do not invent remote access or silently waive its checks.

### AC-006 — Upgrade, bounded recovery and cleanup

criterion_id: AC-006

For the mandatory native host paths, demonstrate upgrade from the released 0.14.5 baseline to the exact 0.20.0 candidate and bounded recovery from a representative supported interrupted, stale or incomplete installation state. Fresh post-upgrade/recovery sessions must expose the intended candidate rather than shadowed/stale runtime content. Existing project governance, unrelated host settings and approval authority remain preserved. Record the starting identity, action, actual effective identity, failure/recovery outcome and cleanup. Reuse supported historical-profile and recovery mechanisms; do not introduce an unsupported destructive migration to obtain a pass.

### AC-007 — Mandatory shared release evidence acceptance

criterion_id: AC-007

The existing publication eligibility path requires accepted native evidence for both hosts and every mandatory matrix row, including Claude's returned Windows observations, before publication can proceed. It must fail on absent, failed, stale, wrong-version, wrong-candidate, duplicate or incomplete evidence. Installing a workflow or providing a test script does not satisfy native qualification. Deterministic rejection tests support but never replace actual native execution. Keep one release decision authority; imported observations cannot approve AGDF gates.

### AC-008 — Reviewable preparation and readiness outcome

criterion_id: AC-008

Deliver coherent release notes, candidate/test instructions and a readiness report exposing completed checks, exact evidence references, qualified tuples/capabilities, experimental hosts, pending external evidence, failures, next actions and required human decisions. Refresh the generated compatibility evidence through its owner. Preserve raw result provenance and redact secrets and unnecessary personal paths; do not transfer credentials. Report preparation and qualification separately from publication and human acceptance. Every unclosed mandatory obligation prevents an overall qualified/release-ready claim.

- working_mode: Release preparation and remote Claude qualification.
- source_state: Candidate preparation or required remote observations are incomplete.
- trigger_action: Prepare the candidate or receive external test results.
- expected_effective_state: Only validated evidence changes its corresponding qualification result.
- visible_feedback: Exact completed and outstanding obligations with one concrete next action each.
- blocker_failure_behavior: Failed or unavailable evidence remains visible and cannot become an overall success.
- recovery_next_action: Fix/retest the affected obligation on the same final candidate or requalify a changed candidate.
- observable_success: A maintainer can decide the next permitted release step without guessing whether tests or publication occurred.
- required_evidence: Candidate report, validated observation references and failing/missing-evidence report checks.

## 6. Non-Goals

Publish packages or tags, submit a marketplace listing, replace the user's active installations, require local Claude authentication, qualify Copilot/OpenCode, remove their adapters, split host version lines, redesign the Cockpit, claim unsupported Desktop/MCP App capabilities, change governance authority, weaken existing checks, or include unrelated fixes.

## 7. Users And Roles

- AGDF maintainer: Owns product support scope and human release/acceptance decisions.
- Native test executor: Runs the agreed candidate on its declared host, retains observable evidence and performs bounded cleanup. The other Windows computer supplies Claude observations; no messaging or remote access is assumed.
- Evidence validator/reviewer: Checks candidate/tuple/case identity and completeness without granting product or gate approval.
- Installing users: Receive accurate host scope, upgrade guidance, experimental labels and capability limits.

## 8. Constraints

Preserve the approved UR and experimental adapters. Use existing canonical version, installation, runtime, native-probe and release owners. Keep Codex Linux/Windows release requirements and current evidence safeguards. Use Node 22 or later under the repository's existing support policy. Respect native host consent and distinguish technical permission from governance approval. Preserve unrelated staged/unstaged work and use a clean finalized candidate for release-grade evidence. Native tests may require credentials and remote execution, but these are never fabricated or exposed in returned evidence. No requested preview or new UI feature exists.

## 9. Evidence Requirements

Retain canonical version/packaging results, affected regression outcomes and durable native observations with expected versus observed results, source/candidate identity, tuple, tested cases, consent boundaries, cleanup and timestamps. Codex CI must remain tied to the final clean commit. The remote Claude handoff must identify that same candidate and return auditable Windows CLI and Desktop coding-session observations. Model prose, fixtures, a green build, installed client presence or the word current cannot substitute for host execution. Each claim's mechanism and scope must be explicit; non-required or unavailable capabilities remain unverified. No full authentication files, raw secrets or blanket approval claims belong in shared evidence.

## 10. Risks And Open Questions

Exact remote Claude client/app versions and available model are not yet observed and must be captured before execution. Native runners/credentials may be unavailable; retain those as blockers. The existing Claude probe lacks exact source binding and upgrade/recovery coverage and cannot qualify Desktop by itself. Final candidate changes invalidate applicable old evidence. Published 0.14.5 lacks development MCP support, so upgrade checks must verify the effective 0.20.0 integration instead of expecting identical old capabilities. Test architecture, remote packaging, evidence storage and case partitioning remain SD/TP decisions under the agreed product acceptance.

## Approval Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Version and supported host intent | before_prd | resolved | One 0.20.0 candidate for Codex and Claude Code; Copilot/OpenCode remain experimental with their adapters/tests retained, as requested and approved in UR | AGDF maintainer |
| Mandatory native matrix and scope limits | before_prd | resolved | Retain Codex CLI Linux/Windows; obtain separate Windows Claude CLI and Claude Code Desktop coding-session evidence on the other computer named by the user; qualify only observed capabilities, never infer embedded App support | AGDF maintainer |
| Evidence availability and release acceptance | before_prd | resolved | Preparation may finish with visible external obligations, but overall native qualification and publication eligibility remain blocked until every mandatory case matches the candidate | AGDF maintainer |
| Native upgrade baseline | before_prd | resolved | Released 0.14.5 to the final 0.20.0 candidate; bounded recovery uses supported mechanisms, preserving project and unrelated host state | AGDF maintainer |
| Evidence exchange, support-policy owner and release integration | later_sd | open | Design by extending existing native-probe, release and compatibility owners without a second release authority | Solution Design author |
| Exact remote client/app/model tuple and executable bounded cases | later_tp | open | Capture native installed versions and permitted model on the Windows executor before execution; map each acceptance obligation to test/results and cleanup | Task/Test Plan author and native test executor |

## 11. Next Step

Present this PRD for `Approval: PRD` against its exact recorded sources and current revision. Approval adopts the specified matrix, support limits and acceptance criteria and permits Solution Design only. It does not authorize implementation, native execution, publication or human acceptance.

## AGDF Approval Summary (de; source=en)

- Ziel: AGDF 0.20.0 als prüfbaren Kandidaten mit nachgewiesener Host-Unterstützung vorbereiten.
- Umfang: Codex CLI unter Linux und Windows; Claude CLI und Claude Code in der Desktop-App auf dem anderen Windows-Rechner. Nur beobachtete Fähigkeiten werden qualifiziert; eingebettete MCP-App und Hook-Ausführung brauchen eigene Belege.
- AC-001: Versionen, Abhängigkeiten und Pakete konsistent auf 0.20.0 vorbereiten und prüfen.
- AC-002: Codex/Claude als vorgesehene qualifizierte Hosts ausweisen; Copilot/OpenCode bleiben ausdrücklich experimentell und erhalten ihre Adapter/Tests.
- AC-003: Nur vollständige native Belege mit exakter Kandidaten-, Host-, Betriebssystem- und Modellidentität akzeptieren.
- AC-004: Vorhandene native Codex-Linux-/Windows-Prüfungen einschließlich Skill-Fortsetzung und Entfernung erhalten und erfüllen.
- AC-005: Claude-Ergebnisse vom anderen Windows-Rechner prüfen; CLI und frische Desktop-Coding-Sitzung getrennt nachweisen. Lokale Claude-Zugangsdaten sind keine Voraussetzung.
- AC-006: Upgrade von 0.14.5 auf 0.20.0 und begrenzte Wiederherstellung mit wirksamer neuer Laufzeit und sauberem Abschluss belegen.
- AC-007: Veröffentlichung bleibt bei fehlenden, fehlgeschlagenen oder unpassenden Pflichtnachweisen beider Hosts gesperrt.
- AC-008: Release-Hinweise, Testübergabe und Statusbericht zeigen erledigte Prüfungen, Grenzen und offene Nachweise nachvollziehbar.
- Entscheidungen: Kein Publizieren oder Taggen; keine Qualifikation experimenteller Hosts. Vorbereitung und vollständige Qualifikation bleiben getrennt. Fehlende Windows-Ergebnisse bleiben offen. Architektur und Testplanung folgen nach PRD-Freigabe; exakte installierte Versions-/Modellwerte werden beim Test erfasst.
