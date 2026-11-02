agdf_revise(args: {
  // Cooperative.
  assurance: "cooperative_local";
  command: { kind?: "ur_draft.replace"; payload?: { source: { digest: string; path: string; } | { digest: string; material_id: string; }; title: string; }; } | { kind?: "source_revision.preview"; payload?: { proposal: { digest: string; path: string; } | { digest: string; material_id: string; }; source_gate: "UR" | "PRD" | "SD" | "TP"; }; } | { kind?: "source_revision.apply"; payload?: { confirmation: string; preview_digest: string; proposal: { digest: string; path: string; } | { digest: string; material_id: string; }; source_gate: "UR" | "PRD" | "SD" | "TP"; }; } | { kind?: "source_revision.recover"; payload?: { pending_digest: string; proposal: { digest: string; path: string; } | { digest: string; material_id: string; }; recovery_revision_id: string; source_gate: "UR" | "PRD" | "SD" | "TP"; }; } | { kind?: "prd_revision.reopen"; payload?: { confirmation: unknown; prd: unknown; }; } | { kind?: "operation.recover"; payload?: { original_kind: "ur_draft.replace" | "prd_revision.reopen"; pending_digest: unknown; recovery_revision_id: unknown; }; };
  // Current rev.
  expected_revision_id: unknown;
  // Replay UUID.
  operation_id: unknown;
  // BCP47 locale.
  presentation_language: string;
  primary_target: unknown;
  // Bound Run ID.
  run_id: string;
  schema_version: "1";
  target_id: unknown;
  // Target basis.
  target_source: "explicit_target" | "continued_target" | "current_repository";
  working_directory: unknown;
}
