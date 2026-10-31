agdf_prepare(args: {
  // Cooperative.
  assurance: "cooperative_local";
  command: { kind?: "presentation.prepare"; payload?: { gate: "UR" | "PRD" | "SD" | "TP" | "QA" | "UAT"; }; } | { kind?: "presentation.deliver"; payload?: { gate: "UR" | "PRD" | "SD" | "TP" | "QA" | "UAT"; presentation_id: string; route: "automatic" | "markdown" | "fallback"; }; };
  // Current rev.
  expected_revision_id: string;
  // Replay UUID.
  operation_id: string;
  // BCP47 locale.
  presentation_language: string;
  primary_target: string;
  // Bound Run ID.
  run_id: string;
  schema_version: "1";
  target_id: string;
  // Target basis.
  target_source: "explicit_target" | "continued_target" | "current_repository";
  working_directory: string;
}
