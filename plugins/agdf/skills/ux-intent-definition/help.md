## NAME

`ux-intent-definition` - define testable UX intent before PRD approval

## SYNOPSIS

`/ux-intent-definition` [`--help`|`-h`]

## DESCRIPTION

Produces structured `ready | blocked | not_applicable` PRD input for user intent, success, working
modes, effective state, visible ownership, activation, blockers, recovery and transitions. It is an
internal non-authorizing analysis and fails closed when product semantics or evidence are unresolved.
Preserves explicit preview commitments from UR scope, stores versioned reopenable previews in the
bound run's artefact directory and maps observed findings to proposed PRD criteria. Optional aids
can use a scenario walkthrough; a required interactive preview cannot silently become text.

## SEE ALSO

See SKILL.md for triggers, authority, required fields and decision rules.
