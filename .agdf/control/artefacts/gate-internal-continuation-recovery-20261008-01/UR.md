# UR: Reliable internal gate continuation and actionable recovery

Status: draft
Gate: UR
Gate approval: open
Requirements clarification: complete
Date: 2026-10-08
Owner: Arndt Gold
Run: gate-internal-continuation-recovery-20261008-01
Language: en

## 1. Problem

During `cockpit-active-backlog-core-ui-20261008-01`, the user repeatedly had to say "Fix it" or "Leg los" to restart work that required an internal preparation or recovery step rather than a new human decision. The user described the gates as awkward and requested a UR after the cause analysis. The observed failures occurred mainly before PRD authoring and during QA-revise follow-up; the recorded transitions after PRD, SD and TP approvals generally continued. The observations do not establish that all gates, hosts or approvals are defective.

The conversation records these concrete cases (times in UTC on 2026-10-08):

- At 14:31, the Brownfield Review required a UX Intent Definition, but the agent attempted PRD continuation before preparing it. The dispatcher returned terminal `prd_authoring_inputs_invalid` instead of a bounded preparation handoff. The user had to restart work.
- At 14:34, the same broad error recurred because the newly written UX analysis contained `Decision: ready` instead of the required `- decision: ready`. The agent's authoring error and the missing-file case produced the same general recovery. The next user prompt led to the exact field correction.
- At 16:15, an active follow-up on a QA-revise run ended in a terminal status card, although the card listed permitted implementation/evidence/review work and said "Ich arbeite weiter". The user supplied another "leg los".
- At 16:16, the agent supplied `continue_delivery` to `qa-gate`, which rejects that option. An MCP attempt also used `language` instead of `presentation_language`. These are agent invocation errors, not evidence that those invalid inputs should become valid. A subsequent correctly bound judgement-skill invocation returned a continuation.
- Earlier, installed and repository runtime checks disagreed about another active run's seal; after a plugin update intake proceeded. Later, package preparation, active server connection and displayed UI resource also needed separate proof. These observations amplify recovery and qualification overhead; they do not justify bypassing integrity checks or reusing observations from an older build.

Internal prerequisites, recoverable agent mistakes, required human decisions and external host dependencies become too similar in the visible flow. The user ends up coordinating framework execution, and broad terminal messages hide the exact missing prerequisite or next responsible actor.

## 2. Goal

Within an explicitly requested, correctly bound delivery scope, the agent completes permitted internal preparation and corrective work until the next genuine human decision or concrete blocker. The user can see what requires their decision, what the agent is doing, and what depends on an external action. Recoveries identify the actual failed condition and its owner. Human gate approval, source integrity and evidence obligations remain fully enforced.

When fresh host qualification is required, the user receives one prepared transition: the exact candidate package, required connection action and a complete bounded observation sequence are ready before the request to reconnect. Evidence remains tied to the observed version.

## Affected Users

- Users directing AGDF delivery who currently have to restart internal preparation or QA-revise work with repeated prompts.
- Coding agents consuming the existing dispatcher, authoring contracts, canonical recording and review routes.
- Reviewers who need to distinguish implementation findings, missing evidence, human approval and runtime/host blockers. Actual host claims remain limited to individually demonstrated execution paths.

## 3. Scope

- **Internal prerequisite handoff:** identify an eligible, missing internal input such as UX Intent Definition before dependent authoring. When the active request and current control permit it, continue through its existing owner, record it canonically and reevaluate the same run. A missing prerequisite requiring new user information, changed scope or unavailable authority remains a concrete blocker.
- **QA-revise follow-up:** distinguish authorized implementation correction, review/evidence maintenance, fresh host qualification and upstream requirement/design gaps. Route only the work allowed by the current control and approved scope. A new layout request or other change must still be assessed for scope; QA-revise is not blanket authority for arbitrary changes or approved-source edits.
- **Actionable diagnostics and bounded correction:** expose the failed source/field/argument, expected condition, observed condition where available, responsible owner and allowed next action. Correct the agent's own incomplete unapproved inputs through existing owners and writers when permitted; validate before reevaluation. Repeated unchanged failures end with one precise blocker rather than repeated blind retries or user prompts. Invalid invocation options remain invalid.
- **Truthful execution presentation:** align visible actor, stop reason and promised next action with the actual dispatcher/host outcome. Separate human decision, agent work, external dependency and technical failure. Retain explicit status requests and the existing bound approval presentation. No terminal card may promise immediate autonomous work while the actual flow stops without an executable handoff.
- **Prepared host qualification:** where a fresh installed-host observation is required for this continuation, prepare candidate identity, supported connection/reopen action and the required observation/evidence sequence together. Distinguish source tests, packaged/served resource proof and actual displayed-host observations. Retain applicable evidence and name only the obligations invalidated by a changed candidate; do not transfer old native observations to a new resource.
- **Existing ownership and verification:** use current Core evaluation, dispatcher, authoring/review skills, canonical writers and interaction owners. Compare fixed observed multi-turn cases before and after the increment, including errors, interruption/resumption and real decision boundaries. Keep installation/protocol/browser/native findings separate.

