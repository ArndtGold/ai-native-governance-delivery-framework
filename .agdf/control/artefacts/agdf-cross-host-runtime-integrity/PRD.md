# PRD: Cross-Host Plugin Runtime Integrity

Status: approved  
Gate: PRD  
Gate approval: `Approval: PRD` provided on 2026-08-25 after same-run, same-gate and revision-3 revalidation.  
Based on: approved `UR.md`, completed `BROWNFIELD_REVIEW.md`, ready `UX_INTENT_DEFINITION.md`  
Date: 2026-08-25  
Owner: agent

## 1. Product Scope

Deliver one bounded integrity contract for AGDF distribution profiles so that a user can distinguish
editable source, a generated runtime-bearing bundle, a registered marketplace, an installed cache or
plugin root, and the plugin actually loaded by a fresh host session.

The delivered product behavior must:

1. classify every supported AGDF distribution as either runtime-bearing, config-local or portable;
2. prevent AGDF-owned Codex and Claude Code installation paths from treating runtime-free `plugin/`
   source as a healthy runtime-bearing plugin;
3. preserve one generated validator payload and one validator-semantics owner across Codex, Claude
   Code and OpenCode;
4. allow thin host adapters to resolve native plugin roots, invoke the shared validator and report
   host-owned lifecycle state without creating host-specific governance rules;
5. accept validator output as machine evidence only when the effective runtime profile, AGDF version
   and runtime digest match the intended installed distribution;
6. report portable Skills-only and instruction-only profiles honestly when no local validator is
   included; and
7. provide a deterministic, non-destructive recovery action for collisions, shadowing, missing
   runtime, version drift, digest corruption, stale cache and unverified loaded state.

The repository marketplace may be removed, restricted to an explicitly non-runtime development
role, or changed to a runtime-complete derived source. Solution Design selects one option. In every
case it must have a non-colliding canonical identity and must not silently replace the existing
durable runtime-bearing marketplace.

## 2. UX Intent And Success

- ui_ux_impact: medium
- ux_intent_definition: ready at `UX_INTENT_DEFINITION.md`
- primary_user_intent: Trust that the AGDF plugin currently guiding work is either paired with its
  matching machine validator or clearly identified as a portable profile without local validation.
- success_signal: One coherent effective-state result identifies the intended profile, observed
  loaded source and version, machine-validation availability and one safe next action when they do
  not agree.
- primary_decision_or_action: Continue the governed workflow when integrity is healthy; otherwise
  use the named supported install or update recovery, or continue only within the declared
  agent-native boundary.

## 3. Working Modes And Effective State

| working_mode | effective_state | visible_state_types | effective_state_authority | primary_state_presentation_owner |
|---|---|---|---|---|
| Runtime-bearing Codex plugin | The plugin selected by the current Codex session has the intended marketplace identity, exact AGDF version and matching runtime digest. | healthy; restart required; source-shadowed; version mismatch; digest mismatch; runtime missing; unverified | Observed loaded Codex cache or plugin source plus the exact-version local runtime probe | Codex lifecycle/status result and fresh-session AGDF orientation |
| Runtime-bearing Claude Code plugin | The active `${CLAUDE_PLUGIN_ROOT}` belongs to the intended installed plugin and has the exact AGDF version and matching runtime digest. | healthy; restart required; wrong plugin root; version mismatch; digest mismatch; runtime missing; unverified | Observed Claude Code plugin root plus the exact-version local runtime probe | Claude Code lifecycle/status result and fresh-session AGDF orientation |
| Config-local OpenCode runtime | The effective OpenCode config package resolves the expected exact-version validator owned by the existing OpenCode installation path. | healthy; version mismatch; runtime missing; unverified | Observed config-local package plus existing OpenCode validator resolution | Existing OpenCode status surface |
| Portable Skills-only or instruction-only profile | Packaged skills and resources are available without a claimed bundled executable validator. | agent-native available; machine validation unavailable; external validation required; package incomplete | Declared portable distribution profile plus packaged-resource evidence | Agent-native gate/status response |
| Source-development checkout | Canonical editable sources are present but are not themselves a runtime-bearing installed plugin. | source only; generated bundle ready; install required | Repository source and generated-build evidence | Build or supported install/update result |

## 4. Activation, Blockers, Recovery And Transitions

- activation_and_deactivation: A runtime-bearing profile becomes active only after the supported
  install or update operation completes and a fresh host session observes the intended plugin root or
  cache. Installation success before restart is shown as `restart required`, not as refreshed
  effective state. A portable profile activates through installed skills and never gains an implied
  local validator.
