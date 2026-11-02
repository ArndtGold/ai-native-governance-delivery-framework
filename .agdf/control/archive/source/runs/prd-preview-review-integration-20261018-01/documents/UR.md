# UR: Review a bound UI preview before approving PRD

Status: draft
Gate: UR
Gate approval: open
Requirements clarification: complete
Date: 2026-10-18
Owner: Product owner

## 1. Problem

The current branch describes how a requested UI preview should support UX intent clarification and PRD agreement, but does not implement the Core and decision-view integration. A reviewer cannot yet reliably open the relevant preview from the PRD decision or rely on Core to reject a missing, foreign or changed preview. Passing documentation and deterministic replay checks do not establish that this approval flow works.

## 2. Goal

A reviewer can judge the proposed user interaction before implementation, open the retained preview alongside the PRD review task, and deliberately approve the same verified product basis. Core prevents approval when a required preview is missing, belongs to another run or has changed since presentation. PRD approval continues to approve intended behavior, scope and acceptance criteria and permits the existing next step, Solution Design.

## Affected Users

- Product owners and PRD reviewers who need to understand a proposed interaction before approving its requirements.
- Delivery agents that retain previews, prepare PRD review material and recover from incomplete or changed evidence.

## 3. Scope

- Implement one complete path for a PRD with a required UI preview, using the existing Core presentation owner and decision view.
- Retain reopenable preview versions in the owning run's artefact directory, inside `previews/` with a short name and version number, and `index.html` as the entry file. Include the local assets needed to inspect the preview, as already specified on this branch.
- Define a machine-readable binding within the existing source/evidence model that identifies the applicable preview version, entry file, required local assets, their digests and source UR. Keep product requirements authoritative in the PRD.
- Present the concrete review task, covered normal and error scenarios, preview version and related PRD acceptance criteria together. Provide read-only preview access beside the existing PRD document access when the actual host supports it; report unavailable access accurately.
- Check file containment, run ownership, required files, digests and source binding before presenting the decision and again before persisting approval. A change requires a fresh relevant review and presentation; an earlier reply cannot approve the changed basis.
- Keep unresolved product decisions explicit. Required before-PRD decisions and missing required evidence prevent approval; an illustrative preview must not silently decide product policy.
- Use the approval-screen scenario from this conversation for practical validation: delivered and checked material, open risks or evidence, approval versus change request, and an important missing evidence item. The example policy that missing evidence disables approval remains an illustrative assumption until confirmed for the depicted product.
- Preserve one existing PRD approval action across native and text presentation. Viewing or interacting with a preview grants no approval.
- Add file-based Core integration tests for valid, missing, changed and wrong-run previews, relevant asset changes and unsafe paths; verify the actual decision-view interaction and narrow-layout behavior. Report automated integration evidence separately from native-host qualification or user acceptance.

## 4. Non-Goals

- No new gate, separate preview approval, mandatory view-tracking receipt or second product authority.
- No implementation of the product depicted by the approval-screen example.
- No assumption that a preview establishes delivered behavior, completed checks or independent human approval.
- No general visual editor, preview hosting platform, arbitrary filesystem browser or unrelated control-status repair.
- No merge, release, installation update or claim of qualification for untested hosts.

## 5. Acceptance Signals

- A reviewer can reach the exact retained preview from the PRD decision, inspect the intended task and the important missing-evidence scenario, and return to the same PRD context without approving it.
- The unchanged, valid preview permits the existing deliberate PRD approval path when all other readiness conditions hold.
- Missing entry files or required local assets, foreign-run references, escaped or symlinked paths, source mismatch and changed preview bytes cannot produce an approval for the previously presented basis.
- A newly applicable version is distinguishable from the prior reviewed version and requires a fresh presentation before a new deliberate approval.
- Confirmed interaction findings map to verifiable PRD acceptance criteria; unconfirmed policy and other unanswered product questions remain visible and are not treated as approved requirements.
- Tests exercise real files and the decision view. Stored replay fixtures are not reported as evidence that preview access or binding enforcement works.

## 6. Existing Source Of Truth

- Existing branch `feat/ux-intent-prd-ui-previews`: UX/UR/PRD guidance, preview retention rules and PRD review handoff changes.
- `plugins/agdf/meta/contracts/interaction.md`, section `PRD Preview Review At Approval`: the specified review and approval integration.
- `plugins/agdf/meta/contracts/prd-definition.md` and the UR/PRD/UX artefact templates: source and product-authority boundaries.
- `packages/core/lib/control-evaluation/definition-sources.js`: current analytical source validation.
- `packages/core/lib/control-state/run-presentation.js` and `presentation-decision.js`: existing presentation and decision-material binding owners.
- `packages/core/lib/control-inspect/decision-session.js`: bound read and decision session owner.
- `packages/control-ui/src/mcp/DecisionCard.tsx` and `DecisionEntry.tsx`: current decision presentation and document access.
- The isolated trial report at `/private/tmp/agdf-preview-trial-AKMZQ1/test-evidence/REPORT.md` is supporting local trial evidence, not a production approval or durable product authority.

