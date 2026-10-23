# PRD: AGDF 0.20.0 CLI-qualified release with manually checked Desktop surfaces

Status: draft
Gate: PRD
Gate approval: open
Based on: UR
Date: 2026-10-23
Owner: AGDF maintainer
Traceability contract: criteria-chain-v1

## 1. Product Scope

Prepare one coherent AGDF 0.20.0 candidate with Codex and Claude Code as its intended qualified hosts. The mandatory qualified release matrix is Claude Code CLI on Windows and Codex CLI on macOS. Each mandatory target needs fresh, reviewed native records for the final candidate covering five cases: dispatch, controlled invalid input, skill continuation, upgrade from the released 0.14.5 baseline and bounded owned-stale recovery. Every case includes deliberate installation, discovery, a non-authorizing invocation and clean removal. The maintainer runs the Codex cases on their Mac and the Claude cases on the Windows test computer.

Codex Desktop and Claude Desktop ship as manually checked surfaces. The maintainer's handchecks of invocation, upgrade and recovery stay recorded as reported passed (human_reported) with their unknown app version, model, candidate, session and captures. They are not machine-qualified and do not gate publication. Their candidate-bound qualification moves to a later 0.20.x run; the existing Desktop records, handoff, import and validator stay available.

Codex CLI on Linux and native Windows stays unqualified outside the mandatory matrix. GitHub Copilot and OpenCode stay experimental with their adapters and regression coverage. No CLI result qualifies a Desktop surface, and no result for one operating system qualifies another.

Earlier evidence keeps its original provenance: the five Claude CLI cases for candidate 830d8b94 stay historical, and the earlier macOS Codex CLI results on dirty candidates stay diagnostic. Neither counts for the final candidate.

Preparation, human-reported checks, candidate-bound qualification, human acceptance and publication are distinct outcomes. This PRD grants no release approval and waives no candidate, ownership, failure, cleanup or approval safeguard.

| Host / surface | 0.20.0 scope | Available observation | Qualification boundary |
|---|---|---|---|
| Claude Code CLI on Windows | Mandatory qualified release target | Five validator-accepted cases for the earlier candidate 830d8b94 only | Fresh reviewed records for the final candidate; historical records are not relabelled |
| Codex CLI on macOS | Mandatory qualified release target on the maintainer's Mac | Earlier diagnostics on dirty candidates (Codex CLI 0.163.0, gpt-6-luna, darwin/x64) | Fresh reviewed records for the final candidate with the exact frozen tuple; earlier results stay diagnostic |
| Codex Desktop | Manually checked; not qualified; non-gating | Maintainer reports invocation, upgrade and recovery passed | Exact environment and candidate unverified; qualification deferred to a later 0.20.x run |
| Claude Desktop | Manually checked on the Windows test computer; not qualified; non-gating | Same three reported manual passes | Exact environment and candidate unverified; no borrowed CLI identity; qualification deferred |
| Codex CLI on Windows / Linux | Unqualified; outside the mandatory matrix | No accepted native qualification | No qualified claim inferred from macOS, Desktop or CI |
| GitHub Copilot / OpenCode | Experimental | Existing adapters and fixtures retained | No native 0.20.0 qualification claimed |

## 2. UX Intent And Success

- ui_ux_impact: low
- ux_intent_definition: Direct low-impact support and evidence labels from the current BROWNFIELD_REVIEW.md; no requested preview or new interaction.
- primary_user_intent: Identify which host and surface combinations are qualified for the release candidate, which were only checked manually, and which are unqualified or experimental, then choose the appropriate installation or next action.
- success_signal: Guidance and reports distinguish qualified, manually checked, pending, failed, diagnostic, unqualified and experimental without implying other operating systems, surfaces or capabilities.
- primary_decision_or_action: The maintainer assesses the exact evidence and remaining obligations before any human acceptance or separate release decision; installing users see the demonstrated scope.

## 3. Working Modes And Effective State

