# Native Qualification: Harden the Claude installer against stale and shadowed installations

Gate: QA evidence (T-010, AC-014, SCN-018)
Type: Native Qualification
Status: in_progress

## Environment

- host: Windows 11 Enterprise 10.0.26200
- Claude Code: 2.1.268; Claude Desktop package `Claude_pzs8sxrjxfjjc` (MSIX)
- Node: 22.22.3
- source: branch `feat/claude-install-fix` (base `42c42850`), uncommitted working tree of this run
- operator: Arndt Gold; observer: Claude Code (claude-opus-5-5) inside a Claude Desktop session

## Pre-State (2026-10-15, read-only)

- package detection in this Claude Desktop session (`detectPackagedAppProcess`, working-tree source):
  `{"status":"inside_package","package":"Claude_pzs8sxrjxfjjc"}`; no probe file left in the real or private
  `%LOCALAPPDATA%`.
- installed marketplace plugin `%LOCALAPPDATA%\agdf\marketplaces\agdf\plugins\agdf`: version 0.14.5,
  source `5626f159c5ba816b72e5720186d3b4b400485b147b2a6a69def6dbd58a9e2b77`, runtime
  `2d522a08496fdd3590dfa67be765e58d22a04f0fb7b5b8cb8419515f079de32e`, marker written 2026-10-15 18:29 local
  (build before this run's changes).
- private package copy `%LOCALAPPDATA%\Packages\Claude_pzs8sxrjxfjjc\LocalCache\Local\agdf`: absent.
- Claude installation record `~/.claude/plugins/data/agdf-agdf/installation.json`: absent (the installed build
  predates the record).
- `installed_plugins.json` entry `agdf@agdf`: scope `user`, version 0.14.5, installPath
  `~\.claude\plugins\cache\agdf\agdf\0.14.5`, installed 2026-10-15T16:29:20Z.
- SessionStart context of this session (old build): no `AGDF runtime facts` and no `AGDF installation drift` block.

## Scenarios

| scenario | acceptance | route | result | evidence |
|---|---|---|---|---|
| SCN-002 | AC-001 | `npm run install:claude` from the Bash tool of a Claude Desktop session, before/after snapshot of real and private `agdf` folders and Claude plugin data | pass | see SCN-002 Evidence |
| SCN-004 | AC-003 | terminal install outside Claude Desktop; new Desktop and terminal sessions compare loaded digests and show no drift notice | pass | see SCN-004 and SCN-008 Evidence |
| SCN-008 | AC-006 | the terminal install of this run replaces same-version build `5626f159…`; a new Desktop session loads the new digests | pass | see SCN-004 and SCN-008 Evidence |
| SCN-012 | AC-009 | new Desktop session with runtime facts; none after `claude plugin disable agdf@agdf`; enable again | open | — |
| SCN-015 | AC-011 | stale private copy of an earlier same-version build; drift notice in a new Desktop session; none after terminal reinstall | open | — |
| CR-006 | evidence obligation | package-store contents before and after the retiring reinstall in SCN-015 | open | — |
| cache reuse | CR missing evidence | cache entry digests after a reinstall with `uninstall --keep-data` | pass | see SCN-004 and SCN-008 Evidence |

## SCN-002 Evidence (2026-10-16, approved by Arndt Gold in chat)

- route: `npm run install:claude` in the repository, started from the Bash tool of this Claude Desktop session
  (package `Claude_pzs8sxrjxfjjc`), stdin closed.
- result: exit code 1 with the refusal
  `AGDF install refused: this process runs inside the packaged app Claude_pzs8sxrjxfjjc, whose %LOCALAPPDATA% writes stay private to that app. Run the installation from a terminal outside Claude_pzs8sxrjxfjjc.`
- snapshot method: relative path, size and sha256 of every file under `%LOCALAPPDATA%\agdf` (view of this
  session, 888 files), `%LOCALAPPDATA%\Packages\Claude_pzs8sxrjxfjjc\LocalCache\Local\agdf` (absent),
  `~/.claude/plugins/data/agdf-agdf` (7822 files), `installed_plugins.json` and `known_marketplaces.json`,
  plus probe files in the real and private `%LOCALAPPDATA%` root.
- comparison: 0 changed entries; both snapshot files are byte-identical; no probe file left; the private
  package folder still has no `agdf` entry; the repository working tree shows the same set of changed paths.
- assessment: AC-001 met; the probe refuses before setup, consent, control or marketplace work.

## SCN-004 and SCN-008 Evidence (2026-10-16)

- route: terminal install outside Claude Desktop by Arndt Gold (`npm run install:claude`), marker written
  07:45:22 local, record written 07:45:32 local.
- installed provenance, read after the install:

  | location | source digest | runtime digest |
  |---|---|---|
  | marketplace plugin root, read from this Claude Desktop session (packaged view) | `b9ed2a39065a52148ade132a48acf253c3ee98945c8228f516e08fa1325ed38e` | `a5d357fef12bb8664cff09963a6b81428c1ae90f58d407f5789b5be8eb8eff84` |
  | installation record `~/.claude/plugins/data/agdf-agdf/installation.json` | same | same |
  | Claude cache entry `~\.claude\plugins\cache\agdf\agdf\0.14.5` (scope `user`, installed 05:45:30Z) | same | same |

- previous same-version build in the Desktop view: source `5626f159…`, runtime `2d522a08…` (Pre-State); the Desktop
  view now shows the new build (SCN-008).
- `inspectClaudeHostInstallationDrift` evaluated in this Claude Desktop session with the marketplace plugin root:
  `{"status":"matched"}`; the private package folder still has no `agdf` entry.
- cache reuse: after the installer's `uninstall --keep-data` and install, the cache entry carries the new digests;
  Claude Code did not keep the old cache contents.
- new terminal Claude Code session (interactive `claude`, working directory `C:\Users\golda`): SessionStart context
  contains `AGDF runtime facts: {"context_state":"repo_less","working_directory":"C:\Users\golda","automatic_check":{"status":"skipped","findings":0},"config":"unavailable"}`
  and no `AGDF installation drift` line. Runtime facts for surface `claude` exist only in the new build, so this
  session loaded the new build.
- new Claude Desktop Code session (working directory: this repository): SessionStart context contains
  `AGDF runtime facts: {"context_state":"repository_bound","working_directory":"C:\Workspace\ai-native-governance-delivery-framework","automatic_check":{"status":"unknown","findings":79},"config":"valid","languages":{"artifact":"en","chat":"de","runtime":"en"},"repository_control":{"target":"C:\Workspace\ai-native-governance-delivery-framework","inspection_state":"complete","status":"current","counts":{"migration":0,"repair":0,"historical":61},"authorizes":false}}`
  and no `AGDF installation drift` line; the binding names `expected_version` 0.14.5.
- assessment: both new sessions load the new build (runtime facts for surface `claude`), the loaded root
  matches the installation record in the Desktop view, and neither session shows a drift notice. AC-003 and
  AC-006 met.
- observation outside this run's scope: `automatic_check.status` reads `unknown` because `doctor --all-active`
  reports `revise` (79 findings: 3 revise, 76 warn), which the session check's status list does not contain.
  The list is unchanged since `89e87cbf` and affects Codex the same way.
