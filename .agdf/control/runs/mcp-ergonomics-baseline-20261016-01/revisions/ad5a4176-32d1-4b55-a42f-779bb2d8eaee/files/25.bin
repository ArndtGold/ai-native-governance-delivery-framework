# UR: MCP ergonomics baseline evaluation

Status: draft
Gate: UR
Gate approval: open
Requirements clarification: complete
Date: 2026-10-16
Owner: Arndt Gold

## 1. Problem

A read-only review of the AGDF MCP interfaces (session of 2026-10-16) against the MCP specification
(revision 2026-07-28), the MCP Security Best Practices, Anthropic's "Writing effective tools for agents"
and the OWASP GenAI guide for secure MCP servers found twelve deviations. Examples: no `isError` on domain
failures, input errors mapped to "repair the runtime" or `effect_unknown`, undocumented parameters on
`agdf_inspect` and the five command tools, mixed effect classes in one tool, large responses (stored
dispatch results: median about 14 KB, p90 about 38 KB, maximum about 126 KB) and about 2 s warm dispatch
latency in one macOS performance log.

These figures come from incidental evidence files and a single failed performance run. They are not
representative. AGDF has skill evals, a proportionality benchmark and host E2E probes, but no evaluation
that measures how well agents use the AGDF MCP tools themselves. Without a baseline, the planned interface
changes (error contract, descriptions, tool split, response budget, latency) cannot be shown to improve
agent behavior, and regressions cannot be detected.

## 2. Goal

A repeatable MCP ergonomics evaluation exists and has produced a committed baseline for the current AGDF
MCP interfaces. Later phases can re-run the same evaluation unchanged and compare their results with this
baseline.

## Affected Users

- AGDF maintainers who decide on and verify MCP interface changes.
- Coding agents on Claude Code that call the AGDF MCP tools.
- Indirectly, AGDF users who experience the latency, errors and token cost of those tool calls.

## 3. Scope

- A deterministic protocol-level measurement through the existing `@modelcontextprotocol/client`
  against the locally owned AGDF MCP servers (`agdf`, and `agdf-cockpit` where its gating allows). For
  each tool and outcome it records response bytes and estimated tokens, the `isError` flag, AGDF's own
  failure outcomes (`invalid_input`, `evaluator_error`, `rejected`, `effect_unknown`), latency and tool
  definition bytes. Representative valid, invalid and boundary calls run against temporary fixture
  repositories.
- A native agent measurement on Claude Code only, on this Windows machine, with the models Opus 5.5 and
  Sonnet 5.5, over a fixed, versioned set of representative AGDF tasks. It records per task: tool calls
  per tool, invalid-argument rate (SDK input-validation errors), `isError` rate, AGDF failure outcomes,
  response tokens per tool, total tokens or cost where the host reports them, wall time and task success
  against a verifiable expected outcome.
- Two native variants: with the AGDF skills loaded (current default) and MCP-only without AGDF skills, to
  measure how self-describing the interface is.
- Repetitions per task that are sufficient to report spread, not only single values.
- A committed, machine-readable baseline plus a short human-readable report, both with environment
  provenance (AGDF version, host and model versions, platform, date).
- One documented command per measurement layer for re-running the evaluation.

## 4. Non-Goals

- Changing any MCP interface, contract, description, annotation, error mapping or runtime behavior.
  Those are Phases 1–3 of the plan.
- CI enforcement of thresholds or regression budgets (Phase 4).
- Native measurement on Codex, GitHub Copilot or OpenCode in this slice. Native Codex measurement is a
  follow-up slice that reuses this evaluation.
- An LLM-as-judge quality score; success is judged against deterministic expected outcomes.
- Any action on the real repository's control state during evaluation; tasks run on fixtures.

## 5. Acceptance Signals

- The metric set is defined with exact computation rules, including how AGDF failure outcomes are counted
  while `isError` is not yet set.
- The task set, expected outcomes, host, models, variants and repetition count are fixed and versioned.
- Both measurement layers ran on the current interfaces, and the baseline data and report are committed
  with provenance.
- Re-running the documented commands on unchanged interfaces reproduces the protocol-level figures
  exactly and the native figures within the reported spread.
- The report names, for each of the twelve review findings, the metric that will show its improvement or
  states that it is not measurable in this slice.

## 6. Existing Source Of Truth

- MCP servers and contracts: `packages/mcp-server/src/server.js`, `packages/mcp-server/src/worker.js`,
  `packages/mcp-server/src/worker-entry.js`, `packages/cli/lib/mcp-dispatch-runtime.js`,
  `packages/core/lib/skill-dispatch/contract.js`, `packages/core/lib/control-inspect/contract.js`,
  `packages/core/lib/control-state/run-command-contract.js`,
  `packages/core/lib/control-inspect/cockpit-contract.js`.