| working_mode | effective_state | visible_state_types | effective_state_authority | primary_state_presentation_owner |
|---|---|---|---|---|
| Release preparation | Version and package coherence can pass before qualification | prepared; preparation_failed | Canonical version and package checks | Release readiness report |
| Mandatory CLI qualification | Each mandatory CLI case is open, failed or qualified for the final candidate | pending; failed; qualified | Reviewed native records matching the candidate and the frozen tuple | Existing compatibility and readiness report |
| Desktop handcheck documentation | Original maintainer observations are retained with unknown fields | reported_manual_pass; identity_unverified | Attributed human report; no machine qualification inferred | Desktop handcheck record and compatibility/readiness report |
| Historical and diagnostic evidence | Earlier records apply only to their own candidate and tuple | historical; diagnostic | Original provenance and review status | Evidence handoff and readiness report |
| Unqualified/experimental path | Codex CLI Windows/Linux unqualified; Copilot/OpenCode experimental | unqualified; experimental | Explicit approved scope; no fixture, macOS or Desktop inference | Installation guidance and compatibility report |

These are meanings for existing outputs, not another persistent status machine, approval authority or acceptance register.

## 4. Activation, Blockers, Recovery And Transitions

- activation_and_deactivation: Use deliberate existing installation, consent and removal paths in isolated test scopes. Do not replace an active profile, transfer credentials or infer permission from an observation or a successful MCP call.
- blockers_and_visible_next_actions: A missing, failed or mismatched mandatory CLI case leaves that case open with its exact gap and owner action. An unavailable native environment is recorded as a concrete open blocker, never as a pass.
- recovery_paths: Preserve original records. Repair the affected prerequisite through its existing owner and retry only the affected case visibly on the same candidate and tuple. A candidate change requires fresh records for the new candidate.
- relevant_state_transitions: Recording a human report changes documentation only. Importing reviewed matching records closes exactly their cases; other hosts, surfaces and operating systems stay unchanged. Missing or failed mandatory evidence blocks overall qualified and release-ready status. The Desktop rows leave mandatory eligibility only through approved, tested policy migration, never by being marked passed. Publication remains separate.

## 5. Acceptance Criteria

### AC-001 — Coherent 0.20.0 candidate

criterion_id: AC-001

All canonical and derived release versions and exact dependent package requirements consistently identify 0.20.0. Canonical release preparation, package integrity, packaging and affected regression checks pass without weakening version/history or payload checks. Preparation publishes no package and creates no release tag.

### AC-002 — Accurate surface and support labels

criterion_id: AC-002

Public guidance, release notes, compatibility output and readiness reports consistently identify Claude Code CLI on Windows and Codex CLI on macOS as the qualified surfaces, each only for its reviewed exact tuple. Codex Desktop and Claude Desktop are labelled manually checked and not qualified, with observation method and limits. Codex CLI Windows/Linux stays explicitly unqualified; Copilot/OpenCode stay experimental with adapters and tests retained. Historical and diagnostic records are labelled as such.

- working_mode: Mandatory CLI qualification, Desktop handcheck documentation and unqualified/experimental path.
- source_state: Existing policy and reporting still describe the two Desktop targets as mandatory.
- trigger_action: Read installation, compatibility or candidate readiness guidance.
- expected_effective_state: Qualified, manually checked, unqualified and experimental states stay distinguishable per host, surface and operating system.
- visible_feedback: Host, surface, OS where known, method, result and qualification limits are shown.
- blocker_failure_behavior: Unknown identity, missing or conflicting evidence cannot display qualified.
- recovery_next_action: Record the missing case on the final candidate or keep the row open with its gap.
- observable_success: A reader can identify the demonstrated scope and next action without inferring support for other operating systems or surfaces.
- required_evidence: Source and generated guidance consistency and report inspection, including manual, unknown and open states.

### AC-003 — Exact identity and assurance remain binding

criterion_id: AC-003

Every accepted qualified record identifies the exact tested candidate, AGDF version, clean source commit and/or equivalent verified payload digests, actual host client and version, OS, architecture, model and Node. Unknown and genuinely inapplicable fields stay distinct. Candidate and actual loaded identity must match; version prose, dirty diagnostics, generic chat, fixtures and human assertions without binding do not establish qualification. Preserve immutable provenance, review, containment and duplicate/mismatch rejection.

Human reports may be retained with explicit limits; they must not pass the qualified-record validator or silently acquire machine assurance.

