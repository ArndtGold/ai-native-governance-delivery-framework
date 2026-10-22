# Proposed AGDF 0.20.0 release matrix revision

Date: 2026-10-22
Run: release-0200-codex-claude-20261020-01
Status: reviewable scope proposal; not an effective replacement of approved policy
Initiating phase: CD+Tests
Earliest changed source: PRD
Gate authority: none

## Maintainer decision and intended matrix

The maintainer explicitly requested alignment with the actually checked hosts, documentation of both Desktop handchecks and closeout preparation. Codex under Windows/Linux is to remain unqualified. This is a change of release scope, not a passing result for previously required tests.

| Host / surface | Available evidence | Proposed 0.20.0 treatment | Outstanding condition |
|---|---|---|---|
| Codex Desktop | Maintainer reports normal AGDF invocation, upgrade and recovery passed | Desktop release target; manually checked, with observation limits visible | Bind the original handcheck to actual environment and candidate; review only its demonstrated capabilities |
| Claude Desktop | Maintainer reports normal AGDF invocation, upgrade and recovery passed; Windows test computer previously identified | Desktop release target; manually checked, with observation limits visible | Bind the original handcheck to actual Desktop environment, access path and candidate; do not borrow CLI identity |
| Claude CLI / Windows | Five validator-accepted cases on candidate 830d8b94: dispatch, invalid input, skill continuation, upgrade and recovery | Retain as separate CLI evidence for its exact tuple and candidate | Complete review/import and verify applicability to the final prepared candidate |
| Codex CLI / macOS | Five passing local diagnostic cases on earlier dirty candidate eae8e254 | Retain as bounded diagnostic evidence | No automatic qualification of a final clean candidate or another OS/surface |
| Codex CLI / native Windows | No accepted release qualification | Explicitly unqualified; outside the proposed mandatory 0.20.0 host matrix | Preserve regression coverage and diagnostics; any future qualification is a new evidenced support decision |
| Codex CLI / Linux | No accepted release qualification | Explicitly unqualified; outside the proposed mandatory 0.20.0 host matrix | Same boundary as Windows; no implied platform support |
| GitHub Copilot | Existing experimental adapter and fixtures | Experimental | No native qualification claimed |
| OpenCode | Existing experimental adapter and fixtures | Experimental | No native qualification claimed |

Manual evidence is recorded in [DESKTOP_HANDCHECKS_20261022.md](DESKTOP_HANDCHECKS_20261022.md). Exact Desktop tuples and candidate identities are unknown in the supplied statements. A row must distinguish reported manual success from candidate-bound reviewed qualification.

## Required propagation after source revision and renewed approvals

1. PRD: replace the mandatory Linux/Windows Codex CLI scope in Product Scope, AC-004, Constraints, Evidence Requirements and the matrix decision. Update AC-003/005/007/008 only as needed to express honest surface-specific manual evidence and final-candidate validation; retain all candidate, ownership, failure and approval safeguards.
2. SD: describe the revised per-surface matrix, operator-evidence representation and validation, policy migration and compatibility/report projections. Preserve historical evidence and the old Codex protocol/version safeguards for any retained optional CLI qualification path.
3. TP: map the renewed criteria to concrete policy/schema/probe/workflow/report changes and meaningful rejection tests. Retain the complete ordinary CI inventory and current timeouts.
4. Canonical metadata: update the versioned host-support policy through plugins/agdf/meta/agdf-plugin.definition.json and its checked schema/generator. Do not patch only the generated codex-release-policy.json or generated reports.
5. Evidence owners: extend the existing release-policy, release-observation, release-handoff and compatibility owners for the approved Desktop scope. Preserve provenance, containment, immutable imports, actual cleanup, exact identity and human-versus-machine assurance checks. Unknown Desktop identity remains unknown; conversation confirmation alone must not manufacture model/tool traces.
6. Publication graph: require every row of the renewed matrix through the existing release validators. Preserve the current gates until the replacement is approved, implemented and tested. Retain any Linux/Windows workflow as an explicitly optional unqualified-path check where appropriate; do not convert its absence into a pass.
7. Public guidance and readiness: update INSTALL, README, release notes and generated comparison through their owners, stating the surface, OS where known, observed method and limits. Codex on Windows/Linux must remain visibly unqualified.

## Unchanged safeguards

One 0.20.0 version line; no invented host facts; experimental adapters/tests retained; no credential transfer; no trust or ownership exceptions; no increased timeouts; no dropped ordinary tests; no retroactive conversion of diagnostic evidence; no inferred QA/UAT/OR approval; no publication, tag or VCS action under this proposal.

The existing UR explicitly permits a support-scope decision to change the Linux/Windows requirement. Its candidate/evidence, host separation and no-false-qualification intent remain intact. PRD is therefore the earliest changed source. Renew affected downstream sources and assess retained implementation under the renewed TP before declaring closeout readiness.

## AGDF Approval Summary (de; source=en)

Die vorgeschlagene 0.20.0-Matrix umfasst Codex Desktop und Claude Desktop als manuell geprüfte Ziele und behält die fünf separat validierten Windows-Claude-CLI-Fälle bei. Codex CLI unter Linux/Windows bleibt unqualifiziert und gehört nach der beantragten Scope-Änderung nicht zur Pflichtmatrix. Die früheren macOS-Codex-CLI-Tests bleiben Diagnosebelege. Fehlende Desktop-Identitätsangaben bleiben offen. PRD, SD, TP und anschließend die kanonische Policy, Validatoren, Veröffentlichungsabhängigkeiten und Berichte müssen konsistent angepasst werden. Bestehende Sicherheits-, Integritäts-, Prüf- und Freigabegrenzen bleiben verbindlich.
