# Clean Implementation Review: Geführte MCP-Aktivierung während der AGDF-Installation

- revision: 4
- date: 2026-09-09
- based_on: approved SD Revision 2, approved TP Revision 2, Brownfield Analysis Revision 2, CD+Tests Revision 5 and Task Plan Review Revision 4
- decision: `pass`
- authorizes: `false`

## Clean Implementation Review

- decision: `pass`
- primary_solution: Der bestehende Setup-Service wurde an seinen eigenen Vertrags-, Interaktions- und Präsentationsgrenzen um einen Dual-Scope-Preflight und eine zweite Auswahl erweitert. Der lokale Wrapper transportiert ausschließlich ein vor Vorbereitung validiertes Aufrufverzeichnis. Native Registrierung, Priorität, Paketbezug, Rollback und Hostmutation bleiben beim vorhandenen MCP-Lifecycle und seinen Host-Adaptern.
- evidence: `install-setup/contract.js`, `interaction.js`, `presentation.js` und `service.js`; Parser- und Application-Verdrahtung; `resolveLocalInvocationDirectory`; Fokus-Suiten; vollständiger serieller Smoke; Context-Graph-Reconciliation.
- fallbacks_retained: Nichtinteraktiv bleibt der ausdrücklich geplante Project-Default für `--with-mcp`. Fehlt `INIT_CWD`, verwendet der lokale Wrapper das vorhandene `process.cwd()` nach derselben strengen Validierung. Gültige nicht unterstützte Sprache fällt über den bestehenden kanonischen Locale-Owner vollständig auf Englisch zurück. Alle drei Regeln sind freigegebene Produkt- oder Designentscheidungen mit Tests und keine Fehlerkaschierung.
- workaround_or_shim_risk: niedrig. Der Wrapper interpretiert keine Setup-Auswahl und baut keine zweite Scope- oder Prioritätslogik auf. Die WeakMap hält die vollständigen read-only MCP-Reports nur intern zwischen Preflight und Ausführung und erzeugt keinen persistierten Zustand.
- parallel_structure_risk: none. Es entstand kein zweiter MCP-Adapter, Paketowner, Consent-Owner, Locale-Owner, Workflowzustand oder Governance-Owner.
- brownfield_fit: `pass`. Abhängigkeitsrichtung und Mutationsgrenzen entsprechen Brownfield Analysis Revision 2 und SD Revision 2.
- missing_evidence: direkte geladene Hostreise, native Windows-Ausführung und menschliche UAT. Diese Spuren begrenzen Supportaussagen, nicht die Integrität der Repositorylösung.
- required_next_step: Code Review auf dem tatsächlichen Diff durchführen und die verbleibenden Evidenzgrenzen an QA übergeben.

## Integritätsprüfung

| Frage | Ergebnis | Evidenz |
|---|---|---|
| Root Cause behoben | pass | Das falsche lokale Ziel wird vor Generierung an der Wrappergrenze korrigiert; Scope wird nicht mehr still im Service gesetzt. |
| Ein kanonischer Owner | pass | Setup komponiert, MCP-Lifecycle entscheidet native Zustände, Locale-Registry liefert Text, Parser transportiert Kontext. |
| Keine stille Parallelstruktur | pass | Kein zweites Hostprofil, keine zweite Registry, keine neue Persistenz und keine eigene Prioritätstabelle im Setup-Service. |
| Fallbacks begrenzt | pass | `process.cwd()` nur bei fehlendem `INIT_CWD`; Englisch nur für gültige nicht unterstützte Sprache; beide geschlossen getestet. |
| Async-Pfad entscheidet keine Produktregel neu | pass | `runInstallSetup` konsumiert bereits validierte Entscheidungen und Adapterzustände; Prompt und Parser bleiben injizierbar. |
| Entfernung und Rollback unverändert sicher | pass | Bestehende Lifecycle-Matrizen bestehen im seriellen Smoke. |

Es gibt kein normalisiertes offenes Finding.

Clean Review: pass — die Revision erweitert vorhandene Owner ohne zweite Zustands-, Prioritäts- oder Mutationsarchitektur.