- blockers_and_visible_next_actions:
  - marketplace identity collision: show intended and conflicting identities; stop silent
    replacement; route to the supported marketplace recovery;
  - runtime-free source shadowing: show the observed source and intended complete installation;
    reject machine evidence; route to the existing install/update flow;
  - version or digest mismatch: show expected and observed values; reject machine evidence; route to
    update and fresh-session verification;
  - missing or corrupt runtime in a runtime-bearing profile: classify the installation as unhealthy
    and route to reinstall; do not fall back to a registry-resolved validator;
  - host-loaded provenance unavailable: show `unverified` and a visible retry; do not claim healthy;
  - portable profile without a local validator: show the declared limitation and continue only where
    agent-native inspection is permitted.
- recovery_paths: Use only the existing surface-specific install, update or reinstall owner, then
  restart or open a fresh session and repeat the effective-state check. Never edit a host cache in
  place. Unowned marketplace conflicts require an explicit user decision before removal or
  replacement. Recoverable read failures expose one visible retry.
- relevant_state_transitions:
  - source checkout -> generated complete bundle: build succeeds and complete runtime provenance is
    available; next action is supported installation;
  - generated bundle -> registered marketplace -> installed cache/root: each transition preserves
    canonical identity, version and digest; failure rolls back through the existing installer owner;
  - installed cache/root -> fresh loaded session: restart is completed and the observed source
    matches; otherwise show stale, shadowed or unverified state and the recovery action;
  - healthy -> updated: installation succeeds, visible state becomes restart required, then fresh
    verification decides healthy or degraded;
  - healthy -> mismatch/shadowing: machine evidence becomes invalid immediately; installer recovery
    and fresh verification are required;
  - portable package -> agent-native active: machine validation remains explicitly unavailable or
    externally required.

## 5. Acceptance Criteria

Each criterion is observable and must later map to implementation tasks, automated checks and, where
specified, direct host evidence.

### PRD-RI-01 — Distribution Profile Classification

- working_mode: all declared modes
- source_state: an AGDF source, bundle, marketplace or installed profile is inspected
- trigger_action: classify the profile before machine validation or installation health is claimed
- expected_effective_state: exactly one profile class is returned: runtime-bearing, config-local,
  portable or source-development
- visible_feedback: profile class, expected runtime availability and evidence boundary are named
- blocker_failure_behavior: missing or contradictory profile metadata yields an unverified or
  blocking result, never an inferred healthy profile
- recovery_next_action: rebuild or reinstall through the existing owner, or correct the canonical
  profile metadata
- observable_success: every shipped profile fixture has one deterministic classification
- required_evidence: profile-contract tests and generated-package inspection

### PRD-RI-02 — Runtime-Free Source Cannot Masquerade As Installed Runtime

- working_mode: Codex and Claude Code runtime-bearing plugins
- source_state: an AGDF-owned marketplace or plugin source points at runtime-free `plugin/`
- trigger_action: render, install or validate the marketplace source
- expected_effective_state: the source is rejected as a healthy runtime-bearing installation
- visible_feedback: a stable source-as-install-target or runtime-missing diagnostic names the source
  and intended complete profile
- blocker_failure_behavior: validator output is not launched or accepted as machine evidence
- recovery_next_action: use the existing generated-bundle install/update flow; no cache patch is
  proposed
- observable_success: no AGDF-owned installable Codex or Claude Code marketplace resolves
  runtime-free `plugin/` as healthy
- required_evidence: negative renderer, installer and runtime-integrity tests

### PRD-RI-03 — Marketplace Identity Is Unambiguous

- working_mode: Codex and Claude Code runtime-bearing plugins
- source_state: repository and durable marketplace registrations are both discoverable
- trigger_action: generate or validate marketplace metadata and resolve the intended installation
- expected_effective_state: canonical names are rendered exactly and cannot silently shadow each
  other
- visible_feedback: intended plugin and marketplace identity are visible; collisions name both
  identities
- blocker_failure_behavior: an identity collision stops silent install, update or health claims
- recovery_next_action: use the supported owned-marketplace recovery or request a decision for an
  unowned conflict
- observable_success: repository and durable marketplace fixtures either have distinct declared
  identities or only one installable runtime-bearing owner exists
- required_evidence: manifest-rendering, lifecycle and collision tests

### PRD-RI-04 — One Shared Validator With Thin Host Adapters

