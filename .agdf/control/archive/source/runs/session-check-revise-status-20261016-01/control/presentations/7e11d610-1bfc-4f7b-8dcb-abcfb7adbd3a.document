# UR: Report doctor status revise in session runtime facts

Status: draft
Gate: UR
Gate approval: open
Requirements clarification: complete
Date: 2026-10-16
Owner: Arndt Gold

## 1. Problem

The generated AGDF session check runs `doctor --all-active --json` at session start and reports its
status as `automatic_check.status` in the `AGDF runtime facts`. The allow-list in the session-check
template (`scripts/sync-plugin-runtime.js`, `supportedStatuses`) does not contain `revise`, so a
repository whose doctor status is `revise` is reported as `unknown`. This affects every surface that
receives runtime facts (Claude, Codex, OpenCode, Copilot); the list is unchanged since commit `89e87cbf`.

Observed on 2026-10-16 in this repository: `doctor --all-active --json` returns `revise`
(79 findings: 0 block, 3 revise, 76 warn), while Claude sessions show `automatic_check.status: "unknown"`.

`doctor` can return exactly four statuses:

- single run (`packages/core/lib/control-evaluation/doctor.js`): the highest finding severity,
  `block`, `revise`, `warn` or `pass`;
- `--all-active`: `block` for invalid run entries, otherwise the aggregate
  (`packages/core/lib/control-state/aggregate.js`) ranked `pass < warn < revise < block`; without any
  active run and without `allow_no_active_runs: true` the aggregate is `revise`.

The list also contains `blocked`, `error`, `failed` and `unknown`, which `doctor` never returns.

## 2. Goal

A session started in a repository whose doctor status is `revise` shows
`automatic_check.status: "revise"`; every doctor status is passed through unchanged, and only
unexpected values fall back to `unknown`.

## Affected Users

AGDF users and agents in Claude, Codex, OpenCode and Copilot sessions who rely on the session runtime
facts to judge repository health.

## 3. Scope

- Set the allow-list in the session-check template to exactly the statuses `doctor` returns:
  `pass`, `warn`, `revise`, `block`. Any other value stays `unknown`; unparseable output stays
  `unavailable`; no repository stays `skipped`.
- Regenerate the derived runtime projections.
- Add a regression test that runs the generated session check against a fixture repository whose
  doctor status is `revise` and expects `automatic_check.status: "revise"`; tighten the existing
  `["block", "blocked"]` expectation to `block`.

## 4. Non-Goals

- Changing `doctor`, its severities or its aggregation.
- Changing the shape of the runtime facts or the `sessionStartBase` footprint (1912 bytes).
- Raising the Copilot payload budget (260 files / 2256982 bytes): the shorter list reduces the
  Copilot payload, so the budget is kept as is.
- Reinstalling the plugin from inside Claude Desktop.

## 5. Acceptance Signals

- The generated session check reports `revise` for a fixture repository with doctor status `revise`,
  and `block` for the existing blocked fixture.
- Running the regenerated session check against this repository reports
  `automatic_check.status: "revise"`.
- Copilot payload stays within 260 files / 2256982 bytes; the `sessionStartBase` budget is unchanged.
- Affected suites pass, including runtime integrity, instruction footprint, Copilot profile and the
  host-compatibility check.

## 6. Existing Source Of Truth

- `scripts/sync-plugin-runtime.js` (session-check template, shared by all surfaces).
- `packages/core/lib/control-evaluation/doctor.js` and `packages/core/lib/control-state/aggregate.js`
  (doctor status contract).
- `packages/cli/scripts/repository-control-startup-test.js` (runs the generated session check against
  fixture repositories).
- `plugins/agdf/meta/copilot-payload-baseline.json` and `plugins/agdf/meta/agdf-plugin.definition.json`
  (payload and footprint budgets).

## 7. Risks And Unknowns

- The Copilot session check is no longer byte-identical to the previous build; it only shrinks, so
  the payload budget holds. If byte identity is required instead, the alternative is to add only
  `revise` (+10 bytes) and raise the Copilot baseline deliberately.
- Regenerated plugin digests may require re-recording host-compatibility evidence.
- A native check in a new Claude session needs a reinstall from a terminal outside Claude Desktop;
  this run verifies with the regenerated session check directly.

## 8. Next Step

Review this UR and approve only with:

`Approval: UR`