### AC-004 — Codex CLI on macOS qualification and Codex limits

criterion_id: AC-004

Codex CLI on macOS is qualified only by fresh, reviewed, candidate-bound records for the final candidate covering dispatch, controlled invalid input, skill continuation, upgrade and recovery, each with deliberate installation, discovery, a non-authorizing invocation and clean removal. The exact tuple (Codex CLI version, model, architecture, Node) is captured before execution and frozen for all five cases; the Linux/Windows pin is not reused. Earlier macOS diagnostics stay diagnostic. Codex Desktop handchecks stay documented as reported passed with missing identity explicit. Neither macOS nor Desktop evidence nor ordinary Windows/Linux CI qualifies Codex CLI on Windows/Linux. Successful MCP alone proves no hook trust or execution and no embedded MCP App rendering.

### AC-005 — Claude Code CLI on Windows qualification and Claude Desktop limits

criterion_id: AC-005

Claude Code CLI on Windows is qualified only by fresh, reviewed, candidate-bound records for the final candidate covering the same five cases with the same installation, discovery, invocation and removal obligations and its exact frozen tuple. The five cases for candidate 830d8b94 stay historical and are not relabelled for the final candidate. Claude Desktop's three manual scenarios on the Windows test computer stay documented as reported passed without substituting CLI identity. The tests run on the maintainer-operated Windows test computer; no Claude credentials are transferred.

### AC-006 — Upgrade, bounded recovery and cleanup

criterion_id: AC-006

For each mandatory CLI target, prove upgrade from released 0.14.5 to the final 0.20.0 candidate and bounded recovery from a supported owned-stale installation. Record starting identity, action, fresh effective loaded candidate, actual result and cleanup. Preserve project governance, unrelated settings and approval authority. Reuse existing supported mechanisms; no destructive migration, broad cache cleanup, unknown-ownership exception or weakened postcondition is permitted. Desktop upgrade and recovery stay human-reported.

### AC-007 — Mandatory matrix through existing release acceptance

criterion_id: AC-007

The single existing release eligibility path must enforce the approved Claude Code CLI Windows and Codex CLI macOS matrix and reject absent, failed, stale, mixed-candidate, duplicate, incomplete or mismatched records before publication. Migrate the former mandatory Desktop dependency explicitly through canonical support policy and its consumers; never treat unexecuted rows as passed. Supplied Desktop records stay strictly validated but are optional and non-gating; Linux/Windows Codex CLI results are never counted as qualification. Preserve strict candidate, provenance, containment, ownership, cleanup, unknown-state and approval checks and the entire ordinary CI inventory and current timeouts. A documented handcheck is not a publication authorization or validator pass. Use the existing validators, imports and reports, not a second decision authority.

### AC-008 — Reviewable closeout preparation with visible limits

criterion_id: AC-008

Deliver coherent release notes, candidate and evidence instructions per mandatory host, and a readiness report showing actual completed checks, exact references, qualified tuples, human-reported Desktop scenarios, unknown Desktop facts, unqualified/experimental paths, historical and diagnostic records, failures and next actions. Refresh derived compatibility evidence through its owner. Distinguish repository tests, CI, native records and human acceptance, and expose every remaining mandatory obligation. Closeout preparation may be complete while qualification is pending; it must not imply release readiness, human acceptance or publication.

- working_mode: Release preparation, mandatory CLI qualification and Desktop handcheck documentation.
- source_state: Mandatory CLI records for the final candidate do not exist yet; Desktop identity stays unverified.
- trigger_action: Review returned records or prepare closeout.
- expected_effective_state: Only validated applicable records change their qualification result; human reporting stays separately attributed.
- visible_feedback: Completed and open obligations, known environment, unknown facts and one concrete next action per gap.
- blocker_failure_behavior: Missing or failed mandatory proof prevents overall qualified and release-ready status.
- recovery_next_action: Record the affected case on the final candidate through the handoff of its host.
- observable_success: The maintainer can assess the next permitted step without guessing whether qualification, acceptance or publication occurred.
- required_evidence: Candidate report, preserved source statements, validated references and negative report/acceptance checks.

## 6. Non-Goals

