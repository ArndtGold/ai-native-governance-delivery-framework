# UR: Decide gate documents through a bound chat card or exact text

Status: draft
Gate: UR
Gate approval: open
Requirements clarification: complete
Date: 2026-10-10
Owner: Arndt Gold
Run: gate-decision-card-20261010-01
Language: en

## 1. Problem

Users currently type a technical Approval formula after reading a gate presentation. They want a comprehensible decision card in the chat: understand the exact proposed document, inspect it in a larger view, discuss it with the AI and then decide with a clearly labelled action. The user accepted this concept and explicitly asked whether the existing Approval formula remains available during later discussion.

The related core-mcp-flow-coherence-20261010-01 Run improves consistent state, operation contracts and existing writers; its approved UR explicitly excludes new app approval buttons. Its UR/PRD are approved and an SD is already registered. Adding this product behavior only to that SD would conflict with approved scope. This bounded complementary Run owns the user decision interaction, preserves the related Run's sources/approvals and reuses its qualified shared owners when available. No prior Approval applies here.

## 2. Goal

Provide a focused decision card for each current eligible gate-document presentation. Users can inspect, discuss and choose document-specific approval, request a change or reject the presented version without typing a technical formula. The existing exact Approval text remains an equally valid alternative wherever supported by the canonical gate path.

Both routes reach the same existing gate authority with exact target, Run, gate, revision, document and presentation binding. Host tool permission, deliberate human decision and confirmed persistence remain distinct. The interaction shows the actual outcome and next permitted step without exposing routine internal protocol fields.

## Affected Users

- Users directing delivery and deciding requirements, product requirements, design, task/test plan, QA and UAT where those user gates apply.
- Users discussing a proposed document with the AI before deciding, including returning to the text route later in the same bound conversation.
- Reviewers needing truthful document history and evidence of what decision was actually registered.

## 3. Scope

1. **Decision-ready chat card.** Use the existing presentation/summary owner for the selected eligible gate. Show the goal, decision-relevant proposals, material changes since the previous applicable version, unresolved relevant issues, exact document access and the effect of approving. Do not fabricate a comparison where no reliable previous version exists. Available registered gates use appropriate labels such as “UR freigeben”, “PRD freigeben”, “SD freigeben”, “TP freigeben”, “QA freigeben” and “UAT freigeben”. Internal analyses/reviews do not acquire new human gates.
2. **Three deliberate actions.** Offer approve, request change and reject when the current gate/route supports the decision. Request change collects the user's concrete comment and routes to the existing permitted revision owner; unsupported approved-source changes are explicit rather than raw edits. Rejection withholds approval of this version and explains its existing control effect; it does not silently cancel another Run or remove prior decisions.
3. **Document inspection and discussion.** Open the exact decision document in the larger supported view, retain a clear way back to its decision, and allow questions in chat. Mere discussion, reading, opening/closing a view and illustrative/quoted/negated Approval language confer no decision. Do not require artificial scroll-to-end or redundant acknowledgement as evidence of reading. Material changes require a fresh presentation; discussion alone does not.
4. **Equal click and text routes.** Retain the existing exact Approval: UR/PRD/SD/TP/QA/UAT response route with its current eligibility and presentation checks. A user can discuss first and deliberately send the exact response later while that presentation is still current. Clicking is a distinct human interaction input, not an agent-generated chat formula pretending to be a human response. Both routes delegate to existing approval authority; neither bypasses a prerequisite, invents consent or transfers an approval. Ambiguous target/Run or stale material is clarified/refreshed before a decision, without asking for technical IDs unnecessarily.
5. **Confirmed effect and version history.** Show recording-in-progress, confirmed decision plus next permitted action, rejection or exact blocked condition, and uncertain result with status/recovery access. Avoid optimistic success or duplicate decisions after double-click, concurrent text/click, refresh or lost acknowledgement. Replaced/expired/superseded cards cannot approve current content; keep the exact older decision/document inspectable. New presentation follows changed material or eligibility, with no old response replayed as new approval.
6. **Host and Core boundaries.** Separate host tool permission from the concrete gate decision. Respect actual host confirmation requirements without promising a single host prompt on every platform. Reuse existing Core presentation/approval/receipt/readiness/recovery, qualified MCP contracts and truthful document proof. The card does not become a gate evaluator, general writer or arbitrary cockpit command interface. Protect the existing read-only cockpit scope; any shared view change is limited to the needed decision/document interaction.
7. **Exact native qualification and accessibility.** Demonstrate the actual chat card, larger document view, deliberate user interaction and result in the supported Codex host for one exact generated/served candidate. Verify keyboard, focus, narrow/wide layout, localization, refresh/source changes and teardown where affected. Standard MCP Apps support is technical input, not evidence that the current local host already supplies every required trust/interaction primitive. The text route remains available if click capability is unavailable; it does not by itself satisfy this Run's click acceptance.

## 4. Non-Goals

