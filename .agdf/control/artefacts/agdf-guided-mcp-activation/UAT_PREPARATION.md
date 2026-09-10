# UAT Preparation: Geführte MCP-Aktivierung während der AGDF-Installation

- revision: 4
- date: 2026-09-09
- based_on: approved PRD Revision 2, approved SD Revision 2, approved TP Revision 2 and QA Report Revision 4
- status: `ready`
- authorizes: `false`

## Gate-Grenze

QA Report Revision 4 wurde nach derselben Ziel-, Run-, Gate- und Revisionsprüfung exakt mit
`Approval: QA` freigegeben. Die Freigabe ist in
`evidence/QA_APPROVAL_20260909_R4.json` gebunden. Damit darf die vorbereitete UAT ausgeführt
und getrennte Host- und Nutzerevidenz erfasst werden. Diese Vorbereitung selbst führt keine
Installation, Registrierung, Hostmutation oder Nutzerabnahme aus und enthält noch keine
UAT-Entscheidung.

## UAT-Fälle

| Fall | Nutzerhandlung | Erwartbare sichtbare Evidenz | Status |
|---|---|---|---|
| GMA-U01 | Installer interaktiv starten | Plugin-Zustand, Invocation-Ziel und verfügbare Scopes erscheinen vor einer Mutation. | unverified |
| GMA-U02 | Leere und ungültige Setup-Eingabe verwenden | Keine Auswahl, klare Wiederholung, keine Mutation. | unverified |
| GMA-U03 | Plugin-only wählen | Plugin wird geprüft/installiert; MCP bleibt unverändert. | unverified |
| GMA-U04 | Full Setup und Project wählen | Projektpfad und nativer Projekt-Registrierungspfad sind getrennt sichtbar; nur Project wird registriert. | unverified |
| GMA-U05 | MCP-Fehler provozieren | Plugin-Erfolg bleibt sichtbar; MCP-Fehler und genau eine Recovery-Aktion erscheinen. | unverified |
| GMA-U06 | Host neu starten und frische Sitzung öffnen | Discovery wird erst nach direkter Hostbeobachtung als vorhanden behandelt. | unverified |
| GMA-U07 | Gekoppelte Entfernung prüfen | AGDF-eigene Teilzustände und erhaltene fremde oder geteilte Zustände bleiben verständlich. | unverified |
| GMA-U08 | Full Setup öffnen, Project/User vergleichen, Back und User wählen | Nutzer versteht Projekt versus benutzerweiter Hoststandard, native Priorität und dass Back nichts ändert. | unverified |
| GMA-U09 | `npm run install:<host>` aus Repositorywurzel starten | Sichtbarer Vorschlag ist die Repositorywurzel, nicht `create-agdf`; Herkunft wird benannt. | unverified |

## Direkte Hostmatrix

| Host | Installation | Project | User | Back/Cancel | Restart/Discovery | Removal |
|---|---|---|---|---|---|---|
| Codex | unverified | unverified | unverified | unverified | unverified | unverified |
| Claude Code | unverified | unverified | unverified | unverified | unverified | unverified |
| GitHub Copilot | unverified | unverified | unverified | unverified | unverified | unverified |
| OpenCode | unverified | unverified | unverified | unverified | unverified | unverified |

## Annahmekriterien

- Kein UAT-Fall darf aus Repository- oder Protokolltests als bestanden abgeleitet werden.
- Jede Hostspur nennt Hostversion, Betriebssystem, Architektur, Scope, Registrierungspfad,
  wirksame Quelle, Pluginzustand, Restart und frische Sitzung.
- GMA-U08 benötigt menschliche Rückmeldung zur Verständlichkeit der Reichweite und Priorität.
- GMA-U09 benötigt die direkt sichtbare lokale Installation aus der Repositorywurzel.
- Native Windows-Unterstützung bleibt ohne eigenen Windows-Lauf unverified.

## Nächster zulässiger Schritt

Die UAT-Fälle dürfen jetzt mit den bereits getrennt autorisierten Hostmutationen ausgeführt werden.
Erst nach vollständiger, präsentierter Evidenz darf ein exaktes `Approval: UAT` angefordert werden.
Release, Commit und Push bleiben unabhängig davon gesperrt.