Publication, tags, marketplace submission, active-profile replacement, credential transfer, Desktop qualification in 0.20.0, qualification of Codex CLI Windows/Linux, Copilot/OpenCode native qualification, removal of experimental adapters or of the Desktop evidence tooling, split release versions, new product/UI features, governance authority changes, fabricated host identity, assurance escalation or weakened safety/checks. No blanket retesting solely to replace documented manual assertions.

## 7. Users And Roles

- AGDF maintainer: Owns the host scope, the manual Desktop assertions, the native execution environments and human release/acceptance decisions.
- Native test executor: Runs the five cases per mandatory host on the final candidate in an isolated scope, preserves actual environment and bounded cleanup, and returns the records without assuming remote access.
- Evidence reviewer: Checks primary evidence, candidate/tuple/case applicability and immutable import, granting no gate approval.
- Installing users: Receive accurate qualified, manually checked, unqualified and experimental scope.

## 8. Constraints

Retain the approved UR, its exact upstream approval and one version line. Use existing canonical metadata/schema/generation, installer/runtime, native harness, evidence, release and reporting owners. Current policy remains effective until the renewed sources are approved and implemented. Renewed TP and required preparation precede implementation; retain code and tests for assessment. Preserve foreign worktree content. Respect host consent and separate technical permission from governance approval. Use a clean finalized candidate for release-grade proof. Preserve every ordinary CI test, present timeout, ownership and unknown-state safeguard. No requested interactive preview exists.

## 9. Evidence Requirements

Direct human sources are DESKTOP_HANDCHECKS_20261022.md (both Desktop hosts, invocation/upgrade/recovery reported passed, identity not supplied) and the maintainer decisions of 2026-10-23 recorded with the source revision 077ecefa and the current BROWNFIELD_REVIEW.md. Recording date is not execution date.

Each mandatory CLI case needs a reviewed native record with observed expected and actual results, the final candidate, loaded identity, frozen tuple, consent boundaries, cleanup and timestamps, imported through the existing scoped import and accepted by the existing validation. Retain the source-revision receipts, canonical preparation and packaging results, applicable regression outcomes and the historical and diagnostic records with their original status. Missing facts stay visible; no machine JSON, log or screenshot is manufactured from conversation assertions. No secrets, complete auth files, unrelated transcripts or credentials belong in returned evidence. Authoring this PRD claims no fresh host run or CI result.

## 10. Risks And Open Questions

Both native environments are maintainer-operated: the Codex cases need the maintainer's Mac, and the Claude CLI harness on the Windows test computer completed earlier only when started outside the Desktop app package. Records return only after execution there. The exact Codex macOS tuple differs from the existing Linux/Windows pin and must be captured before execution. Published 0.14.5 and development MCP capabilities differ, so upgrade proof must identify the effective new runtime. The canonical hostSupport schema, native records, publication graph and report consumers still encode the Desktop matrix; design and test their coherent migration before changing eligibility. These are later design and execution obligations under the acceptance above, not permission to waive product acceptance.

## Approval Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Version and mandatory release targets | before_prd | resolved | One 0.20.0 line. On 2026-10-23 the maintainer confirmed the PRD-source revision with its exact apply selector after the six Desktop records proved infeasible, and chose Claude Code CLI on Windows and Codex CLI on macOS as the mandatory qualified matrix with five cases each; the macOS Codex row keeps the approved UR requirement of mandatory evidence for both hosts | AGDF maintainer |
| Desktop surfaces | before_prd | resolved | Codex Desktop and Claude Desktop ship as manually checked, not qualified and non-gating; their qualification moves to a later 0.20.x run and the Desktop tooling is retained | AGDF maintainer |
| Unavailable and experimental paths | before_prd | resolved | Codex CLI Windows/Linux remains unqualified outside mandatory scope; Copilot/OpenCode remain experimental with adapters and tests retained | AGDF maintainer |
| Meaning of Desktop confirmation | before_prd | resolved | Record "alle" as all three named scenarios on both Desktop hosts; concrete versions, model and candidate were not supplied and remain unknown | AGDF maintainer |
| Qualification and release acceptance | before_prd | resolved | Preserve the approved UR exact-candidate and no-false-qualification obligations; missing mandatory CLI proof blocks overall qualification and publication eligibility; human reports never qualify | AGDF maintainer |
| Upgrade and recovery obligations | before_prd | resolved | Retain 0.14.5 to final 0.20.0 upgrade, bounded owned-stale recovery and preservation/cleanup safeguards for both mandatory CLI targets | AGDF maintainer |
| Policy, record, publication and report migration | later_sd | open | Extend the existing metadata/schema/generator, release policy, validators, publication and report owners for the CLI matrix with optional non-gating Desktop records; define the role of the Linux/Windows Codex E2E workflow; prevent a parallel authority | Solution Design author |
| Tuple freezing, execution handoff and historical evidence | later_tp | open | Map each mandatory case to its host handoff, tuple capture, review and import on the final candidate; keep historical and diagnostic records unrelabelled | Task/Test Plan author and evidence reviewer |

