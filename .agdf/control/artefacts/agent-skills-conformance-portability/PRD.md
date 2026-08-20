# PRD: Agent Skills Conformance And Portability Baseline

Status: approved
Gate: PRD
Gate approval: Approval: PRD
Based on: UR and Brownfield Review
Date: 2026-08-19
Owner: Arndt Gold

## 1. Product Scope

Deliver one deterministic, offline repository capability that evaluates every canonical AGDF skill
against a locally declared Agent Skills conformance baseline and the AGDF plugin portability policy.
The capability must be consumed by the existing Runtime Integrity and package-verification paths,
reuse existing negative-fixture infrastructure, and support both source and generated plugin layouts.

The delivered compatibility statement must distinguish:

1. strict Agent Skills format constraints;
2. non-blocking upstream authoring recommendations;
3. stricter AGDF-owned policy where explicitly declared;
4. intentional plugin-scoped shared dependencies; and
5. repository/package evidence versus unperformed live-host behavior.

## 2. UX Intent And Success

- ui_ux_impact: none
- ux_intent_definition: justified `not_applicable`; Brownfield Review records no user-facing capability, state, activation or recovery change
- primary_user_intent: Maintainers need one trustworthy answer to whether canonical and packaged AGDF skills satisfy the claimed baseline and portability boundary.
- success_signal: Source and generated plugins pass deterministically; representative invalid fixtures fail with stable, actionable findings; no unsupported standalone or live-host claim is emitted.
- primary_decision_or_action: Correct a reported skill metadata, resource-reference or portability-policy violation before merge or package publication.

## 3. Working Modes And Effective State

| working_mode | effective_state | visible_state_types | effective_state_authority | primary_state_presentation_owner |
|---|---|---|---|---|
| `not_applicable` | This slice adds deterministic repository validation, not an interactive user working mode. | CLI/CI pass, warning and failure output only. | The local conformance policy plus inspected skill/package files. | Existing Runtime Integrity command output and CI step. |

## 4. Activation, Blockers, Recovery And Transitions

- activation_and_deactivation: Runs through existing Runtime Integrity, focused tests and package preparation; no new host activation path is introduced.
- blockers_and_visible_next_actions: Strict-format, AGDF-policy, unresolved-reference and undeclared plugin-dependency findings block the relevant check and name the affected skill and rule. Advisory guidance is visibly separate and does not masquerade as upstream non-conformance.
- recovery_paths: Correct the canonical skill, declared portability policy or generated propagation owner, then rerun the same deterministic check. No network fallback or automatic upstream mutation is permitted.
- relevant_state_transitions: valid source to passing source check; synchronized source to passing generated-plugin check; invalid fixture to stable expected failure; upstream guidance update to separately reviewed local baseline revision.

## 5. Acceptance Criteria

### ASC-1 — Canonical inventory

- working_mode: repository validation
- source_state: canonical plugin definition and `plugin/skills/*`
- trigger/action: run the conformance check
- expected_effective_state: every declared canonical skill is evaluated exactly once and undeclared/missing skill directories fail closed
- visible_feedback: stable skill count and pass/fail result
- blocker/failure_behavior: inventory mismatch blocks
- recovery/next_action: align the canonical definition and skill directories
- observable_success: all ten current skills are covered
- required_evidence: focused test plus Runtime Integrity output

### ASC-2 — Strict Agent Skills constraints

- working_mode: repository validation
- source_state: a skill directory containing `SKILL.md`
- trigger/action: parse and validate metadata
- expected_effective_state: YAML frontmatter exists; `name` and `description` are present; name is 1–64 lowercase alphanumeric/hyphen characters without leading, trailing or consecutive hyphens and matches its parent directory; description is 1–1024 characters
- visible_feedback: stable rule-specific finding with skill path
- blocker/failure_behavior: any strict violation blocks
- recovery/next_action: correct the canonical `SKILL.md`
- observable_success: all canonical and generated skills satisfy the declared strict baseline
- required_evidence: positive coverage and representative malformed YAML, missing field, invalid name, mismatch and description-boundary fixtures

### ASC-3 — Guidance and AGDF policy separation

- working_mode: repository validation
- source_state: valid strict-format skill
- trigger/action: evaluate authoring guidance and explicit AGDF policy
- expected_effective_state: upstream recommendations such as the 500-line guidance are labeled advisory unless a separate AGDF-owned policy deliberately makes them blocking
- visible_feedback: advisory and blocking findings are distinguishable
- blocker/failure_behavior: advisory guidance alone does not produce a false upstream-conformance failure
- recovery/next_action: improve the skill or deliberately revise AGDF policy through governance
- observable_success: test proves advisory guidance is not misreported as a strict standard violation
- required_evidence: focused classification tests

### ASC-4 — Resource and dependency boundary

