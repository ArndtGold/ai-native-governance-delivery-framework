# PRD: Comparable Host Compatibility with Clear Adapter Boundaries

Status: approved
Revision: 1
Gate: PRD
Gate approval: Exact `Approval: PRD` accepted on 2026-09-05 after version-matched gate-check confirmed run `agdf-host-adapter-compatibility`, gate `PRD`, durable Revision 1 and revision identity `30df3462-9235-4495-a2e5-02a6eb858be9`.
Based on: approved UR Revision 1; completed BROWNFIELD_REVIEW.md; ready UX_INTENT_DEFINITION.md
Date: 2026-09-05
Owner: Arndt Gold / Codex
Run: agdf-host-adapter-compatibility
Delivery depth: Structured Slice

## 1. Product Scope

Deliver one comparable compatibility reference for the existing Codex, Claude Code, GitHub Copilot
and OpenCode integrations. It reports five separate lifecycle outcomes and the evidence supporting
each capability claim. The underlying adapters must keep host mechanisms separate from canonical
AGDF decisions and shared lifecycle invariants.

This slice has three coupled deliverables:

1. A consistent internal boundary: host-specific installation, discovery, invocation integration,
   technical permissions, update and recovery have an explicit host owner. Target resolution,
   governance evaluation, approval, content identity validation and common evidence meaning retain
   their existing central owners. Host registration/command projections may differ.
2. Reusable compatibility scenarios and an evidence report that evaluate the same five outcomes for
   all four adapters. Existing fixtures, provenance checks and observation practices are reused.
3. A concise explanation and linked comparison in existing compatibility documentation, enabling
   users to distinguish available skills, automatic checks, observed governance and technical
   enforcement for a particular environment.

Private module extraction is bounded by these outcomes. Existing public CLI flags, result fields,
exit-code meanings, dispatcher and binding protocols, runtime locations, permission/consent semantics
and installation/recovery behavior remain compatible. The comparison is a repository evidence and
documentation result, not a new public CLI command, runtime API or capability service.

### Initial Coverage and Environment Identity

All four existing host adapters are in scope for shared deterministic scenarios. The comparison must
also make coverage for macOS, Linux and native Windows visible for each host. This defines the
evaluation inventory, not twelve positive support claims. A host name, package presence, SDK
declaration or simulated OS string does not establish a supported environment.

Each positive claim identifies AGDF canonical version and relevant source/runtime content identity,
host variant and version, OS, execution path, applicable permission/trust/activation conditions,
evidence class, observation date, scope and evidence reference. Record runtime/SDK versions where
they affect the path, and the model where model-dependent behavior is claimed. Unknown identity
fields cannot act as wildcards. Version ranges require evidence for the range; one version cannot
establish a range by assumption.

Exact executable tuples are captured during later validation. Unavailable variants and operating
systems remain unverified unless an evidenced restriction establishes that the capability is
unsupported. This slice does not add a host variant merely because it shares a vendor name.

### Five Outcomes and Four Capability Dimensions

| Lifecycle outcome | Required meaning |
|---|---|
| Installed | The intended AGDF distribution is present and identifiable at the relevant installation surface. |
| Discovered | The host exposes the intended enabled AGDF skills from the matching payload. Package file presence alone is insufficient. |
| Callable | The intended host execution path invokes the version-matched AGDF entry and produces the canonical bounded result. A standalone repository invocation only proves its own execution lane. |
| Correctly updated | The supported update path delivers the intended changed content, including same-version content changes where supported; effective fresh-host content/invocation is separately evidenced. |
| Recoverable | Defined failures or interruptions either recover the verified prior/target state within existing ownership rules or expose the exact remaining partial state and bounded next action. A partial recovery is not a successful recovery claim. |

The report separately describes skill availability, automatic runtime checks, observed governance
behavior and technical enforcement. These are independent dimensions. A technical enforcement claim
names the mechanism, the particular protected action and its execution path. DPS evaluator restrictions,
primary-agent hooks and an observed model response cannot become whole-host or subagent guarantees.

## 2. UX Intent and Success

- ui_ux_impact: medium
- ux_intent_definition: `UX_INTENT_DEFINITION.md`, decision ready
- primary_user_intent: Understand which capabilities are demonstrated for the intended environment and which verification or recovery action is needed before relying on a stronger claim.
- success_signal: A reader can identify the environment/date, distinguish all five outcomes and four capability dimensions, inspect the evidence and locate one next action without inferring live state or authority from a summary.
- primary_decision_or_action: Choose an evidenced environment or follow the stated verification/recovery route for an incomplete or failed capability.

