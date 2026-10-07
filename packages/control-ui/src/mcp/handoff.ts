import type { ContextPacket } from '../types';

export interface ContextSelection { target: string; snapshot_id: string; run_id: string; revision_id: string; resource_id: string; graph_ids: string[]; excluded_ids: string[] }
export interface HandoffPort {
  support(): { context: boolean; question: boolean };
  prepare(selection: ContextSelection, generation: number): Promise<ContextPacket>;
  validate(packet: ContextPacket): Promise<void>;
  invalidate(): Promise<{ host_publication_required: boolean; invalidation_id?: string }>;
  completeInvalidation(invalidationId: string): Promise<void>;
  publish(value: Record<string, unknown>): Promise<void>;
  question(text: string): Promise<void>;
}
export interface HandoffState { phase: 'idle' | 'preparing' | 'accepted' | 'sending' | 'question' | 'invalidating' | 'error' | 'uncertain'; code?: string; packet?: ContextPacket; recovery?: 'retry_begin' | 'retry_completion' | 'fresh_connection' }
const problem = (error: unknown) => error instanceof Error ? error.message : 'handoff_failed';

// One publication lane. A source switch disables actions immediately, while its
// invalidation waits behind any bounded, already submitted host update.
export class HandoffController {
  private generation = 0;
  private tail: Promise<void> = Promise.resolve();
  private invalidating: Promise<void> | null = null;
  private listeners = new Set<() => void>();
  private touched = false;
  private release: { id: string; hostAcknowledged: boolean } | null = null;
  private hostReleaseUncertain = false;
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
    if (!this.touched && !this.release) {
      if (this.state.recovery !== 'fresh_connection') this.set({ phase: 'idle' });
      return Promise.resolve();
    }
    if (this.invalidating) return this.invalidating;
    this.set({ phase: 'invalidating' });
    this.invalidating = this.enqueue(() => this.finishRelease()).finally(() => { this.invalidating = null; });
    return this.invalidating;
  };
  private async finishRelease() {
    try {
      if (this.hostReleaseUncertain) throw Error('context_cleanup_uncertain');
      if (!this.release) {
        // A denied/lost begin response grants no host update. A nonowner may
        // navigate normally but cannot clear another view's publication.
        const begin = await this.port.invalidate();
        if (!begin.host_publication_required) { this.touched = false; this.set({ phase: 'idle' }); return; }
        if (!begin.invalidation_id) throw Error('dto_invalid');
        this.release = { id: begin.invalidation_id, hostAcknowledged: false };
      }
      if (!this.release.hostAcknowledged) {
        try {
          await this.port.publish({ schema_version: '1', kind: 'agdf_cockpit_invalid_selection', generation: this.generation,
            invalidation_id: this.release.id, observed_at: new Date().toISOString(), authorizes: false, current: false });
        } catch (error) { this.hostReleaseUncertain = true; throw error; }
        this.release.hostAcknowledged = true;
      }
      // If this response is lost, retain the token and acknowledged flag. The
      // only permissible retry is this completion, never the host update.
      await this.port.completeInvalidation(this.release.id);
      this.release = null; this.touched = false; this.set({ phase: 'idle' });
    } catch (error) {
      const code = problem(error);
      this.set({ phase: 'uncertain', code, recovery: this.hostReleaseUncertain || code === 'context_cleanup_uncertain'
        || code === 'session_expired' ? 'fresh_connection' : this.release?.hostAcknowledged ? 'retry_completion' : 'retry_begin' });
    }
  }
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
        if (generation === this.generation) {
          const code = problem(error);
          this.set({ phase: submitted || code === 'context_cleanup_uncertain' ? 'uncertain' : 'error', code,
            ...(submitted ? { recovery: 'retry_begin' as const } : code === 'context_cleanup_uncertain' ? { recovery: 'fresh_connection' as const } : {}) });
        }
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
        if (generation === this.generation) this.set({ phase: submitted && problem(error) !== 'message_rejected' ? 'uncertain' : 'error', code: problem(error), packet,
          ...(submitted && problem(error) !== 'message_rejected' ? { recovery: 'retry_begin' as const } : {}) });
        // A failed fresh validation also invalidates any previously published context.
        if (!submitted && generation === this.generation) {
          await this.finishRelease();
          if (this.state.phase !== 'uncertain') this.set({ phase: 'error', code: problem(error) });
        }
      }
    });
  };
}