## 4. Non-Goals

- Removing, combining or automatically approving gates; interpreting "leg los", silence, progress text or a UI selection as an exact approval for the named gate.
- Weakening exact target/run/revision/presentation binding, seals, locks, source relationships, canonical evidence or release authority.
- Converting a read-only status question into delivery work, changing Request Activation or inventing authority from discovery or current directory.
- General card redesign, blanket intermediate-card suppression, a new orchestration store, second recovery policy, new gate or parallel source of truth.
- Reimplementing the separately governed intake-after-UR, stale-derived-next-step, card-copy, host-adapter or installer/version-migration scopes. Runtime incompatibility must remain explicit; automatic reinstall, host restart, global inventory exclusion or seal repair is not granted here.
- Changing approved sources or approvals of the reference cockpit run or any related run; their approvals do not transfer. Publication, commit, push and release are excluded.

## 5. Acceptance Signals

- **AC-001 — Internal prerequisites:** In a bound active authoring scenario with an eligible missing UX input, the existing owner prepares and records it before PRD authoring without another user continuation prompt. A genuinely missing user requirement or disallowed operation stops with that exact reason. No approval is inferred.
- **AC-002 — Precise authoring recovery:** Missing UX source and a malformed readiness field are distinguishable. The diagnostic identifies the source and required field/value. A permitted correction to the agent's unapproved draft is validated and reevaluated without asking the user to restart; an unchanged failure does not loop. Approved artefacts remain protected.
- **AC-003 — QA-revise routing:** Fixed cases for an implementation finding, an evidence-only obligation and an upstream scope/design gap each expose the correct owner and permitted next action. Active same-scope correction/evidence work continues without a redundant "leg los"; required user/host actions remain visible. No revise report is presented as ready for QA approval.
- **AC-004 — Valid invocation and truthful stops:** The supported host invocation supplies the declared language field and permits continuation options only for the declared skills. Invalid calls remain rejected with a concrete correction. Visible "agent continues" messages correspond to actual permitted continuation; terminal outcomes accurately name the stop and next actor.
- **AC-005 — Prepared host observation:** Before requesting a required reconnection, one exact candidate and its required observation sequence are ready. Observations identify the resource actually tested. A changed resource creates explicit fresh obligations, while evidence for unchanged parts is retained with its applicability stated. A host surface that cannot be observed is reported as an external evidence gap rather than success.
- **AC-006 — Multi-turn benefit:** A fixed before/after set derived from the observed pre-PRD and QA-revise cases records extra continuation prompts, terminal internal stops and repeated correction attempts separately from legitimate approvals and external actions. The corrected same-scope cases need zero extra continuation prompts while all required decisions and evidence remain present. A real implementation change or host failure may still require another qualification cycle and must be explained.
- **AC-007 — Protected boundaries:** Missing/stale/foreign approval, target or run ambiguity, changed approved intent, invalid seal, incompatible runtime and read-only status requests retain their applicable checks and stop/reading behavior. Recovery does not select another run, bypass a blocker, silently reinstall or alter foreign control data.
- **AC-008 — Evidence and ownership:** The increment uses the existing canonical owners, preserves the full run/revision/evidence chain and creates no parallel authority. Automated transition coverage and actually observed installed-host multi-turn behavior are reported separately; unobserved hosts are not claimed. Every changed localized presentation is rendered and checked for every registered language.

## 6. Existing Source Of Truth

