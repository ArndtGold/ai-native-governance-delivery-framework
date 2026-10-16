# UR: Harden the Claude installer against stale and shadowed installations

Status: draft
Gate: UR
Gate approval: open
Requirements clarification: complete
Date: 2026-10-15
Owner: Arndt Gold

## 1. Problem

On Windows, Claude Desktop sessions ran an AGDF 0.14.5 state from 2026-10-08 although
`npm run install:claude` had installed a newer 0.14.5 state on 2026-10-15. Claude Desktop is an
MSIX-packaged app: `%LOCALAPPDATA%` writes of the app and of every process it starts land in a
package-private copy that shadows the real path for processes inside the package, and Claude Code
loads directory-marketplace plugins in place from that path. The AGDF marketplace lives under
`%LOCALAPPDATA%\agdf\marketplaces\agdf`, so an install started from inside a Claude Desktop session
updates only the private copy, and an install started outside leaves the private copy stale.

A review of the Claude install path found related defects that made this failure possible or
invisible:

1. The installer does not detect, before writing, that it runs inside a packaged app.
2. Post-install verification compares only the version string; every local build is `0.14.5`, so a
   stale or shadowed state is reported as `healthy`.
3. For Claude, `runtime-checks status` reports `effective: enabled` (plugin enablement is the
   consent) and the installer removes any Claude runtime-check receipt, but the generated
   SessionStart check emits `AGDF runtime facts` only with such a receipt. Claude sessions therefore
   never receive runtime facts while the status claims they are enabled.
4. The install transaction treats a failure after the marketplace commit (for example a Windows
   `EBUSY`/`EPERM` while removing the backup) like a pre-commit failure: it uninstalls and
   reinstalls the plugin, records a filesystem rollback as `restored` although nothing was restored,
   and reports the install as failed although the new state is committed.
5. The marketplace location is one that packaged apps virtualize, so processes inside and outside
   Claude Desktop can see different marketplaces at the same logical path.
6. Every install uninstalls and reinstalls `agdf@agdf`, based on the assumption that Claude Code
   serves the cached copy; for directory marketplaces Claude Code loads the plugin in place, so the
   cycle does not deliver content, leaves a window without an installed plugin and adds Windows
   locking exposure.
7. Installed state and version are read from the human-readable output of `claude plugin list`,
   which can change between Claude Code releases.

A first fix (commit `42c42850` on branch `feat/claude-install-fix`) retires stale AGDF-owned
marketplace copies in package stores after install and appends an `AGDF installation drift` notice
to the Claude SessionStart context. It was implemented before this run and is not yet reviewed.

## 2. Goal

A Claude installation either reaches the state Claude Code sessions will actually load, from a
marketplace every process sees identically, verified by content provenance, or fails or degrades
with an accurate, actionable report. The installer follows how Claude Code really loads the plugin
and reads host state in a machine-readable way. Status reporting for Claude runtime checks matches
what sessions actually receive, and post-commit problems are reported truthfully without
destructive recovery.

## Affected Users

- AGDF users installing or updating AGDF for Claude Code or Claude Desktop on Windows.
- AGDF maintainers diagnosing installations and relying on install evidence and SessionStart
  context.
- Coding agents in Claude sessions that depend on the dispatcher binding and runtime facts.
- Codex users of the shared AGDF marketplace, if its location changes.

## 3. Scope

- Baseline: review and integrate fix `42c42850` (packaged-app copy reconciliation and SessionStart
  drift notice) as part of this run.
- Packaged-app preflight: before any marketplace or data-root mutation, the Claude installer
  detects that its own process runs inside a packaged app whose `%LOCALAPPDATA%` view is
  package-private, and stops with an actionable message (install from a terminal outside that app)
  instead of writing an installation that is invisible outside the package.
- Marketplace location: the marketplace Claude Code loads AGDF from must be the same for processes
  inside and outside packaged apps. SD decides whether the marketplace moves to a location packaged
  apps do not virtualize (including migration of existing Claude and Codex registrations and of
  existing installations) or whether preflight plus reconciliation suffices.
- Loading model: the installer follows the actual Claude Code loading model for directory
  marketplaces and no longer uninstalls and reinstalls the plugin on every run; new content still
  reaches sessions on every supported loading behaviour.
- Content verification: after install, the Claude installer compares the committed source and
  runtime digests with the installation provenance of the root Claude Code loads and of the Claude
  cache entry it records; a mismatch is never reported as `healthy`.
- Machine-readable host state: installed state and version of `agdf@agdf` are read from
  machine-readable Claude Code output where the host provides it.