- working_mode: portability validation
- source_state: relative file references in canonical skills
- trigger/action: resolve referenced resources from the skill location
- expected_effective_state: skill-local resources resolve inside the skill root; intentional shared AGDF dependencies resolve inside the plugin and are explicitly recognized as plugin-scoped; arbitrary traversal, unresolved resources and undeclared out-of-root dependencies fail closed
- visible_feedback: finding identifies resource, resolved boundary and portability class
- blocker/failure_behavior: unsafe, unresolved or undeclared dependency blocks
- recovery/next_action: correct the reference or update the single approved portability-policy owner
- observable_success: current shared Runtime Contract references pass as plugin-scoped without being called standalone-portable
- required_evidence: positive current-plugin coverage plus unresolved, arbitrary-traversal and undeclared-dependency fixtures

### ASC-5 — Source and generated parity

- working_mode: package validation
- source_state: canonical plugin plus generated Codex/Copilot/OpenCode/public-submission assets
- trigger/action: synchronize and run the same claimed baseline at each applicable packaged boundary
- expected_effective_state: generated path rewriting preserves resolvable dependencies and valid metadata
- visible_feedback: source and package results remain separately attributable
- blocker/failure_behavior: generated-only drift blocks package preparation/publication
- recovery/next_action: correct the canonical synchronizer or source owner and regenerate
- observable_success: repeated synchronization is idempotent and built-plugin integrity passes
- required_evidence: package build/content tests, Runtime Integrity and diff check

### ASC-6 — Existing workflow integration

- working_mode: CI and release preparation
- source_state: repository or generated plugin candidate
- trigger/action: execute existing guardrail, Runtime Integrity and package-smoke paths
- expected_effective_state: conformance validation is unavoidable in the established verification chain without adding a competing top-level authority
- visible_feedback: existing commands remain the user-facing entry points
- blocker/failure_behavior: conformance failure propagates a non-zero result
- recovery/next_action: correct the reported canonical owner and rerun
- observable_success: guardrail/publish definitions and aggregate smoke consume the check
- required_evidence: workflow inspection and passing focused/aggregate tests

### ASC-7 — Evidence honesty

- working_mode: compatibility reporting
- source_state: passing repository and package checks
- trigger/action: document or report compatibility
- expected_effective_state: claims state core-format conformance and plugin-scoped portability only; standalone portability, identical cross-host behavior and authenticated UAT remain unclaimed without direct evidence
- visible_feedback: canonical installation/compatibility documentation contains the boundary
- blocker/failure_behavior: overclaim is a review or QA blocker
- recovery/next_action: narrow the claim or provide direct evidence in a separately governed scope
- observable_success: documentation and reports preserve repository/package/host/UAT separation
- required_evidence: documentation assertion and review

## 6. Non-Goals

- Independent installation of each AGDF skill.
- Copying Runtime Contract modules into every skill.
- Changing skill routing, gate semantics or approvals.
- Adding optional OpenAI UI metadata, MCP, connectors or a remote registry.
- Fetching the upstream specification during routine CI.
- Certifying behavior across Codex, Claude Code, OpenCode or Copilot from static repository checks.

## 7. Users And Roles

- Maintainers own the local claimed baseline and compatibility wording.
- Contributors receive deterministic findings and correct canonical sources.
- Runtime Integrity remains the repository/package verification entry point.
- The public Agent Skills specification owns upstream format semantics.
- Host vendors own host discovery, activation, permission and execution behavior.

## 8. Constraints

- Validation must be deterministic and offline.
- One canonical local policy owner must distinguish upstream strict rules, advisory guidance and AGDF extensions.
- Existing plugin definition, Runtime Contract and sync owners must be reused.
- No duplicate skill inventory or copied contract corpus may become authoritative.
- Source and generated layouts must both be supported.
- Error codes/messages used by tests must be stable and actionable.
- The implementation must preserve current ten-skill behavior and existing public command shapes.

## 9. Evidence Requirements

- Focused validator unit tests.
- Positive validation of all canonical source skills.
- Negative fixtures for every blocking rule family.
- Advisory-versus-strict classification test.
- Source and generated Runtime Integrity passes.
- Repeated-sync idempotence and generated-diff verification.
- Existing skill evaluations and package smoke pass.
- Code Review, clean implementation review and QA evidence.
- Documentation assertion proving the bounded compatibility claim.

## 10. Risks And Open Questions

- SD must select the single local policy owner and validator module boundary.
- SD must define safe reference extraction without treating arbitrary Markdown or example text as a dependency.
- SD must define how canonical plugin references and rewritten generated references share one classification model.
- TP must keep aggregate smoke proportionate while covering all fail-closed rule families.
- Upstream drift remains a deliberate maintenance event; automatic network-based acceptance is prohibited.

## 11. Next Step

The PRD was approved with exact `Approval: PRD` on 2026-08-19.

Draft and review the bounded Solution Design. Implementation remains forbidden until SD and TP are
durable and approved.
