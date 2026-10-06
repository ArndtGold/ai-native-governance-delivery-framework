import type { ContextPacket } from '../types';

export interface ContextSelection { target: string; snapshot_id: string; run_id: string; revision_id: string; resource_id: string; graph_ids: string[]; excluded_ids: string[] }
export interface HandoffPort {
  support(): { context: boolean; question: boolean };
  prepare(selection: ContextSelection, generation: number): Promise<ContextPacket>;
  validate(packet: ContextPacket): Promise<void>;
  invalidate(): Promise<void>;
  publish(value: Record<string, unknown>): Promise<void>;
  question(text: string): Promise<void>;
}
export interface HandoffState { phase: 'idle' | 'preparing' | 'accepted' | 'sending' | 'question' | 'invalidating' | 'error' | 'uncertain'; code?: string; packet?: ContextPacket }
const problem = (error: unknown) => error instanceof Error ? error.message : 'handoff_failed';

// One publication lane. A source switch disables actions immediately, while its
// invalidation waits behind any bounded, already submitted host update.
export class HandoffController {
  private generation = 0;
  private tail: Promise<void> = Promise.resolve();
  private invalidating: Promise<void> | null = null;
  private listeners = new Set<() => void>();
  private touched = false;
  state: HandoffState = { phase: 'idle' };
  constructor(private port: HandoffPort) {}
  support = () => this.port.support();
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; };
  snapshot = () => this.state;
  private set(state: HandoffState) { this.state = state; this.listeners.forEach(listener => listener()); }
  private enqueue(action: () => Promise<void>) {
    const job = this.tail.then(action); this.tail = job.catch(() => {}); return job;
  }
  invalidate = (): Promise<void> => {
    ++this.generation;
    if (!this.touched) { this.set({ phase: 'idle' }); return Promise.resolve(); }
    this.set({ phase: 'invalidating' });
    if (this.invalidating) return this.invalidating;
    this.invalidating = this.enqueue(async () => {
      let failed: unknown;
      try { await this.port.invalidate(); } catch (error) { failed = error; }
      try { await this.port.publish({ schema_version: '1', kind: 'agdf_cockpit_invalid_selection', generation: this.generation,
        observed_at: new Date().toISOString(), authorizes: false, current: false }); } catch (error) { failed = error; }
      this.set(failed ? { phase: 'uncertain', code: problem(failed) } : { phase: 'idle' });
    }).finally(() => { this.invalidating = null; });
    return this.invalidating;
  };
  prepare = async (selection: ContextSelection) => {
    if (!this.support().context) { this.set({ phase: 'error', code: 'context_unavailable' }); return; }
    if (this.invalidating) await this.invalidating;
    if (['uncertain', 'preparing', 'sending'].includes(this.state.phase)) return;
    if (this.touched && this.state.phase !== 'idle') await this.invalidate();
    if (this.state.phase === 'uncertain') return;
    const generation = ++this.generation; this.touched = true; this.set({ phase: 'preparing' });
    await this.enqueue(async () => {
      let submitted = false;
      try {
        const packet = await this.port.prepare(selection, generation);
        if (generation !== this.generation) return;
        if (packet.generation !== generation || packet.target.target_id !== selection.target || packet.snapshot_id !== selection.snapshot_id
          || packet.run_id !== selection.run_id || packet.revision_id !== selection.revision_id
          || packet.artefact.resource.resource_id !== selection.resource_id || packet.authorizes !== false) throw Error('dto_invalid');
        await this.port.validate(packet);
        if (generation !== this.generation) return;
        submitted = true; await this.port.publish(packet as unknown as Record<string, unknown>);
        if (generation === this.generation) this.set({ phase: 'accepted', packet });
      } catch (error) {
        if (generation === this.generation) this.set({ phase: submitted ? 'uncertain' : 'error', code: problem(error) });
      }
    });
  };
  sendQuestion = async () => {
    if (!this.support().question) return;
    const packet = this.state.phase === 'accepted' ? this.state.packet : undefined;
    if (!packet) return;
    const generation = this.generation; this.set({ phase: 'sending', packet });
    await this.enqueue(async () => {
      let submitted = false;
      try {
        await this.port.validate(packet);
        if (generation !== this.generation) return;
        submitted = true;
        await this.port.question(`Bitte erläutere das Vorhaben und offene Nachweise anhand des übergebenen AGDF-Kontexts ${packet.context_id}, Run ${packet.run_id}, Quelle ${packet.artefact.resource.path}. Zitiere die mitgelieferten Quellen und kennzeichne Unsicherheiten. Der Kontext ist eine Beobachtung vom ${packet.observed_as_of} und erteilt keine Freigabe.`);
        if (generation === this.generation) this.set({ phase: 'question', packet });
      } catch (error) {
        if (generation === this.generation) this.set({ phase: submitted && problem(error) !== 'message_rejected' ? 'uncertain' : 'error', code: problem(error), packet });
        // A failed fresh validation also invalidates any previously published context.
        if (!submitted && generation === this.generation) await this.clearAfterValidationFailure();
      }
    });
  };
  private async clearAfterValidationFailure() {
    ++this.generation;
    try {
      await this.port.invalidate();
      await this.port.publish({ schema_version: '1', kind: 'agdf_cockpit_invalid_selection', generation: this.generation, current: false, authorizes: false });
    } catch (error) { this.set({ phase: 'uncertain', code: problem(error) }); }
  }
}