- Claude runtime facts: runtime-check status and SessionStart behaviour for Claude become
  consistent with the existing consent model (plugin enablement is the consent, revocation is
  `claude plugin disable agdf@agdf`, no receipt or permission rule is written).
- Post-commit failure path: failures after the marketplace commit no longer trigger uninstall,
  rollback or reinstall; they are reported as a committed, degraded result with recovery evidence,
  rollback evidence never claims a restoration that did not happen, and interrupted cleanup is
  completed by the next run.
- Automated regression tests for each item, added to the existing smoke-test chain.

## 4. Non-Goals

- Remaining review findings: `bigint` root identities, splitting `local-marketplace.js`.
- Codex, Copilot and OpenCode installer behaviour, except the migration of the shared marketplace
  registration if SD chooses to relocate the marketplace; the Copilot payload stays byte-identical.
- Reconciling package-private copies of `runtime-checks`, `mcp` or `packages` data.
- MCP server, dispatcher or gate behaviour changes; version bump or release.
- Investigating why uncommitted changes in the working tree were reset on 2026-10-15.
- Cleaning up other open runs.

## 5. Acceptance Signals

- Each scope item has an observable expected behaviour that PRD can specify without new product
  decisions; the marketplace location decision is explicitly assigned to SD.
- An install started inside a packaged app stops before mutation with a message naming the cause
  and the remedy; an install outside a package is unaffected.
- After an install from a normal terminal, a new Claude Desktop session and a terminal Claude Code
  session load the same AGDF state.
- A repeated install with unchanged content performs no uninstall and no reinstall; changed content
  reaches new sessions.
- A post-install digest mismatch yields a non-healthy result with evidence naming both digests.
- Installed state and version are determined from machine-readable host output where available,
  with defined behaviour where it is not.
- A Claude session with the plugin enabled receives the runtime facts that `runtime-checks status`
  promises, or status no longer claims more than sessions receive.
- A simulated post-commit cleanup failure leaves the new state installed, reports it as degraded
  with recovery evidence, records no false `restored`, and the next run completes the cleanup.
- If the marketplace is relocated, existing Claude and Codex installations migrate without manual
  steps and uninstall removes or reports the new location correctly.
- Fix `42c42850` passes review; existing targeted suites and the smoke-test chain stay green;
  native confirmation on Windows with Claude Desktop is possible.

## 6. Existing Source Of Truth

- `packages/cli/scripts/install-local-plugin.js` (local install entry, `npm run install:claude`).
- `packages/cli/lib/host-adapters/claude/plugin.js` (Claude install sequence, reinstall cycle,
  recovery) and `packages/cli/lib/host-adapters/claude/uninstall.js`.
- `packages/cli/lib/installers/local-marketplace.js` (marketplace location, transaction, ownership,
  digests, Codex MCP path rendering).
- `packages/cli/lib/installers/plugin-command.js` (plugin list parsing, rollback and evidence).
- `packages/cli/lib/host-adapters/codex/` (Codex registration of the shared marketplace).
- `packages/cli/lib/host-adapters/claude/runtime-check.js` and
  `packages/cli/lib/runtime-check-consent/service.js` (Claude consent model: plugin enablement).
- `scripts/sync-plugin-runtime.js` (generated `agdf-session-check.js`, runtime facts gate).
- Fix `42c42850`: `packages/cli/lib/installers/packaged-app-marketplace.js`,
  `packages/core/lib/runtime/host-installation.js`,
  `packages/cli/scripts/claude-packaged-app-copy-test.js`.
- Tests: `runtime-check-consent-test.js`, `runtime-integrity-layout-test.js`, `lifecycle-test.js`,
  `local-marketplace-test.js`, `claude-cache-recovery-test.js`; native probes
  `scripts/native-probes/claude-host-e2e.mjs` and the Codex plugin MCP probe.

## 7. Risks And Unknowns

- Reliable packaged-app detection from inside the package when no private copy exists yet; the
  identity comparison used by `42c42850` only works once a copy exists. SD must choose a signal.
- Which root Claude Code loads (in-place marketplace versus cache copy) may depend on the Claude
  Code version; loading model, verification and the drift notice must not assume one behaviour.
- Without the reinstall cycle, the Claude cache entry may keep older provenance; the drift notice
  of `42c42850` compares against it and could report false drift. SD must reconcile both.
- Relocating the marketplace touches Codex (absolute MCP paths, registration), uninstall and every
  existing installation; a target location must not be virtualized by packaged apps and must not
  intrude into host-owned directories.
- Whether the supported Claude Code versions offer machine-readable plugin listing.
- Emitting runtime facts for Claude runs the repository check at every session start; cost and
  disclosure must stay within the existing consent disclosure.