- Existing measurements and harnesses: `packages/mcp-server/test/performance.test.js`,
  `packages/mcp-server/test/runtime-fixture.js`, `scripts/native-probes/claude-host-e2e.mjs`
  (`npm run native:claude-e2e`), `evals/manifest.json`,
  `evals/proportionality/`, `evals/host-compatibility/`.
- Capability and compatibility records: `plugins/agdf/meta/agdf-mcp-capability.json`,
  `docs/compatibility/`.
- External references: MCP specification 2026-07-28 (tools, error handling), MCP Security Best
  Practices, Anthropic "Writing effective tools for agents" (evaluation metrics).

## 7. Risks And Unknowns

- Native runs are nondeterministic and cost money. Task count, repetitions and budget must be bounded in
  PRD/SD.
- Unknown which token and cost data Claude Code exposes per session and per tool result, and whether a
  result's `isError` or structured content reaches the model. SD must determine the reliable source for
  each metric.
- Unknown whether Claude Code can load the AGDF MCP server without the AGDF skills and hooks. The MCP-only
  variant depends on this.
- Opus sessions cost markedly more than Sonnet sessions; the native budget must account for both models.
- Evaluations must not mutate the real repository's `.agdf/control` state. Fixture isolation must be
  proven.
- Stored transcripts can contain local paths or prompt content. Evidence must stay structured and redacted
  like the existing native probes.
- The working tree currently carries uncommitted changes on `feat/claude-install-fix`. Implementation
  should start from a clean branch.
- Brownfield Review must clarify how far existing probes and fixtures can be reused instead of duplicated.

## 8. Next Step

Review this UR and approve only with:

`Approval: UR`

## AGDF Approval Summary (de; source=en)

Problem: Ein lesendes Review der AGDF-MCP-Schnittstellen vom 2026-10-16 hat sie mit der MCP-Spezifikation 2026-07-28, den MCP Security Best Practices, Anthropics Leitfaden „Writing effective tools for agents“ und dem OWASP-Leitfaden für sichere MCP-Server verglichen. Dabei kamen zwölf Abweichungen heraus. Beispiele: Fachliche Fehler kommen ohne `isError` zurück. Eingabefehler werden als „Runtime reparieren“ oder `effect_unknown` gemeldet. `agdf_inspect` und die fünf Command-Tools haben unbeschriebene Parameter. Einzelne Tools mischen Wirkungsklassen. Gespeicherte Dispatch-Ergebnisse sind groß: Median etwa 14 KB, p90 etwa 38 KB, maximal etwa 126 KB. Ein macOS-Performance-Log zeigt etwa 2 s Latenz für warme Dispatch-Aufrufe. Diese Zahlen stammen aus zufällig vorhandenen Evidenzdateien und einem einzelnen fehlgeschlagenen Performance-Lauf und sind nicht repräsentativ.

Problem (Messlücke): AGDF hat Skill-Evals, einen Proportionalitäts-Benchmark und Host-E2E-Probes, aber keine Messung, wie gut Agenten die AGDF-MCP-Tools selbst nutzen. Ohne Ausgangswert lässt sich weder belegen, dass die geplanten Änderungen das Agentenverhalten verbessern, noch eine Verschlechterung erkennen. Geplant sind Änderungen am Fehlervertrag, an den Beschreibungen, am Tool-Schnitt, am Antwortbudget und an der Latenz.

Ziel: Es gibt eine wiederholbare MCP-Ergonomie-Messung und einen committeten Ausgangswert für die heutigen AGDF-MCP-Schnittstellen. Spätere Phasen führen dieselbe Messung unverändert erneut aus und vergleichen ihre Ergebnisse damit.

Betroffene: AGDF-Maintainer, die Schnittstellenänderungen entscheiden und prüfen. Coding-Agenten auf Claude Code, die die AGDF-MCP-Tools aufrufen. Indirekt AGDF-Nutzer, die Latenz, Fehler und Tokenkosten dieser Aufrufe spüren.

Umfang: Erstens eine deterministische Messung auf Protokollebene. Sie läuft über den vorhandenen `@modelcontextprotocol/client` gegen die lokal installierten AGDF-MCP-Server: `agdf` und, soweit dessen Freischaltung es zulässt, `agdf-cockpit`. Erfasst werden je Tool und Ergebnisart Antwortbytes und geschätzte Tokens, das `isError`-Flag, die eigenen AGDF-Fehlerergebnisse (`invalid_input`, `evaluator_error`, `rejected`, `effect_unknown`), die Latenz und die Größe der Tool-Definitionen. Dafür laufen repräsentative gültige, ungültige und Grenzfall-Aufrufe gegen temporäre Fixture-Repositories.

