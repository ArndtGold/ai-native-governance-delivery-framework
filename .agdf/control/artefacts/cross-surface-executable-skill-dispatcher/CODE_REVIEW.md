# Code Review: Cross-surface Executable Skill Dispatcher

Revision: 13
Decision: pass
Date: 2026-09-05
Review mode: direct review by the implementing agent, not independent-agent evidence.
Baseline: 4d38db394d05bf2afb5280dc3af92dfee042a2bb.


## Semantic Function-owner Review

- decision: pass for the semantic contract, projections, CLI/binding integration and tests.
- correctness: the function definition exposes exact per-value target-source meanings, paired
  optional target fields, non-authorizing cwd semantics, terminal transfer and bounded continuation.
  Value order derives from the target resolver and run syntax derives from `RUN_ID_PATTERN`.
- regression: schema-2 binding shape and protocol remain unchanged. All canonical argument values,
  context-only invocation, unresolved target behavior and 40 adapter cases pass.
- security: descriptions grant no target, approval or delivery authority. Unknown values remain
  invalid; no raw prompt, shell command or rejected value enters the semantic owner.
- maintainability: command registry, binding and all skills consume one owner. Runtime Integrity
  rejects semantic projection drift in source and installed profiles.
- footprint: no ceiling changed; Copilot measures 91 files and 696479 bytes, seven bytes below the
  existing maximum. Selected-skill and SessionStart budgets pass.
- review limitation: direct implementing-agent review and generated fixtures do not prove model
  adherence in a fresh loaded host.
- required_next_step: QA consumes resolved CSED-DISPATCH-14 and retains CSED-QA-01.

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CSED-DISPATCH-14 | implementation_gap | CD+Tests | resolved | canonical function definition, derived grammar, exact ten-skill projections and integrity tests | Verify a refreshed installed host under CSED-QA-01. |


## Typed Failure Review

- decision: pass for the affected target, dispatcher, presentation, locale, contract and test diff.
- correctness: context-only target-check remains valid. Invalid target sources receive a distinct
  machine reason and canonical allowed values. Dispatcher failures identify the actual failed stage
  and choose the matching requested-locale recovery.
- regression: resolved and unresolved target flows, deterministic control and judgement
  continuation remain unchanged. Focused tests, 40 adapter cases, packaging, Runtime Integrity,
  83/83 reviewed replay compatibility and source smoke pass.
- security: rejected target values and downstream exception messages do not enter visible terminal
  output. The allowed-values row renders only the exact canonical source list. Recovery codes are
  closed code-owned identifiers.
- maintainability: target-source validation and locale rendering each retain one owner. Failure
  classification follows the existing service sequence and does not parse error text.
- review limitation: this is direct review by the implementing agent. Repository and generated
  evidence do not prove a refreshed host loaded the correction.
- required_next_step: QA consumes both resolved implementation findings and retains CSED-QA-01.

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CSED-CODEX-12 | implementation_gap | CD+Tests | resolved | target-check `target_source_invalid`, typed `input_error`, localized exact replay | Verify a refreshed installed host under CSED-QA-01. |
| CSED-DISPATCH-13 | implementation_gap | CD+Tests | resolved | stable stage codes, localized recovery, output-bound localization and raw-error suppression | Verify terminal fidelity in the fresh host matrix. |


## Target-source Recovery Review

- decision: pass for the bounded eight-file correction.
- reviewed scope: task-target resolution values, dispatcher contract/service, CLI registry,
  interaction renderer, locale registry and focused dispatcher/binding tests.
- correctness: all consumers derive the same three values; invalid input remains terminal and
  non-authorizing; German and English recovery use reviewed locale entries.
- regression: `<source>` is rejected by the binding test, all canonical values still execute, and
  the complete serial suite plus source/generated Runtime Integrity pass.
- security: visible recovery does not interpolate the invalid raw value. Field and allowed-value
  tokens are bounded code-owned identifiers, so control characters or shell text cannot enter the
  terminal instruction through `target_source`.
- maintainability: no alias table, host-specific recovery, second grammar or duplicate locale
  renderer was added.
