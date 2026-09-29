# Implementation evidence

Run: agdf-intake-continuation-repair
Date: 2026-09-27
Baseline: 36fd67e571f2f62f9bf94e92448c00ecbd4e4a3b
Status: source and packaged-runtime validation complete; live host evidence pending

## Implemented path

- Shared CLI/MCP contract carries explicit new/resume intent and bound continue_delivery. Missing mode retains conservative selection; collisions do not adopt existing runs.
- Shared validation handlers expose run-create in the shipped validator. Read-only scaffold inspection is split from creation so MCP's static import closure remains read-only.
- Missing/ambiguous/invalid selection suppresses a misleading Approval: UR offer.
- run-present writes an exclusive prepared record under the selected run; exact run, gate, revision, artefact seal, language and rendered-text digest are checked. run-approve requires its id, stores the digest in evidence and revalidates under the existing write lock.
- Historical recorded approvals remain unchanged. New approvals without a binding fail with recovery requiring a NEW presentation and NEW reply.
- Authorized intake/continuation prepares a presentation, displays its exact text and waits. Valid UR continuation returns only canonical Brownfield Review / Mode-Slice work. Status and MCP dispatch remain read-only.
- Contracts, skill instructions, CLI help and generated packages carry the same semantics. A receipt is evidence of preparation, not proof of display or human-response timing.

## Validation boundary

Source/packaged-runtime tests are distinct from installed files and a loaded Codex chat. The automated E2E uses synthetic approvals only in disposable fixtures. See LIVE_VALIDATION.md for the outstanding actual-user sequence.

## Test execution

Node v22.22.3; npm 10.9.8 explicitly selected with PATH=/usr/local/bin:$PATH on darwin-x64. The installed default npm 12.1.0 produced the previously observed pack-JSON incompatibility; no unrelated npm parser change was made.

The smoke command was started, stopped at genuine integration failures, and resumed after scoped corrections. Failed output is retained alongside the corrected suite outputs. Instruction budgets and safety assertions were preserved. The expanded grammar uses a shorter language placeholder; the duplicate contract reference was removed. The shared read-only scaffold split satisfied MCP import-closure safety.

The request-activation manifest and deterministic skill replay manifest were rebound to the changed contract owners. Existing fixture policy remains valid; recorded live/model observations were not rewritten. Deterministic replay is not a fresh model or host observation.

All scripts in the smoke-test chain completed successfully after the documented corrections, with failed segments rerun rather than repeating already passing suites. The long standalone smoke-test and final routing test both passed. CLI revalidation and the final packaged-runtime E2E passed after the last help/schema-envelope corrections. E2E archive digest: sha256:04fcbf5b6f424a2d34d83379ada5ac35109dcf5007ce8fcd1b268e1c03c489d2.

Covered: release preparation; instruction footprint; activation/projection/callback/schema checks; canonical initialization; CLI and setup contracts; consent; target resolution; semantic dispatch and 40 adapter cases; host commands; MCP lifecycle, protocol, safety, provenance and packaging; validators; marketplace and installer paths; package build/contents; lifecycle; control state; packaged intake; reconciliation; presentation/localization; integrity; skill conformance and 83 deterministic replay cases; proportionality; delivery-path search; OpenCode hardening; final smoke and routing. Logs and SHA-256 inventory: evidence/manifest.json. This was a resumed full suite, not one uninterrupted green invocation.

Final source review also corrected the new CLI envelope's schema_version to the existing string convention; the stored receipt retains its integer schema version. The final E2E asserts this distinction.

The `presentation_required` return is preparatory bookkeeping required by SD D-05, followed by an explicit user wait; it is not authorization to perform Brownfield work without UR or to cross a user gate. SD D-03's bounded Brownfield continuation remains separate.

## Installed state

Supported `install:codex -- --plugin-only --verbose` succeeded with the desktop CLI 0.158.0-alpha.2.1 and npm 10.9.8. The initial sandbox write attempt failed; the authorized escalation allowed the user-directory operation. A second attempt found the old /usr/local/bin/codex 0.77.0 without plugin marketplace support and rolled back. The successful command used the desktop CLI directory first in its child PATH; no global PATH/config edit or cache patch.

Installed plugin: 0.14.5+codex.local-8f2a6ae0c54a
Installed root: /Users/arndtgold/.codex/plugins/cache/agdf/agdf/0.14.5+codex.local-8f2a6ae0c54a
Source digest: 8f2a6ae0c54a557efd06bd4f8fc2e1d8de3d83a40f9f22b5830f0538af2590e2
Runtime digest: 21f49bfd9db5174ae09354fdc847cd77010822435a552794d23d258238b56ccc
Direct installed-validator resolution: owned_version_matched, provenance matched, no registry access.
Installer: healthy, MCP included, automatic checks manual, host discovery not checked, restart required.

A direct process reports its own `loaded_session` evidence label; it does not establish that this already-running Codex chat reloaded its tool schema. The old cache was replaced during installation. Reviews in this repair therefore use the already-authorized local repair path and canonical source dispatcher, not a claim of refreshed native MCP execution.

## Scope and remaining obligation

Only this AGDF repository and its supported local Codex installation are in scope. No MGDF changes, historical approval rewrite, publish, commit or push. Windows shim checks are explicitly skipped by the host-command suite on macOS; no live cross-host claim.

T10/V11 requires a fresh loaded Codex schema and an actual subsequent user reply. Until that exists, UX fidelity remains partially evidenced and QA cannot pass. OR/UAT are not yet authorized by the quality state.

## Knowledge ownership

memory_target: scope_artifact
memory_reason: run-specific implementation, test and installation evidence; normative semantics live in existing contracts.
memory_refs: IMPLEMENTATION_EVIDENCE.md; LIVE_VALIDATION.md; plugin/meta/contracts/interaction.md
context_graph_impact: none
context_graph_reconciliation: not_applicable
context_graph_required_action: none
context_graph_gate_effect: none
