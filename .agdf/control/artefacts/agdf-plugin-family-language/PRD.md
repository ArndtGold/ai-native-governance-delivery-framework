# PRD: AGDF Local Marketplace Family Label

Status: approved
Gate: PRD
Gate approval: approved with exact `Approval: PRD` on 2026-08-23
Based on: `.agdf/control/artefacts/agdf-plugin-family-language/UR.md`
Date: 2026-08-23
Owner: Arndt Gold

## 1. Product Scope

Deliver the first bounded AGDF plugin-family naming slice for the locally installed Codex
Marketplace:

- present `AGDF` as the visible Marketplace family brand;
- retain lowercase `agdf` as the technical Marketplace ID, plugin ID and installation reference;
- retain `AI Governance & Delivery Framework` as the AGDF core plugin product name;
- reuse the already approved canonical `AGDF` brand value rather than creating a second brand owner;
- keep the current AGDF core role description compatible with the family statement "AGDF is a
  family of tools for governed agentic work" without changing governance meaning;
- validate source projection, installed package and direct Codex rendering as separate evidence.

This PRD does not apply the family language to AGDF Project Inventory. It establishes the first
AGDF-core precedent that a later separately governed Inventory change may reuse.

## 2. UX Intent And Success

- ui_ux_impact: low
- ux_intent_definition: directly defined low-impact semantics in this PRD; Brownfield Review records that no working mode, effective-state, activation, blocker or recovery semantics change.
- primary_user_intent: Recognize the AGDF family brand immediately without seeing a lowercase technical identifier presented as marketing copy.
- success_signal: A freshly loaded Codex Plugins screen shows the Marketplace heading `AGDF`, while technical CLI and package references remain lowercase and functional.
- primary_decision_or_action: Identify the AGDF Marketplace and distinguish its core plugin from future family products; no new action is introduced.

## 3. Working Modes And Effective State

| working_mode | effective_state | visible_state_types | effective_state_authority | primary_state_presentation_owner |
|---|---|---|---|---|
| Repository maintenance | Canonical source declares the approved AGDF family label and the local Marketplace projection consumes it | Source metadata and generated Marketplace manifest | `plugin/meta/agdf-plugin.definition.json` plus the approved PRD | Repository files and deterministic validation output |
| Installed Codex use | The registered installed Marketplace contains the projected display label for its installed version | Marketplace group heading and AGDF core plugin card | Registered installed Marketplace package; technical Marketplace ID remains `agdf` | Codex Plugins screen |
| Host limitation | Codex continues to render the technical ID despite correct source and installed metadata | Lowercase `agdf` heading plus an explicit evidence limitation | Codex host rendering behavior | Codex Plugins screen and UAT evidence |

## 4. Activation, Blockers, Recovery And Transitions

- activation_and_deactivation: Repository changes become installed behavior only after the existing build, cachebuster and separately authorized local plugin refresh path completes. Removing or rolling back that refreshed projection restores the previous installed state.
- blockers_and_visible_next_actions: A failed source test blocks packaging. A mismatched installed manifest blocks host claims. A stale or unchanged Codex heading requires restart/reload verification before concluding that the host ignores the display label.
- recovery_paths: Revert the bounded source mapping or use the existing owned Marketplace transaction rollback. Never edit the installed cache directly. A recoverable host-load uncertainty must offer a visible restart and retry observation.
- relevant_state_transitions: approved source mapping -> validated generated Marketplace; validated package -> separately authorized installed projection; installed projection -> fresh Codex observation; failed validation or host mismatch -> rollback or evidence-limited outcome without renaming technical IDs.

## 5. Acceptance Criteria

### AFL-1 Visible family brand projection

- working_mode: Repository maintenance
- source_state: Canonical `AGDF` brand value exists and the local Marketplace currently consumes the full product display name.
- trigger/action: Build the local Codex Marketplace projection.
- expected_effective_state: `interface.displayName` of the local Marketplace is exactly `AGDF`.
- visible_feedback: Generated Marketplace JSON contains the exact uppercase value.
- blocker/failure_behavior: Missing, lowercase or independently hardcoded values fail deterministic validation.
- recovery/next_action: Correct the canonical mapping and rerun validation.
- observable_success: Exact JSON equality passes.
- required_evidence: Focused local Marketplace regression test.

### AFL-2 Technical identity preservation

- working_mode: Repository maintenance
- source_state: Marketplace ID, plugin ID and install references are `agdf`.
- trigger/action: Apply the visible label change.
- expected_effective_state: Every technical ID remains lowercase and unchanged.
- visible_feedback: CLI inventory and generated manifest `name` fields remain `agdf`.
- blocker/failure_behavior: Any technical rename blocks the slice.
- recovery/next_action: Revert the technical rename and keep only the display mapping.
- observable_success: Existing installation and identity tests pass unchanged.
- required_evidence: Local Marketplace and lifecycle regression tests.

### AFL-3 Core product identity preservation

