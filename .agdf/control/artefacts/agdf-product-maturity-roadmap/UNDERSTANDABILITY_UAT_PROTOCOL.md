# Understandability UAT Protocol: AGDF Product Maturity Roadmap

Status: `ready_for_execution`
Date: `2026-08-19`
Task: `RMP-09 / RMP-10`
Requirement: `PMR-6`
Decision: `evidence_obligation_only`

## Purpose

Collect the direct human evidence required by PMR-6 without creating a speculative Unified Journey
product owner. This protocol evaluates whether new or independent participants can correctly
identify the target, current status, next action and authority effect from current AGDF interaction
surfaces.

## Authority Boundary

- This protocol does not approve PMR-6, QA, UAT, RMP-10 or RMP-12.
- Agents, automated fixtures and model-generated answers cannot count as participants.
- Repository tests may verify stimulus integrity and scoring completeness, but cannot replace direct
  participant observations.
- A failed or ambiguous observation is evidence. It must not be silently repaired, reworded or
  excluded after exposure.
- A product-change finding routes to a separately gated Child UR owned by the earliest affected
  canonical Target, Interaction, Mode, Gate, Status or OpenCode owner.

## Minimal Execution Design

- participants: at least four people independent of the implementation and not briefed on expected
  AGDF paths; each participant evaluates two scenarios in randomized order;
- observations: exactly eight primary blinded observations, one per scenario;
- stimulus source: current code-owned rendered output or a frozen repository fixture generated from
  the same owner; no handcrafted paraphrase;
- blinding: do not reveal the expected mode, target, gate, next action, authority effect or scoring
  key before the participant submits all answers;
- session isolation: participants do not see previous answers or aggregate outcomes;
- recording: use pseudonymous participant IDs and avoid personal or repository-sensitive data;
- observer role: record answers verbatim before semantic scoring;
- retries: a technical display failure may be retried and must be recorded; a comprehension failure
  is not retried within the primary observation.

## Scenario Set

| scenario_id | required coverage | stimulus state | participant task | critical misunderstanding |
|---|---|---|---|---|
| PMR6-S01 | Quick | explicit small non-normative target with an ungated Scope Classification result | identify the target, why the path is lightweight, what may happen next and whether approval is required | treating `cwd` or an evidence repository as the mutation target; inventing an approval |
| PMR6-S02 | Compact | bounded existing-owner change with durable evidence and escalation conditions | identify the target, current delivery path, allowed action and escalation boundary | treating Compact Delivery as permission to bypass fail-closed escalation |
| PMR6-S03 | Structured | approved UR with Brownfield Review or PRD as the next step | identify the target, current gate, exact next action and what the existing approval does not authorize | interpreting UR approval as implementation authority |
| PMR6-S04 | Structured decision | QA-approved run awaiting UAT | identify completed quality evidence, missing decision, next action and prohibited delivery actions | interpreting QA as UAT, release or commit approval |
| PMR6-S05 | Blocked recovery | multiple plausible targets or target-content mismatch | identify why work is blocked, which targets are plausible, the one recovery action and mutation authority | choosing a target from `cwd`, proximity or evidence and continuing without clarification |
| PMR6-S06 | Host limit | repository behavior passes while authenticated host rendering or enforcement remains unobserved | distinguish repository proof from host proof, identify the limit, next evidence action and authority effect | claiming a live-host or enforcement guarantee from repository fixtures |
| PMR6-S07 | Target change | a confirmed prior target followed by an explicit new target | identify the new primary target, the ended binding, governance target and permitted mutation scope | retaining both targets or mutating the prior target |
| PMR6-S08 | Installation and activation | global OpenCode installation with active, inactive or invalid repository control state | distinguish installation from activation and delivery, identify status, next action and whether a local runtime copy is required | treating installation as repository activation or inventing a generated local runtime requirement |

## Participant Questions

Ask the same four questions after every stimulus, without hints:

1. What is the primary target or object of work?
2. What is the current status or delivery state?
3. What is the single next action?
4. What does this state authorize, and what does it not authorize?

## Scoring Key

Score each answer only after it is recorded verbatim.

| field | result | rule |
|---|---|---|
| target | `correct | incorrect | unclear` | correct only when the participant selects the actual primary target and does not promote `cwd` or an evidence source |
| status | `correct | incorrect | unclear` | correct only when the participant identifies the operative mode/gate/block/activation state without upgrading evidence |
| next_action | `correct | incorrect | unclear` | correct only when exactly the permitted recovery, gate decision or delivery step is selected |
| authority_effect | `correct | incorrect | unclear` | correct only when approval, mutation, host-proof and release boundaries are preserved |
| critical_misunderstanding | `yes | no` | yes for any mutation-target, approval-authority or host-guarantee error named in the scenario table |

## Acceptance Rule

PMR-6 may become `satisfied_with_limits` only when:

- all eight primary observations are valid and use the frozen current stimuli;
- every scenario has `correct` for target, status, next action and authority effect;
- critical misunderstandings equal zero;
- participant independence and blinding are evidenced;
- host and evidence limitations remain visible rather than being promoted; and
- no observation is removed or retried because of a comprehension failure.

Any `incorrect`, `unclear`, missing or invalid row keeps PMR-6 open. A critical misunderstanding
routes to product-gap assessment before RMP-12. The protocol must not lower the approved threshold.

## Observation Record

Append exactly one row per primary observation after execution.

| scenario_id | participant_id | stimulus_ref_and_digest | host_or_fixture | verbatim_answers_ref | target | status | next_action | authority_effect | critical_misunderstanding | observer | observed_at |
|---|---|---|---|---|---|---|---|---|---|---|---|

## Preflight Checklist

- freeze eight current code-owned stimuli and record digests;
- verify each stimulus exposes no expected answer or scoring label;
- recruit at least four independent participants;
- randomize two scenarios per participant;
- prepare pseudonymous recording and consent appropriate to the session;
- designate an observer who did not implement the evaluated feature;
- stop before scoring if any stimulus is missing, stale, malformed or reveals the answer.

## Current Result

- protocol_readiness: `ready_for_execution`
- stimulus_freeze: `completed_not_exposed`
- stimulus_freeze_id: `pmr6-understandability-v1-20260827`
- stimulus_manifest: `understandability-uat/STIMULUS_MANIFEST.json`
- participant_guide: `understandability-uat/PARTICIPANT_GUIDE.md`
- observer_runbook: `understandability-uat/OBSERVER_RUNBOOK.md`
- integrity_check: `node .agdf/control/artefacts/agdf-product-maturity-roadmap/understandability-uat/verify-stimuli.mjs`
- observation_forms: eight empty records under `understandability-uat/records/`
- randomization: fixed blinded allocation for `P01` through `P04`, two scenarios per participant;
  participant identities remain unassigned
- execution_availability: `blocked_external_participants`
- observations_completed: `0/8`
- participants_confirmed: `0/4 minimum`
- availability_evidence: the user confirmed on `2026-08-19` that no independent participants are
  currently available
- PMR-6 decision: `open_critical_evidence_gap`
- RMP-12 readiness: `not_ready`
- required_next_step: wait until at least four independent participants are available, then execute
  the eight blinded observations without changing the stimuli after exposure.
- prohibited_substitution: agents, automated fixtures, implementers or simulated participants must
  not be counted to clear the evidence gap.
