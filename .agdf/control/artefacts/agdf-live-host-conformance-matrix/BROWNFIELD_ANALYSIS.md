# Brownfield Analysis: AGDF Live Host Conformance Matrix

Status: done
Mode: `pre_implementation_analysis`
Decision: `pass`
Mode/Slice Decision: `structured_slice`
Required next gate: none
Date: 2026-07-28
Owner: agent

## Scope

Geprüft wurde der konkrete Ausführungspfad für LHT-02 bis LHT-10: run-eigene Evidenzartefakte,
synthetische Wegwerfziele und begrenzte direkte Beobachtungen auf Codex, Claude Code und OpenCode.
Runtime-, Plugin-, Contract-, Skill-, Adapter-, Installations-, Authentifizierungs- und
Konfigurationsänderungen bleiben ausgeschlossen.

## Evidence

- version-matched AGDF-Validator `0.11.4`; Child- und Parent-Doctor vor TP-Freigabe jeweils
  `pass` mit 0 Findings;
- Codex CLI `0.145.0` unter `<user-npm-bin>/codex`;
- Claude Code `2.1.193` unter `/usr/local/bin/claude`;
- OpenCode `1.18.3` unter `<user-npm-bin>/opencode`;
- redigierter Auth-Preflight: Codex meldet authentifizierten Zustand; Claude Code meldet
  `loggedIn: false`;
- OpenCode-Preflight `opencode_evaluator_ready`: Agent `agdf-evaluator`, `--pure`-Pfad und
  terminale Deny-Permissions für ausführbare Werkzeuge sind vorhanden; Provider-Verfügbarkeit
  bleibt bis zum begrenzten Modellaufruf unbewiesen;
- bestehende technische Owner:
  `create-agdf/lib/delivery-path-search/evaluators/codex.js`,
  `create-agdf/lib/delivery-path-search/evaluators/claude.js`,
  `create-agdf/lib/delivery-path-search/evaluators/opencode.js` und
  `create-agdf/lib/delivery-path-search/transports/read-only-guard.js`;
- aktueller Worktree enthält die bekannten Parent-/Child-Control-Artefakte, aber keine durch
  diesen Child-Run erzeugte Runtime-/Plugin-Änderung.

## Current Coverage

| Bereich | Status | Grenze |
|---|---|---|
| Run-/Gate-/Artefakt-Semantik | `partially_done` | Repository- und aktuelle Codex-Interaktion liefern Baseline, aber noch keine 36 Host-/Fall-Zeilen |
| Codex Headless | `partially_done` | authentifiziert; vorhandener `--sandbox read-only --ephemeral --ignore-user-config`-Pfad wiederverwendbar |
| Claude Code Headless | `not_done` | technisch mit `--disallowedTools Edit,Write,Bash` vorbereitet, aktuell nicht authentifiziert |
| OpenCode Headless | `partially_done` | technischer Preflight bestanden; Provider-/Modellaufruf noch nicht bestätigt |
| Interaktive Attachment-/Restart-Claims | `not_done` | keine sichere automatische UI-/Restart-Session bestätigt |
| Matrix und Bericht | `not_done` | run-eigene Artefakte noch nicht erstellt |

## Reuse Strategy

- `extend`: bestehende Contract-, Test- und Run-Evidenz nur als Erwartungsbaseline verlinken;
- `reuse`: vorhandene tool-enforced Headless-Invocation- und Mutation-Guard-Muster für begrenzte
  Einmalaufrufe übernehmen;
- `new`: ausschließlich run-eigene Schema-, Matrix-, Report- und redigierte Evidenzartefakte;
- kein persistiertes Harness, kein neuer Capability-Owner und keine zweite Gate-/Host-Policy.

## Minimal Clean Implementation

1. Schema und 36 leere Host-/Fall-Slots als Child-Artefakte erstellen.
2. Synthetische Wegwerf-Workspaces außerhalb des Repositorys verwenden.
3. Pro Host zuerst nur sichere, redigierte Preflights und begrenzte Headless-Beobachtungen
   ausführen.
4. Claude Code aktuell ohne Loginversuch fallweise `host_unavailable` klassifizieren.
5. OpenCode bei Provider-/Auth-Fehler ohne Retry oder Konfigurationsänderung
   `host_unavailable` klassifizieren.
6. UI-, Attachment- und Restart-Claims ohne nachweislich isolierten interaktiven Pfad nicht
   simulieren, sondern `host_unavailable` oder `limitation` vergeben.
7. Produktabweichungen nur routen; keine Reparatur im Child-Run.

## Regression And Side Effects

- keine Produkt- oder Laufzeitdatei darf verändert werden;
- `git status --porcelain` wird vor und nach jedem read-only Host-Aufruf verglichen;
- temporäre Dateien liegen ausschließlich in einem mit `mktemp -d` erzeugten Wegwerfverzeichnis;
- vollständige Modellantworten und Auth-Ausgaben werden nicht als Evidenz persistiert;
- Timeouts, Auth-/Provider-Fehler und unerwartete Mutation stoppen die jeweilige Host-Serie;
- die bestehenden Parent-/Child-Control-Diffs werden als bekannte Baseline behandelt und nicht
  überschrieben.

## Parallel-Structure And SoT Check

Kein Parallel-Owner erforderlich. `OBSERVATION_SCHEMA.json` validiert nur diesen Lauf und ist nicht
normativ. AGDF-Contracts bleiben Erwartungsquelle; `HOST_CONFORMANCE_MATRIX.json` ist
Beobachtungsevidenz. Produktsemantik-Drift wird als `product_gap` an den bestehenden Owner geroutet.

## UI/Visible Ownership

Native Entscheidungsdarstellung, Attachment-Verfügbarkeit und Restart-Wahrnehmung bleiben Eigentum
des jeweiligen Hosts und des bestehenden Interaction Contracts. Headless-Ausgabe wird nicht zum
UI-Nachweis hochgestuft.

## Context Graph Impact

- context_graph_impact: `link_only`
- refs: `CG-TASK-TARGET-AUTHORITY`; `CG-NATIVE-INTERACTION-AUTHORITY`;
  `CG-DELIVERY-PATH-SEARCH`; `CG-RUN-SCOPED-CONTROL-STATE`
- keine neue Architekturautorität und kein automatischer neuer Knoten.

## Risks

- OpenCode kann trotz bestandenem technischen Preflight keinen authentifizierten Provider besitzen;
- Claude Code bleibt ohne Nutzerlogin nicht ausführbar;
- aktuelle Codex-Interaktion ist direkt beobachtbar, aber kein Ersatz für fremde Host-UIs;
- interaktive Fälle können als `host_unavailable` enden;
- rohe Host-Ausgabe könnte private Daten enthalten und darf deshalb nicht persistiert werden.

## Missing Evidence

- erster begrenzter OpenCode-Modellaufruf;
- direkte Fallbeobachtungen und Mutation-Guards;
- sicher isolierbare interaktive Hostpfade für HC-05 und HC-08;
- 36 validierte Matrixzeilen und Berichtsmatrix-Parität.

## Required Next Step

LHT-02 bis LHT-05 ausführen. Host-Serien strikt nach den dokumentierten Stop-Bedingungen behandeln.
