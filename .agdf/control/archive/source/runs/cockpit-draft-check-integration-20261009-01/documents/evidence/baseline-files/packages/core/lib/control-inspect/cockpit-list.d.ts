export const COCKPIT_BACKLOG_SECTIONS: readonly ['Active Backlog', 'Planned / Parking Lot', 'Completed / Superseded Pointers'];
export interface ListEntry { section: string; key: string; title: string; stored_status: string; selectable: boolean }
export interface ListDiagnostic { code: string; section?: string; key?: string | null }
export interface ListInventory<T extends ListEntry = ListEntry, D extends ListDiagnostic = ListDiagnostic> {
  entries: T[]; diagnostics: D[]; counts: Record<string, number>; content_digest: string; source_path: string;
}
export interface CockpitListRow<T extends ListEntry = ListEntry> {
  entry: T; index: number; identity: string; selectable: boolean; displayTitle: string;
  provenance: { path: string; digest: string; originalTitle: string };
}
export interface CockpitList<T extends ListEntry = ListEntry, D extends ListDiagnostic = ListDiagnostic> {
  section: string; query: string; coverage: 'complete' | 'partial' | 'unavailable'; diagnostics: D[];
  sectionCount: number | null; matchCount: number | null; rows: CockpitListRow<T>[];
}
export function hasConsistentBacklogCounts(inventory: unknown): boolean;
export function backlogRowKey(entry: ListEntry, index: number, digest: string): string;
export function projectCockpitList<T extends ListEntry, D extends ListDiagnostic>(inventory: ListInventory<T, D> | null, options?: { section?: string; query?: string }): CockpitList<T, D>;