## 3. Working Modes and Effective State

| working_mode | effective_state | visible_state_types | effective_state_authority | primary_state_presentation_owner |
|---|---|---|---|---|
| Compare evidence | A dated observation supports only the named environment and scope | demonstrated, failed, unverified, stale/mismatched or unsupported with reason, separately per outcome | Referenced evidence and evaluated applicability; a report does not activate the reader's host | Existing documentation compatibility reference, linked to the complete evidence report |
| Inspect own installation | Current installation, activation and runtime-check states follow existing local probes and host facts | Existing lifecycle/status/check states, including pending restart or permission | Current host state and existing canonical status/consent owners | Existing local lifecycle/status output |
| Verify or recover | A check/repair remains pending or partial until its actual result is evidenced | pending verification, verified result, failed/partial recovery, unavailable path | Actual bounded operation result and preserved host-owned permission decisions | Existing operation output for progress; revised comparison after evidence evaluation |

Evidence states have distinct meanings:

- **Demonstrated:** admissible matching evidence proves this outcome within its stated lane and scope.
- **Failed:** admissible matching evidence shows the defined outcome failed. The failure remains visible.
- **Unverified:** required evidence is absent, incomplete, malformed or inconclusive. Conflicting
  observations retain both references and a conflict reason; they cannot silently collapse to a pass.
- **Stale/mismatched:** evidence belongs to a different relevant payload, host version, OS, execution
  path or permission/activation assumption. It remains historical evidence for its original tuple.
- **Unsupported:** an explicit evidenced capability boundary prevents this operation in the named
  environment. Absence of testing is insufficient to use this label.

These are product presentation meanings, not new public CLI enum values. Preserve existing canonical
evidence vocabularies and define any necessary internal mapping in SD. Report validity/test success
must be separate from whether a particular host capability has been demonstrated. No global green
badge, percentage or support tier may conceal unresolved outcomes.

## 4. Activation, Blockers, Recovery and Transitions

- activation_and_deactivation: Reading or generating the comparison is passive with respect to hosts and gate authority. Existing explicit host/target status selection, installation, restart, opt-out and consent paths remain authoritative. Comparison generation never repairs, reinstalls or grants permission automatically.
- blockers_and_visible_next_actions: Every absent/mismatched identity, missing session, unavailable host, denied permission, malformed/conflicting evidence or failed operation names the affected claim and one bounded next action. A denied permission is not a product failure when the existing manual path remains usable.
- recovery_paths: A recoverable transient check failure offers retry of the same bounded check through the existing authorized path. Installation/trust repair follows the existing host flow and is followed by fresh verification. Unsupported functionality states its actual limitation; it does not suggest an invented repair.
- relevant_state_transitions: Matching new evidence may establish only its covered outcome. Relevant identity changes invalidate applicability to the new environment. An update before restart does not establish fresh callable content. Partial recovery retains unresolved facts. Revocation/decline of automatic checks preserves existing manual behavior and never changes gate authority. Historical evidence remains accessible across all transitions.

## 5. Acceptance Criteria

For the following criteria, visible feedback is required when user-facing. Internal maintainability
criteria use their review/report evidence as the observable result. Product evidence states do not
replace the existing local CLI statuses.