## 11. Next Step

Record and present this PRD against the exact retained UR and the current Brownfield Review, then obtain a new deliberate Approval: PRD. That decision adopts the CLI-qualified matrix and criteria and permits SD drafting only. Old PRD/SD/TP approvals do not carry forward; the revision confirmation itself approves no gate, implementation or release.

## AGDF Approval Summary (de; source=en)

- Ziel: AGDF 0.20.0 als einheitlichen Kandidaten vorbereiten, qualifiziert auf Claude Code CLI unter Windows und Codex CLI unter macOS, mit ehrlich ausgewiesenen Desktop-Handprüfungen.
- Umfang: Pflichtmatrix sind Claude Code CLI unter Windows und Codex CLI unter macOS mit je fünf Fällen am finalen Kandidaten: Dispatch, kontrollierte Fehleingabe, Skill-Fortsetzung, Upgrade von 0.14.5 und Recovery. Codex Desktop und Claude Desktop gelten als manuell geprüft, nicht qualifiziert und blockieren die Veröffentlichung nicht. Codex CLI unter Windows/Linux bleibt unqualifiziert, Copilot/OpenCode bleiben experimentell. Frühere CLI-Ergebnisse bleiben historisch oder Diagnose.
- AC-001: Versionen, Abhängigkeiten und Pakete konsistent auf 0.20.0 vorbereiten und prüfen; nichts veröffentlichen oder taggen.
- AC-002: Qualifizierte, manuell geprüfte, unqualifizierte und experimentelle Kombinationen in Doku und Berichten klar unterscheiden.
- AC-003: Qualifikation verlangt exakte Kandidaten- und Umgebungsbindung; Handberichte werden erhalten, aber nie maschinell qualifiziert.
- AC-004: Codex CLI unter macOS mit fünf frischen, geprüften Fällen und eingefrorenem Tupel belegen; das zählt weder für Desktop noch für Windows/Linux.
- AC-005: Claude Code CLI unter Windows mit fünf frischen, geprüften Fällen belegen; die Fälle für 830d8b94 bleiben historisch, Claude Desktop bleibt manuell geprüft.
- AC-006: Upgrade von 0.14.5 und begrenzte Recovery für beide CLI-Ziele mit tatsächlicher neuer Laufzeit, Erhalt fremder Einstellungen und sauberem Abschluss belegen.
- AC-007: Die bestehende Release-Prüfung auf die CLI-Pflichtmatrix umstellen; Desktop-Belege bleiben streng geprüft, aber optional. Alle Sicherheits-, Eigentums-, Freigabeprüfungen sowie alle normalen CI-Tests und Zeitlimits bleiben erhalten.
- AC-008: Abschlussunterlagen zeigen erledigte Prüfungen, Handberichte, Grenzen und offene Pflichtnachweise, ohne Release-Bereitschaft oder Abnahme zu behaupten.
- Entscheidungen: Die Pflichtmatrix und der Desktop-Status stehen fest; die macOS-Codex-Zeile erfüllt die UR-Pflicht für beide Hosts. Offen bleiben die Umstellung der Policy und Berichte im SD sowie Tupel, Übergaben und Import im TP. Nach neuer PRD-Freigabe folgen erneuerte SD und TP; die UR bleibt gültig.
