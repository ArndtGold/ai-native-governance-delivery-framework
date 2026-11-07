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

For design-relevant work, uses the target project's declared brand/design source with its identity,
owner and scope recorded in existing evidence. Derives proposed observable criteria from source
passages and perceptual priorities; file presence or generic quality adjectives are insufficient.
Material gaps use the existing questions/readiness rules. This adds no gate, output field, universal
brand-file requirement or technical design authority, and does not change UX-impact routing.

## SEE ALSO

See SKILL.md for triggers, authority, brand-source applicability and provenance, required fields and
decision rules.