- working_mode: Installed Codex use
- source_state: The core plugin product name is `AI Governance & Delivery Framework`.
- trigger/action: Render the plugin beneath the AGDF Marketplace family heading.
- expected_effective_state: The plugin card retains its full product name and existing icon.
- visible_feedback: The family heading and product card are distinct visible labels.
- blocker/failure_behavior: Replacing the core product name with a second `AGDF` label blocks acceptance.
- recovery/next_action: Restore the full core product display name.
- observable_success: Source and installed plugin manifests retain the exact full name.
- required_evidence: Manifest inspection and direct Codex observation.

### AFL-4 Public contract isolation

- working_mode: Repository maintenance
- source_state: `agdf-public-plugin-distribution` is a separately approved run at UAT.
- trigger/action: Implement and validate this local Marketplace slice.
- expected_effective_state: The public plugin candidate display name, short copy, prompts and readiness contract remain unchanged.
- visible_feedback: Public plugin contract tests show no semantic delta.
- blocker/failure_behavior: Any public candidate change escalates to revision and its owning scope.
- recovery/next_action: Remove the public-contract change from this slice.
- observable_success: Public candidate assertions pass unchanged.
- required_evidence: Public plugin contract regression test and diff inspection.

### AFL-5 Installed package evidence

- working_mode: Installed Codex use
- source_state: Repository validation passes but the installed Marketplace may still contain an older projection.
- trigger/action: Perform a separately authorized cachebuster and local refresh through the existing installer.
- expected_effective_state: The registered installed Marketplace manifest contains `interface.displayName: "AGDF"` and an identifiable refreshed version.
- visible_feedback: Installed Marketplace inspection shows the exact value and version.
- blocker/failure_behavior: Missing cachebuster, wrong registration or manifest mismatch forbids host success claims.
- recovery/next_action: Use the existing installer rollback or repeat the authorized refresh cleanly.
- observable_success: Installed package inspection passes independently of repository tests.
- required_evidence: Registered Marketplace inventory and installed manifest inspection.

### AFL-6 Direct Codex behavior

- working_mode: Installed Codex use
- source_state: The refreshed installed Marketplace is verified.
- trigger/action: Open a fresh Codex Plugins view after the required reload or restart.
- expected_effective_state: The visible Marketplace heading is exactly `AGDF`.
- visible_feedback: Direct screenshot or equivalent host observation.
- blocker/failure_behavior: If Codex still renders `agdf`, record a host limitation and do not rename technical IDs or claim success.
- recovery/next_action: Retry once after a visible restart/reload; otherwise preserve the evidence-limited outcome.
- observable_success: Fresh direct host observation shows `AGDF`.
- required_evidence: Direct authenticated/local Codex UI evidence after installed-package verification.

### AFL-7 Companion boundary

- working_mode: Repository maintenance
- source_state: AGDF Project Inventory is a separate repository and installed plugin.
- trigger/action: Complete this AGDF-core first slice.
- expected_effective_state: No Inventory source, package, cache or registration changes occur.
- visible_feedback: Changed-path inspection contains only AGDF repository paths and governed control artefacts.
- blocker/failure_behavior: Any Inventory mutation blocks this slice.
- recovery/next_action: Remove it and govern the companion change separately.
- observable_success: Scope validation passes.
- required_evidence: Exact changed-path snapshot.

## 6. Non-Goals

- Rename technical IDs, commands, packages, repositories or installation references.
- Rename the AGDF core plugin product.
- Change AGDF Project Inventory.
- Merge plugins or Marketplaces.
- Change governance, gates, capabilities, security, persistence, architecture, API, CLI or release behavior.
- Publish, release, deploy, commit, push or create a pull request.
- Treat repository validation as installed-package or direct-host proof.

## 7. Users And Roles

- Codex user: recognizes the AGDF family and the distinct core product.
- AGDF maintainer: owns the canonical brand value, local projection and evidence boundary.
- Codex host: owns final rendering behavior and may impose a limitation that AGDF must report honestly.
- AGDF Project Inventory maintainer: out of scope for this first slice.

## 8. Constraints

- `AGDF` is the exact visible family brand.
- `agdf` remains the exact technical ID.
- One canonical brand value must be reused.
- Existing local Marketplace staging, ownership, rollback and install paths remain authoritative.
- Public distribution and local Marketplace evidence remain separate.
- Durable AGDF artefacts remain English; user-facing interaction remains German.

## 9. Evidence Requirements

- Focused local Marketplace regression passes.
- Runtime Integrity passes.
- Public plugin contract regression passes unchanged.
- Exact changed-path and whitespace checks pass.
- Installed package and registered Marketplace are inspected only after separately authorized refresh.
- Direct Codex UI evidence is collected only after installed-package verification and required restart/reload.

## 10. Risks And Open Questions

- Codex may render the technical Marketplace ID instead of `interface.displayName`.
- The screenshot may reflect stale registration or session cache.
- The implementation must confirm that reusing the public brand value does not couple local behavior to public release state.
- Solution Design must define the clean canonical mapping and prove public-contract isolation.
- Task planning must keep cachebuster/reinstall and direct UI evidence separately authorized and sequenced.

## 11. Next Step

PRD approved. Review the bounded Solution Design before Task/Test Plan or implementation work.
