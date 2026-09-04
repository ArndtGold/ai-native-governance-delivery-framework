# Product Requirements: Cross-surface Executable Skill Dispatcher

- revision: 1
- status: `approved`
- related_ur: `.agdf/control/artefacts/cross-surface-executable-skill-dispatcher/UR.md`
- brownfield_review: `.agdf/control/artefacts/cross-surface-executable-skill-dispatcher/BROWNFIELD_REVIEW.md`
- ux_intent: `.agdf/control/artefacts/cross-surface-executable-skill-dispatcher/UX_INTENT_DEFINITION.md`
- delivery_depth: `structured_delivery`

## Product Problem

AGDF's current direct skills carry correct target, gate and interaction rules, and the installed
runtime already implements deterministic validation and rendering. The host model must nevertheless
discover those owners and assemble the operational path. This creates long silent waits, unnecessary
tool calls, malformed reconstruction and model-strength dependence before the actual skill begins.

The observed Copilot path eventually made the correct safe decision, but approximately three
minutes after invocation. A preflight that stops invalid work must be both correct and operationally
early.

## Product Outcome

Every supported installed AGDF surface offers one shared executable dispatch capability. A direct
canonical skill invocation uses it first to resolve the task target, validate the installed runtime,
bind permissible control context and return either a terminal canonical output or one bounded next
action for the named skill.

The dispatcher reduces orchestration work. It does not replace the reasoning or decision authority
of Brownfield, review, QA or closeout skills.

## Users And Context

- Developers and maintainers invoking AGDF skills directly in Copilot, Codex, Claude Code or OpenCode.
- Users working in a repository-backed conversation, a repo-less chat or a context with several
  plausible repositories or active runs.
- Strong and weaker models that should receive the same deterministic starting state.
- Maintainers diagnosing whether latency belongs to the executable, model or host transport.

## Product Principles

1. Execute deterministic work in code, keep product judgement in the owning skill.
2. Resolve the work target before repository activation or evidence discovery.
3. Reuse existing authority and renderer owners; dispatch is orchestration, not governance policy.
4. Fail closed and visibly when execution cannot be trusted.
5. Distinguish executable conformance from instruction-only availability.
6. Measure runtime, model and host timing separately.
7. Generate every surface from canonical sources and ship version-coherent runtime assets.

## Functional Requirements

### PRD-01 Canonical Skill Registry

The product shall expose one canonical registry of every shipped direct AGDF skill. Each entry
identifies the stable skill id, whether a deterministic evaluator/presentation path exists, whether
skill judgement remains required and which bounded continuation is legal after target resolution.
Unknown, duplicate or conflicting entries fail closed.

### PRD-02 Normalized Invocation Input

One invocation shall accept a stable normalized context containing:

- canonical skill id;
- surface identifier;
- conversation language;
- working directory as context only;
- target source;
- optional primary target;
- optional run identifier;
- expected AGDF version and installed-runtime identity.

Missing or malformed required values shall produce a typed invalid-input result. The dispatcher
shall never convert working directory or evidence access into target authority.

### PRD-03 Runtime And Provenance Preflight

Before skill-specific work, the dispatcher shall prove the expected local runtime, version,
distribution profile and provenance through the existing resolver. Remote registry access,
automatic installation and silent fallback to another version are prohibited.

### PRD-04 Target-first Execution

The dispatcher shall execute the existing target resolver before repository activation, run
selection, gate evaluation, quality review or mutation. Resolved and unresolved results must retain
the existing Task Target Resolution schema and authority semantics.

### PRD-05 Terminal Unresolved Outcome

For `no_reliable_target`, multiple targets, mismatch or unavailable target, the dispatcher shall:

- return the canonical localized Task Target orientation;
- return exactly one normalized recovery action;
- mark the result terminal and non-authorizing;
- perform no repository control inspection or skill-specific evidence discovery afterward.

### PRD-06 Resolved Dispatch Packet

For a resolved target, the dispatcher shall return one immutable packet containing target identity,
governance target, runtime identity, selected skill, permitted next operation, presentation language,
terminal status, timing and diagnostic fields. Downstream work may use only that governance target
and packet revision.

### PRD-07 Deterministic And Judgement Paths

When an existing code-owned evaluator can produce the complete requested result, the dispatcher may
invoke it and return its canonical renderer output. When Brownfield, review, QA or other skill
judgement is required, it shall return bounded inputs and one continuation to that named skill. It
shall not synthesize the judgement.

### PRD-08 Gate And Approval Integrity

The dispatcher shall not grant or persist an approval. Approval presentations, deliberate input and
post-response target/run/gate/revision revalidation remain governed by the existing Interaction and
Gate Transition contracts. A stale dispatch packet cannot authorize later mutation.

### PRD-09 Canonical Presentation

All AGDF-owned visible blocks shall be returned from the existing interaction renderer and complete
locale registry. Adapters shall transmit renderer output verbatim where required. They shall not
rebuild tables, translate individual values or create host-local Markdown templates.

### PRD-10 First-action Contract

A conforming direct skill adapter shall invoke the dispatcher as its first operational action. It
shall not search for contract files, locate alternative runtimes, inspect repository control or
reconstruct commands first. Short static instructions necessary to issue the call are allowed.

### PRD-11 Timing And Progress

- Deterministic dispatcher execution shall complete within 2 seconds in local supported-OS fixtures.
- Dispatcher output shall include process duration and phase timing without hidden reasoning or
  personal content.
