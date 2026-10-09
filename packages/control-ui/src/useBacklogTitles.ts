import { useEffect, useRef, useState } from 'react';
import type { BacklogEntry, Envelope, Inventory, TitleObservation } from './types';
import { backlogRowKey } from '../../core/lib/control-inspect/cockpit-list.js';

export type TitleLoader = (ids: string[], signal: AbortSignal) => Promise<Envelope<Inventory> | null>;
// Stable across capture replacements; opaque row selectors themselves are never cached.
export class BacklogTitleCache {
  private values = new Map<string, TitleObservation>();
  private bytes = 0;
  private size(key: string, value: TitleObservation) { return new TextEncoder().encode(JSON.stringify([key, value])).length; }
  get(key: string) {
    const value = this.values.get(key);
    if (value) { this.values.delete(key); this.values.set(key, value); }
    return value;
  }
  put(key: string, value: TitleObservation) {
    const old = this.values.get(key);
    if (old) { this.bytes -= this.size(key, old); this.values.delete(key); }
    this.values.set(key, value); this.bytes += this.size(key, value);
    while (this.values.size > 128 || this.bytes > 256 * 1024) {
      const first = this.values.keys().next().value!;
      this.bytes -= this.size(first, this.values.get(first)!); this.values.delete(first);
    }
  }
  clear() { this.values.clear(); this.bytes = 0; }
  get count() { return this.values.size; }
  get byteLength() { return this.bytes; }
}

export const createBacklogTitleStore = () => ({ cache: new BacklogTitleCache(), attempted: new Set<string>(), digest: null as string | null });
export type BacklogTitleStore = ReturnType<typeof createBacklogTitleStore>;
export function useBacklogTitles(inventory: Inventory | null, enabled: boolean, load?: TitleLoader, retained?: BacklogTitleStore, reset = false) {
  const owned = useRef(createBacklogTitleStore()), store = retained ?? owned.current;
  const cache = useRef(store.cache), attempted = useRef(store.attempted);
  const list = useRef<HTMLUListElement>(null), visible = useRef(new Set<string>());
  const active = useRef<AbortController | null>(null), timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeKeys = useRef<string[]>([]);
  const generation = useRef(0), current = useRef({ inventory, enabled, load });
  const [version, update] = useState(0), [loading, setLoading] = useState(false);
  current.current = { inventory, enabled, load };
  const digest = inventory?.content_digest;
  useEffect(() => {
    generation.current++; active.current?.abort(); active.current = null;
    if (reset || store.digest !== digest) { cache.current.clear(); attempted.current.clear(); store.digest = digest ?? null; }
    visible.current.clear();
    setLoading(false); update(v => v + 1);
    return () => {
      generation.current++; active.current?.abort();
      // A cancelled, never observed candidate is eligible when the view returns.
      for (const key of activeKeys.current) if (!cache.current.get(key)) attempted.current.delete(key);
      activeKeys.current = [];
      if (timer.current) clearTimeout(timer.current);
    };
  }, [digest, enabled, reset, store]);
  const schedule = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const state = current.current;
      if (active.current || !state.enabled || !state.load || document.hidden || !state.inventory) return;
      const rows = state.inventory.entries;
      const ordered = [...(list.current?.querySelectorAll<HTMLElement>('[data-backlog-row]') ?? [])];
      const demand = ordered.filter(el => visible.current.has(el.dataset.backlogRow!));
      // Only one adjacent row may be prefetched, even with many visible rows.
      const last = ordered.indexOf(demand.at(-1)!);
      if (last >= 0 && ordered[last + 1]) demand.push(ordered[last + 1]);
      const keys = demand.map(el => el.dataset.backlogRow!).filter(key => !attempted.current.has(key)).slice(0, 12);
      const selected = keys.map(key => rows.find((row, index) => backlogRowKey(row, index, state.inventory!.content_digest) === key)).filter((row): row is BacklogEntry => !!row?.row_id);
      if (!selected.length) return;
      const controller = new AbortController(), epoch = generation.current;
      active.current = controller; activeKeys.current = keys; keys.forEach(key => attempted.current.add(key)); setLoading(true);
      try {
        const result = await state.load(selected.map(row => row.row_id!), controller.signal);
        if (controller.signal.aborted || generation.current !== epoch || !result?.data || result.data.content_digest !== digest) return;
        result.data.entries.forEach((row, index) => {
          if (row.title_observation) cache.current.put(backlogRowKey(row, index, result.data!.content_digest), row.title_observation);
        });
        update(v => v + 1);
      } finally {
        if (generation.current === epoch) { active.current = null; activeKeys.current = []; setLoading(false); schedule(); }
      }
    }, 60);
  };
  useEffect(() => {
    if (!enabled || !load || !list.current || typeof IntersectionObserver === 'undefined') return;
    const element = list.current;
    let parent = element.parentElement;
    while (parent && !/(auto|scroll)/.test(getComputedStyle(parent).overflowY)) parent = parent.parentElement;
    const observer = new IntersectionObserver(changes => {
      for (const change of changes) {
        const key = (change.target as HTMLElement).dataset.backlogRow!;
        if (change.isIntersecting) visible.current.add(key); else visible.current.delete(key);
      }
      schedule();
    }, { root: parent });
    element.querySelectorAll('[data-backlog-row]').forEach(row => observer.observe(row));
    const visibility = () => { if (!document.hidden) schedule(); };
    document.addEventListener('visibilitychange', visibility);
    return () => { observer.disconnect(); visible.current.clear(); if (timer.current) clearTimeout(timer.current); document.removeEventListener('visibilitychange', visibility); };
    // Re-observe after list filtering or a capture replacement changes its selectors.
  });
  return { list, cache: cache.current, loading, version };
}
