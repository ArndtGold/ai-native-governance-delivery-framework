export type Availability = 'available' | 'empty' | 'partial' | 'invalid' | 'missing' | 'unsupported' | 'blocked' | 'stale' | 'error';
export interface Target { target_id: string; display_path: string }
export interface Envelope<T> { schema_version: '1'; target: Target; snapshot_id: string | null; observed_as_of: string | null; source_digest: string | null; state: Availability; code: string | null; retryable: boolean; data: T | null }
export interface Run { run_id: string; valid: boolean; lifecycle: string | null; revision_id: string | null; objective: string | null; title: string; source_path: string; status: string | null; current_gate: string | null; code: string | null;
  attention?: { blocking_reason: string; missing_approval: string; missing_evidence_count: number } }
export interface BacklogEntry { section: string; key: string; original_key: string; title: string; stored_status: string; scope: string;
  priority: string | null; stored_next_step: string; source_links: string; current_spec: string | null; selectable: boolean }
export interface Inventory { kind: 'backlog'; entries: BacklogEntry[]; diagnostics: Diagnostic[]; source_path: string; content_digest: string;
  counts: Record<string, number>; file_count: number; byte_count: number; removed_run_id?: string }
export type ReadingScope = Inventory | { kind: 'run'; run: Detail | null; requested_run_id?: string }
  | { kind: 'document'; run: Detail; document: DocumentData | null }
  | { kind: 'context'; run: Detail; document: DocumentData | null; context: GraphData };
export interface Resource { resource_id: string; run_id: string; type: string; path: string | null; registered_reference: string; status: string }
export interface Detail { run_id: string; title?: string; revision_id: string | null; lifecycle: string | null; objective?: string | null; resources: Resource[]; diagnostics?: Diagnostic[];
  evaluation?: { status: string; current_gate: string; blocking_reason: string; missing_approval: string; next_allowed_action: string; next_action_de: string | null; doctor_status: string; quality_outlook: string;
    control_assessment?: { state: 'open' | 'blocked' | 'unconfirmed' | 'completed'; authorizes: false };
    diagnostics: Diagnostic[]; approvals: { gate: string; status: string; evidence: string }[]; missing_evidence: unknown[]; git_evidence: string };
  persisted?: { current_gate: string; next_allowed_action: string; decision: string; artefacts: unknown[] } }
export interface Diagnostic { code: string; message?: string; path?: string; next_step?: string; severity?: string; section?: string; key?: string | null }
export interface DocumentData { resource: Resource; format?: string; content?: string; content_digest?: string; links?: Record<string, string>; reason?: string }
export interface Route { view: 'overview' | 'detail' | 'document'; runId?: string; resourceId?: string; resourcePath?: string }
export interface GraphReference { resource_id: string; run_id: string; origin: string; path: string; node_id: string | null;
  graph_digest: string | null; content_digest: string | null; content: string | null;
  state: 'available' | 'unresolved' | 'missing' | 'blocked' | 'unsupported'; code: string | null }
export interface GraphData { run_id: string; references: GraphReference[] }
export interface ContextPacket { schema_version: '1'; target: Target; run_id: string; revision_id: string; snapshot_id: string;
  source_digest: string; observed_as_of: string; prepared_at: string; context_id: string; generation: number;
  artefact: DocumentData; graph_nodes: GraphReference[];
  included: { resource_id: string; path?: string; node_id?: string | null; origin?: string }[];
  excluded: { resource_id: string; node_id: string | null; origin: string; state: string; code: string | null; reason: string }[];
  authorizes: false }
