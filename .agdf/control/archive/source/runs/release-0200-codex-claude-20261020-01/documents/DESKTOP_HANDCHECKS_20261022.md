# Desktop handchecks reported by the maintainer

Recorded: 2026-10-22
Run: release-0200-codex-claude-20261020-01
Evidence owner: AGDF maintainer; recorded by Codex
Assurance: human-reported manual observations
Status: reported passed; exact execution identity not supplied
Gate authority: none

## Direct human statements

The maintainer stated: "Codex Desktop und Claude Desktop von Hand geprüft."
The maintainer requested that the 0.20.0 matrix reflect the actually checked hosts and that Codex on Windows/Linux remain unqualified.

The follow-up question requested, for each Desktop host, OS, app version, model, tested commit/candidate if known, and whether upgrade and recovery were checked alongside the normal AGDF invocation. The maintainer answered: "alle".

This records that answer as confirmation of all three named scenarios for both Desktop hosts. It supplies no concrete version, model, execution date, candidate ID or primary capture. No such value is inferred from this recording date, the current checkout, the installed CLI, earlier test reports or the availability of the application.

## Reported results

| Host surface | Normal AGDF invocation | Upgrade | Recovery | Observation method |
|---|---|---|---|---|
| Codex Desktop | Reported passed | Reported passed | Reported passed | Maintainer handcheck |
| Claude Desktop | Reported passed | Reported passed | Reported passed | Maintainer handcheck |

## Execution identity and limits

| Field | Codex Desktop | Claude Desktop |
|---|---|---|
| AGDF release context | 0.20.0 preparation; exact tested payload unbound | 0.20.0 preparation; exact tested payload unbound |
| Operating system | Not specified for this handcheck | Windows from the earlier test-computer statement; exact edition/architecture not supplied for this handcheck |
| Desktop app version | Not supplied | Not supplied |
| Model | Not supplied | Not supplied |
| Tested commit / candidate / loaded runtime digest | Not supplied | Not supplied |
| Execution date / session identifier | Not supplied | Not supplied |
| Primary diagnostics or screen captures | Not supplied | Not supplied |
| Individual install/discovery, invalid-input, skill-contract, preservation or cleanup facts | Not separately described | Not separately described |
| Access path and coding-session identity | Not separately described | Not separately described |

The separate Claude CLI tuple (2.1.302 / claude-sonnet-5-5 / win32 x64 / Node v22.22.3) describes the CLI records only. It is not substituted for the Desktop tuple. Codex CLI diagnostics and Windows process-lifecycle CI are likewise not Desktop observation captures.

These are actual human assertions, not automated release records, verified screenshots, fresh model/tool traces or gate approvals. They must not be rewritten as machine-validated passes. Exact candidate binding and the scope of each advertised capability remain review obligations. No automatic, hook, MCP App rendering or technical enforcement capability is established by this report.

## Treatment in the proposed matrix

Include both Desktop surfaces as manually checked release targets, label the observation method and remaining identity gaps, and preserve these assertions without demanding a blanket repetition of the handchecks. Reuse any available original version/session/candidate information first. If exact execution identity cannot be recovered, keep the release claim explicitly unverified for that identity; any fresh targeted verification must be named and justified.

Codex CLI under Linux and native Windows remains unqualified. Neither the Desktop assertions nor green CI may qualify those combinations. Copilot and OpenCode remain experimental.

## AGDF Approval Summary (de; source=en)

Der Maintainer bestätigt manuelle Prüfungen von Codex Desktop und Claude Desktop einschließlich normalem AGDF-Aufruf, Upgrade und Wiederherstellung. Konkrete Versions-, Modell-, Sitzungs- und Kandidatenangaben sowie Primärbelege fehlen. Diese Angaben werden nicht erfunden oder aus CLI-/CI-Ergebnissen übernommen. Die Handprüfungen sind dokumentierte menschliche Aussagen und keine automatisch validierten Release- oder Gate-Freigaben. Codex unter Linux/Windows bleibt unqualifiziert; Copilot/OpenCode bleiben experimentell.
