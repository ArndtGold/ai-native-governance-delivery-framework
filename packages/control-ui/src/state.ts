import type { Envelope, Inventory, Detail, DocumentData, Route } from './types';
export interface ReadingState { generation: number; phase: 'idle' | 'loading' | 'ready' | 'error'; route: Route;
  inventory: Envelope<Inventory> | null; detail: Envelope<Detail> | null; document: Envelope<DocumentData> | null;
  stale: boolean; problem: string | null; removed: boolean }
export const initialState: ReadingState = { generation: 0, phase: 'idle', route: { view: 'overview' }, inventory: null, detail: null, document: null, stale: false, problem: null, removed: false };
export type ReadingAction = { type: 'begin'; generation: number; route: Route } | { type: 'ready'; generation: number; route: Route;
  inventory: Envelope<Inventory>; detail: Envelope<Detail> | null; document: Envelope<DocumentData> | null; removed?: boolean }
  | { type: 'error'; generation: number; code: string } | { type: 'stale'; snapshot: string; code: string };
export function readingReducer(state: ReadingState, action: ReadingAction): ReadingState {
  if (action.type === 'stale') return state.inventory?.snapshot_id === action.snapshot ? { ...state, stale: true, problem: action.code } : state;
  if (action.type === 'begin') return { ...state, generation: action.generation, phase: 'loading', problem: null };
  if (action.generation !== state.generation) return state;
  if (action.type === 'error') return { ...state, phase: 'error', problem: action.code, stale: !!state.inventory };
  return { ...state, ...action, phase: 'ready', stale: false, problem: null, removed: !!action.removed };
}
