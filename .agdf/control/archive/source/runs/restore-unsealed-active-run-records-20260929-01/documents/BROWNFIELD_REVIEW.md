# Brownfield Review: Ungesiegelte aktive AGDF-Runs sicher wiederherstellen

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: `done`

## Run

- run_id: restore-unsealed-active-run-records-20260929-01
- related_ur: .agdf/control/artefacts/restore-unsealed-active-run-records-20260929-01/UR.md
- current_gate: Brownfield Review
- reviewer: agent
- reviewed_at: 2026-09-29

## Objective

Die 23 aktiven kanonischen Runs mit `AGDF_RUN_SEAL_INVALID` sicher einordnen, die vorhandenen Wiederherstellungs- und Migrations-Eigentümer prüfen und einen Lieferweg wählen, der keine nicht belegten Freigaben nachträglich als gültig behandelt.

## UI / UX Impact Routing

- delivery_context: `brownfield`
- ui_ux_impact: `none`
- ui_ux_impact_reason: Dieser Run betrifft persistierte Run-Control-Daten und ihre Lifecycle-Validierung. Die vorhandenen Gate- und Status-Präsentationen werden nicht geändert. Eine nutzerseitige MCP-Erweiterung ist als separates Vorhaben besprochen und gehört nicht zu dieser UR.
- ux_intent_definition_required: `no`
- ux_intent_definition_result: `not_applicable`

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | `plugin/meta/contracts/modes.md`; `plugin/meta/contracts/gate-transition.md` | Ein Siegel schützt Inhalt und Approval-Zeilen; es ist laut `run-seal.js` keine Signatur und belegt nicht rückwirkend die Herkunft einer früheren Freigabe. Die Regeln für ungesiegelte kanonische Runs sind offen. | `high` |
| Source of truth | `.agdf/control/runs/<run_id>/RUN_STATE.md`; `.agdf/control/CONTEXT_GRAPH.md` (`CG-RUN-SCOPED-CONTROL-STATE`) | Jeder der 23 Befunde zeigt auf einen eigenen aktiven, version-2 Run State. Der Context-Graph verlangt isolierte Run-Autorität und ausdrücklich keine automatische Migration. | `high` |
| Runtime path | `create-agdf/lib/control-state/run-seal.js`; `run-state-writer.js`; `legacy-migration.js`; `create-agdf/lib/cli/command-registry.js` | `run-update` lehnt `unsealed` und `invalid` ab. `run-migrate` liest nur die alte einzelne `.agdf/control/AGDF_RUN.md` ein; es migriert keine vorhandenen kanonischen Run-Verzeichnisse. | `high` |
| UI / UX | Bestehende Run Status Card und `run-present` | Für diese UR sind keine Änderungen an Karten, Freigabetexten oder einer MCP-Nutzeroberfläche vorgesehen. | `none` |
| Persistence / data | 23 aktive Run-Verzeichnisse unter `.agdf/control/runs/` | Alle 23 aktuellen Run-State-Dateien sind getrackt. Die Git-Historie über bekannte Refs enthält für keine davon eine Version mit beiden Siegelzeilen. | `high` |
| Tests / QA | `create-agdf/scripts/control-state-test.js`; `lifecycle-test.js`; `run-revision-test.js`; `run-step-transaction-test.js`; `run-lock-test.js` | Diese Suiten sind die vorhandenen Eigentümer für Run-State, Lifecycle, Revisionen, atomare Schritte und Locks. Ein Recovery-Pfad für bereits kanonische, ungesiegelte aktive Runs ist durch die geprüften Befehle nicht belegt. | `high` |
| Release / operations | lokaler `create-agdf` CLI- und MCP-Payload | Eine Änderung am Recovery-Vertrag würde die ausgelieferte Validator- und Lifecycle-Oberfläche betreffen; Paket-, Host- und Release-Artefakte sind in dieser UR nicht enthalten. | `medium` |

## Architecture Impact