- working_mode: Codex, Claude Code and OpenCode executable profiles
- source_state: a host requests machine validation
- trigger_action: resolve and invoke the surface-local validator
- expected_effective_state: the host adapter invokes the existing shared validator semantics from
  its native installed root
- visible_feedback: surface, resolved source, expected version, observed version and registry-access
  state are available as machine-readable evidence
- blocker_failure_behavior: path or version resolution failure stops machine-evidence acceptance
- recovery_next_action: repair the existing surface installation
- observable_success: no skill or host adapter contains an independent complete validator payload or
  gate implementation
- required_evidence: source-ownership assertions, generated-payload digest checks and focused host
  adapter tests

### PRD-RI-05 — Version And Digest Gate Machine Evidence

- working_mode: all runtime-bearing and config-local executable profiles
- source_state: a candidate local validator exists
- trigger_action: request machine validation
- expected_effective_state: output counts as machine evidence only when skill/plugin profile,
  manifest version, runtime version and declared runtime digest agree
- visible_feedback: expected and observed version and digest evidence are reported without registry
  access
- blocker_failure_behavior: version drift, digest corruption, missing manifest or missing runtime
  rejects the evidence with a stable diagnostic
- recovery_next_action: supported update or reinstall followed by a fresh resolution probe
- observable_success: positive exact-match fixtures pass and every independent mismatch fixture fails
  closed
- required_evidence: exact-version probe, digest tests and negative mismatch fixtures

### PRD-RI-06 — Intended Installation And Effective Loaded State Stay Separate

- working_mode: Codex and Claude Code runtime-bearing plugins
- source_state: installation or update completed, while the current host may still load an older or
  different source
- trigger_action: report lifecycle status or begin a fresh AGDF session
- expected_effective_state: installed state and observed loaded state are separately classified
- visible_feedback: successful installation before restart shows restart required; fresh-session
  status names the observed plugin source and integrity result
- blocker_failure_behavior: installed-bundle success alone cannot produce a healthy loaded-session
  claim
- recovery_next_action: restart or open a fresh session and retry the effective-state check
- observable_success: stale-cache and shadowing fixtures remain degraded until fresh loaded evidence
  matches
- required_evidence: lifecycle tests plus direct fresh-session Codex and Claude Code observations

### PRD-RI-07 — Portable Profiles Degrade Honestly

- working_mode: public Skills-only and instruction-only profiles
- source_state: the declared distribution intentionally contains no local validator
- trigger_action: start or inspect an AGDF workflow
- expected_effective_state: agent-native operation remains available within its contract and machine
  validation is unavailable or externally required
- visible_feedback: absence of a validator is described as the declared profile boundary, not as a
  healthy runtime-bearing installation and not automatically as corruption
- blocker_failure_behavior: work requiring machine evidence stops or requests external evidence; no
  registry fallback is launched automatically
- recovery_next_action: continue agent-native where permitted or deliberately install a
  runtime-bearing profile
- observable_success: portable package tests pass without runtime files while runtime-bearing tests
  continue to require them
- required_evidence: public-package conformance and negative executable-claim tests

### PRD-RI-08 — Recovery Is Safe And Actionable

- working_mode: all modes
- source_state: collision, shadowing, mismatch, corruption, missing runtime or transient host-read
  failure is observed
- trigger_action: present the integrity result
- expected_effective_state: the degraded or blocked state remains authoritative until recovery is
  directly verified
- visible_feedback: one primary diagnostic and one safe next action are shown without conflating
  installation, cache and loaded-session evidence
- blocker_failure_behavior: direct cache editing, silent marketplace removal and automatic registry
  resolution are never offered as recovery
- recovery_next_action: existing owned install/update/reinstall, explicit decision for unowned
  conflict, or visible retry for transient read failure
- observable_success: every negative fixture maps to one deterministic recovery category
- required_evidence: diagnostic contract tests and negative lifecycle tests

### PRD-RI-09 — Evidence Planes Remain Independently Verifiable

- working_mode: all modes
- source_state: repository, generated package, registered marketplace, installed root/cache or loaded
  session evidence is available
- trigger_action: produce test, QA or UAT evidence
- expected_effective_state: each claim is attributed to exactly its observed evidence plane
- visible_feedback: evidence labels distinguish repository, bundle, registration, installed host and
  fresh session
- blocker_failure_behavior: lower-plane success cannot satisfy a higher-plane host or UAT claim
- recovery_next_action: collect the missing evidence from the required plane
- observable_success: QA can determine which planes pass, fail or remain unverified without inference
- required_evidence: evidence-matrix tests, package checks and direct host UAT records

