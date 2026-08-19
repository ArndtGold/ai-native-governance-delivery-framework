import { getProfileDefinition, isStagedProfile } from "./profiles.js";

export function renderMarkdown(report) {
  if (report.profile_id && isStagedProfile(getProfileDefinition(report.profile_id))) {
    const lines = [
      "# AGDF Staged Proportionality Observation",
      "",
      `- Status: \`${report.status}\``,
      `- Evidenzgrenze: ${report.evidence_boundary}`,
      `- Profil/Protokoll: \`${report.profile_id}\` / \`${report.protocol_version}\``,
      ...(report.evidence_class ? [
        `- Corpus/Baseline: \`${report.corpus_version}\` / \`${report.baseline_version}\``,
        `- Report-Version: \`${report.report_version}\``,
        `- Evidenzklasse: \`${report.evidence_class}\``,
        `- Authentifizierte Live-Host-Evidenz: \`${report.authenticated_live_host_evidence}\``,
        `- Live-Host-Nichtbehauptung: ${report.live_host_non_claim}`,
      ] : []),
      `- Serie: \`${report.series_id ?? "none"}\``,
      `- Surface/Modell: \`${report.surface ?? "none"}\` / \`${report.model ?? "none"}\``,
      `- Runtime/AGDF/Adapter/Runner: \`${report.runtime_version ?? "none"}\` / \`${report.agdf_version ?? "none"}\` / \`${report.adapter_version ?? "none"}\` / \`${report.runner_version}\``,
      `- Freshness: \`${report.freshness_status}\``,
      `- Beobachtungen: ${report.valid_observations}`,
      `- Coverage: ${report.scenarios.filter((item) => !item.blocking_reasons.includes("coverage")).length}/${report.scenario_count} Szenarien aus ${report.case_count} Fällen`,
      `- Stage-/Pfad-Szenarien: ${report.stage_scenario_count}/${report.path_scenario_count}`,
      `- Kritische Under-Governance: ${report.critical_under_governance_ids.length}`,
      `- Stage-Abweichungen: ${report.stage_deviation_ids.length}`,
      `- Pfad-Over-Governance: ${report.over_governance_ids.length}`,
      `- Small-Segment Over-Governance: ${report.small_segment_over_governance_ids.length}/${report.small_segment_denominator} (${report.small_segment_over_governance_percent} %)`,
      `- Ambiguous/Stale/Incomplete: ${report.ambiguous_ids.length}`,
      "",
      "| Szenario | Lifecycle | Soll-Stage | Stage-Konsens | Soll-Pfad | Pfad-Konsens | Status |",
      "|---|---|---|---|---|---|---|",
    ];
    for (const item of report.scenarios) lines.push(`| ${item.scenario_id} | ${item.lifecycle_stage} | ${item.expected_next_permissible_stage ?? "n/a"} | ${item.consensus_stage ?? "n/a"} | ${item.expected_delivery_path ?? "n/a"} | ${item.consensus_delivery_path ?? "n/a"} | ${item.status} |`);
    return `${lines.join("\n")}\n`;
  }
  const lines = [
    "# AGDF Proportionality Benchmark",
    "",
    `- Status: \`${report.status}\``,
    `- Evidenzgrenze: ${report.evidence_boundary}`,
    `- Serie: \`${report.series_id ?? "none"}\``,
    `- Surface/Modell: \`${report.surface ?? "none"}\` / \`${report.model ?? "none"}\``,
    `- Runtime/AGDF/Adapter/Runner: \`${report.runtime_version ?? "none"}\` / \`${report.agdf_version ?? "none"}\` / \`${report.adapter_version ?? "none"}\` / \`${report.runner_version}\``,
    `- Freshness: \`${report.freshness_status}\``,
    `- Beobachtungen: ${report.valid_observations}`,
    `- Coverage: ${report.cases.filter((item) => !item.blocking_reasons.includes("coverage")).length}/${report.case_count}`,
    `- Kritische Under-Governance: ${report.critical_under_governance_ids.length}`,
    `- Small-Segment Over-Governance: ${report.unanimous_over_governance_small_cases}/${report.small_segment_denominator} (${report.small_segment_over_governance_percent} %)`,
    `- Ambiguous/Stale/Incomplete: ${report.ambiguous_ids.length}`,
    "",
    "| Case | Soll | Verteilung | Konsens | Status |",
    "|---|---|---|---|---|",
  ];
  for (const item of report.cases) {
    const distribution = Object.entries(item.distribution).map(([path, count]) => `${path}:${count}`).join(", ") || "none";
    lines.push(`| ${item.case_id} | ${item.expected_delivery_path} | ${distribution} | ${item.consensus_delivery_path ?? "none"} | ${item.status} |`);
  }
  return `${lines.join("\n")}\n`;
}
