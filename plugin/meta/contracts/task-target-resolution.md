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

If task-target resolution is unresolved, steps 2–4 and every mutation are forbidden.

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

## Target Authority Precedence

Resolve in this order:

1. an explicit file, artefact or repository named as the work target in the current user turn;
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

## Fail-Closed States

- `multiple_plausible_targets`: more than one work target remains plausible; list the candidates and
  request the smallest clarification.
- `target_content_mismatch`: the requested content change is not supported by the explicit target's
  observable content; name the mismatch and ask whether the target or requested change should change.
- `target_unavailable`: the named file, attachment or artefact cannot be inspected; request supply or
  access and offer a visible retry.
- `no_reliable_target`: neither an explicit target nor an unambiguous continuation exists; request a
  target.

These states forbid repository activation, Scope Classification, gate evaluation and mutation.
Never silently expand scope to make the request fit a different project.

## Presentation Boundary

`contracts/interaction.md` owns the visible, non-authorizing Task Target Orientation.
`create-agdf/lib/interaction-presentation.js` owns its rendering. The renderer projects a normalized
result; it must not resolve targets, derive governance or become a state store.

Show orientation when target/context separation is material, when the target changes, or when the
result is unresolved. Avoid redundant presentation for an obvious unchanged target. Presentation
never grants mutation or gate authority.
