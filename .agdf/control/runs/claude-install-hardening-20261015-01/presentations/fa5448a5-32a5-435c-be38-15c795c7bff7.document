# SD: Harden the Claude installer against stale and shadowed installations

Status: draft
Gate: SD
Gate approval: open
Based on: PRD
Date: 2026-10-15
Owner: Arndt Gold
Traceability contract: criteria-chain-v1
Design Decisions contract: sd-decisions-v1

## 1. Solution Overview

The Claude install path is hardened inside its existing owners. The marketplace stays at
`%LOCALAPPDATA%\agdf\marketplaces\agdf` (user decision). Four mechanisms make the result trustworthy:

1. A packaged-app preflight refuses Claude installs from inside a packaged app before any mutation.
2. After the marketplace commit, stale AGDF-owned package-private copies are retired (candidate
   `42c42850`) and an AGDF installation record is written to the Claude plugin data root, which
   packaged apps do not virtualize.
3. One provenance comparator verifies the install (loaded marketplace root, installation record and,
   in copied-loading mode, the Claude cache entry) and drives the SessionStart drift notice.
4. The installer follows Claude Code's in-place loading of directory marketplaces: it no longer
   uninstalls and reinstalls on every run, reads host state from `claude plugin list --json`, and
   treats failures after the commit as a committed, degraded outcome.

The generated Claude SessionStart check treats plugin enablement as runtime-check consent and emits
runtime facts, matching `runtime-checks status`.

## 2. Ownership And Source Of Truth

- Marketplace transaction, ownership marker and installation provenance:
  `packages/cli/lib/installers/local-marketplace.js` (unchanged location; commit option added).
- Claude install sequence and result: `packages/cli/lib/host-adapters/claude/plugin.js`.
- Packaged-app detection, provenance comparison and drift inspection (single owner):
  `packages/core/lib/runtime/host-installation.js` (from `42c42850`, extended).
- Package-copy reconciliation: `packages/cli/lib/installers/packaged-app-marketplace.js` (from `42c42850`).
- Claude plugin data root: `claudePluginDataRoot` in `packages/cli/lib/mcp-lifecycle/plugin-runtime.js`
  (`~/.claude/plugins/data/agdf-agdf`), already used by the plugin MCP runtime.
- Generated SessionStart check and its consent gate: `scripts/sync-plugin-runtime.js`.
- Claude consent model and status: `packages/cli/lib/host-adapters/claude/runtime-check.js`,
  `packages/cli/lib/runtime-check-consent/service.js` (behaviour unchanged).
- Host-owned state (`known_marketplaces.json`, `installed_plugins.json`, plugin cache) is read only
  and changed exclusively through the Claude Code CLI.

## 3. Architecture Decisions

- SDD-001: `host-installation.js` is the single owner of packaged-app detection, provenance comparison and drift inspection; installer verification, preflight, reconciliation and SessionStart consume it; rationale: one detector and one comparator prevent divergent verdicts between install and session; consequence: the module stays part of the plugin runtime projection and remains excluded from the Copilot payload.
- SDD-002: Packaged-app preflight via a probe: on Windows, the Claude install first writes a uniquely named probe file directly under `%LOCALAPPDATA%`, looks for the same file in the `LocalCache\Local` folder of every package family under `%LOCALAPPDATA%\Packages` and removes the probe in a finally block; a hit means the process runs inside that package and the install stops with a `packaged_app` lifecycle error naming the package and the remedy; the preflight is the first step of the Claude install flow, before setup, consent, marketplace or data-root work; rationale: works even before any private copy exists, unlike identity checks on existing copies, and needs no native API; consequence: one transient probe file in `%LOCALAPPDATA%`, and non-Windows platforms skip the check.
- SDD-003: The marketplace location is unchanged; stale AGDF-owned package copies are retired after every Claude install commit (candidate `42c42850`), foreign copies are reported only; rationale: user decision, smallest change, no Codex migration; consequence: AC-012 is not applicable; an install of another host started inside a packaged app can recreate a copy until the next Claude install, which the drift notice reveals in the meantime.
- SDD-004: In-place loading model: when the registered `agdf` marketplace is the owned local directory source, the installer refreshes it with `claude plugin marketplace update agdf` and installs `agdf@agdf` only if it is absent or its version differs; equal version means the committed content is already live and no uninstall or reinstall is issued; otherwise (copied loading or version change) the existing uninstall/install path remains; rationale: Claude Code loads directory-marketplace plugins in place (observed 2026-10-15 and documented per the analysis session), so the reinstall cycle only adds a window without plugin and lock exposure; consequence: the Claude cache entry may keep older provenance for same-version builds and is not used as verification reference in in-place mode.
- SDD-005: After commit the installer writes an AGDF installation record (`installation.json` with source digest, runtime digest, marketplace root and timestamp) atomically into the Claude plugin data root; rationale: this location is plugin-owned, not virtualized by packaged apps and independent of the host cache; consequence: Claude Code removes it with the plugin data on uninstall without `--keep-data`; uninstall reports it otherwise.
- SDD-006: Verification and drift use the comparator from SDD-001: the install is `healthy` only if the provenance at the marketplace plugin root and the installation record both match the committed source and runtime digests (plus the cache entry from `claude plugin list --json` in copied mode); the SessionStart drift notice compares the loaded root with the installation record instead of the cache entry; rationale: removes false drift after same-version installs and still detects package-private copies; consequence: candidate `42c42850` is adapted accordingly.
- SDD-007: Host state is read from `claude plugin list --json` (entry `agdf@agdf`: version, enabled, installPath) through the Claude adapter; on a non-zero exit or unparsable JSON the existing text parser is used and evidence `plugin_list:text_fallback` is added; if neither yields a version the result is not `healthy`; rationale: Claude Code 2.1.268 provides JSON output; consequence: the shared text parser in `plugin-command.js` stays unchanged for Codex.
- SDD-008: The generated SessionStart check treats surface `claude` as consented by plugin enablement and runs the existing runtime check without a receipt or capability-identity comparison; Codex, Copilot and OpenCode keep the receipt gate; rationale: the hook runs only while the plugin is enabled, matching the documented consent model and `runtime-checks status`; consequence: the repository check runs at every Claude session start within the existing disclosure and revocation `claude plugin disable agdf@agdf`.
- SDD-009: Post-commit failures are reported, not rolled back: the Claude adapter commits with a `tolerateCleanupFailure` option so a failed backup removal leaves the committed transaction marker for the next run's existing recovery and returns `cleanup: pending` with the reason; the adapter's recovery block covers only pre-commit steps, and post-commit steps (reconciliation, record, verification, MCP preparation) are individually guarded and add degraded evidence; rollback evidence records `restored` only when a restoration was performed; rationale: the new state is already live after the commit point; consequence: the default `commit()` behaviour for Codex and Copilot is unchanged.

