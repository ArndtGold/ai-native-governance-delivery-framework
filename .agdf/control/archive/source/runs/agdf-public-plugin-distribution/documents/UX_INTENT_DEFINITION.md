# UX Intent Definition: Public AGDF Plugin Distribution

Status: ready  
Date: 2026-08-17  
Run: `agdf-public-plugin-distribution`

## Decision

- decision: ready
- blocking_reason: none
- primary_user_intent: A prospective or installed user can understand whether AGDF fits their work,
  install the public plugin from a trusted directory, enter the lightest supported AGDF working mode
  and always see whether governance is effective, advisory, blocked or unavailable on the current
  surface.
- success_signal: The user reaches a truthful supported state with one clear next action, while the
  publisher can distinguish repository readiness, submitted review state, publication and effective
  host behavior without treating one as proof of another.
- primary_decision_or_action: The adopter decides whether to install or activate AGDF for the current
  context; the publisher separately decides whether to submit or publish a validated candidate.

## Working Modes

| Mode | User context | Intended outcome |
|---|---|---|
| `directory_discovery` | User encounters AGDF in the public plugin directory | Understand purpose, fit, limits, publisher and supported workflows before installation. |
| `installed_fit_assessment` | Plugin is installed but no governed repository state is established | Receive a read-only proportional fit assessment and a clear choice to stay advisory, create durable control explicitly or not use AGDF. |
| `governed_repository_delivery` | Codex has the installed plugin plus a resolvable repository and valid AGDF control state | Use the full gate-aware workflow with durable run authority, package-local validation and honest host-capability boundaries. |
| `advisory_non_repository` | ChatGPT or another supported context can use AGDF skills but cannot prove repository-local execution or durable control | Receive planning, review or explanation that is explicitly non-authorizing and does not claim repository enforcement. |
| `degraded_or_unavailable` | Required skill, hook, file, validator, trust, package version or host capability is absent, stale or unverified | See the precise unavailable/degraded boundary and one safe recovery or alternative path; no silent fallback to stronger claims. |
| `publisher_readiness` | Maintainer has a repository candidate but no external submission state | Inspect listing, legal, package, test and host evidence; readiness never equals submission or publication. |
| `submitted_review` | Candidate exists in the OpenAI submission portal | See submitted/revise/approved status as OpenAI-owned effective state and route review findings back to canonical owners. |
| `published_operation` | Approved version is deliberately published | Verify directory discovery and supported host behavior, monitor version/evidence drift and retain explicit rollback or delisting authority. |

## Effective State By Mode

| Mode | Effective state |
|---|---|
| `directory_discovery` | The current OpenAI directory listing and its reviewed version, availability and publisher identity. |
| `installed_fit_assessment` | Installed/enabled plugin state plus observable context capability; no repository governance is inferred. |
| `governed_repository_delivery` | Installed matching plugin, resolved task/governance target, valid selected `.agdf/control/runs/<run_id>/RUN_STATE.md` and current gate evaluation. |
| `advisory_non_repository` | Available AGDF skill instructions and current conversation evidence only; no durable gate authority. |
| `degraded_or_unavailable` | The first failed or unverified required capability, package, trust, target, run or validator boundary. |
| `publisher_readiness` | Repository-owned candidate evidence and its exact version; external portal state is absent. |
| `submitted_review` | OpenAI portal draft/review result for the submitted version. |
| `published_operation` | OpenAI directory publication state plus post-publication observation for the exact version and surface. |

## Visible State Types

- fit: `recommended | optional | disproportionate | unknown`
- plugin availability: `discoverable | installed | enabled | disabled | unavailable`
- governance effectiveness: `governed | advisory | blocked | not_applicable | unverified`
- package confidence: `source_verified | bundle_verified | installed_verified | mismatch | unverified`
- host capability: `supported | surface_specific | degraded | unavailable | unverified`
- publisher lifecycle: `repository_ready | draft | submitted | revise | approved | published | withdrawn`
- evidence provenance: `repository | packaged_artifact | installed_host | portal | post_publication`

## Effective-State Authority By Mode

