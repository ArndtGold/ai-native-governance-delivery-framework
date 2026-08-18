# User Requirement: Transfer Useful Pages Guidance Into The Handbook

Status: approved
Revision: 1
Run: `agdf-handbook-first-reader-content-transfer`
Date: 2026-08-18
Approved: 2026-08-18 via exact `Approval: UR`

## Problem

The landing-page simplification correctly removed detailed operational guidance from the public
homepage. Most removed material is already covered by the handbook or belongs to other canonical
owners, but three useful first-reader topics are still incomplete in the handbook: defining UX
intent before implementation, recognizing recurring delivery failure patterns, and distinguishing
repository evidence from host observation, user acceptance and external publication.

Copying the old Pages catalogues into the handbook would recreate duplication and could reintroduce
obsolete or non-canonical terminology. The useful content therefore needs a small semantic transfer,
not a wholesale restoration.

## User Need

As a first-time AGDF user, I want the practical handbook to explain these three topics in plain
language and in the place where I need them, so that I can understand why AGDF stops, what evidence
proves and what must be clarified before visible behavior is implemented.

## Desired Outcome

Revise the German-primary handbook first and then update the corresponding reviewed English
translation so that:

1. `03-typische-arbeitsablaeufe.md` explains when user-visible work needs UX intent to be clarified
   before PRD readiness, including working modes, effective and visible state, blockers, recovery
   and transitions;
2. the same workflow chapter explains a concise set of recurring failure patterns: silent scope
   drift, a parallel Greenfield path inside an existing system, a green build with unfinished plan
   obligations, permanent workarounds and premature handoff;
3. `05-abschluss-und-auslieferung.md` distinguishes repository/source and build evidence, observed
   installed-host behavior, human UAT and external deployment or publication evidence;
4. the English chapters remain faithful reviewed translations of the canonical German chapters,
   including correct source-revision metadata;
5. all explanations remain practical and non-normative, linking to canonical Runtime Contract or
   installation owners where deeper rules are required.

## In Scope

- `docs/handbook/de/03-typische-arbeitsablaeufe.md`;
- `docs/handbook/de/05-abschluss-und-auslieferung.md`;
- the matching English chapters and their translation metadata;
- handbook navigation only if a changed heading makes it necessary;
- focused documentation, translation-drift, link and Runtime Integrity checks.

## Non-Goals

- restoring the removed Pages catalogues, matrices, skill lists or marketing sections;
- changing the current landing-page candidate or its passed QA report;
- introducing a new AGDF mode, gate, evidence authority or product claim;
- changing the Runtime Contract, CLI, plugin behavior, installation instructions or host support;
- adding AI Act, cost, invoice, compatibility or public-listing marketing content to the handbook;
- deployment, publication, release or VCS delivery.

## Acceptance Signals

- A first-time reader can explain why UX intent is clarified before implementation of meaningful
  visible behavior.
- The five failure patterns are recognizable without turning the handbook into a warning catalogue.
- The evidence explanation prevents repository tests, installed-host observations, UAT and public
  availability from being treated as interchangeable proof.
- German remains the semantic source; each changed English chapter declares the exact current
  German SHA-256 revision and `translation_status: reviewed` only after semantic review.
- Existing mode, gate, CLI and responsibility explanations remain consistent and no removed Pages
  copy becomes a second normative owner.
- Relevant handbook/community-health, public-document and Runtime Integrity checks pass.

## Approval Request

Approve this bounded user requirement with the exact value:

`Approval: UR`