### PRD-RI-10 — Existing Surface Contracts Remain Regression Clean

- working_mode: Codex, Claude Code, OpenCode and portable profiles
- source_state: the bounded integrity correction is applied
- trigger_action: run existing build, installer, runtime-integrity, package and surface suites
- expected_effective_state: existing gate semantics, exact approval values, OpenCode config-local
  behavior, portable packaging and owned rollback behavior remain unchanged
- visible_feedback: regressions are reported against their existing owner
- blocker_failure_behavior: any regression blocks QA pass
- recovery_next_action: revise the implementation within the existing owner; do not add a parallel
  path
- observable_success: relevant existing suites and new focused tests pass without weakened assertions
- required_evidence: regression-suite output and mandatory later review reports

## 6. Non-Goals

- Copying a validator runtime into each skill or creating host-specific validator semantics.
- Creating a second installer, marketplace format, gate model, approval path or runtime contract.
- Changing AGDF gates, approval values, control-state authority or delivery modes.
- Adding an MCP service, hosted validator, account requirement or automatic registry fallback.
- Editing installed caches directly or silently removing unowned marketplace registrations.
- Treating portable Skills-only distribution as runtime-bearing installation.
- Publishing, deploying, committing, pushing, opening a pull request or performing host UAT as part
  of PRD approval.
- Claiming cross-host parity from repository or package tests alone.

## 7. Users And Roles

- AGDF user: needs a truthful active-state result and a safe recovery action.
- Contributor or maintainer: builds and installs AGDF locally through existing owned workflows.
- AGDF runtime and installer owners: retain authority over validator generation, marketplace staging,
  lifecycle operations and rollback.
- Host runtime: owns which plugin root or cache is actually loaded and when restart takes effect.
- Reviewer and QA owner: decides whether acceptance criteria and evidence planes are satisfied.
- User or host administrator: decides removal or replacement of unowned marketplace registrations.

No host adapter, hook, cache or package metadata gains AGDF gate-approval authority.

## 8. Constraints

- One canonical validator implementation and one generated runtime payload must remain the only
  machine-validation semantics owner.
- Codex and Claude Code adapters may translate only native root resolution, invocation and host
  lifecycle evidence. OpenCode retains its existing config-local owner.
- Canonical product, surface and marketplace metadata remains owned by
  `plugin/meta/agdf-plugin.definition.json` or an explicitly approved successor selected in SD.
- Runtime-bearing validation must be local, exact-version and registry-free.
- Existing installer ownership checks, staging, atomic promotion and rollback guarantees must be
  preserved.
- Host-owned permissions and lifecycle controls remain separate from AGDF approvals.
- The change must be independently reversible through existing installers and must not require a
  coordinated cross-host cutover.
- The unrelated modified `docs/presentation/agdf_cto_praesentation.key` remains outside scope.

## 9. Evidence Requirements

Later QA requires separate evidence for:

1. canonical distribution-profile and marketplace metadata;
2. source-tree and generated-bundle contents;
3. runtime manifest, entrypoint, focused payload, version and digest coherence;
4. durable marketplace registration and installed root or cache;
5. negative source-target, identity-collision, missing-runtime, version-drift, digest-corruption and
   stale-cache cases;
6. Codex direct fresh-session loaded-source and validator evidence;
7. Claude Code direct installed-root and fresh-session validator evidence;
8. OpenCode config-local regression evidence;
9. portable Skills-only conformance without executable claims;
10. task-plan coverage, clean implementation review, mandatory code review and QA decision.

Repository, generated-package, installation and direct loaded-session results must be reported as
separate evidence planes. Authenticated or rendered host observations cannot be inferred from lower
planes.

## 10. Risks And Open Questions

- SD must select whether the repository marketplace is removed, explicitly restricted to a
  development-only portable role, or rendered from the complete generated bundle. The choice must
  preserve contributor discovery without recreating shadowing.
- SD must define the canonical profile and provenance fields without creating a second manifest or
  state owner.
- SD must define how Codex and Claude Code expose effective loaded provenance when the host offers
  different native evidence.
- TP must identify the exact negative fixtures, existing suites and fresh-session evidence sequence.
- Direct Codex marketplace-precedence behavior and Claude Code fresh-session behavior remain
  evidence obligations, not assumed facts.
- A host update may alter cache-selection or plugin-root behavior. Such drift must yield unverified
  state and trigger evidence refresh rather than silent compatibility claims.

## 11. Next Step

Review this PRD. Approval permits only Solution Design drafting. Implementation remains forbidden.

Approve only with:

`Approval: PRD`
