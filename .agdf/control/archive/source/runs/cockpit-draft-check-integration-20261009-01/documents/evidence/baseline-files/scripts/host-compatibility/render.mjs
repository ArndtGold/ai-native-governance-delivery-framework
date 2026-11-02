import { CAPABILITIES, HOSTS, OUTCOMES, SYSTEMS } from "./contract.mjs";
const escape = value => String(value ?? "unknown").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("|", "\\|").replaceAll("\n", " ");
const hostName = { codex: "Codex", claude: "Claude Code", copilot: "GitHub Copilot", opencode: "OpenCode" };
const osName = { darwin: "macOS", linux: "Linux", win32: "native Windows" };

export function renderComparison(report) {
  const lines = ["# AGDF Host Compatibility", "", "Generated dated evidence snapshot. Inspect existing AGDF local status for your own installation.", "",
    `AGDF canonical version: **${escape(report.snapshot.version)}**.`,
    `Observation dates: ${escape(report.dates[0])} to ${escape(report.dates.at(-1))}.`,
    `Source fingerprint: \`${report.snapshot.digest}\`.`,
    `Report consistency: **${report.consistent ? "valid" : "invalid"}**. Deterministic scenarios: **${report.scenarios.evaluated} evaluated, ${report.scenarios.failed} unexpected failures**.`, "",
    "These scenario results describe isolated production fixtures. Expected negative cases can pass the test while the observed capability is failed. They provide no fresh-host or human-UAT proof.", "",
    "[Recorded facts](evidence/facts.json) · [Exact observations and source identities](evidence/snapshot.json)", "",
    "## Five deterministic outcomes", "",
    "| Host | Installed | Discovered | Callable | Updated | Recoverable |",
    "|---|---|---|---|---|---|",
  ];
  for (const host of HOSTS) lines.push(`| ${hostName[host]} | ${OUTCOMES.map(claim => escape(report.rows.find(row => row.environment.host === host && row.scenario === claim)?.state ?? "unverified")).join(" | ")} |`);
  lines.push("", "Each outcome is independent. Legacy installation `healthy` does not establish discovery, invocation, effective update, recovery or automatic execution.", "", "## Native coverage", "",
    "Inventory of required evidence, not twelve supported combinations. Unknown host versions are gaps, never wildcard matches.", "",
    "| Host | OS | Variant / version | Fresh installation, discovery, invocation, update and recovery | Next action |", "|---|---|---|---|---|");
  for (const host of HOSTS) for (const os of SYSTEMS) {
    const rows = report.native.filter(row => row.environment.host === host && row.environment.os === os && OUTCOMES.includes(row.claim));
    if (!rows.length) lines.push(`| ${hostName[host]} | ${osName[os]} | unverified | unverified | Record an exact authorized host/OS observation and fresh-session payload identity. |`);
    else for (const row of rows) lines.push(`| ${hostName[host]} | ${osName[os]} | ${escape(row.environment.variant)} / ${escape(row.environment.host_version)} / ${escape(row.environment.path)} | ${escape(row.claim)}: ${escape(row.state)} (${escape(row.lane)}) | ${escape(row.next_action)} |`);
  }
  lines.push("", "## Capability evidence", "",
    "Available skills, automatic checks, observed governance and technical enforcement are separate promises. Enforcement needs its exact mechanism, action and primary/subagent path. Trust or a consent receipt is not evidence that a check ran.", "",
    "| Host | Available skills | Automatic checks | Observed governance | Technical enforcement |", "|---|---|---|---|---|");
  for (const host of HOSTS) lines.push(`| ${hostName[host]} | ${CAPABILITIES.map(claim => {
    const rows = report.native.filter(row => row.environment.host === host && row.claim === claim);
    return rows.length ? rows.map(row => `${escape(row.state)}: ${escape(row.environment.variant)} ${escape(row.environment.host_version)}, ${escape(row.environment.os)}, ${escape(row.environment.path)}, ${escape(row.mechanism)} [evidence](evidence/snapshot.json)`).join("<br>") : "unverified in a current native tuple";
  }).join(" | ")} |`);
  lines.push("", "Native observation import is explicit. Inventory gaps do not invent executable native tuples. The snapshot identifies each supplied observation's lane and scope.", "",
    "## Scoped observations", "",
    "All rows below use the deterministic_adapter lane, a simulated host, the recorded actual execution OS and fixture version. Target platform strings do not establish native execution. The linked facts retain expected and observed payload digests, runtime identity, permission/activation conditions and scenario outcomes.", "",
    "| Observation | OS / path | Outcome | Observed state | Scenario conformance | Evidence | Limitation / next action |", "|---|---|---|---|---|---|---|");
  for (const row of report.rows) {
    lines.push(`| ${escape(row.id)} | ${escape(osName[row.environment.os])} / ${escape(row.environment.path)} | ${escape(row.claim)} | ${escape(row.state)} | ${row.conformance.passed ? "pass" : "FAIL"} | [${escape(row.id)}](evidence/facts.json) | Simulated host only. ${escape(row.next_action)} |`);
  }
  lines.push("", "## Historical evidence", "", "Original result and enforcement vocabulary are preserved. Missing OS, payload digest or path identity prevents current support claims. Historical records do not transfer approvals or establish support for the current payload.", "",
    "| Observation | Original host version / AGDF | Original evidence class | Original result | Original enforcement | Applicability |", "|---|---|---|---|---|---|");
  for (const o of report.historical) lines.push(`| ${escape(o.id)} | ${escape(o.host_version)} / ${escape(o.canonical_version)} | ${escape(o.original.evidence_class)} | ${escape(o.original.result)} | ${escape(o.original.enforcement_class)} | historical / incomplete identity |`);
  lines.push("", "Historical source and individual reference hashes are retained in the snapshot. Original transcripts are not copied into this public comparison.", "",
    "## Verification and recovery", "",
    "Use the existing local status and bounded verification/retry paths. A failed or pending retry remains unresolved until a matching new observation is recorded. Denied automatic checks leave manual verification available. Generating or checking this report never installs a host, changes permission, restarts a session or grants a governance approval.", "");
  return lines.join("\n");
}