## 7. Risks And Unknowns

- Brownfield Review and SD must determine the smallest binding and read contract that fits current presentation records, decision receipts and captured read-only observations without a parallel source of truth.
- Executable preview content must remain isolated from approval controls and host authority. Preview access must not introduce arbitrary file or network access.
- Actual host support for opening an interactive preview and returning to the same context must be checked. A source-level or browser integration test does not qualify every native host.
- Backward compatibility for existing presentations and runs without required previews needs an explicit design and regression coverage.
- The product policy for approving despite an important missing evidence item remains unconfirmed in the example. This integration must preserve that question rather than infer an answer.
- Existing uncommitted branch changes and the unrelated pre-existing `.gitignore` edit must be preserved.

## 8. Next Step

Review and approve this UR, then perform the existing Brownfield Review and required UX/PRD/SD/TP preparation before implementation. Review this UR and approve only with:

`Approval: UR`

## AGDF Approval Summary (de; source=en)

### Problem

Der Branch beschreibt die Vorschau als Grundlage der PRD-Abstimmung. Core und Freigabeansicht setzen den vollständigen Ablauf bisher nicht um: Vorschauzugriff und die Prüfung fehlender oder veränderter Vorschau-Dateien sind noch nicht zuverlässig an die Freigabe gebunden.

### Ziel

Produktverantwortliche können die vorgeschlagene Bedienung vor der Implementierung beurteilen. Sie öffnen die passende Vorschau aus der PRD-Entscheidung und geben bewusst dieselbe geprüfte Grundlage frei. Die PRD-Freigabe bestätigt Verhalten, Umfang und Akzeptanzkriterien und ermöglicht den bestehenden nächsten Schritt Solution Design.

### Betroffene Nutzer

PRD-Prüfer und Produktverantwortliche sowie die Agenten, die Vorschauen erhalten, Prüfunterlagen vorbereiten und fehlende oder veränderte Nachweise bearbeiten.

### Umfang

Ein vollständiger technischer Ablauf für eine erforderliche Vorschau: versionierte Ablage im Artefaktverzeichnis des Runs, maschinenlesbare Bindung von Einstieg, lokalen Dateien, Prüfsummen und UR-Quelle, konkrete Prüfaufgabe mit Normal- und Fehlerfall sowie Zuordnung zu PRD-Kriterien. Die Vorschau wird neben dem Dokument lesend zugänglich, soweit der tatsächliche Host das unterstützt. Core prüft die erforderliche Grundlage vor Präsentation und erneut vor Speicherung der Freigabe. Eine Änderung verlangt eine neue relevante Prüfung und Präsentation.

### Nicht-Ziele

Kein zusätzliches Gate, keine gesonderte Vorschaufreigabe und keine zweite Produktwahrheit. Die beispielhafte Freigabeansicht wird nicht als Produkt implementiert. Vorschau und Browserprüfung beweisen weder gelieferte Funktion noch menschliche Freigabe. Allgemeine Hosting- oder Editorfunktionen, fremde Statusfehler, Merge, Release und ungetestete Host-Zusagen bleiben außerhalb des Umfangs.

### Erfolgssignale

Der Prüfer kann die genaue Vorschau öffnen, den Bedienablauf einschließlich eines wichtigen fehlenden Nachweises beurteilen und zur gleichen PRD-Entscheidung zurückkehren. Der gültige unveränderte Stand erlaubt bei sonstiger Bereitschaft die bestehende bewusste Freigabe. Fehlende Dateien oder lokale Ressourcen, ein falscher Run, unsichere Pfade, abweichende Quellen oder geänderte Bytes verhindern die Freigabe der alten Grundlage. Eine neue Version wird erkennbar neu präsentiert. Bestätigte Erkenntnisse werden überprüfbare PRD-Kriterien; unbeantwortete Produktfragen bleiben offen. Tests müssen echte Dateien und die Bedienung prüfen.

### Quellen und Verantwortung

Die geschärften UR-/UX-/PRD-Verträge und Vorlagen dieses Branches beschreiben das Ziel. Die bestehenden Core-Eigentümer für Quellen, Präsentation, Entscheidungsgrundlage und Sitzung sowie die vorhandene Freigabekarte bleiben die Integrationspunkte. Das PRD bleibt die verbindliche Produktquelle. Der isolierte Probelauf ist lokaler Nachweis mit ausgewiesenen Grenzen.

### Risiken und offene Designfragen

Brownfield Review und Solution Design klären Bindungsformat, sichere isolierte Vorschauzugriffe, Kompatibilität älterer Runs und tatsächliche Host-Fähigkeiten. Ob das im Beispiel dargestellte Produkt bei einem wichtigen fehlenden Nachweis zwingend sperren muss, ist weiterhin unbestätigt; die Integration darf diese Produktentscheidung nicht erfinden. Bestehende Branch-Änderungen werden erhalten.

### Nächster Schritt

Diese UR prüfen und bewusst freigeben. Danach folgen die bestehenden Vorbereitungsschritte bis zur erlaubten Implementierung; es wird kein Gate übersprungen.