| criterion_id | working_mode | source_state | trigger/action | expected effective state | visible feedback | blocker/failure behavior | recovery/next action | observable success | required evidence |
|---|---|---|---|---|---|---|---|---|---|
| HAC-01 | Compare evidence | No comparable inventory | Generate comparison for the four adapters and declared OS coverage | Each of the five outcomes is evaluated independently per recorded environment/lane; absent native coverage stays unverified | Environment, outcome, state, date, evidence lane/reference, limitation and next action | Missing rows/identity or zero evaluated scenarios cannot yield a complete successful comparison | Complete the missing input or execute the named scenario | All four adapters have five deterministic outcome groups; native coverage and its gaps are explicit | Deterministic report validation, output review and source/test references |
| HAC-02 | Inspect own installation / compare evidence | Plugin list or installation succeeds | Present installation evidence alongside the comparison | Only installed facts supported by that evidence are demonstrated | Discovery, invocation, update and recovery remain distinct; reference explains legacy installation `healthy` | Successful installation cannot upgrade the other outcomes or automatic checks | Run the relevant existing discovery/session/check path | A plugin-visible-but-not-discovered case remains visibly incomplete | Negative fixture plus rendered comparison; actual host evidence for any live discovery claim |
| HAC-03 | Compare evidence | Partial capability evidence | Read skill, check, governance and enforcement support | Four independent dimensions with mechanism/path-specific limits | Exact evidence scope, including primary/subagent and model limits where applicable | Hook trust, DPS restrictions or a single model response cannot imply universal enforcement | Obtain evidence for the specific missing mechanism/path | No promotion between dimensions without admissible evidence | Positive and adversarial claim-mapping cases; evidence-reference review |
| HAC-04 | Verify or recover | Earlier version/content installed | Exercise supported update with changed bytes at the same canonical version | Existing host update behavior delivers intended content; fresh callable state requires its own evidence | Intended versus observed content and pending restart/session boundary | Old cache, wrong digest or merely completed command cannot pass effective update | Follow existing restart/retry/repair and verify intended bytes | Tests detect stale content even when canonical versions match | Existing adapter/transaction suites extended with common assertions; fresh-host evidence for any effective update claim |
| HAC-05 | Verify or recover | Installation/update operation in progress | Inject a defined failure or interruption and exercise existing recovery | Verified prior/target state or accurately identified partial recovery, preserving foreign files and prior permission/enablement | Recovered facts, unresolved facts and one next action | Failed recovery never reports recoverable/pass; original failure and recovery evidence are retained | Retry or follow existing bounded repair for unresolved state | Common failure tests detect incorrect global success and lost ownership/enablement | Transaction/adapter failure injection and before/after evidence; direct native-OS evidence for native recovery claims |
| HAC-06 | Compare evidence | Earlier demonstrated claim | Change relevant payload/host/OS/path/permission assumption or supply conflicting observations | Earlier evidence retains historical identity and cannot prove the changed environment; conflicts remain inconclusive | Stale/mismatch/conflict reason and both relevant references | Unknown identity is never a wildcard; an older pass cannot hide a matching negative result | Obtain matching evidence or resolve the documented conflict | Changed-input and conflicting-input cases downgrade the affected claim only | Applicability/invalidation tests and report output review |
| HAC-07 | Verify or recover | Authorized bounded check fails transiently, or automatic checks are declined | Read next action and retry when authorized | Retry remains pending until observed; manual mode and host-owned deny/ask are preserved | Failure or manual state, direct retry/verification route and result when available | No automatic reinstall, permission widening or assumed success after elapsed time | Existing bounded retry or manual verification | Reader has an actionable recovery path without a new authority path | Failure/retry presentation cases and existing consent regression evidence |
| HAC-08 | Compare evidence / maintain adapters | Existing shared decision flow | Run equal normalized target/control cases through each adapter path | Canonical target, gate and terminal/continuation semantics agree; host transport metadata may differ | Comparison/review identifies canonical owner and result | A host-specific alternate gate/target rule or post-terminal continuation fails conformance | Correct the adapter boundary within approved design; escalate changed product policy upstream | Normal, unresolved-target, missing-approval and invalid-input cases detect semantic drift | Existing dispatcher and binding suites with common normalized outcome assertions |
| HAC-09 | Maintain adapters | Mixed host mechanics in existing lifecycle owners | Complete bounded private ownership refactor | Host mechanics have one explicit owner; common identity/consent/result/transaction invariants remain shared | Reviewable owner map and relevant regression results | A new host mechanism must not create a second governance decision, transaction or state authority | Reuse existing owner or return to SD | A representative host-local change leaves other host behavior and core decision results unchanged in regression evidence | Caller/dependency review and meaningful host-isolation tests, not file-count or regex-only proof |
| HAC-10 | Inspect own installation / maintain adapters | Current public behavior and persisted formats | Run existing command/result, provenance, consent and recovery regressions against final source | Existing public flags/fields/exit meanings, dispatcher/binding versions, paths, receipt/marker meanings and permission behavior are preserved | Existing user flows remain familiar; new comparison is clearly separate | Incompatible behavior or a required schema/path/permission change exceeds the slice | Revisit sizing and the earliest affected product/design gate | Existing consumers and focused regressions remain valid without weakened assertions | Public-contract regression evidence, package/runtime integrity and pre-implementation Brownfield review |
| HAC-11 | Compare evidence | Historical reports and new deterministic results coexist | Produce the first report and documentation reference | Historical, deterministic, installed-root, fresh-host and human-UAT evidence retain their original scope | Publishable summaries link to accessible redacted evidence and show observation dates/limits | Source-only tests cannot count as native-host evidence; completed old runs cannot establish current payload support | Record a gap or collect the missing scoped evidence; leave foreign approvals unchanged | Historical schema remains intact; every claim is traceable and no private evidence is exposed publicly | Evidence-map review, generated-output checks, documentation link/language checks and scoped host evidence |
| HAC-12 | Compare evidence / maintain adapters | Baseline scenarios and separate host tests exist | Deliver and review the common suite/report | Common acceptance assertions are reused across all four adapters while technical host stimuli stay local | Coverage identifies common scenarios, host-specific stimulus and unresolved live obligations | Four copied independent suites or an empty all-green report do not meet the outcome | Consolidate the shared assertions and rerun covered scenarios | One shared scenario change applies to all relevant adapters; lifecycle negatives remain detectable | Test ownership review and actual deterministic execution with nonzero coverage and failure sensitivity |