- missing_evidence: corrected installed profile and fresh-host execution remain under CSED-QA-01.
- required_next_step: QA consumes the resolved implementation finding and retains the external
  evidence obligation.

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CSED-CODEX-11 | implementation_gap | CD+Tests | resolved | Canonical target-source owner, explicit binding grammar, localized recovery and exact failing-call regression | Verify the corrected installed host under CSED-QA-01. |


## Codex Follow-up Review

- decision: pass for the bounded follow-up diff against `/private/tmp/agdf-codex-followup-baseline/`.
- evidence: exact registry/recovery-owner equality, strict untranslated-value rejection, native
  environment fixtures, 40 reference cases and real-repository generated-runtime replay.
- correctness: native Codex PLUGIN_ROOT precedes its Claude compatibility alias; explicit surface
  and the specific Copilot marker retain precedence. No new target, run or gate inference exists.
- regression: the prior fixtures forced the host and used English control, masking both defects;
  the new cases exercise those boundaries independently. Locale formatting is preserved.
- security/ownership: no renderer weakening, trust/permission mutation, hook manifest change or
  added runtime search. Existing dirty work remains outside this correction.
- missing_evidence: corrected installed profile and fresh host execution under CSED-QA-01.
- required_next_step: QA consumes resolved code findings and retains the open host evidence.

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CSED-CODEX-09 | implementation_gap | CD+Tests | resolved | Canonical recovery locale entries and German ambiguous-run replay | Retest the corrected installed host. |
| CSED-CODEX-10 | implementation_gap | CD+Tests | resolved | Native-variable precedence and generated SessionStart fixtures | Retest the corrected Codex binding in a fresh task. |

## Reviewed Scope

Actual diff and affected neighbours: binding.js, CLI command registry, local-validator child env,
OpenCode transform, SessionStart generator, all ten skill entry blocks, composed-profile and
footprint consumers, integrity/consent/lifecycle/hardening tests, new transport tests and the
reviewed offline replay fingerprints. Generated profiles and payload budgets were checked.
Target resolver, gate semantics, activation kernel and permissions are unchanged. The current
locale-registry addition is assessed in the follow-up review above.

## Findings

No open code defect remains evident in the reviewed scope. Resolved issues found during this work:

1. The original tuple omitted Electron child env and exact argument names. The shared owner and
   code-derived grammar correct both without weakening --cwd rejection or target pairing.
2. Runtime suitability needed positive evidence, bounded failure and stale-file invalidation.
   The probe is fixed, repository-free and cached only for the exact current launch identity.
3. Inherited Node bootstrap module configuration could run code before the fixed probe. It is
   rejected before spawn and is never printed. The parent env remains untouched.
4. Real Electron emitted OS stderr despite correct output and exit 0. Stderr is bounded but is
   not treated alone as failure. Error, signal, timeout, overflow and malformed stdout still fail.
5. Source-only fixtures had advertised nonexistent installed runtime paths. Explicit source
   fixture paths now preserve the new missing-runtime failure rather than bypass it in production.
6. The missing-entrypoint layout test had expected the obsolete permissive binding. Its new
   assertion requires unavailable, no executable binding and the unchanged passive kernel.
7. Review removed an unused production serializer. Model argument construction is not falsely
   represented as enforcement by a helper used only in tests.
8. The offline replay stamp was stale. A compatibility review found no changed case-specific
   source or judgement text outside dispatch blocks. Only reviewed source fingerprints changed;
   no observation, threshold, case rule or provenance kind was relabelled as live execution.

## Evidence And Limits

CD_TESTS.md records green focused/aggregate tests, all corrected red tests, exact measurements
and the rollback fixture. CSED-RUNTIME-01 proves the real local Electron process chain only.
The 2000 ms E2E timeout was retained after one transient failure under concurrent aggregate load.
Native Windows/Linux execution, real loaded models, visible output fidelity and fresh-session
adherence remain an explicit evidence gap, not an unsubstantiated defect or a fabricated pass.
No other user change was included. The unrelated image was not edited.
The existing wrapper owns dispatch-time version/digest/provenance validation.

- required_next_step: evaluate plan coverage and the retained host evidence gap through qa-gate.