- This conversation: cause analysis followed by the user's request "Lege dazu ein Ur an oder was sagst du". The reference execution is `cockpit-active-backlog-core-ui-20261008-01`; the UTC observations above identify its relevant conversation segments.
- Reference evidence: `.agdf/control/artefacts/cockpit-active-backlog-core-ui-20261008-01/BROWNFIELD_REVIEW.md`, `UX_INTENT_DEFINITION.md`, `EVIDENCE_RESPONSIVE-03.md` and `QA_RESPONSIVE_ADDENDUM-03.md`. These support the prerequisite and version-specific qualification context; they do not approve this increment.
- `packages/core/lib/skill-dispatch/service.js`: source readiness checks, terminal recovery, continuation routing and the QA-specific route condition. `contract.js` in that directory owns skill/argument validation. `packages/core/lib/control-evaluation/` and `control-state/` retain policy and canonical writing/presentation authority.
- `plugins/agdf/meta/contracts/`, the existing authoring/review skills and `plugins/agdf/meta/agdf-interaction-locales.json` own execution instructions and localized interaction. `docs/architecture/02-dispatcher.md` documents status versus active continuation and terminal handling.
- `agdf-intake-continuation-repair` owns initial intake and the bounded post-UR review/route repair. `agdf-intermediate-status-card-reduction-20261002-01` owns suppression of redundant intermediate cards. `agdf-actionable-card-ux-20260928-01` owns general next-actor/card wording. `status-card-stale-next-action-20261008-01` owns derived next-step consistency. This increment addresses the newly observed prerequisite and QA-revise handoffs and precise recovery, reusing those owners rather than duplicating their product scope.
- Host/package compatibility and installation retain their existing owners; this increment covers preparation and truthful evidence handoff only. `.agdf/control` and existing Core evaluation remain authoritative.

## 7. Risks And Unknowns

- The analysis distinguishes observed agent mistakes from source behavior. The QA routing condition is source evidence, not proof that every host has the same failure. Brownfield Review must reproduce the exact cases and establish the smallest shared-owner changes.
- An apparently internal failure may require changed approved intent, unavailable authority or an external host action. PRD must make these outcomes observable without granting generic recovery authority. SD must preserve terminal safety and bounded retries.
- Machine-readable Markdown fields are exact contracts. More precise errors and prevalidation are required; whether representation should change is a later design question, not permission to accept malformed inputs.
- Related active runs touch dispatcher and presentation owners. Preparation must inspect their current baseline and avoid competing implementations or approval transfer.
- Native reconnection may remain a human action. The requirement reduces avoidable coordination, not all restarts or necessary repeat testing. Package/version coherence repair itself stays outside this slice.
- The before/after scenarios, host evidence route and proportional Mode/Slice decision are established after UR approval. No implementation, passing test or new host support is claimed by this draft.

## 8. Next Step

Review this UR and decide using `Approval: UR`, request revision or decline. A valid UR approval permits the existing Brownfield Review and Mode/Slice Decision next; downstream planning, implementation and QA approvals remain separate.

## AGDF Approval Summary (de; source=en)