- Loaded-host evidence shall separately record invocation time, first dispatcher tool start, first
  AGDF-owned visible output and terminal result.
- A conforming loaded-host scenario shall show first AGDF-owned output within 15 seconds. A host that
  cannot meet or prove this remains explicitly `instruction_only` or non-conforming.
- No three-minute silent invocation may be classified as passing executable dispatch.

### PRD-12 Failure And Recovery

Typed outcomes shall distinguish at least invalid input, missing runtime, version/provenance mismatch,
target unresolved, ambiguous run, evaluator failure and host binding unavailable. Each recoverable
outcome carries exactly one action. Automatic target substitution, installation, registry contact,
unbounded retry and weaker executable fallback are prohibited.

### PRD-13 Cross-surface Delivery

Copilot, Codex, Claude Code and OpenCode shall receive the same registry, dispatcher behavior,
machine schema and canonical presentation through their existing distribution profiles. Adapters may
differ only in executable discovery, invocation transport, progress chrome and documented capability.

### PRD-14 Capability Honesty

Each surface observation shall report `executable`, `instruction_only` or `unavailable` based on
direct evidence. Plugin installation, package presence or source tests alone do not prove loaded-host
execution. Unsupported host-native command claims are prohibited.

### PRD-15 Packaging And Version Coherence

The dispatcher, registry, runtime manifest, generated profiles, payload inventories and public
package shall remain version and digest coherent. A partial projection or stale installed runtime
fails validation before dispatch.

### PRD-16 Compatibility And Rollback

Existing validator commands and their JSON remain compatible unless SD defines and tests a versioned
additive extension. Rollback shall remove the dispatcher binding and restore prior skill entry
instructions as one coherent release operation without changing repository control state.

### PRD-17 Privacy And Security

Dispatch is local by default. Timing diagnostics shall contain phases and durations, not prompts,
hidden reasoning, file contents, secrets or unrelated paths. Existing host tool permissions,
repository mutation boundaries and the OpenCode subagent enforcement limitation remain visible.

### PRD-18 Observable Skill Coverage

The shared registry shall cover all shipped canonical skills at release. `gate-check` and `qa-gate`
are mandatory end-to-end reference cases because they exercise deterministic output and retained
skill judgement respectively. No unregistered shipped skill may silently use the old discovery path.

## UX Acceptance Matrix

| Situation | Required visible result | Authority effect |
|---|---|---|
| Repo-less direct invocation | Localized Task Target orientation and one target request | none |
| Resolved repository and deterministic status path | Canonical status or decision presentation | existing evaluator only |
| Resolved repository and review skill | Bounded continuation to named skill | none |
| Missing or stale runtime | Typed blocked recovery with one repair action | none |
| Host cannot prove first executable action | Explicit `instruction_only` disclosure | none |
| Target/run/gate changes | Prior packet rejected as stale; fresh dispatch required | none |

## Acceptance Evidence

### Deterministic Tests

- Registry completeness and uniqueness for all shipped canonical skills.
- Input/output schema, terminality and stale-packet validation.
- Target cases: explicit, continued, none, multiple, mismatch and unavailable.
- German, English, unsupported-locale fallback and invalid-registry failure.
- Runtime missing, version mismatch, provenance mismatch and malformed result.
- Gate-check deterministic end-to-end projection and QA bounded-judgement continuation.
- No repository access after a terminal unresolved result.
- Dispatcher duration at or below 2 seconds under supported local OS fixtures.

### Distribution Tests

- Canonical-to-generated parity for Codex, Claude, Copilot and OpenCode.
- Runtime manifest, digest, package contents, Copilot payload baseline and installer tests.
- Windows, macOS and Linux path and process invocation coverage.
- Rollback and older compatible invocation behavior.

### Loaded-host Evidence

For each surface record exact plugin/runtime version, host, model, operating system, invocation,
tool-start latency, dispatcher duration, first-visible-output latency, terminal result, locale and
capability classification. Missing evidence stays missing and cannot be inferred from another host.

## Success Criteria

- The three-minute Copilot discovery sequence is replaced by one dispatcher-first invocation in the
  same repo-less scenario.
- Strong and weaker models receive the same normalized starting packet and do not need to discover
  runtime paths or reconstruct target cards.
- Every shipped canonical skill has one registered common preflight path.
- Existing target, gate, QA, approval and presentation authority tests remain green.
- Every distribution profile is coherent, installable and truthfully classified.

## Non-goals

- Fully automating Brownfield, review, QA or other judgement-bearing skills.
- Building a general workflow engine or persistent orchestration service.
- Adding remote telemetry, registry access or automatic installation to ordinary dispatch.
- Standardizing host-native UI, tool permissions or reasoning displays.
- Reopening the prior Target Preflight or Windows Symlink Fixture runs.
- Claiming executable behavior on a host without loaded-host evidence.

## Risks And Constraints

- Copilot may not expose a host-native direct executable command for skill invocation; its adapter
  must prove the first-tool-call behavior or remain instruction-only.
- A broad dispatcher can become a second policy engine unless its output stays limited to existing
  owner calls and typed orchestration.
- Cross-platform quoting, plugin-root discovery and process startup must be tested on native Windows.
- Payload growth and generated-profile drift remain release blockers.
- Host/model latency outside dispatcher execution must remain separately visible.

## Release Boundary

Release readiness requires approved design and plan, implementation and tests, mandatory reviews,
QA pass and approval, UAT across the supported surfaces with honest unavailable states, Context Graph
reconciliation and explicit delivery closeout. No approval or release action is implied by this PRD.
