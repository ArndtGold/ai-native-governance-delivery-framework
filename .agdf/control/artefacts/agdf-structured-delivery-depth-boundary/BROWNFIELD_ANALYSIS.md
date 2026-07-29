# Brownfield Analysis: Structured Delivery Depth Boundary

Status: done
Mode: `pre_implementation_analysis`
Decision: `pass`
Mode/Slice Decision: `structured_delivery`
Required next gate: none
Date: 2026-07-29
Run: `agdf-structured-delivery-depth-boundary`
Based on: genehmigter TP Revision 1

## Brownfield Analysis

- mode: `pre_implementation_analysis`
- decision: `pass`
- mode_slice_decision: `structured_delivery`
- required_next_gate: `none`
- artefact:
  `.agdf/control/artefacts/agdf-structured-delivery-depth-boundary/BROWNFIELD_ANALYSIS.md`
- scope: Die genehmigte Depth-Semantik ausschließlich über vorhandene normative, operative,
  Template-, Integrity-, Eval- und Context-Graph-Owner erweitern.
- evidence: Baseline-Commit `7a15768d319b47f78e6a178c52e94682360ad6dc`; die zehn
  kanonischen Kandidatenpfade sind unmittelbar vor der Implementierung unverändert und entsprechen
  den in Abschnitt „Baseline“ dokumentierten SHA-256-Werten.
- transparency: Es entsteht weder eine zweite Policy-Engine noch ein neuer Mode-, Gate-, Approval-,
  CLI- oder Schemawert. Benchmark-v3 und die bereits fremd veränderten Proportionalitätspfade
  bleiben isoliert.
- missing_evidence: keine für den Implementierungsstart; Laufzeit- und Regressionsevidenz entsteht
  gemäß SDB-V01 bis SDB-V09.
- current_coverage: `partially_done`; abstrakte Structured-Modi, Mode/Slice-Persistenz,
  Brownfield-Auswahl, Integrity- und Eval-Infrastruktur existieren bereits, die entscheidbare
  Depth-Grenze fehlt.
- reuse_strategy: `extend`
- risks: Regeldrift durch Duplikation, versehentliche Mutation des fremden Benchmarkscopes,
  überbreite Instruction-Assertions und falsche positive Entscheidungen bei lückenhaften Fakten.
- context_graph_impact: `update_existing_node`
- required_next_step: SDB-T02 bis SDB-T11 innerhalb der genehmigten Allowlist implementieren,
  anschließend SDB-V01 bis SDB-V09 und die Reviews ausführen.

## Bestehende Owner und Wiederverwendung

| Bereich | Bestehender Owner | Wiederverwendung |
|---|---|---|
| Produktsemantik | `plugin/meta/contracts/modes.md` | normativen Abschnitt ergänzen |
| Gate-Integration | `plugin/meta/contracts/gate-transition.md` | Owner referenzieren und unresolved auf `block` routen |
| Operative Anwendung | `plugin/skills/brownfield-analysis/SKILL.md` | Faktenaufnahme, Entscheidung und Recovery ergänzen |
| Persistenzvorlage | `plugin/control/templates/artefacts/BROWNFIELD_REVIEW.md` | strukturierte Depth-Evidenz ergänzen |
| Strukturprüfung | `plugin/scripts/check-runtime-integrity.mjs` | fokussierte Invarianten ergänzen |
| Negativtests | `create-agdf/scripts/runtime-integrity-negative-test.js` | bestehendes Mutationsmuster erweitern |
| Entscheidungsevals | `evals/cases/brownfield-analysis.json` | sechs deterministische Fälle ergänzen |
| Replay/Manifest | bestehende Eval-Dateien | nur Brownfield-Beobachtungen und -Fingerprint aktualisieren |
| Graph | `.agdf/control/CONTEXT_GRAPH.md` | drei bestehende Knoten aktualisieren |
| Propagation | `sync-package-assets` | bestehende Ableitung nutzen |

## Baseline

| Pfad | SHA-256 | Status vor Implementierung |
|---|---|---|
| `plugin/meta/contracts/modes.md` | `1c980c289898d62880942c0005019d650598c51ada13d6ddb23380d38f7bc80c` | clean |
| `plugin/meta/contracts/gate-transition.md` | `4d50855d3719a13fa0dc3d9d1d424c716d886ba93361cccc9271a37c95f46e0a` | clean |
| `plugin/skills/brownfield-analysis/SKILL.md` | `a7a1edd8b75cfd87d24cab0c0d1ef8e5785f155745903fd39757607a183b7f75` | clean |
| `plugin/control/templates/artefacts/BROWNFIELD_REVIEW.md` | `babf88322b85a9a213ac4450cfcd38404a4a22f66cc7f196f86d70a463f503ae` | clean |
| `plugin/scripts/check-runtime-integrity.mjs` | `d80f021703c3b159b3fdc3dbf15066b47a2acdd9d1beed277859a904c97fe4d4` | clean |
| `create-agdf/scripts/runtime-integrity-negative-test.js` | `9d01d759767ff324be6dc435b513b1f14294575261df5f519aad4b6c83905c0a` | clean |
| `evals/cases/brownfield-analysis.json` | `bac0ad2dfd2584919bba38f6c372981818b3f12ed4ff4e715b04a32da0e20222` | clean |
| `evals/manifest.json` | `6db095ae59555e0f620b55102d9e08ddc5a928784e566bb80afb5fbe465b2dc3` | clean |
| `evals/observations/deterministic-replay.json` | `03ceb2664f4693ed63e178775fd4b943e90618148a137014c7e4377f959952bb` | clean |
| `.agdf/control/CONTEXT_GRAPH.md` | `3ab3853b11c5de84eb0b1c5a20086fd2956be5f070315135f14ef0231d8e6aa1` | clean |

## Scope-Isolation

- ausgeschlossene bestehende Fremdänderungen:
  `evals/proportionality/**`, `create-agdf/lib/proportionality-benchmark/**`,
  `create-agdf/lib/skill-evals/live-recorder.js`,
  `create-agdf/lib/control-evaluation/gate-policy.js` und zugehörige Benchmark-/QA-Transition-Artefakte;
- diese Pfade werden weder als Authority noch als Child-Testziel mutiert;
- generierte `create-agdf/generated/**`-Flächen entstehen ausschließlich durch den genehmigten
  Sync und bleiben abgeleitet;
- eine notwendige Änderung außerhalb der TP-Allowlist stoppt die Umsetzung.

## Regression und Verifikation

- bestehende kompakte Pfade und Gate-Reihenfolge über Control-State-, Interaction- und
  Verified-Change-Tests schützen;
- Source-/Installed-Parität durch Runtime-Integrity-Layout und Package-Tests prüfen;
- Depth-Verlust durch drei neue negative Mutationen fail-closed nachweisen;
- sechs semantische Grenzfälle deterministisch evaluieren;
- vollständigen Smoke-Test, versionsgleichen Doctor und run-spezifischen Gate Check ausführen;
- Instruction-Assertions ausdrücklich als strukturelle Konsistenzprüfung, nicht als Beweis
  semantischer Modellbefolgung behandeln.

## Ergebnis

Die vorhandenen Owner reichen aus, die Kandidaten sind sauber isolierbar und der kleinste
dauerhafte Pfad ist eine Erweiterung der bestehenden Contracts, Skills, Templates und Tests.
Die Implementierung darf mit SDB-T02 beginnen.
