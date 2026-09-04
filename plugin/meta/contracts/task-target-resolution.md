# AGDF Runtime Contract — Task Target Resolution

## Purpose And Ordering

Resolve the user's primary work target before repository activation, Scope Classification, mode
selection or gate evaluation. Repository governance is downstream of the task target; the current
working directory, an inspected repository or a source mentioned as evidence must never become the
work target by accident.

The canonical order is:

1. resolve or revalidate the task target;
2. derive the governance target from that resolved target;
3. activate repository-local AGDF control only for that governance target;
4. then apply read-only orientation, Scope Classification, mode selection and gate evaluation.

Task-target resolution is an identity and routing decision only. It must not infer approval, gate
eligibility, completed work, QA readiness or evidence sufficiency. Those decisions remain with the
applicable downstream validator and gate owner.

If task-target resolution is unresolved, steps 2–4 and every mutation are forbidden. The unresolved
result is terminal for the current response and overrides continuation, missing-control, fresh-UR
and approval branches. Prior chat artefacts, runs and approvals remain candidate context only; they
must not produce a conditional gate result until one target is resolved.

## Resolution Result

Use one normalized result:

- `resolution_state`: `resolved | unresolved`
- `reason_code`: `explicit_target | continued_target | multiple_plausible_targets |
  target_content_mismatch | target_unavailable | no_reliable_target`
- `primary_target`: exactly one requested work object when resolved, otherwise empty
- `evidence_sources`: zero or more mentioned or inspected sources that do not gain mutation authority
- `working_directory`: execution context only, never target authority by itself
- `governance_target`: the repository whose control state applies to the primary target, otherwise empty
- `target_changed`: whether an explicit new target replaced the previously confirmed target
- `next_action`: required clarification, supply or retry action when unresolved

A resolved result requires a non-empty `primary_target` and a reason code of `explicit_target` or
`continued_target`. An unresolved result requires an empty `primary_target`, an empty
`governance_target`, one of the four unresolved reason codes and a non-empty `next_action`.
Contradictory or incomplete results fail closed.

## Automatic Recovery Before Clarification

Prefer bounded, evidence-backed target recovery over asking the user to restate context that AGDF or
the active host can already establish reliably.

Before returning `no_reliable_target`, inspect only the target evidence that is already available from
the current interaction or from bounded candidate contexts. Applicable sources include:

- an explicit current-turn locator such as a repository, file, artefact, AGDF run ID, pull request,
  branch, task identifier or prior-session reference;
- a previously confirmed target from the current conversation when the current request clearly
  continues the same action, object and scope;
- host-selected workspace or repository roots, as evidence only;
- durable AGDF run metadata, Source And Scope State or Context Graph entries inside a candidate
  repository already identified by the current interaction or host context.

A locator is not itself mutation authority. It may only be used to discover candidate work targets.
Reading candidate repository metadata for this purpose is evidence inspection, not repository
activation.

Do not perform an unbounded filesystem scan, search unrelated repositories or select a target merely
because it is the most recent run, branch or repository. Recency is supporting evidence only.

When recovery establishes exactly one reliable target without conflicting evidence, bind it without
asking the user to reconfirm it:

- a current-turn locator that deterministically identifies one work target resolves as
  `explicit_target`;
- a previously confirmed target that remains unambiguous resolves as `continued_target`;
- the current repository resolves only under the explicit/deictic rule in Target Authority
  Precedence below.

When more than one plausible target remains, return `multiple_plausible_targets` and request only the
smallest information needed to distinguish them. When no reliable candidate can be established,
return `no_reliable_target`.

The purpose of automatic recovery is to remove avoidable clarification, not to weaken the fail-closed
boundary.

## Target Authority Precedence

Resolve in this order:

1. an explicit file, artefact, repository or current-turn locator that deterministically identifies
   exactly one work target;
2. a previously confirmed target only when the current turn unambiguously continues the same action,
   object and scope;
3. the current repository or working directory only when the request explicitly or deictically asks
   for work on "this project", "this repository" or an equivalent current-scope reference;
4. otherwise `no_reliable_target`.

An explicit current-turn target always replaces an inherited target. Make the change visible when
the previous target could otherwise remain plausible.

Do not fall back to the working directory, a neighboring file or an evidence source when the
explicit target is unavailable or its content does not support the requested change.

## Evidence And Mutation Boundary

Reading, inspecting, mentioning or relying on a repository or artefact makes it an evidence source,
not a mutation target. Evidence access never grants mutation authority and never activates that
repository's AGDF control state.

Derive `governance_target` only from:

- the repository containing the resolved `primary_target`; or
- an explicit user statement that a named repository governs the target.

An external standalone artefact may have no repository governance target. In that case the router
continues with the applicable non-repository path; it must not borrow governance from the current
working directory.

## Continuation And Target Change

A confirmed target may continue across related turns only when the current request remains
unambiguous. Revalidate it before every mutation or gate decision. New explicit target evidence wins.
New ambiguity ends the inherited binding and produces `multiple_plausible_targets`.

When a durable AGDF run exists, its Source And Scope State may record the confirmed target as
evidence. It does not override a newer explicit user target. Outside a run, continuation remains
transient conversation state; do not create a global target store or a second run-state owner.

## Run Selection And Gate Eligibility Are Downstream

Resolving a task target does not select an eligible QA, UAT or other gate run by conversational
inference.

After the task target and governance target are resolved, the applicable AGDF control path must:

1. select or reconcile exactly one run from the resolved governance target;
2. validate that run against the requested skill or gate;
3. determine predecessor state, artefact state, tests, reviews, evidence, blockers and required
   approvals from durable AGDF state and deterministic validators.

The user may provide a run ID or another locator when run reconciliation is genuinely ambiguous, but
the user must not be asked to attest that CD+Tests completed, tests passed, review evidence exists,
QA is ready or a gate may be entered when AGDF can validate those facts itself.

A work locator helps find a target or run. A resolved target establishes identity. A validator
establishes admissibility. A gate establishes authority. Do not collapse these responsibilities into
one conversational decision.

## Fail-Closed States

- `multiple_plausible_targets`: more than one work target remains plausible; list the candidates and
  request the smallest clarification.
- `target_content_mismatch`: the requested content change is not supported by the explicit target's
  observable content; name the mismatch and ask whether the target or requested change should change.
- `target_unavailable`: the named file, attachment or artefact cannot be inspected; request supply or
  access and offer a visible retry.
- `no_reliable_target`: bounded automatic recovery found neither an explicit target nor an
  unambiguous continuation; request the minimum locator needed to establish one target.

These states forbid repository activation, Scope Classification, gate evaluation and mutation.
Never silently expand scope to make the request fit a different project.

## Presentation Boundary

`contracts/interaction.md` owns the visible, non-authorizing Task Target Orientation.
`create-agdf/lib/interaction-presentation.js` owns its rendering. The renderer projects a normalized
result; it must not resolve targets, derive governance or become a state store.

Automatic target recovery is internal preflight work. Do not narrate routine contract lookup, file
search, shell commands, candidate inspection or reasoning steps to the user. If recovery resolves the
target, continue without asking for reconfirmation. If recovery remains unresolved, emit the
canonical Task Target Orientation and ask only for its concrete recovery action.

Show orientation when target/context separation is material, when the target changes, or when the
result is unresolved. Avoid redundant presentation for an obvious unchanged target. Presentation
never grants mutation or gate authority.