## 6. Non-goals

- A new governance engine, general adapter framework, capability state service or support dashboard.
- New public CLI/schema/protocol behavior, runtime-location migration, host command algorithms or
  permission/enforcement mechanisms. Existing content changes still undergo existing identity renewal.
- Identical host APIs/UI, automatic discovery of every host variant or universal version/OS support.
- A new policy declaring historical observations current by age alone, or treating untested as unsupported.
- Completing unrelated QA/UAT runs, silently repairing installations, adding the proposed OpenCode
  native tool, publishing a site/package, or performing VCS delivery.
- Redesigning the existing installation/status UI. The new comparative evidence view explains its limits.

## 7. Users and Roles

- Users select a host/environment and decide what evidence is sufficient for their intended use.
- Maintainers own adapters, execute bounded compatibility checks and review evidence applicability.
- Host owners retain technical permission/trust decisions. Canonical AGDF control retains gate authority.
- QA evaluates the final implementation and evidence against these criteria. Human UAT remains distinct.

## 8. Constraints

- Reuse the canonical owners named in BROWNFIELD_REVIEW.md and identify exact internal boundaries in SD.
- No new persistent capability authority or migration of consent/provenance/control records. Reports
  remain derived evidence; an optional internal report representation is not a supported external API.
- Preserve source-versus-generated, installed-root-versus-loaded-session and primary-versus-subagent
  distinctions. Historical observation files and unrelated worktree changes remain untouched.
- Existing package propagation and independently authorized host installation are sufficient. If a
  coordinated rollout, external protocol/versioning change or non-local recovery becomes necessary,
  re-evaluate the bounded slice before proceeding.
- Public documentation uses publishable redacted evidence and accessible links. German-primary handbook
  content and its English counterpart follow existing repository ownership and parity conventions.

## 9. Evidence Requirements

The final validation plan maps every criterion to existing or extended deterministic checks and,
where applicable, observable presentation or host evidence. Common scenarios cover success, missing
discovery, wrong/stale identity, unresolved target, missing approval, denied permission, changed bytes
under the same version, interrupted update, partial recovery and conflicting observations.

Every deterministic adapter receives the same outcome assertions. OS fixtures are identified as
fixtures. Live support claims require direct evidence for the exact claimed tuple and execution path.
No live-host action is required merely to draft or approve this PRD. A final report may truthfully
contain unverified live combinations while the report implementation and deterministic suite pass;
it may not describe those combinations as demonstrated support. Zero evaluated deterministic cases,
fabricated observations or relabeled historical passes are unacceptable.

Pre-implementation Brownfield Analysis after approved TP must confirm current callers, protected
contracts, generated consumers, foreign-run overlap and the baseline. Code Review, Clean Review,
Task Plan Review and QA retain their existing roles. Direct host/restart/OS evidence remains separate
from repository test results and from user acceptance.

## 10. Risks and Open Questions

- SD must identify the exact adapter entry points and compatibility imports while preserving current
  behavior. It must show that common mechanics such as ownership transactions are not duplicated.
- SD must choose internal normalization and the report's repository owner, retaining negative results
  and historical identities. The existing skill-only live recorder and fixed historical schema are
  not universal lifecycle owners.
- SD must specify how the existing documentation reaches the comparison without maintaining a second
  hand-written support matrix. Detailed output layout and publication packaging remain design work.
- TP must capture the exact validation tuples and decide which direct observations can be collected
  through available authorized paths. Missing access is an evidence gap, never implicit lifecycle consent.
- Runtime byte changes may trigger existing consent renewal; hiding this would violate compatibility.
- No unresolved product choice blocks PRD review. The bounded deliverables, independent evidence states,
  unchanged public contracts and honest acceptance of unverified live coverage are explicit decisions
  being presented for approval.

## 11. Next Step

PRD Revision 1 is approved. The next permitted artefact is Solution Design for this bounded slice.
Implementation remains gated.
