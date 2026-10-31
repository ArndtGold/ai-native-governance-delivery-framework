agdf_inspect(args: {
  // Doctor/map scope.
  all_active?: boolean;
  // Next page cursor.
  cursor?: string;
  // Bound revision.
  expected_revision_id?: string;
  // Gate selector.
  gate?: "UR" | "PRD" | "SD" | "TP" | "QA" | "UAT";
  // Contract or UUID.
  module?: string;
  // Read operation.
  operation: "doctor" | "gate-check" | "delivery-map" | "contract" | "artifact-readiness" | "authoring-inputs" | "operation-contract" | "operation-status" | "native-qualification" | "presentation-document" | "presentation-preview" | "runtime-generations" | "project-state" | "inventory";
  // Presentation ID.
  presentation_id?: string;
  // Reply language.
  presentation_language: string;
  // Confirmed target.
  primary_target?: string;
  // Confirmed Run.
  run_id?: string;
  // Target identity.
  target_id?: string;
  // Target provenance.
  target_source?: "explicit_target" | "continued_target" | "current_repository";
  // Status variant.
  variant?: "status-card" | "approval-envelope";
  // Context directory.
  working_directory: string;
}
