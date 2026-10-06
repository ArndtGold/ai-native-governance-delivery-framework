import type { Envelope, Inventory, Detail, DocumentData, Route } from './types';
export interface ReadingState { generation: number; phase: 'idle' | 'loading' | 'ready' | 'error'; route: Route;
  inventory: Envelope<Inventory> | null; detail: Envelope<Detail> | null; document: Envelope<DocumentData> | null;
  stale: boolean; refreshing: boolean; problem: string | null; removed: boolean; requestedRunId: string | null; requestedRoute: Route | null }
export const initialState: ReadingState = { generation: 0, phase: 'idle', route: { view: 'overview' }, inventory: null, detail: null, document: null, stale: false, refreshing: false, problem: null, removed: false, requestedRunId: null, requestedRoute: null };
export const hasExpiredSession = (state: ReadingState) => state.problem === 'session_expired' || state.inventory?.code === 'session_expired';
export type ReadingAction = { type: 'begin'; generation: number; route: Route; background?: boolean } | { type: 'ready'; generation: number; route: Route;
  inventory: Envelope<Inventory>; detail: Envelope<Detail> | null; document: Envelope<DocumentData> | null; removed?: boolean }
  | { type: 'error'; generation: number; code: string } | { type: 'stale'; snapshot: string; code: string };
export function readingReducer(state: ReadingState, action: ReadingAction): ReadingState {
  if (action.type === 'stale') return state.inventory?.snapshot_id === action.snapshot ? { ...state, stale: true, problem: action.code } : state;
  if (action.type === 'begin') return { ...state, generation: action.generation, requestedRunId: action.route.runId ?? null, requestedRoute: action.route, phase: action.background ? 'ready' : 'loading', refreshing: !!action.background, stale: action.background || state.stale, problem: null };
  if (action.generation !== state.generation) return state;
  if (action.type === 'error') return { ...state, phase: 'error', refreshing: false, problem: action.code, stale: !!state.inventory };
  return { ...state, ...action, requestedRoute: action.inventory.data ? null : state.requestedRoute, phase: 'ready', refreshing: false, stale: false, problem: null, removed: !!action.removed };
}
