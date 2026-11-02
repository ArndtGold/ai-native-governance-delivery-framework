# UR: Claude Local Install Must Verifiably Deliver Current Source Content

Status: approved
Gate: UR
Gate approval: approved
Date: 2026-08-26
Owner: Arndt Gold

## 1. Problem

`npm run install:claude` reports "AGDF installation complete" while the Claude host keeps stale plugin content. Two defects combine:

1. The local Claude install keeps the canonical version (`0.13.5`), so `claude plugin update agdf@agdf` sees an unchanged version and never copies new content into the host plugin cache. Source changes without a version bump never reach the host. Observed directly on 2026-08-26: marketplace copy rebuilt at 11:10, host cache copy still from 2026-08-24 without `distributionProfiles`.
2. `pluginVersionFromList` expects the version on the same line as the plugin id, but current `claude plugin list` output is multi-line (`❯ agdf@agdf` / `Version: 0.13.5`). Verification returns "unknown"/degraded and the mismatch guard (`installedVersion && ...`) silently passes instead of failing closed.

## 2. Goal

After a source change, `npm run install:claude` plus host restart yields the new content in the Claude host, and the installer verifies that honestly: the real installed version is read, and a state that cannot be verified is not reported as trustworthy success.

## 3. Scope

- Reliable content refresh for the Claude surface; the mechanism (Codex-symmetric local version projection vs. deterministic reinstall) is decided by the Brownfield Review with evidence.
- Robust parsing of current `claude plugin list` output (multi-line format), preserving compatibility with the single-line format.
- Fail-closed verification: an unreadable installed version must not silently pass the mismatch guard.
- Regression coverage for both defects.

## 4. Non-Goals

- Codex or OpenCode transport changes.
- Release, publication or npm registry changes.
- Loaded-host (restarted host) proof — that remains explicit UAT evidence.
- Weakening runtime-integrity or provenance enforcement.

## 5. Acceptance Signals

- With an already-installed same-version plugin and changed source content, `npm run install:claude` results in the current content in Claude's plugin area (verified by directly observable evidence, e.g. the rebuilt copy's markers).
- Verification reports the real installed version from current CLI output; `verificationStatus: healthy` on success.
- A version that cannot be parsed leads to degraded/failed reporting, never to a silently passed guard.
- Focused tests cover multi-line list parsing and the refresh path; existing suites remain green where host-capable.

## 6. Existing Source Of Truth

- `create-agdf/lib/installers/plugin-installers.js` owns Claude/Codex host lifecycle sequencing and list parsing.
- `create-agdf/lib/installers/local-marketplace.js` owns staging and the `transaction.changed` signal.
- Codex precedent: `codexLocalInstallVersion` content-digest version projection.
- Runtime-integrity contract (run `agdf-cross-host-runtime-integrity`, Awaiting QA) currently requires `.claude-plugin/plugin.json` version to equal the canonical definition version.

## 7. Risks And Unknowns

- Whether `claude plugin uninstall` + `install` actually clears and re-copies the same-version cache (empirical probe required; the current session itself runs on this plugin).
- A Claude-side local version projection would collide with the runtime-integrity version-equality contract that is still in its own QA gate.

## 8. Next Step

Perform the post-UR Brownfield Review including the refresh-mechanism decision, then the proportional Mode/Slice Decision.