## 4. Integration Points

- CLI install command for surface `claude` (`packages/cli/lib/cli/application.js` → `installClaudeGlobalPlugin`) and the local entry `npm run install:claude` (`packages/cli/scripts/install-local-plugin.js`).
- Claude Code CLI: `plugin marketplace list --json`, `plugin marketplace update agdf`, `plugin list --json`, `plugin install|uninstall agdf@agdf`.
- Marketplace transaction in `local-marketplace.js` (commit option) and its existing interrupted-transaction recovery.
- Plugin data root (`claudePluginDataRoot`) for the installation record.
- Generated `runtime/agdf-session-check.js` and the plugin runtime projection (`scripts/sync-plugin-runtime.js`, `scripts/core-projection.mjs`).
- Uninstall plan (`packages/cli/lib/host-adapters/claude/uninstall.js`) for reporting the installation record.

## 5. Constraints And Compatibility

- Nothing without a valid AGDF ownership marker is deleted; foreign package copies stay untouched.
- No Claude receipt or permission rule is written; legacy ones keep being removed.
- Host-owned Claude state changes only through the Claude Code CLI.
- macOS and Linux behaviour is unchanged except the shared improvements (JSON listing, no reinstall
  cycle, post-commit reporting, runtime facts); packaged-app logic is Windows-only.
- Codex, Copilot and OpenCode installers and the Copilot payload stay unchanged.
- Existing installations keep working on every failure path; older Claude Code versions without
  `--json` keep working through the fallback.

## 6. Test And Evidence Strategy

- Unit tests with injected fs/env/exec for preflight (inside, outside, probe cleanup), reconciliation,
  comparator, installation record, JSON/fallback listing and command sequences per loading mode.
- Fault injection for backup-cleanup failure after commit and next-run recovery.
- Generated session-check tests for Claude runtime facts with plugin enabled and absence when disabled.
- Regression: existing installer, consent, layout, lifecycle, payload-budget and host suites unchanged.
- Native Windows qualification (AC-014): Claude Desktop and terminal Claude Code, bound to digests.

## 7. Acceptance Traceability

