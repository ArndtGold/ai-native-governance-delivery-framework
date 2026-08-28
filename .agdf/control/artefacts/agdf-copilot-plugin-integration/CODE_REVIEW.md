# Code Review: AGDF GitHub Copilot Plugin Integration

- decision: pass
- findings:
  - [resolved] `create-agdf/lib/installers/plugin-installers.js` formerly installed the local path directly. It now registers the owned local Marketplace, refuses same-name conflicts, migrates the direct install and verifies `agdf@agdf` version `0.13.8`.
  - [resolved] `create-agdf/lib/public-plugin/manifest.js` emitted `interface.supportURL` and an unnecessary explicit `hooks` path in the Codex manifest. The projection now omits the unsupported support field and relies on Codex default discovery of `hooks/hooks.json`; the hook file remains packaged and integrity-checked.
  - [resolved] `create-agdf/scripts/sync-plugin-runtime.js` emitted plain text for Copilot `sessionStart`, although Copilot accepts injected session context only through a JSON object containing `additionalContext`. Copilot now receives that exact envelope while Codex, Claude and OpenCode keep their existing plain-text contract.
- reviewed_scope: canonical Copilot metadata, manifest rendering, package generation, runtime root binding, consent state, host adapter, pinned official npm CLI bootstrap, lifecycle operations and presentation, precedence diagnostic, integrity checks, focused tests, package scripts and documentation
- evidence: Official OpenAI plugin packaging reference; official GitHub Copilot Hooks Reference; installed Copilot App 1.1.14 SDK runtime and session event; external Codex plugin validator pass; `git diff --check`; Node syntax checks; focused manifest, consent, lifecycle and local-development installer tests; Copilot `additionalContext` JSON regression test; package contents and byte-identical build; Runtime Integrity positive/negative suites; complete `create-agdf` smoke suite; direct `npm run install:copilot` completed with exit code 0 and Copilot verified AGDF `0.13.8`
- missing_evidence: The refreshed Marketplace description and non-empty Copilot `additionalContext` after explicit renewed runtime-check consent remain visible evidence obligations, not code-review defects. Copilot App hook execution itself is directly proven.
- risks: A Copilot host may expose list formatting, cache behavior, managed-policy responses or update semantics not represented by documented commands and bounded fixtures. The adapter fails closed on missing/malformed/version-mismatched evidence and requires a fresh session.
- required_next_step: Reinstall or update AGDF, explicitly renew Copilot runtime-check consent, restart Copilot and verify both the Marketplace description and direct `sessionStart` behavior.

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CPI-CR-01 | implementation_gap | CD+Tests | resolved | Marketplace registration, migration and `agdf@agdf` version verification pass in focused tests, full smoke suite and the real Copilot 1.0.80 host. | Restart the app and complete the separate visible-evidence observation. |
| CPI-CR-02 | implementation_gap | CD+Tests | resolved | Generated Codex manifest omits `interface.supportURL` and explicit `hooks`; `hooks/hooks.json` remains present; external plugin validation, public plugin tests, package contents and Runtime Integrity pass. | Keep default hook discovery and the accepted Codex manifest field set covered by regression tests. |
| CPI-CR-03 | implementation_gap | CD+Tests | resolved | Generated Copilot session hook output parses as exactly `{ additionalContext }`; the same regression test confirms Codex retains plain text; Copilot App 1.1.14 directly executed the installed AGDF `sessionStart` hook with `success: true` and empty output under the current non-enabled consent state. | Reinstall or update AGDF, explicitly renew runtime-check consent, restart Copilot and verify non-empty context injection. |