## AGDF Approval Summary (de; source=en)

Problem: Der generierte Session-Check führt beim Sitzungsstart `doctor --all-active --json` aus und meldet dessen Status als `automatic_check.status` in den AGDF-Runtime-Facts. In der Positivliste des Templates (`scripts/sync-plugin-runtime.js`, `supportedStatuses`) fehlt `revise`. Deshalb erscheint ein Repo mit doctor-Status `revise` als `unknown`, und zwar auf allen Surfaces (Claude, Codex, OpenCode, Copilot); die Liste ist seit Commit 89e87cbf unverändert. Beobachtet am 16.10. in diesem Repo: doctor meldet `revise` (79 Findings: 0 block, 3 revise, 76 warn), Claude-Sitzungen zeigen `unknown`. doctor kann genau vier Status liefern: `pass`, `warn`, `revise` und `block`. Das gilt für einzelne Runs (höchste Severity) wie für `--all-active` (Aggregat, ohne aktiven Run und ohne `allow_no_active_runs` ebenfalls `revise`). Die Werte `blocked`, `error`, `failed` und `unknown` in der Liste liefert doctor nie.

Ziel: Eine Sitzung in einem Repo mit doctor-Status `revise` zeigt `automatic_check.status: "revise"`. Jeder doctor-Status wird unverändert durchgereicht, nur unerwartete Werte werden zu `unknown`.

Betroffene: AGDF-Nutzer und Agenten in Claude-, Codex-, OpenCode- und Copilot-Sitzungen, die den Repo-Zustand an den Runtime-Facts ablesen.

Umfang: Die Positivliste im Template wird exakt auf die doctor-Status `pass`, `warn`, `revise` und `block` gesetzt. Andere Werte bleiben `unknown`, unlesbare Ausgabe bleibt `unavailable`, ohne Repo bleibt es bei `skipped`. Die abgeleiteten Runtime-Projektionen werden neu generiert. Ein Regressionstest startet den generierten Session-Check gegen ein Fixture-Repo mit doctor-Status `revise` und erwartet `revise`. Die bestehende Erwartung `["block", "blocked"]` wird auf `block` geschärft.

Grenzen: Keine Änderung an doctor, an dessen Severities oder an der Aggregation. Form der Runtime-Facts und `sessionStartBase`-Footprint (1912 Bytes) bleiben unverändert. Das Copilot-Payload-Budget (260 Dateien / 2256982 Bytes) wird nicht angehoben, weil die kürzere Liste den Copilot-Payload verkleinert. Keine Neuinstallation des Plugins aus Claude Desktop heraus.

Erfolg: Der generierte Session-Check meldet `revise` für das Fixture-Repo mit Status `revise` und `block` für das bestehende blockierte Fixture. Gegen dieses Repo meldet der neu generierte Session-Check `automatic_check.status: "revise"`. Der Copilot-Payload bleibt innerhalb von 260 Dateien / 2256982 Bytes, das `sessionStartBase`-Budget ist unverändert. Die betroffenen Suiten sind grün, darunter Runtime-Integrität, Instruction-Footprint, Copilot-Profil und der Host-Kompatibilitäts-Check.

Quellen: `scripts/sync-plugin-runtime.js` (Session-Check-Template für alle Surfaces); `doctor.js` und `aggregate.js` (doctor-Statusvertrag); `packages/cli/scripts/repository-control-startup-test.js` (startet den generierten Session-Check gegen Fixture-Repos); `copilot-payload-baseline.json` und `agdf-plugin.definition.json` (Budgets).

Risiken: Der Copilot-Session-Check ist nicht mehr byte-gleich zum bisherigen Build. Er wird nur kürzer, das Budget hält also. Wird Byte-Gleichheit verlangt, wäre die Alternative, nur `revise` zu ergänzen (+10 Bytes) und die Copilot-Baseline bewusst anzuheben. Durch geänderte Plugin-Digests müssen eventuell die Host-Kompatibilitätsbelege neu erfasst werden. Eine native Prüfung in einer neuen Claude-Sitzung braucht eine Neuinstallation aus einem Terminal außerhalb von Claude Desktop; dieser Run prüft direkt mit dem neu generierten Session-Check.

Nächster Schritt: UR prüfen und freigeben, danach folgt der Brownfield Review mit der Wahl des Lieferwegs.
