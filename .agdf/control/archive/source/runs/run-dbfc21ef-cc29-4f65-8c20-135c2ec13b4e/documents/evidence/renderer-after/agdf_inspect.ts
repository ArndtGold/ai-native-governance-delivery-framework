agdf_inspect(args: {
  all_active?: boolean;
  cursor?: string;
  expected_revision_id?: string;
  // Not for gate-check.
  gate?: "UR" | "PRD" | "SD" | "TP" | "QA" | "UAT";
  // contract: module; operation-contract: group/kind; operation-status: UUID.
  module?: string;
  operation: "doctor" | "gate-check" | "delivery-map" | "contract" | "artifact-readiness" | "authoring-inputs" | "operation-contract" | "operation-status" | "native-qualification" | "presentation-document" | "presentation-preview" | "runtime-generations" | "project-state" | "inventory";
  presentation_id?: string;
  presentation_language: string;
  // Confirmed root; pair target_source.
  primary_target?: string;
  run_id?: string;
  target_id?: string;
  // Pair with primary_target.
  target_source?: "explicit_target" | "continued_target" | "current_repository";
  variant?: "status-card" | "approval-envelope";
  working_directory: string;
}
