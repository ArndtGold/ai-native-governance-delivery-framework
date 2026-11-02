# UR: AGDF Plugin Family Language

Status: approved
Gate: UR
Gate approval: approved with exact `Approval: UR` on 2026-08-23
Date: 2026-08-23
Owner: Arndt Gold

## 1. Problem

Codex currently presents the AGDF local marketplace with the technical lowercase identifier `agdf`,
while the related AGDF Project Inventory marketplace uses a branded product name. The two plugins
are recognizably related, but their visible naming does not yet follow one explicit family language.
Technical identifiers, marketplace labels, product names and product descriptions can therefore be
mistaken for equivalent brand surfaces.

## 2. Goal

Establish one clear naming and marketing language for the AGDF plugin family, beginning with the
visible lowercase `agdf` marketplace label:

- `AGDF` is the visible family brand.
- Lowercase `agdf` is reserved for technical identifiers, commands and package references.
- Every family product has a distinct role beneath the shared AGDF brand.
- The initial shared family statement is: "AGDF is a family of tools for governed agentic work."

## 3. Scope

This first slice includes:

- define the canonical visible-versus-technical naming rule in the AGDF repository;
- identify the canonical owner of the visible local Marketplace label;
- change the visible AGDF Marketplace family label from `agdf` to `AGDF` where the Codex host
  supports a separate display name;
- align the AGDF core role description with the shared family statement without changing its
  governance meaning;
- propagate the approved values through the existing generated Marketplace and plugin metadata
  owners;
- verify repository output, the installed Marketplace package and direct Codex UI behavior as
  separate evidence classes.

## 4. Non-Goals

- Renaming the technical plugin ID `agdf`, Marketplace ID `agdf`, package names, commands,
  repositories or installation references.
- Changing the AGDF Project Inventory repository or its installed package in this first slice.
- Merging the two plugins or their Marketplaces.
- Changing AGDF gates, governance authority, capabilities or runtime behavior.
- Performing publication, release, deployment, commit, push or pull-request actions.
- Claiming that repository or installed-package validation proves Codex UI behavior.

## 5. Acceptance Signals

- All user-facing AGDF family labels owned by this slice use uppercase `AGDF`.
- Lowercase `agdf` remains unchanged wherever it is a technical identifier.
- The family statement and AGDF core role description are concise, compatible and do not overstate
  AGDF authority.
- Generated local Marketplace metadata remains derived from one canonical source.
- Repository validation and installed-package inspection pass independently.
- A fresh direct Codex observation confirms whether the host renders `AGDF`; if the host renders the
  technical ID instead, that limitation is recorded without renaming the ID or claiming success.

## 6. Existing Source Of Truth

- `plugin/meta/agdf-plugin.definition.json` owns canonical AGDF plugin metadata.
- `create-agdf/lib/installers/local-marketplace.js` owns the local Marketplace projection.
- `create-agdf/scripts/sync-package-assets.js` owns generated repository Marketplace metadata.
- `.agdf/control/runs/agdf-public-plugin-distribution/RUN_STATE.md` remains the authority for its
  existing public-distribution scope and must not be silently expanded by this follow-up run.
- The registered and installed local Marketplaces are runtime evidence only, not source files.

## 7. Risks And Unknowns

- Codex may render the technical Marketplace ID even when `interface.displayName` is present.
- The currently visible lowercase label may come from stale host registration or session cache.
- A shared family statement could blur the difference between AGDF governance authority and a
  companion product unless each product role remains explicit.
- Brownfield Review must confirm the single metadata owner, all generated consumers, cachebuster and
  reinstall path, and the smallest safe delivery mode before implementation.

## 8. Next Step

UR approved. Perform Brownfield Review and proportional routing before any later artefact or
implementation work.