- Automatic approvals, fabricated human response, click synthesis by the agent, model-supplied approval flags as provenance, weaker binding or independent-human-proof claims unsupported by the host.
- A second approval service, evaluator, presentation source, gate order or orchestration store; new human gates for internal work.
- A general cockpit redesign, arbitrary source editing, installer/restart changes, universal all-host promise or automatic Git/release/publication.
- Editing approved/foreign Runs, importing their approvals, silently expanding the Core/MCP Run or treating its pending SD as approved.
- Eliminating the exact text route, preventing discussion before approval or requiring a new technical formula for ordinary users.

## 5. Acceptance Signals

- **AC-001 — A decision the user understands:** A current eligible card shows the decision document, a concise complete summary, meaningful version changes or honest unavailability, relevant open issues and the consequence/next step. Document-specific action labels are understandable without protocol knowledge. No decision-ready approval action is offered when required conditions are unresolved.
- **AC-002 — Inspect then return:** The user opens the exact document in the supported larger view and returns to the same decision. Displayed identity and content match the presentation; current versus historical material is explicit. Inspection/view closure records no approval.
- **AC-003 — Three supported choices:** Approve records only a new deliberate decision for the presented material. Request change accepts a concrete comment and reaches the permitted current revision/clarification owner. Reject leaves that version unapproved with a truthful outcome; unsupported revisions do not silently modify approved sources or Run lifecycle.
- **AC-004 — Discussion and exact text stay available:** Questions may precede or follow inspection; discussion alone changes no approval. A new exact Approval response later in the same bound conversation succeeds when current/eligible, while stale/foreign/quoted/example/negated/future-gate responses do not. Click and text produce equivalent canonical approval effects and next-state meaning without a second policy.
- **AC-005 — User origin and permission are distinct:** Actual deliberate user interaction is evidenced according to the supported host trust boundary. Remembered tool permission, malicious document/tool content, agent invocation or caller-supplied confirmed flags alone cannot count as a human gate decision. Server binding and eligibility remain enforced; provenance limits are explicit and required host confirmation remains honored.
- **AC-006 — Correct feedback under failure and concurrency:** The card reports progress then confirmed effect/next action, or exact rejection/blocker. Lost response stays uncertain until receipt/status/recovery proves its outcome. Double-click, simultaneous text/click and repeat after refresh do not create duplicate decisions. New payload/source/revision requires a new applicable decision rather than replay.
- **AC-007 — Truthful current and historical cards:** Changed material/control or expiry disables the old decision and presents current material as required. Prior accepted decisions remain inspectable with their actual versions. Asynchronous old results cannot revive superseded cards, and closing a view does not imply backend teardown or governance completion.
- **AC-008 — One existing authority with protected neighbors:** Core presentation, approval, receipt and qualified MCP owners are reused; existing text workflows, read-only cockpit/document/draft-check behavior, foreign/approved sources and appropriate gate routes remain intact. The complementary Run has explicit dependency/overlap handling with the Core/MCP Run, not duplicate lifecycle implementation.
- **AC-009 — Actual usable host and language evidence:** One exact candidate demonstrates the native inline card, large document view, real user click, observed canonical result, affected interaction/teardown and keyboard/focus/layout cases. All registered languages render changed states. Synthetic/protocol evidence and text fallback alone are insufficient for native click acceptance; unsupported hosts remain honestly limited.

## 6. Existing Source Of Truth

- Approved UR/PRD and unapproved SD of core-mcp-flow-coherence-20261010-01: reusable Core/MCP intent, fixed write-group proposals and explicit app-button exclusion; no implementation qualification yet.
- packages/core/lib/control-state/run-presentation.js, approval-command.js and approval-operations.js: existing bound presentation, deliberate exact response, receipt and cooperative approval authority.
- packages/core/lib/control-evaluation/, control-inspect/cockpit.js and run-presentation-render.js: existing current evaluation, readiness, localized summaries, document projection and presentation ownership.
- packages/control-ui/src/ and existing cockpit/session/MCP transport owners: reuse exact documents, snapshot/generation/session guards where suitable; Brownfield must determine the smallest appropriate card/view boundary.
- docs/architecture/03-agentenkontrolle-zielbild.md, 04-mcp-schnittstellen.md and 06-agdf-cockpit.md: current owner/transport/app boundaries. agdf-actionable-card-ux-20260928-01 concerns explanatory non-authorizing cards; agdf-product-maturity-roadmap coordinates broader maturity and does not own this exact native-click slice.
- Official OpenAI MCP-Apps UI and security documentation fetched during discussion: component tool calls and focused inline cards are available concepts; annotations do not replace authorization/confirmation. These pages are guidance, not actual Codex candidate qualification or permission to invent human evidence.

## 7. Risks And Unknowns

Product intent is complete: three actions, inspect/discuss, exact text retained, same canonical authority and truthful outcomes. Before design, Brownfield/UX/PRD must resolve reuse, applicable gate states, material comparison, rejection/change semantics and overlap at the current source baseline.

The central technical uncertainty is distinguishing a human UI decision from agent/tool payloads within the actual Codex host. SD must select a supported binding/trust path and state its assurance honestly. Do not assume that tool visibility, a UI nonce, a message bridge, confirmed=true or a synthetically generated Approval response independently proves human origin. Missing necessary host support blocks that click capability's qualification; a safe exact text fallback remains usable without a false click-completion claim.

