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

Repository permissions alone do not transfer any of these documented roles. `.github/CODEOWNERS`
supports review routing, but does not indicate enabled branch protection or automatic merge
approval.

## Decisions

Decisions consider project value, risk, existing architecture, compatibility, evidence and available
maintainer capacity. A Discussion, Issue or pull request does not imply acceptance or placement on a
roadmap.

Unless security, privacy or confidential information prevents it, material reasons should remain
traceable in the related Issue, Discussion or pull request.

## Conflicts of interest

The maintainer discloses recognizable personal or financial conflicts of interest where doing so
does not violate other obligations. An independent subject-matter opinion may be requested for a
conflict. This does not create a permanent additional maintainer role.

## Authority changes and succession

A change of maintainer or responsibility requires a traceable, reviewed change to this document.
Affected rules in `.github/CODEOWNERS`, `SECURITY.md`, `CODE_OF_CONDUCT.md`, release documentation
and the Source of Truth Registry must be aligned in the same change.

During extended unavailability, the last documented state remains authoritative. No new authority
arises automatically. Succession must be documented publicly and unambiguously before it becomes
effective.

## Language

Governance is primarily conducted in German. Contributions and reasoned requests in English are
accepted. Exact technical identifiers, commands and AGDF approval values are not translated.
