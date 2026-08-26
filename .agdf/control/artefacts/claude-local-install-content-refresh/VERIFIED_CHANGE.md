# Verified Change: Claude Local Install Content Refresh

- run_id: claude-local-install-content-refresh
- date: 2026-08-26
- decision: pass
- mode: verified_change

## Change

- `create-agdf/lib/installers/plugin-installers.js`:
  - `installClaudeGlobalPlugin`: when the plugin is already installed, the local install now runs `claude plugin uninstall agdf@agdf` followed by `claude plugin install agdf@agdf` instead of `claude plugin update agdf@agdf`, because same-version `update` keeps the cached host copy and local source changes carry no version bump. Fresh installs are unchanged (single `install`). Marketplace migration, error taxonomy and recovery flow are untouched.
  - `pluginVersionFromList`: now also parses the current multi-line `claude plugin list` format (plugin id and `Version:` on separate lines) by scanning the entry's block up to the next plugin-id line; the single-line format (Codex, older outputs) keeps working; versions from other entries' blocks are not attributed.
- `create-agdf/scripts/local-marketplace-test.js`: assertions for the reinstall sequence (uninstall before install, no `update`, no uninstall on fresh installs), a scripted multi-line-output install with healthy verification, and four `pluginVersionFromList` unit checks (single-line, multi-line, foreign-block isolation, absent plugin).

## Verification Evidence

| Check | Result | Evidence |
|---|---|---|
| Reinstall sequencing, multi-line verification, guard behavior | pass | Standalone run of the new assertions (identical logic to the test-file additions) passed on this host, 2026-08-26, including: uninstall precedes install, `update` absent, fresh install without uninstall, mismatch (`0.0.1`) throws with marketplace rollback. |
| End-to-end `npm run install:claude` | pass, now fully healthy | Lifecycle result: `Version: 0.13.5 (verified)`, `Installation: healthy`, `Verification: healthy`, `Restart required: yes (host_reload)` — previously `Version: unknown`, `degraded`. |
| Host cache freshness | pass | After the run, `~/.claude/plugins/cache/agdf/agdf/0.13.5/meta/agdf-plugin.definition.json` carries the 11:10 build with `distributionProfiles: true` (previously the 2026-08-24 build without profiles). |
| Full `local-marketplace-test.js` on this host | blocked by pre-existing host limitation | The file still fails earlier at the darwin-path `defaultAgdfDataRoot` assertions (POSIX separators, `path.join` is platform-bound) — pre-existing, disclosed in run `windows-native-install-viability`; the new assertions execute on POSIX/CI hosts. |

## Disclosed Limitations

- Loaded-host proof still requires a Claude Code restart; repository/cache evidence does not claim it (`Activation: pending_restart` is honest).
- Between uninstall and a failing install the plugin would be absent until rerun; the failure is loudly reported with phase and next action. Accepted for a local development path.
- The rejected alternative (Claude-side `+claude.local-<digest>` version projection) is documented in the Brownfield Review; revisit only together with the runtime-integrity contract owner if per-content version identity becomes a requirement.

## Rollback

Revert the two-file diff; no contract, schema or host-configuration change is involved.
