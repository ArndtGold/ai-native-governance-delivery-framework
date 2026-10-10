export interface RenderBootstrap { sessionId: string; targetId: string; initialRunId?: string; generation: number }

// Only scoped render metadata may initialize a reader; ordinary read results do not reset it.
export function readRenderBootstrap(result: { _meta?: Record<string, unknown>; structuredContent?: unknown }): RenderBootstrap | null {
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
  if (value.initial_run_id !== undefined && (typeof value.initial_run_id !== 'string' || !/^[A-Za-z0-9_-]{1,128}$/.test(value.initial_run_id))) return null;
  return { sessionId: value.session_id, targetId: target.target_id, generation: value.render_generation as number,
    ...(typeof value.initial_run_id === 'string' ? { initialRunId: value.initial_run_id } : {}) };
}
