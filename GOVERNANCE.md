# Project Governance

## Current maintainer model

AGDF currently has a sole maintainer: **Arndt Gold** (`@ArndtGold`).

The maintainer is responsible for:

- triage and routing of Issues and Discussions;
- review and merge decisions for pull requests;
- release and publication decisions;
- maintenance of public project and runtime statements;
- enforcement of the [Code of Conduct](CODE_OF_CONDUCT.md);
- coordination of confidential security reports under [SECURITY.md](SECURITY.md).

Granting repository permissions does not transfer any of these documented roles.
`.github/CODEOWNERS` supports review routing, but does not prove that branch protection is enabled or
that changes can be merged automatically.

## Decisions

Decisions consider project value, risk, existing architecture, compatibility, evidence and available
maintainer capacity. A Discussion, Issue or pull request does not imply acceptance or placement on a
roadmap.

Unless security, privacy or confidentiality prevents it, important reasons for a decision should be
recorded in the related issue, Discussion or pull request.

## Conflicts of interest

The maintainer discloses known or potential personal or financial conflicts of interest unless doing
so would violate another obligation. The maintainer may seek independent expert advice when a
conflict arises. This does not create a permanent additional maintainer role.

## Authority changes and succession

A change of maintainer or responsibility requires a traceable, reviewed change to this document.
Affected rules in `.github/CODEOWNERS`, `SECURITY.md`, `CODE_OF_CONDUCT.md`, release documentation
and the Source of Truth Registry must be aligned in the same change.

During extended unavailability, the last documented state remains authoritative. No one gains
authority automatically. A successor must be documented publicly and unambiguously before the
change takes effect.

## Language

Governance is primarily conducted in German. Contributions and reasoned requests in English are
accepted. Exact technical identifiers, commands and AGDF approval values are not translated.