| criterion_id | design_response | source_of_truth | design_decision_ids | compatibility_risk |
|---|---|---|---|---|
| AC-001 | Probe-based preflight as first step of the Claude install refuses with package and remedy | host-installation.js detection; claude/plugin.js install entry | SDD-001, SDD-002 | Transient probe file in %LOCALAPPDATA%; Windows only |
| AC-002 | Preflight finds no package hit outside packages; normal sequence continues to verification | claude/plugin.js; host-installation.js | SDD-002, SDD-006 | none — ordinary installs keep their sequence apart from SDD-004 |
| AC-003 | Retiring stale copies plus the non-virtualized installation record make Desktop and terminal sessions load the committed marketplace | packaged-app-marketplace.js; local-marketplace.js | SDD-003, SDD-005 | Copies recreated by other hosts inside a package remain until the next Claude install |
| AC-004 | Reconciliation after commit retires owned stale copies, reports foreign ones, degrades while any remain | packaged-app-marketplace.js | SDD-003 | Locked copies stay and are reported with their reason |
| AC-005 | Equal installed version in in-place mode issues no uninstall or install | claude/plugin.js | SDD-004, SDD-007 | Same-version cache entry may stay older; not used as reference |
| AC-006 | Changed content is live in place; copied mode or version change keeps the install path | claude/plugin.js; local-marketplace.js | SDD-004 | Depends on Claude Code loading behaviour; covered per mode and natively |
| AC-007 | Comparator checks marketplace root, installation record and cache in copied mode; mismatch degrades with both digests | host-installation.js | SDD-001, SDD-006 | none — read-only comparison of AGDF-owned provenance |
| AC-008 | Claude adapter reads plugin list JSON, falls back to text parser with evidence | claude/plugin.js; plugin-command.js (unchanged) | SDD-007 | Older Claude Code versions use the fallback |
| AC-009 | Generated session check treats Claude plugin enablement as consent and emits runtime facts | sync-plugin-runtime.js; runtime-check.js | SDD-008 | Check runtime at every session start; Codex/Copilot/OpenCode gates unchanged |
| AC-010 | Commit with tolerated cleanup failure, pre-commit-only recovery, truthful rollback evidence | local-marketplace.js; claude/plugin.js; plugin-command.js | SDD-009 | Default commit unchanged for other hosts |
| AC-011 | Drift notice compares loaded root with the installation record and names the package copy | host-installation.js; sync-plugin-runtime.js | SDD-001, SDD-006 | Missing record yields no false notice (status unknown) |
| AC-012 | not applicable — marketplace is not relocated | local-marketplace.js | SDD-003 | none — no migration happens |
| AC-013 | Other host paths, default commit and Copilot projection stay unchanged | codex, copilot and opencode adapters; core-projection.mjs | SDD-001, SDD-009 | Guarded by existing suites and payload budget |
| AC-014 | Native Windows run binds observations to installed digests | TP evidence plan | none — evidence obligation without a new design decision | Requires a Windows machine with Claude Desktop |

## 8. Risks And Open Questions

- Probe detection relies on MSIX redirection of new files in `%LOCALAPPDATA%`; native confirmation in AC-014.
- In-place loading may change in future Claude Code versions; copied mode keeps the install path.
- Running the repository check at every Claude session start adds startup time; measured in TP.
- Another host's install from inside a packaged app can recreate a shadow copy (accepted residual risk, SDD-003).

## Design Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Marketplace location | before_sd | resolved | Keep the location; preflight plus reconciliation (user decision 2026-10-15); AC-012 not applicable. | Arndt Gold |
| In-package detection signal | before_sd | resolved | Probe file under %LOCALAPPDATA% searched in package stores (SDD-002). | Arndt Gold |
| Loading model and drift reference | before_sd | resolved | In-place mode without reinstall; installation record in the plugin data root as reference (SDD-004 to SDD-006). | Arndt Gold |
| Machine-readable listing fallback | before_sd | resolved | plugin list JSON with text fallback and evidence (SDD-007). | Arndt Gold |
| Runtime-fact consent | before_sd | resolved | Plugin enablement is consent for the Claude session check (SDD-008). | Arndt Gold |
| Post-commit failure handling | before_sd | resolved | Tolerated cleanup failure, pre-commit-only recovery (SDD-009). | Arndt Gold |
| Exact message wording and evidence keys | later_tp | open | Fixed with tests in TP. | Arndt Gold |

## 9. Next Step

Review this solution design and approve only with:

`Approval: SD`

## AGDF Approval Summary (de; source=en)

- Ziel: Der Claude-Installer erreicht nachweislich den Stand, den Sessions laden, oder meldet Ursache und Abhilfe; umgesetzt in den bestehenden Modulen, der Marketplace bleibt an seinem Ort.
- Umfang: Vorab-Check per Probedatei unter %LOCALAPPDATA% als erster Schritt der Claude-Installation; Entfernen veralteter AGDF-Paketkopien nach dem Commit; ein AGDF-Installationsprotokoll im Plugin-Datenordner unter ~/.claude, den App-Pakete nicht umleiten; ein gemeinsamer Herkunftsvergleich für Installationsprüfung und Drift-Meldung; kein Deinstallieren und Neuinstallieren mehr bei gleicher Version, da Claude Code direkt aus dem Marketplace-Ordner lädt; claude plugin list --json mit Text-Fallback; Runtime-Facts für Claude über den Plugin-Consent; Fehler nach dem Commit als eingeschränktes Ergebnis ohne Rückbau.
- Entscheidungen: Marketplace-Ort bleibt (deine Entscheidung), AC-012 entfällt. Erkennung per Probedatei. Referenz für Prüfung und Drift ist das Installationsprotokoll statt des Claude-Caches. JSON-Liste mit Text-Fallback. Plugin-Aktivierung ist Consent für den Session-Check. Commit toleriert Aufräumfehler nur für Claude, Codex und Copilot bleiben unverändert. Meldungstexte legt der TP fest.
- Risiken: Die Probe hängt an der MSIX-Umleitung und wird nativ bestätigt; künftige Claude-Code-Versionen könnten anders laden; der Session-Check kostet Startzeit; eine Installation eines anderen Hosts aus Claude Desktop kann bis zur nächsten Claude-Installation wieder eine Kopie erzeugen.
