# Nachweisabweichung zur physischen Paketmigration

Status: proposed; no approval or waiver recorded
Run: agdf-physical-package-boundaries-20261001-01
Reference: approved TP.md, TASK_PLAN_REVIEW.md TPR-E001/TPR-E002

## Konkrete Abweichung

Die vor jeder Implementierungsstufe geforderten ursprünglichen C01–C03-Sicherungen mit Source-/Outputmanifesten wurden nicht vollständig aufgezeichnet. C00 enthält die tatsächlichen vorherigen Quellen einschließlich MCP-Reparatur, Genehmigungs-/Quellhashes, Indexgesamt-Hash und staged Pfadnamen. Der binäre Indexhash änderte sich später; ursprüngliche Einzel-OIDs wurden nicht separat erfasst. Es wurde kein Staging/Reset/Commit vorgenommen. Die fünf staged Pfade bleiben gleich, doch daraus folgt allein kein vollständiger Originalidentitätsnachweis. Die Umsetzung darf diese Lücke weder verstecken noch mit nachträglich erfundenen Originalsnapshots schließen.

## Vorhandene Nachweise

- C00-Quelle: /tmp/agdf-physical-C00-source-20261001; gehasht in evidence/IMPLEMENTATION_BASELINE.json; frühere Run-/Reviewartefakte wurden als bytegleich verifiziert.
- Finaler Quellstand: evidence/FINAL_SOURCE_BINDING.json und FINAL_DIFF_INVENTORY.json; alle 15 Kriterien und 42 Szenarien zugeordnet.
- Neue isolierte C00→C04-Wiederholung: evidence/checkpoints/STAGED_REHEARSAL.json; tatsächlicher Core-Cutover des älteren Consumers, physischer Source-/Build-Cutover, drei normale Archive, externe CLI/Offline/MCP-Verbraucher und reale Rückweg-/Konfliktprüfungen bestanden.
- Fehler-/Rückwegfixture: realer Assemblyfehler vor Veröffentlichung bewahrt alle drei vorherigen Outputs; tatsächliches Core-Quell-/Outputbytepaar wird gemeinsam wiederhergestellt; fremde Post-Hashes und geänderter Fixtureindex verhindern alle Writes.
- Indexprüfung: evidence/INDEX_PRESERVATION.json benennt beweisbare und unbeweisbare Teile. Der Liveindex wird nicht zurückgesetzt, um einen Anfangshash zu erzwingen.

## Zur Entscheidung stehender Vorschlag

Den aktuellen funktionalen Rückwegnachweis und die explizite Index-Beweisgrenze für diesen Run als begrenzten Ersatz der fehlenden historischen Stufennachweise akzeptieren; die ursprüngliche Abweichung dauerhaft erhalten. Eine solche Entscheidung ändert die hier genannten Evidence-Obligations, aber keine Produktfunktion, Architekturgrenze, Paketnamen, Datenpfade oder generelle AGDF-Regel. Sie ist noch nicht getroffen und wird nicht aus einem allgemeinen „leg los“ oder früheren UR/PRD/SD/TP-Reply abgeleitet. Keine neue Approval-Formel wird erfunden.

Verbleibender Nachteil: Die genaue ursprüngliche C01–C03-Rückführbarkeit und die ursprünglichen einzelnen Indexidentitäten bleiben historisch unbeweisbar. Die aktuelle Rückwegfähigkeit ist getestet; eine neue Wiederholung beweist keine frühere Durchführung. Nur eine ausdrückliche zuständige Entscheidung zur begrenzten Abweichung oder neu verfügbare Originale können die Findings schließen. Bis dahin bleibt QA revise.

required_next_step: Die konkrete Nachweisabweichung dieses Dokuments verbindlich beurteilen; danach TP Review und QA mit dem Ergebnis aktualisieren.

Final index observation: evidence/FINAL_STAGED_ENTRIES.json records the original five staged duplicate paths plus 28 additionally observed staged documentation deletions. No staging/reset was performed by this migration; attribution is unavailable and the live index is preserved. This observation is not a migration-owned deletion or proof of the original per-entry index identity. Current source/approved artefact SHA256 bindings remain unchanged.
