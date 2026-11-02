# T-001 Host Probe: Toast, Status Line, Audio and Language Setting

- run_id: `agdf-companion-followup-20261027-01`
- task: T-001 (approved TP revision 11)
- date: 2026-10-27, 16:42 local time (2026-10-27T15:42:42Z)
- host: Claude desktop app, Code tab, Windows 11 Enterprise 10.0.26200; desktop engine Claude Code 2.1.308 (bundled mod API declaration), standalone CLI 2.1.302
- observer: Claude Code implementing agent (screenshots, probe result file); Arndt Gold (audibility)

## Setup

A scratch mod `agdf-probe` in this session's dev-mods folder (`C:\Users\golda\.claude\dev-mods\<session>\agdf-probe`, outside the repository) was enabled by the owner through Claude's "Turn on the mods Claude writes in this session?" question. `claude plugin validate` passed (hooks: `tool.call{tool=Bash}` with `.catch`; calls: `$.audio.play`, `$.fs.write`, `$.settings.read`, `$.ui.status`, `$.ui.toast`). The probe opened no pane. A Bash call containing `AGDF_PROBE_FIRE` called, in order: `$.ui.status("AGDF · QA · wartet")`, `$.ui.toast("agdf-probe wartet auf Freigabe: Qualitätssicherung", { timeoutMs: 60000 })`, `$.settings.read({ key: "language" })`, `$.audio.play({ base64, mime: "audio/wav" }, { gain: 0.35 })` with a generated two-note 8 kHz 8-bit mono WAV of 0.3 s, and wrote the answers with `$.fs.write`. A Bash call containing `AGDF_PROBE_CLEAR` called `$.ui.status(undefined)`. The mod was removed after the probe; its source is kept in the session scratchpad only.

## Results

| Channel | Host answer | Observation | Evidence |
|---|---|---|---|
| `$.ui.toast` | returned | Drawn at the bottom right of the Claude window as "agdf-probe: agdf-probe wartet auf Freigabe: Qualitätssicherung"; the host prefixes the plugin name | `live/01-probe-toast-and-status-line.png` |
| `$.ui.status` | returned | Drawn in the footer beside the model selector as "agdf-probe AGDF · QA · wartet" (plugin name dimmed before the text) with no pane of the mod open; it stayed until cleared and disappeared after `$.ui.status(undefined)` | `live/01-probe-toast-and-status-line.png`, `live/02-probe-status-line-cleared.png` |
| `$.settings.read({ key: "language" })` | `"de"` | Equals the owner's `language` setting in `~/.claude/settings.json` | probe result file |
| `$.audio.play` (base64 WAV, gain 0.35) | resolved without error | Not audible according to the owner; consistent with the declaration that a Windows host without a player skips playback and resolves | owner answer 2026-10-27; probe result file |
| AGDF | unaffected | The installed AGDF companion pane, the AGDF CLI and MCP calls of this session continued normally during and after the probe | session transcript |

Probe result file (scratchpad): `{ "status": "called", "toast": "called", "language": "de", "audio": "resolved" }`.

## Consequences For The Run

- AC-004 (toast) and AC-006 (status line) are drawable on the Windows desktop; implementation proceeds as designed (SDD-06, SDD-07). The status line needs no pane, which confirms SDD-08's hidden-pane reading as the only requirement.
- Because the host prefixes the plugin name, the companion's toast reads "agdf: …" and its status line "agdf AGDF · QA · wartet". The approved PRD wording (`AGDF · {gate} · {short state}`) is kept; dropping the redundant "AGDF ·" would be a product change and is recorded as a later candidate.
- AC-005: the sound switch stays as designed; on Windows the chime is silent. `INSTALL.md` (T-008) documents that sound plays only where Claude has an audio player (macOS according to the declaration), and the live test reports the result as observed.
- AC-010: `$.settings.read({ key: "language" })` returns the raw setting value; the language fallback (SDD-11) can rely on it.
- No result returns the run to SD.
