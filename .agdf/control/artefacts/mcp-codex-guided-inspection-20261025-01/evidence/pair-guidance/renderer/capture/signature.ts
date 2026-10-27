inspect_probe(args: {
  // All runs: doctor/delivery-map.
  all_active?: boolean;
  // Copy next_cursor.
  cursor?: string;
  // gate-check revision; original for reads.
  expected_revision_id?: string;
  // Document gate. Never with gate-check.
  gate?: "UR" | "PRD" | "SD" | "TP" | "QA" | "UAT";
  // Contract, group/kind or receipt UUID.
  module?: string;
  // Read action.
  operation: "doctor" | "gate-check" | "delivery-map" | "contract" | "artifact-readiness" | "operation-contract" | "operation-status" | "native-qualification" | "presentation-document" | "presentation-preview" | "runtime-generations";
  // ID from catalog/conversation.
  presentation_id?: string;
  // Reply BCP47 tag.
  presentation_language: string;
  // Pair: target_source.
  primary_target?: string;
  // Confirmed run.
  run_id?: string;
  // Target hash: operation-contract.
  target_id?: string;
  // Requires primary_target.
  target_source?: "explicit_target" | "continued_target" | "current_repository";
  // gate-check view.
  variant?: "status-card" | "approval-envelope";
  // Context; not target authority.
  working_directory: string;
})