- Windows file-locking behaviour during commit cleanup with running Claude sessions.
- Fix `42c42850` was written before this run and must be treated as an unreviewed candidate.
- Local tests cannot prove MSIX virtualization; native Windows confirmation is needed.

## 8. Next Step

Review this UR and approve only with:

`Approval: UR`

## AGDF Approval Summary (de; source=en)

Problem: Unter Windows liefen Claude-Desktop-Sessions mit einem AGDF-Stand vom 08.10., obwohl am 15.10. ein neuerer Stand 0.14.5 installiert wurde. Claude Desktop ist eine MSIX-App: Schreibzugriffe unter %LOCALAPPDATA% landen für die App und alle von ihr gestarteten Prozesse in einer privaten Kopie, und Claude Code lädt das Plugin direkt aus dem Marketplace-Ordner, der genau dort liegt. Ein erster Fix (Commit 42c42850 auf feat/claude-install-fix) räumt veraltete Paketkopien auf und meldet Abweichungen beim Session-Start; er entstand vor diesem Run und ist noch nicht geprüft. Die Prüfung des Installers ergab sieben Mängel:
- Kein Vorab-Check gegen eine Installation aus einem App-Paket.
- Prüfung nach der Installation nur über die Versionsnummer.
- Widersprüchliche Runtime-Facts für Claude: Status „enabled“, aber die Session erhält nie Facts.
- Ein Fehlerpfad nach dem Commit, der deinstalliert, eine nicht erfolgte Wiederherstellung meldet und die Installation als gescheitert meldet.
- Ein Marketplace-Ort, den App-Pakete umleiten.
- Deinstallieren und Neuinstallieren bei jedem Lauf auf Basis einer falschen Annahme über das Ladeverhalten.
- Lesen von claude plugin list als Freitext.

Ziel: Eine Claude-Installation erreicht nachweislich den Stand, den Sessions tatsächlich laden, aus einem Marketplace, den alle Prozesse gleich sehen, oder bricht mit einer zutreffenden, umsetzbaren Meldung ab beziehungsweise meldet sich als eingeschränkt. Der Installer folgt dem tatsächlichen Ladeverhalten von Claude Code und liest den Host-Zustand maschinenlesbar. Der Runtime-Check-Status für Claude entspricht dem, was Sessions erhalten. Probleme nach dem Commit werden wahrheitsgemäß gemeldet, ohne zerstörerische Wiederherstellung.

Betroffene: AGDF-Nutzer, die AGDF für Claude Code oder Claude Desktop unter Windows installieren oder aktualisieren; Maintainer, die Installationen diagnostizieren; Coding-Agenten in Claude-Sessions, die Dispatcher-Bindung und Runtime-Facts nutzen; Codex-Nutzer des gemeinsamen Marketplace, falls sich sein Ort ändert.

Umfang:
- Fix 42c42850 prüfen und übernehmen.
- Vorab-Check: Läuft der Installer in einem App-Paket, bricht er vor jeder Änderung mit Hinweis auf eine Installation aus einem normalen Terminal ab.
- Marketplace-Ort: Prozesse innerhalb und außerhalb von App-Paketen müssen denselben Marketplace sehen. Das SD entscheidet zwischen Verlegen an einen nicht umgeleiteten Ort (mit Migration bestehender Claude- und Codex-Registrierungen und Installationen) und Vorab-Check plus Aufräumen.
- Ladeverhalten: Der Installer folgt dem tatsächlichen Laden direkt aus dem Marketplace-Ordner und deinstalliert und installiert nicht mehr bei jedem Lauf; neue Inhalte erreichen Sessions bei jedem unterstützten Ladeverhalten.
- Inhaltsprüfung: Nach der Installation werden Source- und Runtime-Digest mit der Herkunftsangabe des geladenen Verzeichnisses und des Claude-Caches verglichen; eine Abweichung gilt nie als „healthy“.
- Maschinenlesbarer Host-Zustand: Installationsstatus und Version von agdf@agdf werden aus maschinenlesbarer Ausgabe von Claude Code gelesen, wo der Host sie anbietet.
- Runtime-Facts: Status und Session-Start-Verhalten für Claude werden mit dem bestehenden Consent-Modell in Einklang gebracht (Plugin-Aktivierung ist der Consent, Widerruf über claude plugin disable agdf@agdf, kein Receipt, keine Permission-Regel).
- Fehlerpfad nach dem Commit: kein Deinstallieren, Zurückrollen oder Neuinstallieren mehr, sondern ein eingeschränktes Ergebnis mit Recovery-Nachweis; keine falsche Meldung „restored“; der nächste Lauf schließt das Aufräumen ab.
- Für jeden Punkt automatisierte Regressionstests in der smoke-test-Kette.