| Mode | Authority |
|---|---|
| `directory_discovery` | OpenAI directory and verified publisher listing for effective external state; canonical AGDF metadata for desired repository state. |
| `installed_fit_assessment` | Host plugin installation state and current task evidence; AGDF fit classification remains non-authorizing advice. |
| `governed_repository_delivery` | Selected canonical `RUN_STATE.md`, approved artefacts and exact approvals; host controls do not replace AGDF authority. |
| `advisory_non_repository` | Current skill execution and conversation evidence only. |
| `degraded_or_unavailable` | The failing owner: host, package, repository target/run, validator or trust setting. |
| `publisher_readiness` | Versioned repository candidate and deterministic evidence. |
| `submitted_review` | OpenAI submission portal for review state; repository artefacts own remediation intent. |
| `published_operation` | OpenAI directory for publication state; exact installed host observations for effective runtime behavior. |

## Primary State Presentation Owner By Mode

| Mode | Primary presentation owner |
|---|---|
| `directory_discovery` | OpenAI plugin directory listing, supported by AGDF's public website. |
| `installed_fit_assessment` | AGDF plugin conversation output using canonical fit and read-only orientation rules. |
| `governed_repository_delivery` | Canonical AGDF status and gate presentations consumed by the host. |
| `advisory_non_repository` | AGDF conversation output with a visible advisory/non-authorizing boundary. |
| `degraded_or_unavailable` | AGDF error/status presentation when available; otherwise the host's explicit installation or capability state. |
| `publisher_readiness` | Repository submission-readiness report. |
| `submitted_review` | OpenAI portal, with linked repository remediation evidence. |
| `published_operation` | OpenAI directory plus AGDF post-publication conformance report. |

## Activation And Deactivation Paths

- Discovery activates no governance authority; the user deliberately installs/enables the plugin.
- Installation enables plugin discovery but does not create repository control state or approve a gate.
- Full governed repository delivery activates only after task-target resolution, a valid AGDF
  repository configuration/control state and a selectable canonical run where required.
- Advisory mode activates when skills are usable but durable repository authority is absent or not
  applicable; it must remain visibly non-authorizing.
- Codex hooks activate only after host trust and load behavior are effective; plugin usefulness and
  safety boundaries must not depend on silently assuming hook execution.
- Disable/uninstall follows existing host and AGDF lifecycle behavior and retains user-owned durable
  control unless the user separately removes it.
- Submission and publication activate only through separate deliberate publisher actions in the
  OpenAI portal after repository readiness; neither is inferred from a passing build.

## Blockers And Visible Next Actions

| Blocker | Visible next action |
|---|---|
| Plugin is not available for the user's product, account, region or workspace | State availability boundary; point to supported surface or current public documentation without claiming access. |
| Plugin is installed but disabled or stale | Enable or update through the host; verify exact version before governance claims. |
| Hook is untrusted, skipped or surface-inapplicable | State the hook boundary; continue only in a supported skill/advisory path or ask the user to review host trust settings. |
| Repository target is unresolved or unavailable | Request the smallest target clarification or supply/retry action; do not borrow the current directory. |
| Durable AGDF control is absent | Offer fit assessment; create control only on explicit request. |
| Multiple active runs are ambiguous | Request/select an exact run; do not silently choose. |
| Package metadata references missing shipped files | Block candidate readiness; rebuild or repair the canonical package owner and rerun complete inventory validation. |
| ChatGPT capability is not directly evidenced | Mark it unverified or advisory; perform bounded host UAT before publishing a stronger claim. |
| Privacy, terms, support, test cases or publisher identity are incomplete | Keep portal submission blocked and name the missing owner/evidence. |
| Portal review requests revision | Leave publication blocked; route each finding to canonical metadata, skill, package, policy or evidence owner and resubmit deliberately. |
| Published and repository versions drift | Stop current-version claims; reconcile candidate, listing and installed evidence before update or rollback. |

## Recovery Paths

- Every recoverable transient host or portal failure offers a visible retry after state re-read.
- Version or package mismatch recovery uses the existing update/reinstall lifecycle and verifies the
  resulting installed version; it never edits the installed cache directly.
- Missing repository control recovery begins with read-only fit assessment and requires explicit
  user intent before durable initialization.
- Ambiguous-run recovery selects one exact run and revalidates its gate before any write.
- Unsupported ChatGPT behavior recovers to a clearly labeled advisory mode or a documented Codex
  path, never to simulated full parity.
- Submission rejection recovers through canonical-source remediation, new evidence and a new portal
  submission version; portal text is not patched as an independent source of truth.