- Problem: Beim Cockpit-Run mussten interne Arbeiten wiederholt mit „Fix it“ oder „Leg los“ angestoßen werden. Vor dem PRD fehlte zuerst die UX-Analyse; danach war ihr Pflichtfeld falsch geschrieben. Bei QA-Nacharbeit endete der Ablauf trotz erlaubter Arbeit in einer Statuskarte. Ein falscher Agent-Aufruf verursachte einen weiteren Stopp. Die Übergänge nach PRD-, SD- und TP-Freigabe liefen grundsätzlich weiter. Laufzeitabweichungen und versionsgebundene Host-Nachweise erschwerten die Wiederaufnahme zusätzlich; daraus folgt keine Erlaubnis, Kontrollen zu umgehen.
- Ziel und Betroffene: Nutzer sollen über echte Entscheidungen befinden und bereits erlaubte interne Schritte nicht selbst anschieben müssen. Agenten und Reviewer benötigen den konkreten Fehler, zuständigen Akteur und erlaubten nächsten Schritt. Interne Vorbereitung und Nacharbeit laufen bis zur nächsten notwendigen Entscheidung oder konkreten Blockade; menschliche Freigaben bleiben verbindlich.
- Umfang: Fehlende interne Voraussetzungen wie UX-Analyse über ihren bestehenden Eigentümer vorbereiten und erfassen; QA-Revise nach Implementierungsbefund, fehlendem Nachweis oder vorgelagertem Umfangs-/Designproblem unterscheiden. Nur im aktuellen Kontrollstand erlaubte Arbeit fortsetzen. Eigene unvollständige, unfreigegebene Eingaben gezielt korrigieren und vor erneuter Auswertung prüfen. Quelle, Feld oder Argument, erwartete Bedingung, beobachteter Zustand und erlaubte Korrektur müssen konkret erkennbar sein. Unveränderte Fehler führen zu einem präzisen Stopp statt zu einer Schleife.
- Darstellung und Host-Prüfung: Menschliche Entscheidung, Agentenarbeit, externe Abhängigkeit und technischer Fehler bleiben unterscheidbar. „Ich arbeite weiter“ muss zum tatsächlichen Ablauf passen. Vor einer notwendigen Neuverbindung liegen konkrete Paketkennung und zusammenhängende Prüfschritte bereit. Quellen-, Paket-, Protokoll- und echte Host-Beobachtungen bleiben getrennt; frühere Host-Nachweise gelten nicht automatisch für ein neues Paket. Weiter gültige Nachweise werden mit ihrer Gültigkeit erhalten.
- AC-001: Eine erlaubte fehlende interne UX-Voraussetzung wird vor dem PRD ohne weiteren Fortsetzungsimpuls vorbereitet und erfasst. Echte fachliche Lücken oder fehlende Berechtigung bleiben konkrete Blocker.
- AC-002: Fehlende Quelle und falsches Bereitschaftsfeld werden gezielt unterschieden. Erlaubte Korrekturen eigener unfreigegebener Entwürfe werden geprüft; unveränderte Fehler erzeugen keine Wiederholungsschleife. Freigegebene Artefakte bleiben geschützt.
- AC-003: QA-Revise-Fälle für Implementierung, fehlende Evidenz und vorgelagerten Umfang beziehungsweise Design führen zum passenden Eigentümer und erlaubten nächsten Schritt. Erlaubte Nacharbeit benötigt kein weiteres „leg los“. Erforderliche Nutzer-/Host-Aktionen bleiben sichtbar; eine Revise-Fassung ist nicht QA-freigabereif.
- AC-004: Host-Aufrufe verwenden die gültigen Felder und skillabhängigen Optionen. Ungültige Aufrufe bleiben abgewiesen, nennen aber die konkrete Korrektur. Fortsetzungsversprechen und terminaler Stopp entsprechen dem tatsächlichen Ablauf.
- AC-005: Vor erforderlicher Neuverbindung sind ein exakter Kandidat und seine Prüffolge vorbereitet. Beobachtungen nennen die tatsächlich geprüfte Fassung. Neue Fassungen erhalten gezielt neue Nachweispflichten; weiter gültige Evidenz bleibt nachvollziehbar. Eine nicht beobachtbare Host-Fläche bleibt eine externe Nachweislücke.
- AC-006: Feste Vorher-/Nachher-Fälle zählen zusätzliche Weiterarbeits-Prompts, interne terminale Stopps und wiederholte Korrekturversuche getrennt von echten Freigaben und externen Aktionen. Die korrigierten Fälle benötigen keinen zusätzlichen Weiterarbeits-Prompt; notwendige Entscheidungen und Nachweise bleiben vollständig. Echte Änderungen oder Hostfehler dürfen weitere Prüfrunden erfordern.
- AC-007: Fehlende, veraltete oder fremde Freigaben, unklare Ziele/Runs, geänderter genehmigter Umfang, ungültige Seals, inkompatible Laufzeiten und reine Statusfragen behalten ihre Kontrollgrenzen. Kein fremder Run, keine stille Neuinstallation und kein Umgehen eines Blockers.
- AC-008: Bestehende kanonische Eigentümer und die Run-/Revisions-/Nachweiskette bleiben erhalten. Automatische Ablaufprüfungen und tatsächlich beobachtete installierte Mehrturn-Abläufe werden getrennt belegt. Keine unbeobachteten Host-Zusagen; geänderte lokalisierte Darstellungen werden in allen registrierten Sprachen gerendert geprüft.
- Abgrenzung: Keine Abschaffung oder Zusammenlegung von Gates, automatischen Freigaben, zweite Kontrollinstanz oder pauschale Kartenunterdrückung. Bestehende Runs für Intake nach UR, weniger Zwischenkarten, Kartenformulierungen und veraltete Folgeschritte behalten ihren Umfang und ihre Freigaben. Installer-/Versionsmigration, automatische Host-Neustarts, globale Inventarausnahmen, Seal-Reparatur, Veröffentlichung und Git-Aktionen gehören nicht dazu. Der bestehende Cockpit-Run wird nicht umgeschrieben.
- Quellen und offene Punkte: Core-Auswertung, Dispatcher, Eingabevertrag, Skills, kanonische Writer, Interaktionsvertrag und Locale-Registry bleiben maßgeblich. Die Ursache ist teilweise falsche Agent-Ausführung, teilweise fehlende Weiterleitung und ungenaue Diagnose. Brownfield Review reproduziert die Fälle und grenzt vorhandene Arbeiten ab; PRD präzisiert beobachtbare Entscheidungen und Blocker, SD die sichere begrenzte Fortsetzung. Die genaue Vergleichsfolge und installierte Host-Prüfung stehen noch aus. Nächster Schritt nach `Approval: UR` ist Brownfield Review mit Mode/Slice Decision; diese UR erteilt keine Implementierungsfreigabe.
