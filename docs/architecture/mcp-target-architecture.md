# Zielarchitektur: Fachliche MCP-Schnittstellen

**Status dieses Dokuments: Diskussionsvorschlag, nicht normativ.** Es beschreibt mögliche
fachliche Fähigkeiten für einen künftigen MCP-Zugang zu AGDF. Die Vorschläge ändern weder die
Verfügbarkeit noch die Bedeutung bestehender Werkzeuge.

## Statuslegende

- **`implemented` (Repository-Quelle):** im untersuchten Quellstand durch Vertrag oder Code belegt.
- **`decided`:** durch bestehende kanonische Verträge oder dokumentierte Architekturentscheidungen festgelegt.
- **`candidate`:** fachliche Möglichkeit zur Diskussion; weder MCP-Name noch Schema oder Registrierung sind damit beschlossen.
- **`open`:** braucht eine eigene Entscheidung oder belastbare Evidenz.

Die Aussagen zu implementiertem Verhalten beziehen sich auf die Repository-Quellen, die am
30.09.2026 geprüft wurden. Sie sind keine Aussage über eine veröffentlichte Version oder eine gerade
geladene Host-Sitzung. Die [Architekturübersicht](README.md) und der
[Dispatcher-Use-Case-Katalog](dispatcher.md) beschreiben diesen Quellstand. Paketmetadaten,
veröffentlichtes Paket und geladene Host-Sitzung benötigen jeweils eigene Nachweise. Die Kandidaten
in diesem Dokument erweitern das implementierte Verhalten nicht.

## Ausgangspunkt: heutige Grenze

### `implemented`: zwei Werkzeugverträge im untersuchten Quellstand

Der Quellstand enthält die Verträge für `agdf_dispatch` und `agdf_inspect`. Der Dispatcher nimmt
eine kanonische Skill-Auswahl entgegen, bindet den Zielkontext und liefert ein Kontrollergebnis oder
einen begrenzten Fortsetzungsauftrag. Der Inspect-Vertrag bietet lesende Kontrollabfragen für
`doctor`, `gate-check`, `delivery-map` und `contract`. Seine Auswahlregeln sind ausdrücklich
schreibgeschützt.

Die semantischen Eigentümer sind die Verträge in
[`skill-dispatch/contract.js`](../../create-agdf/lib/skill-dispatch/contract.js) sowie
[`control-inspect/contract.js`](../../create-agdf/lib/control-inspect/contract.js) und
[`selection.js`](../../create-agdf/lib/control-inspect/selection.js). Die MCP-Laufzeit setzt diese
Definitionen zusammen; der
[MCP-Server](../../agdf-mcp-server/src/server.js) registriert sie und leitet Aufrufe weiter. Der
Adapter fügt keine fachliche Gate- oder Freigabelogik hinzu.

