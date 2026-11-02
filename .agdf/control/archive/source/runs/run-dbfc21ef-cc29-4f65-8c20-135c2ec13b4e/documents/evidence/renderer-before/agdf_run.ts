agdf_run(args: {
  // Cooperative.
  assurance: "cooperative_local";
  command: { kind: "run.create"; payload: { title: string; }; };
  // Replay UUID.
  operation_id: string;
  // BCP47 locale.
  presentation_language: string;
  primary_target: string;
  schema_version: "1";
  target_id: string;
  // Target basis.
  target_source: "explicit_target" | "continued_target" | "current_repository";
  working_directory: string;
}