Umfang (native Messung): Zweitens eine native Agentenmessung nur auf Claude Code auf diesem Windows-Rechner, mit den Modellen Opus 5.5 und Sonnet 5.5 und einem festen, versionierten Satz repräsentativer AGDF-Aufgaben. Je Aufgabe werden erfasst: Aufrufe je Tool, Quote ungültiger Argumente (Validierungsfehler des SDK), `isError`-Quote, AGDF-Fehlerergebnisse, Antworttokens je Tool, Gesamttokens bzw. Kosten (sofern der Host sie meldet), Laufzeit und Erfolg gegen ein prüfbares erwartetes Ergebnis. Es gibt zwei native Varianten: mit geladenen AGDF-Skills (heutiger Standard) und nur MCP ohne Skills, um zu messen, wie gut sich die Schnittstelle selbst beschreibt. Jede Aufgabe läuft so oft, dass Streuung berichtet werden kann. Daten und ein kurzer Bericht werden committet, beide mit Angaben zur Umgebung: AGDF-Version, Host- und Modellversion, Plattform und Datum. Je Messebene gibt es einen dokumentierten Befehl zum Wiederholen.

Nicht-Ziele: Keine Änderung an MCP-Schnittstellen, Verträgen, Beschreibungen, Annotations, Fehlerabbildung oder Laufzeitverhalten; das sind die Phasen 1 bis 3. Keine Schwellwerte oder Regressionsbudgets in der CI; das ist Phase 4. Keine native Messung auf Codex, GitHub Copilot oder OpenCode in diesem Schritt; die native Codex-Messung ist ein Folge-Slice, der diese Messung wiederverwendet. Keine Qualitätsbewertung durch ein LLM als Richter; Erfolg wird an deterministischen Erwartungen gemessen. Die Messung verändert keinen Steuerungszustand des echten Repositories; alle Aufgaben laufen auf Fixtures.

Abnahmesignale: Die Kennzahlen sind mit genauen Rechenregeln definiert, einschließlich der Frage, wie AGDF-Fehlerergebnisse gezählt werden, solange `isError` noch nicht gesetzt wird. Aufgabensatz, erwartete Ergebnisse, Host, Modelle, Varianten und Anzahl der Wiederholungen sind festgelegt und versioniert. Beide Messebenen sind gegen die heutigen Schnittstellen gelaufen, und Daten und Bericht sind mit Herkunftsangaben committet. Bei unveränderten Schnittstellen liefert ein erneuter Lauf auf Protokollebene exakt dieselben Werte und nativ Werte innerhalb der berichteten Streuung. Der Bericht nennt für jeden der zwölf Review-Befunde die Kennzahl, die eine Verbesserung zeigen wird, oder vermerkt, dass der Befund in diesem Schritt nicht messbar ist.

Quellen und Zuständigkeiten: Die MCP-Server und -Verträge liegen in `packages/mcp-server` (server.js, worker.js, worker-entry.js), `packages/cli/lib/mcp-dispatch-runtime.js` und den Verträgen unter `packages/core/lib` (skill-dispatch, control-inspect, run-command, cockpit). Vorhandene Messungen und Probes: `packages/mcp-server/test/performance.test.js`, `runtime-fixture.js`, `scripts/native-probes/claude-host-e2e.mjs` (`npm run native:claude-e2e`) sowie `evals/` mit Manifest, Proportionalitäts- und Host-Kompatibilitätsdaten. Dazu kommen `plugins/agdf/meta/agdf-mcp-capability.json` und `docs/compatibility/`. Externe Referenzen sind die MCP-Spezifikation 2026-07-28, die MCP Security Best Practices und Anthropics Leitfaden für Agenten-Tools.

Risiken und Unbekanntes: Native Läufe sind nicht deterministisch und kosten Geld; Anzahl der Aufgaben, Wiederholungen und Budget müssen in PRD und SD begrenzt werden. Offen ist, welche Token- und Kostendaten Claude Code je Sitzung und je Tool-Ergebnis preisgibt und ob `isError` und strukturierter Inhalt beim Modell ankommen; das SD muss die verlässliche Quelle jeder Kennzahl festlegen. Offen ist auch, ob Claude Code den AGDF-MCP-Server ohne AGDF-Skills und -Hooks laden kann; davon hängt die Variante „nur MCP“ ab. Opus-Sitzungen kosten deutlich mehr als Sonnet-Sitzungen; das native Budget muss beide Modelle berücksichtigen.

Risiken (Umsetzung): Die Messung darf den echten `.agdf/control`-Zustand nicht verändern; die Isolation der Fixtures muss nachgewiesen werden. Gespeicherte Transkripte können lokale Pfade oder Prompt-Inhalte enthalten; die Evidenz bleibt deshalb strukturiert und bereinigt wie bei den bestehenden nativen Probes. Der Arbeitsbaum enthält derzeit nicht committete Änderungen auf `feat/claude-install-fix`; die Umsetzung sollte auf einem sauberen Branch beginnen. Das Brownfield Review klärt, wie weit vorhandene Probes und Fixtures wiederverwendet werden können, statt sie zu duplizieren.

Nächster Schritt: Diese UR prüfen und nur mit `Approval: UR` freigeben.