Grenzen: Nicht enthalten sind bigint für Datei-IDs und die Aufteilung von local-marketplace.js; Änderungen an den Installern für Codex, Copilot und OpenCode, außer der Migration der gemeinsamen Marketplace-Registrierung, falls das SD das Verlegen wählt (die Copilot-Payload bleibt byte-gleich); das Abgleichen privater Kopien von runtime-checks, mcp und packages; Änderungen an MCP-Server, Dispatcher oder Gates; Versionssprung oder Release; die Klärung des Zurücksetzens vom 15.10.; andere offene Runs.

Erfolg:
- Jeder Punkt hat ein beobachtbares Sollverhalten ohne neue Produktentscheidung; die Entscheidung über den Marketplace-Ort liegt ausdrücklich beim SD.
- Eine Installation aus einem App-Paket stoppt vor jeder Änderung mit Ursache und Abhilfe; außerhalb eines Pakets ändert sich nichts.
- Nach einer Installation aus einem normalen Terminal laden eine neue Claude-Desktop-Session und eine Claude-Code-Session im Terminal denselben AGDF-Stand.
- Eine erneute Installation mit unverändertem Inhalt deinstalliert und installiert nichts; geänderter Inhalt erreicht neue Sessions.
- Eine Digest-Abweichung ergibt ein nicht gesundes Ergebnis mit beiden Digests als Nachweis.
- Installationsstatus und Version kommen aus maschinenlesbarer Host-Ausgabe, wo verfügbar, mit definiertem Verhalten, wo nicht.
- Eine Claude-Session mit aktiviertem Plugin erhält die versprochenen Runtime-Facts, oder der Status verspricht nicht mehr, als Sessions erhalten.
- Ein simulierter Fehler beim Aufräumen nach dem Commit lässt den neuen Stand installiert, meldet ihn als eingeschränkt, enthält kein falsches „restored“, und der nächste Lauf räumt auf.
- Wird der Marketplace verlegt, migrieren bestehende Claude- und Codex-Installationen ohne Handarbeit, und die Deinstallation entfernt oder meldet den neuen Ort korrekt.
- Fix 42c42850 besteht die Prüfung; bestehende Testsuiten und die smoke-test-Kette bleiben grün; eine native Bestätigung unter Windows mit Claude Desktop ist möglich.

Quellen: install-local-plugin.js, host-adapters/claude/plugin.js und uninstall.js, local-marketplace.js, plugin-command.js, die Codex-Host-Adapter für den gemeinsamen Marketplace, die Claude-Consent-Module runtime-check.js und service.js, scripts/sync-plugin-runtime.js, die Dateien des Fixes 42c42850 sowie die bestehenden Tests und die nativen Proben für Claude und Codex.

Risiken und Unbekanntes:
- Zuverlässige Paketerkennung von innen, solange noch keine private Kopie existiert; das SD muss ein Signal wählen.
- Welches Verzeichnis Claude Code lädt, kann von der Claude-Code-Version abhängen; Ladeverhalten, Prüfung und Drift-Meldung dürfen kein bestimmtes Verhalten voraussetzen.
- Ohne Neuinstallation kann der Claude-Cache eine ältere Herkunftsangabe behalten; die Drift-Meldung aus 42c42850 vergleicht damit und könnte fälschlich anschlagen. Das SD muss beides abstimmen.
- Ein Verlegen des Marketplace betrifft Codex (absolute MCP-Pfade, Registrierung), die Deinstallation und alle bestehenden Installationen; der neue Ort darf weder von App-Paketen umgeleitet werden noch in Host-eigene Verzeichnisse eingreifen.
- Ob die unterstützten Claude-Code-Versionen eine maschinenlesbare Plugin-Liste bieten, ist offen.
- Runtime-Facts für Claude führen bei jedem Session-Start die Repository-Prüfung aus; Aufwand und Offenlegung müssen im bestehenden Consent-Rahmen bleiben.
- Windows-Dateisperren beim Aufräumen nach dem Commit.
- Der Fix 42c42850 gilt als ungeprüfter Kandidat.
- Lokale Tests können die MSIX-Virtualisierung nicht beweisen; eine native Bestätigung unter Windows ist nötig.
- Keine offene fachliche Anforderungsentscheidung.

Nächster Schritt: UR prüfen und freigeben; danach folgen Brownfield Review und die bestehende Mode-/Slice-Entscheidung.