- architecture_relevance: `relevant`
- architecture_impact: `high`
- architecture_reason: Die gefundene Lücke betrifft die Autorität über bestehende persistierte Gate-Freigaben und eine fehlende, sichere Migration für kanonische Run States. Ein Wiederherstellungsweg berührt Siegelberechnung, Schreibschutz, Approval-Historie, Rollback und den öffentlichen Lifecycle-Vertrag.
- architecture_evidence: `create-agdf/lib/control-state/run-seal.js` berechnet `content_seal` und `approval_seal` und hält fest, dass diese keine Signaturen sind. `run-state-writer.js` verweigert `unsealed`/`invalid`. `legacy-migration.js` akzeptiert nur `.agdf/control/AGDF_RUN.md` als Legacy-Quelle. `command-registry.js` deklariert `run-migrate`, aber keinen Recovery-Befehl für kanonische Run-Verzeichnisse. Die 23 Git-Verläufe enthalten jeweils keinen Commit mit beiden Siegelzeilen.
- architecture_missing_evidence: Die Herkunft und Verlässlichkeit der gespeicherten Approval-Zeilen ohne Siegel ist für keinen der 23 Runs durch den geprüften Repository-Verlauf als gesiegelte Revision belegt.
- architecture_next_owner_and_action: PRD-Eigentümer klärt, welche historische Evidenz für eine Migration genügt, wie nicht belegte Approval-Zeilen behandelt werden und wie Vorschau, Wiederherstellung und Rollback pro Run funktionieren.

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| problem — Es gibt keinen vorhandenen Lifecycle-Pfad für diese kanonischen ungesiegelten Runs. | `run-state-writer.js` lehnt sie ab; `legacy-migration.js` verarbeitet nur die alte einzelne `AGDF_RUN.md`. | Manuelles Anfügen von Siegeln oder ein zweites Ad-hoc-Skript könnte unbestätigte Approval-Zeilen als gültigen Stand festschreiben und einen parallelen Schreibpfad schaffen. | PRD soll den Recovery-Vertrag entscheiden; SD soll genau einen bestehenden Control-State-Eigentümer für Ausführung, Revision und Siegel verwenden. |
| unresolved — Die vorhandene Approval-Historie ist nicht durch ein früheres Siegel bestätigt. | 23 getrackte aktuelle Run States; Suche in `git log --all --follow` fand in keiner bekannten Revision beide Siegelzeilen. | Ein neues Siegel über den aktuellen Inhalt allein würde dessen Integrität ab jetzt festhalten, aber die frühere Approval-Herkunft nicht beweisen. | In PRD und SD festlegen, ob Approval-Zeilen pro Run entwertet, erneut bestätigt oder durch zusätzliche vertrauenswürdige Evidenz belegt werden müssen. |
| trade-off — Der vorhandene Legacy-Migrationsbefehl bleibt auf den historischen Einzel-Run begrenzt. | `legacy-migration.js` liest nur `.agdf/control/AGDF_RUN.md`; Context-Graph-Invariante CG-RUN-SCOPED-CONTROL-STATE verlangt explizite Migration und keine automatische Übernahme. | Eine Erweiterung ohne klaren Source-Typ könnte Legacy-Import und Reparatur kanonischer Run States vermischen. | Den bestehenden Legacy-Eigentümer beibehalten und PRD/SD entscheiden lassen, ob eine getrennte Recovery-Operation innerhalb derselben Control-State-Owner-Familie nötig ist. |

## Mode / Slice Decision

- decision: `structured_delivery`
- required_next_gate: `PRD`
- scope_reason: `authority_policy_security_depth`; die Wiederherstellung muss festlegen, welche früheren Freigaben als vertrauenswürdig gelten. Zusätzlich ist `persistence_migration_depth` belegt, da 23 vorhandene aktive Run States ohne unterstützten Recovery-Pfad betroffen sind.
- evidence: `run-seal.js` dokumentiert den Unterschied zwischen Integritätssiegel und Signatur; `run-state-writer.js` blockiert ungesiegelte Updates; `legacy-migration.js` beschränkt Migration auf die historische Einzeldatei; Git-Historie über bekannte Refs enthält keine gesiegelte Fassung dieser 23 Runs.
- transparency_note: Der bestehende Writer und die Siegelberechnung können wiederverwendet werden. Es fehlt jedoch eine genehmigte Regel zur Approval-Herkunft sowie eine unterstützte Migration für diese kanonischen Datensätze. PRD ist erforderlich, bevor SD oder Änderungen an Run States erfolgen.

## Structured Depth Evidence

