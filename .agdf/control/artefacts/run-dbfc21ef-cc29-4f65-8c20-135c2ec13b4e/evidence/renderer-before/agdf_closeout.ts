agdf_closeout(args: {
  // Cooperative.
  assurance: "cooperative_local";
  command: { kind?: "closeout.record"; payload?: { confirmation: string; or: { digest: string; path: string; } | { digest: string; material_id: string; }; }; } | { kind?: "closure.preview"; payload?: { entries: Array<{ outcome: "superseded" | "abandoned"; reason: string; run_id: string; successor_reference?: string; successor_run?: string; }>; }; } | { kind?: "closure.apply"; payload?: { confirmation: string; preview_id: string; }; } | { kind?: "operation.recover"; payload?: { original_kind: "closeout.record" | "lifecycle_close.record"; pending_digest: string; recovery_revision_id: string; }; };
  // Current rev.
  expected_revision_id?: string;
  // Replay UUID.
  operation_id: string;
  // BCP47 locale.
  presentation_language: string;
  primary_target: string;
  // Bound Run ID.
  run_id?: string;
  schema_version: "1";
  target_id: string;
  // Target basis.
  target_source: "explicit_target" | "continued_target" | "current_repository";
  working_directory: string;
}