- Publication regression recovers through the approved update, withdraw or rollback path with
  post-action read-back; repository release intent alone does not prove effective rollback.

## Relevant State Transitions

```text
directory_discovery -> installed_fit_assessment -> governed_repository_delivery
                                              \-> advisory_non_repository
any supported mode -> degraded_or_unavailable -> recovered prior mode | advisory_non_repository
publisher_readiness -> submitted_review -> publisher_readiness (revise)
                                   \-> published_operation (approved + deliberate publish)
published_operation -> publisher_readiness (new version) | withdrawn (deliberate rollback/delisting)
```

## Proposed PRD Acceptance Criteria

1. The public listing communicates AGDF's purpose, fit boundary, independent publisher identity and
   non-certification/non-endorsement limits before installation.
2. The public package is generated from canonical AGDF owners and contains no independent policy or
   descriptive-copy fork.
3. ChatGPT and Codex capabilities are stated separately wherever effective behavior differs,
   including hooks, filesystem/repository access, durable control and machine validation.
4. Installation does not imply repository governance, gate approval, hook trust or live-host proof.
5. Every user-visible mode exposes one of `governed`, `advisory`, `blocked`, `not_applicable` or
   `unverified` and supplies one valid next action.
6. Missing or ambiguous target/run/control state fails closed without modifying a repository.
7. Public package readiness validates every declared runtime path and final shipped file, not only a
   selected required-file list or source layout.
8. Listing, website, manifest, skills, package version and public legal/support links are internally
   consistent for the candidate version.
9. Required privacy, terms, support, publisher identity, starter prompts, positive tests, negative
   tests, availability and release notes are present before portal submission is called ready.
10. Repository readiness, portal draft, submitted review, approved, published and post-publication
    verified remain distinct visible states.
11. Portal submission, publication, regional availability, update, withdrawal and rollback require
    deliberate publisher actions and effective-state read-back.
12. Current host UAT records exact product, version, account/context, capability, result and evidence
    provenance and never substitutes deterministic replay for live behavior.
13. Existing npm/local-marketplace, Claude Code, OpenCode and Copilot distribution semantics remain
    unchanged unless an explicitly approved compatibility requirement says otherwise.
14. Disable/uninstall and failure recovery preserve user-owned durable control by default and expose
    what remains installed, retained, blocked or unverified.

## Open Product Questions

- What exact display name and short/long description best balance discoverability with the risk of
  overclaiming implied by “operating system”?
- Which ChatGPT workflows are supported as first-class outcomes at launch, and which remain advisory
  or explicitly unavailable?
- Does the submitted package include Codex hooks directly, and how is their Codex-only, trust-gated
  behavior disclosed in the shared listing?
- Which public routes own privacy policy, terms of service and support, and what data-handling
  statement is accurate for a skills-first plugin with no AGDF-operated MCP server?
- Which countries/regions and workspace contexts are included in the first publication?
- What version, staged-rollout, withdrawal and rollback policy applies to the public directory
  independently of npm publication?
- Which publisher identity and support capacity are intentionally promised in the listing?

## Affected Outputs

- PRD product and acceptance contract;
- later Solution Design for canonical metadata/submission generation and external-state evidence;
- public plugin manifest and listing material;
- public website, privacy, terms and support routes;
- package-inventory and release validation;
- ChatGPT/Codex capability and UAT evidence;
- submission, review, publication and rollback reports.

## Evidence

- approved `.agdf/control/artefacts/agdf-public-plugin-distribution/UR.md`;
- completed `.agdf/control/artefacts/agdf-public-plugin-distribution/BROWNFIELD_REVIEW.md`;
- `plugin/meta/agdf-plugin.definition.json` and generated Codex manifest;
- current official OpenAI plugin architecture and submission documentation inspected 2026-08-17;
- existing package, release, lifecycle, interaction and live-host conformance owners.

## Missing Evidence

The open product questions require PRD decisions but do not block reliable PRD drafting. Current
ChatGPT behavior, publisher permission, portal state and final package evidence remain later
acceptance evidence and must not be presented as already satisfied.

## Required Next Step

Draft the PRD using the approved UR, Brownfield Review and these proposed observable criteria.
Implementation, submission, publication, release and VCS actions remain forbidden.
