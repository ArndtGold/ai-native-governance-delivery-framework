# UR: Cross-Surface Target Preflight For Evidence-Dependent Skills

Status: approved
Gate: UR
Gate approval: approved
Date: 2026-09-03
Owner: Arndt Gold

## 1. Problem

Direkt aufgerufene evidenzabhängige AGDF-Skills können in einem hostseitig repo-losen Chat ohne
aufgelöstes Arbeitsziel starten. Der beobachtete Aufruf von `qa-gate` in GitHub Copilot fragte den
Nutzer daraufhin pauschal nach Reviews und Tests und versprach eine interaktive QA-Karte, statt das
Ziel zu klären, vorhandene Repository-Evidenz selbst zu lesen oder genau eine QA-Entscheidung zu
treffen. Der bestehende Target-Preflight ist im kanonischen Router definiert, aber nicht in jedem
direkt aufrufbaren Skill ausreichend selbstständig operationalisiert.

## 2. Goal

Evidenzabhängige AGDF-Skills lösen oder revalidieren auf Codex, Claude Code, GitHub Copilot und
OpenCode zuerst das primäre Arbeitsziel. Bei ungeklärtem Ziel endet die Antwort nach der
lokalisierten Task Target Orientation. Bei aufgelöstem Repository lesen Skills die vorhandene
`.agdf/control/`-Evidenz selbst und liefern danach ausschließlich ihren eigenen kanonischen Output.

## 3. Scope

- Einen gemeinsamen, wiederverwendbaren Direct-Skill-Invocation-Preflight für evidenzabhängige
  Skills definieren, beginnend mit `qa-gate`.
- Den bestehenden `task-target-resolution`-Contract, `target-check` und die kanonische
  Task-Target-Orientation wiederverwenden.
- Direkte Aufrufe in allen generierten Codex-, Claude-, Copilot- und OpenCode-Profilen angleichen.
- Nach aufgelöstem Ziel vorhandene Run-, TP-, Review-, Test- und Brownfield-Evidenz selbst lesen.
- Fehlende QA-Evidenz in genau `revise` oder `block` überführen, statt eine freie Fragenliste zu
  erzeugen.
- Die Trennung zwischen Run Status Card, Quality Readiness und skill-spezifischem Output erhalten.
- Cross-Surface-Regressions, Runtime Integrity und deterministische Skill-Evaluierungen ergänzen.

## 4. Non-Goals

- Kein zweiter Target-Resolver, Statuskarten-Renderer oder dauerhafter Target Store.
- Keine Änderung der Gate-Reihenfolge oder der exakten `Approval: <GateName>`-Autorität.
- Keine native oder simulierte interaktive QA-Freigabe in Hosts ohne nachgewiesenen Adapter.
- Keine automatische QA-, UAT-, Release-, Commit-, Push- oder PR-Aktion.
- Keine Behauptung von Cross-Host-Parität ohne getrennte geladene Host-Evidenz.

## 5. Acceptance Signals

1. Ein direkter evidenzabhängiger Skill-Aufruf ohne belastbares Ziel rendert genau eine lokalisierte
   Task Target Orientation, fragt nach der kleinsten Zielklärung und stoppt vor Evidenz- oder
   Gate-Auswertung.
2. Ein direkter `qa-gate`-Aufruf mit aufgelöstem Governance-Repository liest die vorhandenen
   `.agdf/control/`-Artefakte und gibt genau `pass`, `revise` oder `block` aus.
3. Fehlende Evidenz führt zu einer fail-closed QA-Entscheidung mit einem nächsten Schritt, nicht zu
   einer Aufforderung, bereits vorhandene Repository-Evidenz manuell zusammenzustellen.
4. `gate-check` bleibt alleiniger Owner der vollständigen Run Status Card; `qa-gate` bleibt alleiniger
   QA-Entscheidungsowner und verspricht keine nicht nachgewiesene interaktive Karte.
5. Die kanonische Änderung wird deterministisch in Codex-, Claude-, Copilot- und OpenCode-Profile
   propagiert und durch Tests, Runtime Integrity und Skill-Evaluierungen abgesichert.

## 6. Existing Source Of Truth

- `plugin/meta/contracts/task-target-resolution.md`
- `plugin/meta/contracts/interaction.md`
- `plugin/meta/contracts/quality.md`
- `plugin/meta/contracts/gate-transition.md`
- `plugin/meta/agdf-agent-router.md`
- `plugin/skills/gate-check/SKILL.md`
- `plugin/skills/qa-gate/SKILL.md`
- `create-agdf/lib/task-target-resolution.js`
- `create-agdf/lib/interaction-presentation.js`
- `create-agdf/scripts/sync-package-assets.js`
- abgeschlossener Run `task-target-resolution-boundary`
- abgeschlossener Run `quality-readiness-surface`

## 7. Risks And Unknowns

- Der Preflight darf nicht in jedem Skill als abweichende Regel kopiert werden.
- Ein direkter Skill-Aufruf darf den Host-Arbeitsordner nicht still als Governance-Ziel übernehmen.
- Zielklärung, Statuskarte, Quality Readiness und QA-Entscheidung dürfen nicht vermischt werden.
- Generierte Profile können korrekt sein, während ein geladener Host alte Skill-Bytes verwendet.
- Brownfield Review und SD müssen die kleinste gemeinsame Orchestrierungsstelle und den Umfang der
  evidenzabhängigen Skills festlegen.

## 8. Approval Evidence

Exaktes `Approval: UR` am 2026-09-03 im aktuellen Codex-Task nach sichtbarem UR-Entwurf.

## 9. Next Step

Brownfield Review und Mode/Slice-Entscheidung durchführen.
