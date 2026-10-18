## NAME

`ux-intent-definition` - define testable UX intent before PRD approval

## SYNOPSIS

`/ux-intent-definition` [`--help`|`-h`]

## DESCRIPTION

Produces structured `ready | blocked | not_applicable` PRD input for user intent, success, working
modes, effective state, visible ownership, activation, blockers, recovery and transitions. It is an
internal non-authorizing analysis and fails closed when product semantics or evidence are unresolved.
Uses focused UI previews or scenario walkthroughs when they help clarify a user task; preserves
findings as proposed PRD criteria without adding a gate or requiring a visualization tool.

## SEE ALSO

See SKILL.md for triggers, authority, required fields and decision rules.
