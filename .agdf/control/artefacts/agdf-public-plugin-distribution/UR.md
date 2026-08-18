# User Requirement: Public AGDF Plugin Distribution

Status: draft  
Date: 2026-08-17  
Owner: Arndt Gold  
Run: `agdf-public-plugin-distribution`

## 1. User Need

AGDF should become a publicly discoverable and installable plugin through OpenAI's public plugin
distribution path for ChatGPT and Codex. The public offering must reduce installation friction while
preserving AGDF's existing governance authority, proportional delivery paths, exact approvals and
honest host-evidence boundaries.

## 2. Required Outcome

Prepare one submission-ready public AGDF plugin distribution derived from the existing canonical
AGDF sources. The outcome must define what AGDF reliably supports on ChatGPT and Codex, provide the
required public listing and publisher material, validate the final shipped package rather than only
the source tree, and produce reproducible submission and host-UAT evidence.

## 3. Scope

- define the public product and capability contract for the shared ChatGPT and Codex listing;
- preserve AGDF as an independent, cross-surface framework without implying OpenAI endorsement;
- determine the smallest clean public package shape from the existing canonical `plugin/` owners,
  including the role of skills, hooks, runtime validation and surface-specific capabilities;
- complete submission-facing manifest, brand, website, support, privacy, terms, starter-prompt and
  test-case material required for public review;
- validate every declared packaged entrypoint and referenced file against the final shipped bundle;
- verify supported behavior through current live-host evidence for Codex and the applicable ChatGPT
  plugin surface, keeping repository evidence distinct from host UAT;
- prepare an auditable submission-readiness and release decision.

## 4. Acceptance Signals

1. One canonical public distribution is generated from existing AGDF sources; no parallel policy or
   independently maintained OpenAI-specific AGDF fork is introduced.
2. Public copy states AGDF's purpose, independent publisher identity, human authority boundary,
   non-certification boundary and surface-specific limitations accurately.
3. Required public listing, legal, support, visual, prompt and reviewer-test materials are complete,
   internally consistent and linked from the plugin metadata where applicable.
4. A clean packaged-artifact check proves that all declared files, entrypoints, scripts, skills,
   hooks and assets needed at runtime are actually shipped and loadable.
5. Positive, negative and failure-path tests cover the supported public use cases and intentional
   exclusions.
6. Current live-host evidence distinguishes Codex behavior, ChatGPT behavior, unavailable or
   surface-specific capabilities, and unverified claims.
7. Submission, publication, release and rollout remain separately authorized external actions and
   are not implied by repository readiness.

## 5. Non-Goals

- claiming that AGDF is an official, endorsed or certified OpenAI product;
- claiming that AGDF is a security sandbox, compliance certification or replacement for human
  product and engineering responsibility;
- creating separate normative gate rules for ChatGPT or Codex;
- changing Claude Code, OpenCode or GitHub Copilot product semantics except where shared canonical
  source alignment is explicitly approved later;
- submitting, publishing, releasing, deploying, committing, pushing or changing the installed AGDF
  cache under this UR approval alone;
- guaranteeing OpenAI review approval or publication timing.

## 6. Open Questions For Brownfield Review And Later Product Design

- Which capabilities are common to ChatGPT and Codex, and which require an explicit surface-specific
  boundary?
- Should the first public package include Codex lifecycle hooks, or should the public core remain
  useful when those hooks are unavailable or untrusted?
- Which existing website paths should own privacy, terms, support and submission documentation?
- Which current package-integrity and live-host findings remain reproducible against the final
  candidate version?
- What publisher and release authority is required before portal submission and later publication?

## 7. Gate Boundary

This UR defines intent and acceptance boundaries only. After exact `Approval: UR`, the next internal
step is Brownfield Review and Mode/Slice Decision. PRD, Solution Design, Task Plan, implementation,
submission and publication remain forbidden until their applicable gates and explicit external
authorizations are satisfied.