- depth_policy_version: `1`
- depth_facts_status: `complete`
- primary_reason_code: `authority_policy_security_depth`
- decisive_full_depth_triggers: Approval-Autorität und Vertrauensgrenze (`run-seal.js` stellt ausdrücklich klar, dass das Siegel keine Signatur ist); persistierte Run-State-Migration ohne vorher gesiegelte Revision; Writer-Schutz, der Änderungen an ungesiegelten Runs zurückweist.
- rejected_alternative: `structured_slice` oder Quick Task. Es gibt keine belegte lokale, reversible Wiederherstellung; ein Script, das aktuelle Inhalte neu siegelt, würde die Approval-Herkunft nicht klären. Die Trigger beruhen auf Autoritäts- und Migrationswirkung, nicht auf der Anzahl betroffener Dateien oder Runs.
- missing_or_conflicting_facts: Für die Wahl `structured_delivery` fehlen keine entscheidenden Routing-Fakten. Die Approval-Behandlung, Evidenzschwelle, Transaktionsgrenze und Rollback-Regel sind offene PRD-Entscheidungen.
- depth_evidence_refs: `create-agdf/lib/control-state/run-seal.js`; `run-state-writer.js`; `legacy-migration.js`; `create-agdf/lib/cli/command-registry.js`; `plugin/meta/contracts/modes.md`; `.agdf/control/CONTEXT_GRAPH.md` (`CG-RUN-SCOPED-CONTROL-STATE`); die 23 aktuellen Run-State-Dateien und deren vollständige Git-Verläufe über bekannte Refs.

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | `pass` | UR verlangt einen belegten vertrauenswürdigen Stand oder einen ausdrücklich ungeklärten/Legacy-Fall für jeden betroffenen Run. |
| authority_boundary | `fail` | Der neue Recovery-Vertrag muss entscheiden, wie nicht gesiegelte Approval-Zeilen behandelt werden. |
| owner_consumer_coordination | `unknown` | Der bestehende Control-State-Writer und Legacy-Migrationsowner sind sichtbar; alle Auslieferungs- und Host-Verbraucher eines neuen Recovery-Pfads sind noch nicht inventarisiert. |
| full_depth_impacts_absent | `fail` | Persistenz-, Migration- und Approval-Autoritätsgrenzen sind direkt betroffen. |
| migration_propagation_bounded | `fail` | Kein vorhandener Pfad migriert diese kanonischen Run States; Herkunft, Batch-Verhalten und Kompensation sind noch zu entscheiden. |
| failure_recovery_local | `unknown` | Ein unterbrochener Wiederherstellungslauf und Rollback sind noch nicht spezifiziert. |
| independently_acceptable | `pass` | Akzeptanz kann pro Run nach belegter Wiederherstellung oder dokumentierter Sperre ausgewertet werden; keine Gate-Freigabe wird übertragen. |

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| Welche Historie oder externe Evidenz ist nötig, um Inhalte und Approval-Zeilen ungesiegelter kanonischer Runs zu übernehmen? | `PRD` | `block` |
| Müssen bisherige Approval-Zeilen ohne verifizierbare Herkunft erneut eingeholt oder als historische, nicht wirksame Angaben behandelt werden? | `PRD` | `block` |
| Wird pro Run migriert oder eine batchfähige Operation benötigt, und wie werden Teilerfolg, Abbruch, Wiederholung und Rollback dargestellt? | `PRD` | `revise` |
| Welche vorhandenen Control-State-Owner dürfen den Recovery-Schritt schreiben und die neue Revision versiegeln? | `SD` | `revise` |
| Welche Consumer und ausgelieferten Oberflächen müssen den neuen Recovery-Vertrag erkennen oder den Status anzeigen? | `SD` | `revise` |
| Die besprochene Vereinfachung im bestehenden MCP-Service gehört nicht zu dieser UR; soll sie in einem eigenen Vorhaben als Intake-/Reparaturfunktion geplant werden? | `none` | `warn` |

## Context Graph Impact

- context_graph_impact: `update_existing_node`
- context_graph_refs: `.agdf/control/CONTEXT_GRAPH.md#CG-RUN-SCOPED-CONTROL-STATE`
- context_graph_required_action: `update`
- context_graph_reconciliation: `open_gap`
- context_graph_gate_effect: `warning`
- context_graph_evidence: Der bestehende Invariant verlangt explizite Migration und eine kanonische Run-Autorität. Die konkrete Lücke bei ungesiegelten, bereits kanonischen Runs und die künftige Recovery-Policy müssen nach PRD/SD in diesem bestehenden Knoten dokumentiert werden.

## Next Permissible Step

- next_allowed_action: PRD für den Recovery-Vertrag ausarbeiten und die Approval-Herkunft, Migrations-Evidenz, Transaktions- und Rollback-Regeln entscheiden.
- forbidden_until_then: Run States der 23 betroffenen Runs ändern, Siegel manuell ergänzen, Freigaben übertragen oder Implementierung beginnen.

## Quality Outlook

- quality_outlook: Der Routing-Review ist abgeschlossen. Es gibt keinen aktuell unterstützten sicheren Writer-Pfad für die 23 kanonischen ungesiegelten Runs. Eine belastbare Reparatur erfordert einen genehmigten Vertrag für Vertrauensprüfung und Migration; die anschließende Implementierung benötigt gezielte Recovery-, Approval-Erhaltungs-, Unterbrechungs- und Rollback-Evidenz.

## Betroffene Runs

`agdf-copilot-plugin-integration`, `agdf-cross-host-runtime-integrity`, `agdf-guided-mcp-activation`, `agdf-host-adapter-compatibility`, `agdf-npm-package-payload-cleanup`, `agdf-plugin-family-language`, `agdf-product-maturity-roadmap`, `agdf-proportionality-benchmark`, `agdf-public-plugin-distribution`, `agdf-staged-proportionality-observation`, `claude-loaded-host-conformance-observation`, `codex-harness-conformance-slice`, `cross-surface-executable-skill-dispatcher`, `cross-surface-plugin-opt-out`, `cross-surface-skill-target-preflight`, `delivery-path-search-control-input-integrity`, `doctor-presentation-identity-parity`, `github-community-health-governance`, `installation-consent-runtime-checks`, `legacy-profile-upgrade-recovery`, `opencode-native-dispatch-tool`, `opencode-surface-hardening-parity`, `pre-decision-status-card-visibility`.