Run-Zuordnung, Intake-Schritte, Gate-Artefaktvorbereitung und Präsentationsvorbereitung sind im
[aktuellen Dispatcher-Katalog](dispatcher.md#use-case-katalog) erläutert. Der Dispatcher gibt
begrenzt gebundene Aufträge zurück; der Agent führt die Schritte über bestehende Skills und Writer
aus. Daraus folgt keine allgemeine MCP-Schreib- oder Approval-API für das hier diskutierte Zielbild.

**Offen:** Ob und in welchen Releases diese Quellverträge als MCP-Werkzeuge verfügbar sind, muss
separat anhand des Pakets, der Installation und der jeweiligen Host-Sitzung belegt werden. Eine
Quellcode-Definition oder Registrierung allein weist diese Eigenschaften nicht nach.

### `decided`: bestehende Quelleigentümer bleiben maßgeblich

| Verantwortung | Kanonischer Eigentümer |
|---|---|
| Aktivierung, Zielbindung, Interaktion und Gate-Regeln | [Runtime-Verträge](../../plugin/meta/contracts/) |
| Semantik von `agdf_dispatch` | [`skill-dispatch/contract.js`](../../create-agdf/lib/skill-dispatch/contract.js) und der zugehörige Service |
| Semantik und Auswahl von `agdf_inspect` | [`control-inspect/contract.js`](../../create-agdf/lib/control-inspect/contract.js) und [`selection.js`](../../create-agdf/lib/control-inspect/selection.js) |
| Deterministische Gate- und Kontrollauswertung | [`control-evaluation/`](../../create-agdf/lib/control-evaluation/) |
| Persistierter Run, Artefakte und Revisionen | [`control-state/`](../../create-agdf/lib/control-state/) |
| MCP-Transport und Weiterleitung | [`mcp-dispatch-runtime.js`](../../create-agdf/lib/mcp-dispatch-runtime.js) und [`agdf-mcp-server/`](../../agdf-mcp-server/) |

Diese Übersicht ist keine zweite Vertragsquelle. Das bestehende Context-Graph-Thema
[`CG-MCP-DISPATCH-ADAPTER`](../../.agdf/control/CONTEXT_GRAPH.md#cg-mcp-dispatch-adapter) hält die
MCP-Adaptergrenze und die vorhandenen Architektur-Invarianten fest.

## Zielbild: `candidate` — fachliche Fähigkeiten

Die Gruppen folgen Nutzerabsichten. Sie sind **keine** vorgeschlagene 1:1-Liste finaler MCP-Tools;
eine Fähigkeit kann als bestehender Tool-Aufruf, lesbare Resource oder Teil eines anders
geschnittenen Vertrags umgesetzt werden. Namen in dieser Tabelle sind bewusst fachliche Gruppen,
keine API-Namen.

| `candidate` | Zweck | Eingaben und Bindung | Mögliches Ergebnis | Nebenwirkungen | Fehler- und Grenzverhalten |
|---|---|---|---|---|---|
| **Auftrag und Bindung** | Einen Nutzerauftrag einem expliziten Projekt und – falls vorhanden – einem konkreten Run zuordnen, bevor eine Governance-Prüfung beginnt. | Eindeutiges Ziel samt Herkunft der Zielauswahl; optional `run_id`; gewünschte Aktion oder kanonischer Skill. Das Arbeitsverzeichnis allein ist keine Zielautorität. | Bestätigte Ziel-/Run-Bindung, nächste zulässige Aktion oder ein sichtbarer Klärungsbedarf. | Im Kandidatenfall lesend; Run-Erzeugung wäre eine gesondert zu entscheidende Zustandsänderung. | Mehrdeutiges Ziel, widersprüchliche Run-Zuordnung oder fehlender Beleg führt zum Halt und zur Klärung. Kein stilles Raten anhand des Arbeitsverzeichnisses. |
| **Kontrollabfrage** | Den Stand eines bereits gebundenen Runs und seiner Voraussetzungen verständlich abfragen. | Ziel und optional expliziter `run_id`; Abfrageart und, falls passend, Artefakt- oder Gate-Bezug. | Gate, Revision, Blocker, zulässiger nächster Schritt sowie Verweise auf maßgebliche Evidenz. | Lesend; keine Freigabe, Statusänderung oder implizite Run-Auswahl. | Nicht vorhandener Run, unvollständiger Kontrollzustand oder nicht verfügbare Evidenz wird als solcher ausgewiesen. Keine Ausgabe als „bestanden“, wenn erforderliche Informationen fehlen. |
| **Entscheidungsvorbereitung** | Eine anstehende menschliche Gate-Entscheidung auf den exakten Prüfgegenstand beziehen und verständlich darstellen. | Gebundenes Ziel, Run, Gate, Artefakt, Revision und Digest der angezeigten Fassung. | Kanonische Entscheidungsdarstellung mit Status, Konsequenzen, Artefaktverweis und eindeutiger Antwortform. | Vorbereitung bleibt lesend. Nur ein nachgelagerter, eigens autorisierter Vorgang könnte eine Entscheidung erfassen. | Veraltete Revision, abweichender Digest oder unvollständiges Artefakt macht die Darstellung ungültig und erfordert eine neue Prüfung. Der Host zeigt die Entscheidung; der Mensch trifft sie. |
| **Zustandsänderung** | Eine künftig ausdrücklich genehmigte Aktion ausführen, etwa eine menschliche Freigabe oder einen Evidenzverweis zu persistieren. | Mindestens exaktes Ziel, Run, Gate, Revision und Artefakt-Digest; zusätzlich eine bewusste, host-verifizierbare menschliche Aktion, Provenienz und ein Idempotenzbezug. | Persistierter Folgestand mit neuer Revision und eindeutigem Nachweis der ausgeführten Aktion. | **Schreibend.** Betrifft kanonischen Kontrollzustand und muss durch dessen bestehenden Owner erfolgen. | Veraltete Bindung, fehlende Freigabe, doppelte Aktion, unzulässiger Übergang oder unklare Provenienz wird fail-closed abgewiesen. Wiederholung und Wiederherstellung brauchen definierte, prüfbare Regeln. |

Die ersten drei Gruppen sind Kandidaten für klar begrenzte Abfragen oder Entscheidungsvorbereitung.
Die vierte Gruppe ist **bedingte Zukunftsarbeit**: Im untersuchten Quellstand ist hier keine sichere,
allgemeine MCP-Schreib- oder Approval-API belegt. MCP-Transport oder Host-Bestätigung allein sind
kein Nachweis menschlicher Freigabe.

## `decided`: Autoritätsgrenzen

| Beteiligter | Zuständigkeit | Grenze |
|---|---|---|
| Mensch | Formuliert Auftrag und Scope; erteilt geforderte Freigaben bewusst. | Ein Modellvorschlag oder erfolgreicher Tool-Aufruf ersetzt keine menschliche Entscheidung. |
| Agenten-Host | Macht Werkzeuge sichtbar, handhabt Host-Berechtigungen und stellt die Interaktion dar. | Der Host wird nicht zur Quelle für AGDF-Policy oder kanonischen Run-Zustand. |
| MCP-Adapter | Übersetzt typisierte Protokollaufrufe in bestehende, kanonische Services. | Keine eigene Aktivierungs-, Ziel-, Gate-, Approval- oder Persistenzlogik. |
| Dispatcher und Services | Wenden die bestehenden Aktivierungs-, Ziel- und Ablaufregeln an und liefern strukturierte Ergebnisse. | Keine zweite Implementierung dieser Regeln im MCP-Server. |
| Gate-/Kontrollauswertung | Bestimmt den regelbasierten Kontrollstand. | Ergebnisdarstellung entscheidet nicht selbst über eine Freigabe. |
| Kontrollzustand | Besitzt gespeicherte Runs, Artefakte, Freigaben und Revisionen. | MCP-Adapter führen keine parallele Zustandsablage ein. |

## `candidate`: MCP-Primitiven nach Aufgabe auswählen

Diese Zuordnung ist **vorläufig**. Sie hängt unter anderem von Host-Unterstützung, Aktualität,
Interaktion und dem notwendigen Entscheidungskontext ab.

| MCP-Primitiv | Mögliche Rolle im Zielbild | Abwägung |
|---|---|---|
| **Tools** | Gebundene Kontrollabfragen oder eine klar umrissene Entscheidungsvorbereitung; bestehende Werkzeugverträge bleiben der Vergleichspunkt. | Gut für validierte Eingaben und strukturierte Ergebnisse. Jeder Aufruf muss Ziel und Wirkungsgrenze explizit machen. Schreibende Tools brauchen zusätzlich eine eigenständige Freigabe- und Persistenzentscheidung. |
| **Resources** | Lesender Zugriff auf stabile Verträge, Zustandszusammenfassungen oder referenzierte Evidenz. | Nur sinnvoll, wenn Quelle, Zielbindung, Aktualitätsstand und Provenienz erkennbar bleiben. Eine Resource erteilt oder persistiert keine Freigabe. |
| **Prompts** | Wiederverwendbare Orientierung für typische Abläufe oder für die Interpretation einer Kontrollabfrage. | Kann die Interaktion vereinheitlichen, besitzt aber weder Policy noch Berechtigung. Host-Unterstützung und sichtbare Anwendung müssen separat geprüft werden. |

**Offen:** Ob eine Zustandsabfrage als bestehendes Inspect-Werkzeug, spezialisierter Tool-Vertrag,
Resource oder Kombination am besten verständlich ist. Diese Entscheidung sollte anhand realer
Konsumenten, Frischeanforderungen und Host-Evidenz getroffen werden, nicht anhand einer abstrakten
Vollständigkeit der MCP-Primitiven.

## `candidate`: Entwicklung in getrennten Schritten

1. **Diskussion:** Dieses Dokument sammelt fachliche Gruppen, Grenzen und offene Fragen. Der
   bestehende Quellvertrag bleibt unverändert.
2. **Auswahl:** Ein späterer, separat genehmigter Scope wählt einen konkreten Anwendungsfall und
   bestimmt dessen fachlichen Owner, Bindung, Ergebnistypen, Fehler, Nebenwirkungen und
   Autorisierung.
3. **Vertrag und Kompatibilität:** Der bestehende kanonische Owner wird erweitert oder – nur mit
   begründetem Architekturentscheid – ein neuer Owner benannt. Schema-Versionierung,
   Kompatibilität, Migration, Evidenz und Rückweg werden vor einer Einführung festgelegt.
4. **Umsetzung:** MCP bleibt Adapter. Fachregeln und Zustand werden in den bestehenden
   kanonischen Services umgesetzt oder von ihnen aufgerufen; Tool-, Resource- und Prompt-Verträge
   werden daraus abgeleitet und nicht parallel gepflegt.
5. **Qualifikation:** Pro Release und Host werden Protokoll, Discovery, Aufruf, Fehlergrenzen,
   Berechtigungen und Bereinigung separat nachgewiesen. Repository-Code allein begründet keine
   Host-Unterstützung.

**`decided`:** Die bestehenden Interfaces bleiben wirksam, bis eine separate Freigabe ihren
kanonischen Vertrag und den Kompatibilitätspfad ändert. Dieses Dokument benennt keine
Migrationsfrist und nimmt keine Umstellung vor.

## `open`: Offene Entscheidungen

- Welche konkrete Nutzerabsicht rechtfertigt einen zusätzlichen MCP-Vertrag neben den vorhandenen
  Dispatcher- und Inspect-Verträgen?
- Soll der Aufruf fachlich fein geschnitten oder weiterhin über die kanonische Skill-Auswahl
  vermittelt werden? Wer besitzt dann Beschreibung, Schema und Semantik?
- Welche Kontrollinformationen dürfen als Resource erscheinen, und wie werden Bindung, Freshness,
  Provenienz und veraltete Snapshots kenntlich gemacht?
- Welche MCP-Primitiven unterstützen die relevanten Zielhosts tatsächlich und mit welcher
  Interaktions- und Berechtigungssemantik?
- Wie nimmt eine MCP-gestützte Interaktion nach einer ausdrücklichen Fortsetzung direkt den
  angezeigten nächsten Schritt auf, statt dieselbe Statuskarte erneut auszugeben, und wie werden
  Sprache sowie Pflichtzusammenfassungen vor der Freigabepräsentation geprüft? Beobachtung aus
  diesem Dokumentationslauf am 29.09.2026: Nach „Leg los“ erschien eine Statuskarte erneut; die
  erforderliche Lokalisierung der QA-Zusammenfassung wurde erst nach fehlgeschlagenen
  Präsentierungsversuchen sichtbar. Das sollte als Interaktions- und Orchestrierungsanforderung
  diskutiert werden, ohne die bewusste menschliche Freigabe zu verkürzen.
- Welcher kanonische Dienst könnte eine schreibende Aktion besitzen, und wie wird die bewusste
  menschliche Entscheidung host-verifizierbar an Ziel, Run, Gate, Revision und Digest gebunden?
- Welche Fehler-, Retry-, Idempotenz-, Audit- und Recovery-Evidenz wäre für eine solche
  Zustandsänderung erforderlich?

### Beobachtungen zur Durchführung dieses Laufs

Die folgenden Punkte sind konkrete Verbesserungsansätze aus dem Dokumentationslauf. Sie sind
Diskussionsinput und noch keine verbindlichen Architekturentscheidungen:

- **Fortsetzung:** Nach einer ausdrücklichen Fortsetzung sollte der Agent den angezeigten nächsten
  Schritt ausführen, statt dieselbe Statuskarte erneut aufzurufen.
- **Präsentations-Preflight:** Berichtssprache, Interaktionssprache und erforderliche lokalisierte
  Zusammenfassung sollten vor dem ersten Freigabeversuch gemeinsam validiert werden.
- **Einmalige Berichtrevision:** Der QA-Bericht sollte vor dem Speichern vollständig auf
  Pflichtfelder und Presenter-Kompatibilität geprüft werden, damit unnötige Revisionen und
  abgelehnte Präsentationen entfallen.
- **Konsistente Runtime-Bindung:** Die tatsächlich ausführbare CLI-Bindung sollte aus derselben
  verifizierten Runtime-Quelle stammen wie der Dispatcher; ein Pfadfehler führte hier zu einem
  zusätzlichen Aufruf.
- **Gespräch oder Dateiänderung:** Eine Bitte, etwas „in der Diskussion“ aufzugreifen, sollte im
  Gespräch beantwortet werden, solange kein Dokumentieren oder Ändern verlangt ist. Das verhindert
  unnötige Datei- und Kontrollpfade bei einer gewünschten Diskussion.

Bis diese Fragen in einem separat genehmigten Scope beantwortet sind, bleiben Capability-Gruppen,
Primitiven-Zuordnung und Schreibaktionen Kandidaten beziehungsweise offen.
