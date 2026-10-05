export type Availability = 'available' | 'empty' | 'partial' | 'invalid' | 'missing' | 'unsupported' | 'blocked' | 'stale' | 'error';
export interface Target { target_id: string; display_path: string }
export interface Envelope<T> { schema_version: '1'; target: Target; snapshot_id: string | null; observed_as_of: string | null; source_digest: string | null; state: Availability; code: string | null; retryable: boolean; data: T | null }
export interface Run { run_id: string; valid: boolean; lifecycle: string | null; revision_id: string | null; objective: string | null; title: string; source_path: string; status: string | null; current_gate: string | null; code: string | null }
export interface Inventory { runs: Run[]; file_count: number; byte_count: number }
export interface Resource { resource_id: string; run_id: string; type: string; path: string | null; registered_reference: string; status: string }
export interface Detail { run_id: string; revision_id: string | null; lifecycle: string | null; objective?: string | null; resources: Resource[]; diagnostics?: Diagnostic[];
  evaluation?: { status: string; current_gate: string; blocking_reason: string; missing_approval: string; next_allowed_action: string; next_action_de: string | null; doctor_status: string; quality_outlook: string;
    diagnostics: Diagnostic[]; approvals: { gate: string; status: string; evidence: string }[]; missing_evidence: unknown[]; git_evidence: string };
  persisted?: { current_gate: string; next_allowed_action: string; decision: string; artefacts: unknown[] } }
export interface Diagnostic { code: string; message?: string; path?: string; next_step?: string; severity?: string }
export interface DocumentData { resource: Resource; format?: string; content?: string; content_digest?: string; links?: Record<string, string>; reason?: string }
export interface Route { view: 'overview' | 'detail' | 'document'; runId?: string; resourceId?: string; resourcePath?: string }
