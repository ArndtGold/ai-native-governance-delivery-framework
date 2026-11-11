export interface CockpitProvenance { schema_version: '1'; version: string; resource_digest: string; resource_scope: 'server_validated'; host_display: 'unconfirmed'; candidate_match: 'unverified' }
export interface RenderBootstrap { sessionId: string; targetId: string; initialRunId?: string; generation: number; provenance?: CockpitProvenance; integrationSurface?: 'codex' | 'claude' }

// Only scoped render metadata may initialize a reader; ordinary read results do not reset it.
export function readRenderBootstrap(result: { isError?: boolean; _meta?: Record<string, unknown>; structuredContent?: unknown }): RenderBootstrap | null {
  if (result.isError) return null;
  const meta = result._meta?.agdf_cockpit;
  if (!meta || typeof meta !== 'object' || !result.structuredContent || typeof result.structuredContent !== 'object') return null;
  const data = result.structuredContent as Record<string, unknown>;
  if (data.authorizes !== false || data.schema_version !== '1') return null;
  const value = meta as Record<string, unknown>;
  const target = value.target as Record<string, unknown> | undefined;
  const source = data.target as Record<string, unknown> | undefined;
  if (!target || !source || typeof target.target_id !== 'string' || typeof target.display_path !== 'string'
    || target.target_id !== source.target_id || target.display_path !== source.display_path
    || typeof value.session_id !== 'string' || !/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(value.session_id)
    || !Number.isSafeInteger(value.render_generation) || (value.render_generation as number) < 1) return null;
  if (value.initial_run_id !== undefined && (typeof value.initial_run_id !== 'string' || !/^[a-z0-9][a-z0-9._-]{0,127}$/.test(value.initial_run_id))) return null;
  const p = value.provenance as Record<string, unknown> | undefined;
  const provenance = p && p.schema_version === '1' && typeof p.version === 'string' && /^[0-9A-Za-z.+-]{1,80}$/.test(p.version)
    && typeof p.resource_digest === 'string' && /^sha256:[a-f0-9]{64}$/.test(p.resource_digest)
    && p.resource_scope === 'server_validated' && p.host_display === 'unconfirmed' && p.candidate_match === 'unverified'
    ? p as unknown as CockpitProvenance : undefined;
  return { sessionId: value.session_id, targetId: target.target_id, generation: value.render_generation as number,
    ...(['codex', 'claude'].includes(value.integration_surface as string) ? { integrationSurface: value.integration_surface as 'codex' | 'claude' } : {}),
    ...(provenance ? { provenance } : {}),
    ...(typeof value.initial_run_id === 'string' ? { initialRunId: value.initial_run_id } : {}) };
}