Pending Core/MCP work may change shared contracts. Sequence or isolate dependent implementation and refresh affected evidence; no race between competing approved plans. Native claims must name exact package/resource/session identity. Retries, stale cards, concurrent decision channels and material changes require real negative/recovery coverage rather than only a happy-path button demo.

## 8. Next Step

Review this complete new UR and decide with a new deliberate Approval: UR, request a change or reject it. This Run itself still uses the existing text approval route while the new card interaction is unimplemented. Valid approval permits existing Brownfield Review/Mode-Slice routing and required UX analysis; PRD, SD, TP and implementation require their own decisions. No related Run's approval transfers.

## AGDF Approval Summary (de; source=en)

- Ziel: Eine Entscheidungskarte pro aktueller Dokumentfassung im Chat zeigt verständlich, was du freigibst und was danach passiert. Du kannst das Dokument groß öffnen, mit der KI diskutieren und per Klick entscheiden. `Approval: UR/PRD/SD/TP/QA/UAT` bleibt als gleichwertiger Textweg erhalten; eine spätere exakte Antwort gilt nur für ein dann noch aktuelles, entscheidungsbereites Gate.
- Umfang und Betroffene: Für Anwender und Reviewer stehen „Gate freigeben“, „Änderung anfordern“ mit Kommentar und „Ablehnen“ bereit. Kurze vollständige Zusammenfassung, relevante Änderungen/offene Punkte, exaktes Dokument und Entscheidungswirkung gehören auf die Karte. Interne Reviews erhalten keine neuen Nutzerfreigaben. Erforderliche Host-Bestätigungen bleiben separat und hängen vom tatsächlich unterstützten Host ab.
- AC-001/002: Die Karte ist verständlich und nur bei erfüllten Voraussetzungen entscheidungsbereit. Der Dokumentlink öffnet die exakt präsentierte Fassung im großen Bereich mit Rückkehr zur Entscheidung; Lesen und Schließen erteilen keine Freigabe.
- AC-003/004: Drei Aktionen haben konkrete bestehende Wirkungen. Änderungswünsche folgen dem zulässigen Revisionsweg, Ablehnung lässt diese Fassung unfreigegeben. Diskussion bleibt frei möglich. Klick und neue exakte Textantwort nutzen dieselbe Core-Freigabeautorität; Fragen, Zitate, Beispiele, alte/fremde Antworten und künftige Gates werden nicht freigegeben.
- AC-005/006: Tatsächliche Nutzerhandlung, Host-Toolerlaubnis und fachliche Freigabe sind getrennt. Agent, Dokumentinhalt oder `confirmed=true` erzeugen keine menschliche Entscheidung. Die Karte zeigt zunächst Erfassung und erst nach bestätigtem Effekt Erfolg/ nächsten Schritt. Verlorene Antwort, Doppelklick und gleichzeitige Text-/Klickentscheidung erhalten Status/Recovery ohne doppelte Freigabe.
- AC-007/008: Geänderte oder abgelaufene Fassungen sperren alte Aktionen; Historie bleibt mit tatsächlichen Versionen nachvollziehbar. Bestehende Präsentation, Approval-Writer und Belege bleiben zuständig. Dokument-/Entwurfsprüfung, lesendes Cockpit und fremde Freigaben bleiben geschützt; keine zweite Policy oder still erweiterten Nachbarruns.
- AC-009: Das tatsächliche Codex-Chatwidget, große Dokumentansicht, echte Nutzeraktion, registriertes Ergebnis sowie betroffene Tastatur-/Fokus-/Layout-/Teardown-Fälle werden an einer exakten Fassung geprüft. Alle registrierten Sprachen werden gerendert. Protokolltests und Textfallback allein erfüllen den Klicknachweis nicht.
- Abgrenzung und Zusammenhang: Der Core-/MCP-Run schließt neue App-Freigabebuttons in seiner freigegebenen UR aus und hat bereits ein registriertes SD. Dieser begrenzte Ergänzungsrun ergänzt den Bedienweg und nutzt dessen qualifizierte Owner; seine bisherigen Freigaben werden nicht verändert/übernommen. Keine automatische Freigabe, allgemeines Dashboard, Installer-/Neustartarbeit, Git oder Veröffentlichung.
- Risiken und nächste Entwurfsarbeit: Brownfield/UX/PRD klären kleinsten wiederverwendbaren Kartenweg und Abhängigkeiten; SD muss die tatsächliche Host-/Nutzerbindung, ihre Herkunftssicherung und Fehlerfälle lösen. UI-Nachricht oder Token beweist nicht automatisch unabhängige menschliche Herkunft. Fehlende Hostunterstützung bleibt sichtbar; exakte Texteingabe bleibt nutzbar. Es ist noch keine neue Kartenfunktion implementiert oder qualifiziert.
- Nächster Schritt: Diese neue UR mit `Approval: UR` freigeben, Änderung verlangen oder ablehnen. Danach folgen Brownfield und die weiteren Produkt-/Designentscheidungen. Die neue Klickbedienung ersetzt die Texteingabe künftig als bequeme Alternative, nicht als Pflicht.
