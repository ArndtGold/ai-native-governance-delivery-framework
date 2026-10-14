# UR: Read report decisions only from authored result fields

Status: draft
Gate: UR
Gate approval: open
Requirements clarification: complete
Date: 2026-10-14
Owner: AGDF Core

## 1. Problem

The shared report-result reader scans all Markdown lines. A report containing only an illustrative fenced `Decision: pass` currently produces pass. Examples and quoted content must not establish or contradict the actual technical report decision. The previous validator consistency repair and its completed Run remain the baseline, not approval authority for this new change.

## 2. Goal

Recognize an authored report decision from a clearly defined report field context while excluding Markdown examples and quotations. Keep registration, inspection and closeout on one shared Core interpretation and verify the implemented behavior in the installed Codex AGDF plugin.

## Affected Users

Coding agents consume AGDF report results. Users rely on the resulting readiness and closeout statements. This is an agent-facing control correction, with no new product UI.

## 3. Scope

Harden packages/core/lib/control-evaluation/report-decision.js and its existing contract and regression coverage. Define which report-field context is authoritative, accounting for existing authored report formats. Exclude fenced code examples, indented code, block quotations and fields embedded in example or quotation contexts. Maintain one shared reader for report registration, QA inspection and closeout. Generate and install through the supported local Codex plugin path, then verify positive and negative behavior using that exact installed runtime with recorded identity.

## 4. Non-Goals

No additional gate, approval authority, runtime updater, Git adapter, release or VCS action. No rewriting approved reports, transferring previous approvals, or reopening completed Runs. No claim that parser-only tests establish a full QA bypass or native model/platform qualification.

## 5. Acceptance Signals

- Example-only and quotation-only reports produce no confirmed technical result, including backtick/tilde fences, indentation and nested quotation cases.
- Non-authoritative examples or quotations cannot supply a missing result or override/conflict with a genuine report field.
- Genuine supported authored fields remain readable. Consistent duplicates and existing documented aliases retain compatibility where they are authoritative; conflicting, unknown, empty or missing authoritative decisions remain unconfirmed.
- Registration, QA inspection and closeout share the hardened behavior. Relevant integrated negative cases leave canonical state unchanged; existing approved-content and revision guards stay effective.
- Regression checks and supported build/install succeed. Installed-runtime observations distinguish source/package/installed behavior from fresh native Codex/model evidence.

## 6. Existing Source Of Truth

The shared Core reader and its three consumers: control-state/run-artefact-recording.js, control-evaluation/qa-follow-up.js and control-evaluation/closeout-readiness.js. Existing report templates, plugins/agdf/meta/contracts/quality.md, Core report-decision and closeout tests, and canonical writer/revision/approval rules retain ownership. The completed compact-execution-continuation-20261014-01 Run is historical baseline evidence only.

## 7. Risks And Unknowns

Brownfield Review must inventory legitimate result-field placement before choosing the smallest compatible authoritative context. A partial Markdown filter could miss quotation/example forms or suppress legitimate fields. Installed payload growth must be measured through the normal generator and existing budget. The current chat's loaded MCP generation may predate the installed plugin; installed qualification must bind to the actual candidate runtime rather than assuming reload.

## 8. Next Step

Review this UR and approve only with:

`Approval: UR`

## AGDF Approval Summary (de; source=en)

Problem: Der gemeinsame Leser wertet ein Decision-Feld auch in Markdown-Codebeispielen aus. Ziel: Nur echte Berichtsfelder dürfen eine technische Entscheidung begründen; Beispiele und Zitate dürfen weder ein Ergebnis liefern noch ihm widersprechen. Betroffen sind Coding-Agenten und die Nutzer, die sich auf ihre Bereitschafts- und Abschlussmeldungen verlassen.

Umfang: Den vorhandenen Core-Leser härten, den maßgeblichen Feldkontext anhand vorhandener Berichte definieren, Vertragsbeschreibung und Regressionstests ergänzen und den Fix über den unterstützten Weg im installierten Codex-Plugin prüfen. Geprüft werden gültige Entscheidungen, fehlende oder widersprüchliche echte Felder sowie Codeblöcke, eingerückter Code und verschachtelte Zitate. Registrierung, QA-Prüfung und Abschluss verwenden weiterhin denselben Leser.

Abgrenzung: Keine neuen Gates, keine neue Freigabeinstanz, kein Git-Adapter, kein Runtime-Updater und keine Veröffentlichung oder Git-Aktion. Bereits genehmigte Berichte und abgeschlossene Runs werden nicht geändert. Quellenhoheit bleibt bei Core, seinen bestehenden Berichtsvorlagen, dem Qualitätsvertrag und den kanonischen Schreibern.

Risiken: Die Härtung muss vorhandene echte Berichtsfelder erhalten und darf keine Markdown-Sonderfälle übersehen. Build-Größe und die tatsächlich geladene Runtime werden gesondert geprüft. Nächster Schritt: Diese Anforderung freigeben, anschließend Brownfield Review und den passenden Delivery-Pfad bestimmen.
