import type { Envelope, Inventory, Detail, DocumentData, Route, ReadingScope } from './types';
export interface ReadingState { generation: number; phase: 'idle' | 'loading' | 'ready' | 'error'; route: Route;
  scope: Envelope<ReadingScope> | null; inventory: Envelope<Inventory> | null; detail: Envelope<Detail> | null; document: Envelope<DocumentData> | null;
  stale: boolean; sourceChanged: boolean; refreshing: boolean; problem: string | null; removed: boolean; requestedRunId: string | null; requestedRoute: Route | null }
export const initialState: ReadingState = { generation: 0, phase: 'idle', route: { view: 'overview' }, scope: null, inventory: null, detail: null, document: null, stale: false, sourceChanged: false, refreshing: false, problem: null, removed: false, requestedRunId: null, requestedRoute: null };
export const hasExpiredSession = (state: ReadingState) => state.problem === 'session_expired' || state.scope?.code === 'session_expired';
export type ReadingAction = { type: 'begin'; generation: number; route: Route; background?: boolean } | { type: 'ready'; generation: number; route: Route;
  scope: Envelope<ReadingScope>; inventory: Envelope<Inventory> | null; detail: Envelope<Detail> | null; document: Envelope<DocumentData> | null; removed?: boolean }
  | { type: 'titles'; generation: number; inventory: Envelope<Inventory> }
  | { type: 'draft-check'; generation: number; snapshot: string; scope: Envelope<ReadingScope>; detail: Envelope<Detail> }
  | { type: 'error'; generation: number; code: string } | { type: 'stale'; snapshot: string; code: string };
export function readingReducer(state: ReadingState, action: ReadingAction): ReadingState {
  if (action.type === 'stale') return state.scope?.snapshot_id === action.snapshot ? { ...state, stale: true, sourceChanged: state.sourceChanged || action.code === 'source_changed', problem: action.code } : state;
  if (action.type === 'begin') return { ...state, generation: action.generation, requestedRunId: action.route.runId ?? null, requestedRoute: action.route, phase: action.background ? 'ready' : 'loading', refreshing: !!action.background, stale: action.background || state.stale, sourceChanged: state.sourceChanged || !!action.background, problem: null };
  if (action.generation !== state.generation) return state;
  if (action.type === 'titles') return state.phase === 'ready' && state.route.view === 'overview'
    && !state.stale && state.inventory?.data?.content_digest === action.inventory.data?.content_digest
    ? { ...state, inventory: action.inventory, scope: action.inventory } : state;
  if (action.type === 'draft-check') return state.phase === 'ready' && !state.stale && !state.problem && state.route.view === 'detail'
    && state.scope?.snapshot_id === action.snapshot && action.scope.target.target_id === state.scope.target.target_id
    && !!action.detail.data && action.detail.data.run_id === state.route.runId && action.detail.data.revision_id === state.detail?.data?.revision_id
    && action.detail.data.draft_check?.source.artifact_digest === state.detail?.data?.draft_check?.source.artifact_digest
    ? { ...state, scope: action.scope, detail: action.detail, inventory: null, document: null } : state;
  if (action.type === 'error') return { ...state, phase: 'error', refreshing: false, problem: action.code, stale: !!state.scope };
  return { ...state, ...action, requestedRoute: action.scope.data ? null : state.requestedRoute, phase: 'ready', refreshing: false, stale: false, sourceChanged: false, problem: null, removed: !!action.removed };
}
