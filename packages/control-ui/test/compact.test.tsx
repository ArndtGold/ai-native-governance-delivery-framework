import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { App } from '../src/App';
import { BrowserEntry } from '../src/BrowserEntry';
import { CompanionProgress } from '../src/mcp/CompanionProgress';
import { validateData, type ReadTransport } from '../src/api';
import type { Detail, Envelope, ReadingScope } from '../src/types';
import { backlog, pointer, runData, fixtureMeta, runScope, documentFixture } from './scoped-fixtures';
const inventory = {...backlog([pointer('run-a','Deliver cockpit')]),state:'partial' as const,code:'backlog_partial',data:{...backlog([pointer('run-a','Deliver cockpit')]).data!,diagnostics:[{code:'malformed_pointer',message:'Stored pointer incomplete.'}]}};
const data:Detail={...runData('run-a','Deliver cockpit'),revision_id:'rev',evaluation:{...runData('run-a').evaluation!,approvals:[{gate:'TP',status:'approved',evidence:'exact approval'},{gate:'QA',status:'missing',evidence:''}],missing_evidence:[{missing_evidence:'Host context still unverified'}]}};
const detail=runScope(data);
const changed={...fixtureMeta,snapshot_id:'run-snapshot',state:'stale' as const,code:'source_changed',data:null};
const named=(path:string)=>path.startsWith('/api/runs/')||path.startsWith('/api/snapshot?run_id=');
function advanced(){return runScope({...data,revision_id:'rev-2',persisted:{...data.persisted!,current_gate:'QA',next_allowed_action:'Check quality'},evaluation:{...data.evaluation!,current_gate:'QA',next_allowed_action:'Check quality',next_action_de:'Qualität prüfen.'}},'run-snapshot-2');}
async function readySelection(key='run-a'){await screen.findByRole('searchbox');let button:HTMLButtonElement|null=null;await waitFor(()=>{button=document.querySelector<HTMLButtonElement>(`button[data-focus-id="${key}"]`);expect(button).toBeTruthy();expect(button!.disabled).toBe(false);});return button!;}
function chooseArea(name:string){fireEvent.click(screen.getByRole('combobox',{name:'Bestandsbereich'}));fireEvent.click(screen.getByRole('option',{name}));}
async function tick(){await act(async()=>{await vi.advanceTimersByTimeAsync(5000);});}
afterEach(()=>{cleanup();vi.restoreAllMocks();vi.useRealTimers();vi.unstubAllGlobals();});

function companionDraft() {
  const run = documentFixture();
  run.title = 'Karte mit registriertem Entwurf';
  run.objective = 'Passende Quelle direkt lesen';
  run.evaluation = { ...run.evaluation!, current_gate: 'PRD', missing_approval: 'Approval: PRD', control_assessment: { state: 'blocked', authorizes: false } };
  run.persisted = { ...run.persisted!, current_gate: 'PRD' };
  run.figure = { mood: 'wartet', reason: { key: 'waitingApproval', gate: 'PRD' } };
  run.companion = { route: 'structured_slice', path: [{ gate: 'UR', status: 'fulfilled' }, { gate: 'PRD', status: 'current' }, { gate: 'QA', status: 'open' }],
    next_text: 'Die Fassung prüfen.', blocking_text: 'none' };
  return run;
}

function draftRead(run = companionDraft()) {
  const resource = { ...run.resources.find(source => source.type === 'PRD')!, resource_id: 'reissued-prd' };
  const documentState = { ...run.document_states!.find(row => row.type === 'PRD')!, resource_id: resource.resource_id };
  return { ...fixtureMeta, snapshot_id: 'document-snapshot', data: { kind: 'document' as const,
    run: { ...run, resources: run.resources.map(r => r.type === 'PRD' ? resource : r), document_states: run.document_states!.map(row => row.type === 'PRD' ? documentState : row) },
    document: { resource, format: 'markdown', content: '# Registrierte PRD-Fassung', content_digest: documentState.content_digest!, document_state: documentState, links: {} } } };
}

describe('Codex Companion status card', () => {
  const primary = () => screen.getByRole('button', { name: 'PRD-Entwurf öffnen' });

  it('summarizes the nearest gates and marks retained progress as previous', () => {
    const marks = [{ gate: 'UR', mark: 'done' as const }, { gate: 'PRD', mark: 'done' as const },
      { gate: 'SD', mark: 'current' as const }, { gate: 'TP', mark: 'open' as const }, { gate: 'QA', mark: 'open' as const }];
    const view = render(<CompanionProgress marks={marks} previous={false}/>);
    const list = screen.getByRole('list', { name: 'Gate-Fortschritt' });
    const labels = () => screen.getAllByRole('listitem').map(item => item.textContent);
    expect(labels()).toEqual(['PRD Abgeschlossen', 'SD Aktuell', 'TP Danach']);
    expect(list.querySelector('[aria-current="step"]')?.textContent).toBe('SD Aktuell');
    view.rerender(<CompanionProgress marks={marks} previous/>);
    expect(labels()).toEqual(['PRD Abgeschlossen', 'SD Zuletzt aktuell', 'TP Danach']);
    expect(list.querySelector('[aria-current]')).toBeNull();
    view.rerender(<CompanionProgress marks={marks.map((item, index) => ({ ...item, mark: index === 0 ? 'current' : 'open' }))} previous={false}/>);
    expect(labels()).toEqual(['UR Aktuell', 'PRD Danach']);
    view.rerender(<CompanionProgress marks={marks.map((item, index) => ({ ...item, mark: index === 4 ? 'current' : 'done' }))} previous={false}/>);
    expect(labels()).toEqual(['TP Abgeschlossen', 'QA Aktuell']);
    view.rerender(<CompanionProgress marks={marks.map(item => ({ ...item, mark: 'done' }))} previous={false}/>);
    expect(labels()).toEqual(['QA Abgeschlossen']);
    expect(list.querySelector('[aria-current]')).toBeNull();
  });

  it('shows the footer switcher only with multiple active Runs and returns to the original Chat Run silently', async () => {
    const start = vi.fn();
    vi.stubGlobal('AudioContext', class {
      state = 'running';
      destination = {};
      resume = vi.fn(async () => {});
      decodeAudioData = vi.fn(async () => ({}));
      createBufferSource = () => ({ connect() {}, start });
      close = vi.fn(async () => {});
    });
    let activeRunIds = ['run-a'];
    let material = 'a';
    const read = vi.fn(async (path: string) => {
      const id = path.match(/\/api\/runs\/(run-[a-c])|run_id=(run-[a-c])/)?.slice(1).find(Boolean) ?? 'run-a';
      const run = companionDraft();
      return runScope({ ...run, run_id: id, title: `Run ${id}`, active_run_ids: activeRunIds,
        resources: [], document_states: [], companion: { ...run.companion!, decision_material_version: 'sha256:' + material.repeat(64) } });
    }) as unknown as ReadTransport;
    render(<App host="codex" compact transport={read} initialRunId="run-a"/>);
    await screen.findByRole('heading', { name: 'Run run-a' });
    expect(screen.queryByRole('navigation', { name: 'Aktive Runs' })).toBeNull();
    const choose = (name: string, role = 'menuitem') => {
      fireEvent.click(screen.getByRole('button', { name: 'AGDF Companion' }));
      fireEvent.click(screen.getByRole(role, { name }));
    };
    choose('Hinweiston', 'menuitemcheckbox');
    activeRunIds = ['run-a', 'run-b', 'run-c'];
    choose('Neu lesen');
    await screen.findByText('1 von 3');
    const previous = screen.getByRole('button', { name: 'Vorheriger Run' });
    fireEvent.click(previous);
    await screen.findByRole('heading', { name: 'Run run-c' });
    expect(screen.getByText('3 von 3')).toBeTruthy();
    expect(document.activeElement).toBe(previous);
    material = 'b';
    choose('Zurück zum Chat-Run');
    await screen.findByRole('heading', { name: 'Run run-a' });
    expect(start).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Nächster Run' }));
    await screen.findByRole('heading', { name: 'Run run-b' });
    expect(screen.getByText('2 von 3')).toBeTruthy();
    expect(start).not.toHaveBeenCalled();
    material = 'c';
    choose('Neu lesen');
    await waitFor(() => expect(start).toHaveBeenCalledTimes(1));
  });

  it('hides the footer switcher on a completed Chat Run even when other Runs are active', async () => {
    const run = runData('run-boxenfunk', 'Boxenfunk');
    run.lifecycle = 'completed';
    run.active_run_ids = ['run-a', 'run-b', 'run-c'];
    run.persisted = { ...run.persisted!, current_gate: 'OR' };
    run.evaluation = { ...run.evaluation!, status: 'pass', current_gate: 'OR',
      completion: { status: 'completed', gate: 'OR', fulfilled: true },
      control_assessment: { state: 'completed', authorizes: false } };
    run.companion = { route: 'structured_slice', path: [{ gate: 'OR', status: 'fulfilled' }], next_text: '', blocking_text: '' };
    const read = vi.fn(async () => runScope(run)) as unknown as ReadTransport;
    render(<App host="codex" compact transport={read} initialRunId={run.run_id}/>);
    await screen.findByText('Das Vorhaben ist abgeschlossen.', { selector: '.companion-signal' });
    const card = screen.getByRole('article', { name: 'Companion-Statuskarte' });
    expect(card.getAttribute('data-display-gate')).toBe('OR');
    expect(card.getAttribute('data-display-gate-state')).toBe('done');
    expect(screen.queryByRole('navigation', { name: 'Aktive Runs' })).toBeNull();
    expect(screen.getByRole('button', { name: 'AGDF Companion' })).toBeTruthy();
  });

  it('shows an idle Companion when a general opening finds only completed Runs', async () => {
    const former = { ...pointer('run-boxenfunk', 'Boxenfunk'), section: 'completed' as const, lifecycle: 'completed' as const };
    const read = vi.fn(async () => backlog([former])) as unknown as ReadTransport;
    render(<App host="codex" transport={read} companionEmpty/>);
    await screen.findByRole('heading', { name: 'Kein aktiver Run' });
    expect(document.querySelector('.companion-card .run-figure')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'AGDF Companion für Codex', level: 1 })).toBeTruthy();
    expect(screen.queryByText('Boxenfunk')).toBeNull();
    expect(screen.queryByRole('navigation', { name: 'Aktive Runs' })).toBeNull();
  });

  it('keeps the cue independent and silent on enable, revisit, stale and expired observations', async () => {
    const start = vi.fn();
    const close = vi.fn(async () => {});
    vi.stubGlobal('AudioContext', class {
      state = 'running';
      destination = {};
      resume = vi.fn(async () => {});
      decodeAudioData = vi.fn(async () => ({}));
      createBufferSource = () => ({ connect() {}, start });
      close = close;
    });
    let material = 'a', readProblem = '', previous = false, mismatch = false;
    const observed = () => {
      const run = companionDraft();
      run.companion!.decision_material_version = 'sha256:' + material.repeat(64);
      if (mismatch) run.persisted!.current_gate = 'QA';
      return run;
    };
    const read = vi.fn(async (path: string) => {
      if (readProblem) throw Error(readProblem);
      if (path.startsWith('/api/documents/')) return draftRead(observed());
      const response = runScope(observed());
      return previous ? { ...response, state: 'stale' as const, code: 'source_changed' } : response;
    }) as unknown as ReadTransport;
    const show = () => render(<App host="codex" compact transport={read} initialRunId="run-a"/>);
    const view = show();
    await screen.findByText('Du bist dran');
    const menu = () => screen.getByRole('button', { name: 'AGDF Companion' });
    const checkbox = (name: string) => screen.getByRole('menuitemcheckbox', { name });
    const toggle = (name: string) => { fireEvent.click(menu()); fireEvent.click(checkbox(name)); };
    const reread = async () => {
      fireEvent.click(menu());
      await act(async () => { fireEvent.click(screen.getByRole('menuitem', { name: 'Neu lesen' })); });
    };

    fireEvent.click(menu());
    expect(checkbox('Hinweiston').getAttribute('aria-checked')).toBe('false');
    fireEvent.click(checkbox('Hinweiston'));
    toggle('Bewegung');
    expect(start).not.toHaveBeenCalled();
    fireEvent.click(menu());
    expect(checkbox('Hinweiston').getAttribute('aria-checked')).toBe('true');
    expect(checkbox('Bewegung').getAttribute('aria-checked')).toBe('false');
    fireEvent.keyDown(checkbox('Hinweiston'), { key: 'Escape' });
    material = 'b';
    await reread();
    expect(start).toHaveBeenCalledTimes(1);
    await reread();
    expect(start).toHaveBeenCalledTimes(1);
    toggle('Hinweiston');
    material = 'c';
    await reread();
    toggle('Hinweiston');
    await reread();
    expect(start).toHaveBeenCalledTimes(1);
    material = 'd';
    previous = true;
    await reread();
    expect(start).toHaveBeenCalledTimes(1);
    expect(document.querySelector('.companion-signal')?.textContent).toBe('Der aktuelle Stand konnte nicht bestätigt werden.');
    previous = false;
    await reread();
    expect(start).toHaveBeenCalledTimes(2);
    material = 'e';
    mismatch = true;
    await reread();
    expect(start).toHaveBeenCalledTimes(2);
    expect(document.querySelector('.companion-signal')?.textContent).toBe('Der aktuelle Stand konnte nicht bestätigt werden.');
    const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
    material = 'f';
    mismatch = false;
    await reread();
    expect(start).toHaveBeenCalledTimes(2);
    hidden.mockRestore();
    readProblem = 'read_failed';
    await reread();
    expect(document.querySelector('.companion-signal')?.textContent).toBe('Zuletzt war das Vorhaben in der Phase „Produktanforderungen“.');
    expect(start).toHaveBeenCalledTimes(2);
    readProblem = 'session_expired';
    await reread();
    await screen.findByText(/Öffne das Cockpit im Chat erneut/);
    expect(start).toHaveBeenCalledTimes(2);
    view.unmount();
    expect(close).toHaveBeenCalledTimes(2);
    readProblem = '';
    show();
    await screen.findByText('Du bist dran');
    fireEvent.click(menu());
    expect(checkbox('Hinweiston').getAttribute('aria-checked')).toBe('false');
  });

  it('contains failed and obsolete playback while keeping the PRD reader usable', async () => {
    const buffer = {} as AudioBuffer;
    let finishDecode!: (buffer: AudioBuffer) => void;
    const deferredBuffer = new Promise<AudioBuffer>(resolve => { finishDecode = resolve; });
    const decode = vi.fn<() => Promise<AudioBuffer>>().mockReturnValueOnce(deferredBuffer).mockResolvedValue(buffer);
    const start = vi.fn().mockImplementationOnce(() => { throw Error('audio unavailable'); });
    vi.stubGlobal('AudioContext', class {
      state = 'running';
      destination = {};
      resume = vi.fn(async () => {});
      close = vi.fn(async () => {});
      decodeAudioData = decode;
      createBufferSource = () => ({ connect() {}, start });
    });
    let material = 'a';
    const read = vi.fn(async (path: string) => {
      const run = companionDraft();
      run.companion!.decision_material_version = 'sha256:' + material.repeat(64);
      return path.startsWith('/api/documents/') ? draftRead(run) : runScope(run);
    }) as unknown as ReadTransport;
    render(<App host="codex" compact transport={read} initialRunId="run-a"/>);
    await screen.findByText('Du bist dran');
    const choose = async (name: string) => {
      fireEvent.click(screen.getByRole('button', { name: 'AGDF Companion' }));
      const item = screen.getByRole(name === 'Hinweiston' ? 'menuitemcheckbox' : 'menuitem', { name });
      await act(async () => { fireEvent.click(item); });
    };
    await choose('Hinweiston');
    material = 'b';
    await choose('Neu lesen');
    fireEvent.click(primary());
    const back = await screen.findByRole('button', { name: 'Zurück zum Companion' });
    await act(async () => { finishDecode(buffer); });
    fireEvent.click(back);
    await screen.findByText('Du bist dran');
    expect(start).not.toHaveBeenCalled();
    material = 'c';
    await choose('Neu lesen');
    expect(start).toHaveBeenCalledTimes(1);
    fireEvent.click(primary());
    await screen.findByText('Registrierte PRD-Fassung');
    fireEvent.click(screen.getByRole('button', { name: 'Zurück zum Companion' }));
    await screen.findByText('Du bist dran');
    expect(start).toHaveBeenCalledTimes(1);
    material = 'd';
    await choose('Neu lesen');
    expect(start).toHaveBeenCalledTimes(2);
  });

  it('opens the observed source in the existing reader and restores focus after the selector is reissued', async () => {
    const run = companionDraft();
    run.title = 'Open registered decision documents';
    run.objective = 'Registrierte Entscheidungsdokumente öffnen';
    run.companion!.goal = 'Entscheider können den passenden Entwurf direkt aus der Karte lesen.';
    const reply = draftRead(run);
    const read = vi.fn(async (path: string) => path.startsWith('/api/documents/') ? reply : path.startsWith('/api/runs/')
      ? runScope(reply.data.run, 'returned-snapshot') : runScope(run)) as unknown as ReadTransport;
    render(<App host="codex" compact transport={read} initialRunId={run.run_id}/>);
    await screen.findByText('Du bist dran');
    expect(screen.getByRole('heading', { name: 'AGDF Companion für Codex', level: 1 })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Alle Vorhaben' })).toBeNull();
    expect(screen.queryByText(run.objective)).toBeNull();
    const card = screen.getByRole('article', { name: 'Companion-Statuskarte' });
    expect(card.querySelectorAll('[role="status"]')).toHaveLength(1);
    expect(card.querySelector('[role="status"]')?.textContent).toBe('Du bist dran');
    const caption = screen.getByText('Das Vorhaben ist in der Phase „Produktanforderungen“.', { selector: '.companion-signal' });
    expect(caption.closest('.companion-figure-block')).toBeTruthy();
    expect(screen.queryByText('Ich warte auf deine Entscheidung')).toBeNull();
    const approval = screen.getByText('Approval: PRD', { selector: 'code' });
    const readingOrder = [caption, screen.getByRole('heading', { name: run.title }), screen.getByText(run.companion!.goal!),
      screen.getByText('Du bist dran'), screen.getByText('Lies den Entwurf und prüfe, ob er zu deinem Auftrag passt.'),
      primary(), approval, screen.getByText('Boxenstopp 2 von 4'), screen.getByRole('list', { name: 'Gate-Fortschritt' }), card.querySelector('summary')!];
    for (const [index, element] of readingOrder.slice(1).entries()) {
      expect(readingOrder[index].compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    }
    const gatePath = screen.getByRole('list', { name: 'Vollständige Gate-Reihenfolge' });
    expect(gatePath.closest('details')).toBe(card.querySelector('details'));
    expect(gatePath.closest('details')?.open).toBe(false);
    expect(Array.from(gatePath.children, item => item.textContent)).toEqual(['UR Abgeschlossen', 'PRD Aktuell', 'CD+Tests Offen', 'QA Offen']);
    fireEvent.click(primary());
    await screen.findByRole('button', { name: 'Zurück zum Companion' });
    expect(screen.getByRole('heading', { name: 'AGDF Companion für Codex', level: 1 })).toBeTruthy();
    expect(vi.mocked(read).mock.calls.map(([path]) => path)).toContain('/api/documents/PRD?snapshot=run-snapshot');
    fireEvent.click(screen.getByRole('button', { name: 'Zurück zum Companion' }));
    await waitFor(() => expect(document.activeElement).toBe(primary()));
    expect(screen.getByRole('heading', { name: 'AGDF Companion für Codex', level: 1 })).toBeTruthy();
    expect(primary().getAttribute('data-focus-id')).toBe('companion:reissued-prd');
  });

  it('returns focus to the same Run heading when its draft action ceases to apply', async () => {
    const run = companionDraft(), reply = draftRead(run);
    const returning: Detail = { ...run, resources: [], document_states: [],
      evaluation: { ...run.evaluation!, missing_approval: 'none', control_assessment: { state: 'open', authorizes: false } } };
    const read = vi.fn(async (path: string) => path.startsWith('/api/documents/') ? reply : path.startsWith('/api/runs/')
      ? runScope(returning, 'returned-snapshot') : runScope(run)) as unknown as ReadTransport;
    render(<App host="codex" compact transport={read} initialRunId={run.run_id}/>);
    await screen.findByText('Du bist dran');
    fireEvent.click(primary());
    fireEvent.click(await screen.findByRole('button', { name: 'Zurück zum Companion' }));
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole('heading', { name: run.title })));
    expect(screen.queryByRole('button', { name: 'PRD-Entwurf öffnen' })).toBeNull();
    expect(screen.queryByText('Approval: PRD', { selector: 'code' })).toBeNull();
  });

  for (const change of ['revision', 'registration', 'digest', 'foreign Run', 'missing'] as const) {
    it(`refuses a deferred direct read with changed ${change} and rereads the Run without opening replacement bytes`, async () => {
      const run = companionDraft(), reply = draftRead(run);
      if (change === 'revision') reply.data.run.revision_id = '00000000-0000-0000-0000-000000000002';
      if (change === 'registration') reply.data.document.resource.registered_reference = '.agdf/control/other.md';
      if (change === 'digest') reply.data.document.content_digest = 'b'.repeat(64);
      if (change === 'foreign Run') reply.data.document.resource.run_id = 'run-b';
      const response = change === 'missing' ? { ...reply, state: 'missing' as const, code: 'document_missing', data: { ...reply.data, document: null } } : reply;
      let resolveRead!: (value: Envelope<ReadingScope>) => void;
      const deferred = new Promise<Envelope<ReadingScope>>(resolve => { resolveRead = resolve; });
      const read = vi.fn(async (path: string) => path.startsWith('/api/documents/') ? deferred : runScope(run)) as unknown as ReadTransport;
      const expand = vi.fn();
      render(<App host="codex" compact transport={read} initialRunId={run.run_id} onExpand={expand}/>);
      await screen.findByText('Du bist dran');
      fireEvent.click(primary());
      await act(async () => { resolveRead(response); });
      expect(screen.getByRole('button', { name: 'Zurück zum Companion' })).toBeTruthy();
      expect(screen.queryByText('Registrierte PRD-Fassung')).toBeNull();
      expect(screen.getByText(/Die gewählte Fassung konnte nicht bestätigt werden/)).toBeTruthy();
      expect(expand).not.toHaveBeenCalled();
      fireEvent.click(screen.getByRole('button', { name: 'Zurück zum Companion' }));
      await screen.findByText('Du bist dran');
      expect(vi.mocked(read).mock.calls.at(-1)?.[0]).toBe('/api/snapshot?run_id=run-a');
      expect(vi.mocked(read).mock.calls.filter(([path]) => path.startsWith('/api/documents/'))).toHaveLength(1);
    });
  }

  it('keeps optional display compatible and removes malformed gate progress', async () => {
    const run = companionDraft();
    const malformedCue = runScope({ ...run, companion: { ...run.companion!, decision_material_version: 'bad-cue' } });
    expect(() => validateData('/api/snapshot?run_id=run-a', malformedCue)).not.toThrow();
    expect(malformedCue.data?.kind === 'run' && malformedCue.data.run?.companion?.path).toEqual(run.companion!.path);
    expect(malformedCue.data?.kind === 'run' && malformedCue.data.run?.companion?.decision_material_version).toBeUndefined();
    const scope = runScope({ ...run, companion: { ...run.companion!, path: [{ gate: 'foreign', status: 'fulfilled' }] } });
    expect(() => validateData('/api/snapshot?run_id=run-a', scope)).not.toThrow();
    expect(scope.data?.kind === 'run' && scope.data.run?.companion).toBeUndefined();
    const read = vi.fn(async () => scope) as unknown as ReadTransport;
    render(<App host="codex" compact transport={read} initialRunId={run.run_id}/>);
    await screen.findByText('Du bist dran');
    expect(primary()).toBeTruthy();
    expect(screen.queryByRole('list', { name: 'Gate-Fortschritt' })).toBeNull();
  });

  it.each([
    ['Brownfield Review', 'Einordnung des Vorhabens'],
    ['Brownfield Analysis', 'Umsetzung und Tests'],
    ['PRD', 'Produktanforderungen'],
    ['QA', 'Qualitätsprüfung'],
    ['Neuer Schritt', 'Neuer Schritt'],
  ])('names the pending %s gate as %s below the figure', async (gate, heading) => {
    const run = companionDraft();
    run.persisted!.current_gate = gate;
    run.evaluation = { ...run.evaluation!, current_gate: gate, missing_approval: 'none',
      control_assessment: { state: 'open', authorizes: false } };
    run.figure = { mood: 'laeuft', reason: { key: 'working', gate } };
    const read = vi.fn(async () => runScope(run)) as unknown as ReadTransport;
    render(<App host="codex" compact transport={read} initialRunId={run.run_id}/>);
    const signal = await screen.findByText(`Das Vorhaben ist in der Phase „${heading}“.`, { selector: '.companion-signal' });
    expect(signal.closest('.companion-figure-block')).toBeTruthy();
    expect(signal.getAttribute('role')).toBe('status');
    expect(screen.queryByText('Du bist dran')).toBeNull();
  });

  it('addresses the user when a decision is pending without a formal approval', async () => {
    const run = companionDraft();
    run.evaluation = { ...run.evaluation!, missing_approval: 'none', control_assessment: { state: 'open', authorizes: false } };
    run.figure = { mood: 'wartet', reason: { key: 'waitingDecision', gate: 'PRD' } };
    const read = vi.fn(async () => runScope(run)) as unknown as ReadTransport;
    render(<App host="codex" compact transport={read} initialRunId={run.run_id}/>);
    const caption = await screen.findByText('Das Vorhaben ist in der Phase „Produktanforderungen“.', { selector: '.companion-signal' });
    expect(caption.closest('.companion-figure-block')).toBeTruthy();
    expect(screen.getByText('Du bist dran')).toBeTruthy();
    expect(screen.queryByText('Approval: PRD')).toBeNull();
  });

  it('shows pending work in a resting pose and identifies a blocker with no registered finding', async () => {
    const run = companionDraft();
    const pending = { ...run, figure: { mood: 'baut', reason: { key: 'building' } },
      persisted: { ...run.persisted!, current_gate: 'CD+Tests' },
      evaluation: { ...run.evaluation!, current_gate: 'CD+Tests', missing_approval: 'none', control_assessment: { state: 'open' as const, authorizes: false as const },
        next_operation: { type: 'implement_approved_plan', operation_key: 'implementation.execute', actor: 'agent' as const, effect: 'implementation', gate: 'CD+Tests' } } };
    const blocker: Detail = { ...run, evaluation: { ...run.evaluation!, status: 'blocked', missing_approval: 'none', control_assessment: { state: 'blocked', authorizes: false } },
      companion: { ...run.companion!, blocking_text: 'Kontrollquelle muss geprüft werden.' } };
    let value: Detail = pending;
    const read = vi.fn(async () => runScope(value)) as unknown as ReadTransport;
    render(<App host="codex" compact transport={read} initialRunId={run.run_id}/>);
    await screen.findByText('Das Vorhaben ist in der Phase „Umsetzung und Tests“.', { selector: '.companion-signal' });
    expect(screen.getByText('Codex ist als Nächstes dran')).toBeTruthy();
    const figure = document.querySelector('.companion-card .run-figure')!;
    const pose = decodeURIComponent(figure.getAttribute('src')!);
    expect(pose).toContain('data-arm="folded"');
    expect(pose).toContain('data-antenna="receiving"');
    expect(pose).not.toContain('data-tool="torque-wrench"');
    expect(screen.queryByText('Du bist dran')).toBeNull();
    value = blocker;
    fireEvent.click(screen.getByRole('button', { name: 'AGDF Companion' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Neu lesen' }));
    await screen.findByText('Kontrollquelle muss geprüft werden.');
    expect(document.querySelector('.companion-signal')?.textContent).toBe('Das Vorhaben ist in der Phase „Produktanforderungen“.');
    expect(screen.getByText('Kein passender registrierter Befund verfügbar.')).toBeTruthy();
  });

  it('retains the last observation and disables reread when the session expires', async () => {
    const run = companionDraft();
    let expired = false;
    const read = vi.fn(async () => {
      if (expired) throw Error('session_expired');
      return runScope(run);
    }) as unknown as ReadTransport;
    render(<App host="codex" compact transport={read} initialRunId={run.run_id}/>);
    await screen.findByText('Du bist dran');
    const menu = screen.getByRole('button', { name: 'AGDF Companion' });
    fireEvent.click(menu);
    expired = true;
    fireEvent.click(screen.getByRole('menuitem', { name: 'Neu lesen' }));
    await screen.findByText(/Öffne das Cockpit im Chat erneut/);
    expect(document.querySelector('.companion-signal')?.textContent).toBe('Zuletzt war das Vorhaben in der Phase „Produktanforderungen“.');
    expect(screen.getByRole('heading', { name: run.title })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'PRD-Entwurf öffnen' })).toBeNull();
    fireEvent.click(menu);
    expect((screen.getByRole('menuitem', { name: 'Neu lesen' }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByText(/Zuletzt gelesen/).getAttribute('datetime')).toBe(fixtureMeta.observed_as_of);
  });

  it('offers the decisive finding when Core supplies its scoped registration and digest', async () => {
    const run = companionDraft();
    const path = '.agdf/control/runs/run-a/evidence/finding.md';
    const resource = { type: 'Evidence', status: 'registered', run_id: run.run_id, resource_id: 'finding', registered_reference: path, path };
    const content_digest = 'f'.repeat(64);
    run.resources = [resource];
    run.document_states = [];
    run.evaluation = { ...run.evaluation!, status: 'blocked', blocking_reason: 'review_blocked', missing_approval: 'none' };
    run.companion = { ...run.companion!, blocking_text: 'Der Prüfbericht meldet eine offene Pflichtprüfung.', finding: { resource_id: resource.resource_id, content_digest } };
    const reply = { ...fixtureMeta, snapshot_id: 'finding-snapshot', data: { kind: 'document', run,
      document: { resource, format: 'markdown', content: '# Maßgeblicher Prüfbericht', content_digest, links: {} } } };
    const read = vi.fn(async (url: string) => url.startsWith('/api/documents/') ? reply : runScope(run)) as unknown as ReadTransport;
    render(<App host="codex" compact transport={read} initialRunId={run.run_id}/>);
    fireEvent.click(await screen.findByRole('button', { name: 'Befund öffnen' }));
    await screen.findByText('Maßgeblicher Prüfbericht');
    expect(vi.mocked(read).mock.calls.at(-1)?.[0]).toBe('/api/documents/finding?snapshot=run-snapshot');
  });
});

describe('compact MCP entry using the shared scoped reading state',()=>{
 it('searches a large stored backlog without selecting a result; inspected Run replaces discovery controls',async()=>{
  const many=backlog([pointer('run-a','Deliver cockpit'),...Array.from({length:12},(_,i)=>pointer(`other-${i}`,`Other project ${i}`))]);
  const read=vi.fn(async(path:string)=>named(path)?detail:many) as unknown as ReadTransport;
  render(<App compact transport={read}/>);await screen.findByRole('searchbox');
  expect(screen.getByRole('combobox',{name:'Bestandsbereich'})).toBeTruthy();
  expect(screen.getByRole('heading',{name:'Arbeit am Projekt'})).toBeTruthy();
  expect(screen.getByText('/fixture')).toBeTruthy();
  fireEvent.click(screen.getByRole('combobox',{name:'Bestandsbereich'}));
  expect(screen.getByRole('option',{name:'Runs 13 Vorhaben'})).toBeTruthy();
  fireEvent.keyDown(screen.getByRole('combobox',{name:'Bestandsbereich'}),{key:'Escape'});
  expect(document.querySelectorAll('.undertaking-list > li')).toHaveLength(13);
  expect(document.querySelector('.undertaking-list .row-step')).toBeNull();
  expect(document.querySelector('.undertaking-list .compact-row-id')?.textContent).toBe('run-a');
  fireEvent.change(screen.getByRole('searchbox',{name:'Suchen'}),{target:{value:'other-7'}});
  expect(document.querySelectorAll('.undertaking-list > li')).toHaveLength(1);expect(screen.queryByRole('button',{name:'Deliver cockpit'})).toBeNull();expect(read).toHaveBeenCalledTimes(1);
  fireEvent.change(screen.getByRole('searchbox'),{target:{value:'run-a'}});fireEvent.click(await readySelection());
  await screen.findByText('Freigegebenen Umfang umsetzen.');expect(screen.queryByRole('searchbox')).toBeNull();expect(screen.queryByRole('combobox')).toBeNull();
  expect(screen.getByRole('heading',{name:'Deliver cockpit'})).toBeTruthy();expect(read).toHaveBeenCalledTimes(2);
 });
 it('opens planned material directly from the compact overview',async()=>{
  const row={...pointer('plan-a','Geplantes Vorhaben'),kind:'planned' as const,identity:'planned/plan-a',section:'planned',row_id:'00000000-0000-4000-8000-000000000001'};
  const inventory=backlog([row]);
  const planned={...fixtureMeta,data:{kind:'planned',entry:{plan_id:'plan-a',title:row.title,priority:'high',path:row.source.path,digest:row.source.digest,content:'# Geplanter Entwurf',readiness:{ready:false},authorizes:false}}};
  const read=vi.fn(async(path:string)=>path.startsWith('/api/planned/')?planned:inventory) as unknown as ReadTransport;
  render(<App compact transport={read}/>);await screen.findByRole('searchbox');
  chooseArea('Geplant 1 Vorhaben');
  fireEvent.click(screen.getByRole('button',{name:row.title}));
  expect((await screen.findByRole('article',{name:'Geplante UR'})).textContent).toContain('Geplanter Entwurf');
  expect(vi.mocked(read).mock.calls.at(-1)?.[0]).toBe('/api/planned/'+row.row_id+'?snapshot=snapshot');
  fireEvent.click(screen.getByRole('button',{name:'UR schließen'}));
  expect(screen.queryByRole('article',{name:'Geplante UR'})).toBeNull();
 });
 it('opens an archive through the compact MCP view without loading a current Run',async()=>{
  const row={...pointer('old-run','Archiviertes Vorhaben'),kind:'archive' as const,identity:'archive/old-run',section:'archive',row_id:'00000000-0000-4000-8000-000000000001'};
  const archived={...fixtureMeta,data:{kind:'archive',entry:{id:'old-run',title:row.title,entry_kind:'run',recorded_lifecycle:'active',recorded_gate:'TP',source_control_version:'2',recorded_approvals:[],resources:[],authorizes:false},document:null}};
  const read=vi.fn(async(path:string)=>path.startsWith('/api/archive/')?archived:backlog([row])) as unknown as ReadTransport;
  render(<App compact transport={read}/>);await screen.findByRole('searchbox');
  chooseArea('Archiv 1 Vorhaben');
  const button=await readySelection('old-run');fireEvent.click(button);
  await screen.findByRole('article',{name:'Altbestandsarchiv'});
  expect(screen.getByText(/Keine aktuelle Freigabe/)).toBeTruthy();expect(screen.getByText('active')).toBeTruthy();
  expect(vi.mocked(read).mock.calls.map(call=>call[0])).toEqual(['/api/snapshot','/api/archive/'+row.row_id+'?snapshot=snapshot']);
  expect(screen.queryByRole('button',{name:'Vorhaben öffnen'})).toBeNull();
  fireEvent.click(screen.getByRole('button',{name:'Archiv schließen'}));
  expect(document.activeElement).toBe(screen.getByRole('button',{name:row.title}));
 });
 it('partial pointer diagnostics start closed and malformed stored rows cannot be opened',async()=>{
  const bad={...pointer('invalid-run','Broken pointer'),selectable:false};
  const partial={...inventory,data:{...inventory.data!,entries:[...inventory.data!.entries,bad],counts:{...inventory.data!.counts,'active':2},diagnostics:[{code:'malformed_pointer',message:'Broken stored row.'}]}};
  const read=vi.fn(async()=>partial) as unknown as ReadTransport;render(<App compact transport={read}/>);await readySelection();
  expect(screen.getByText('Teilweise verfügbar · Runs · 1 Lesehinweis').closest('details')?.open).toBe(false);
  expect((screen.getByRole('button',{name:/Broken pointer/}) as HTMLButtonElement).disabled).toBe(true);
  expect(screen.getByText('Broken stored row.')).toBeTruthy();expect(read).toHaveBeenCalledTimes(1);
 });
 it('does not warn about active coverage when only another backlog area is unreadable',async()=>{
  const source=backlog([pointer('run-a')]);
  source.state='partial';source.code='backlog_partial';
  source.data!.diagnostics=[{code:'work_section_unavailable',section:'planned'}];
  render(<App compact transport={vi.fn(async()=>source) as unknown as ReadTransport} onExpand={vi.fn()}/>);
  await readySelection();
  expect(screen.queryByText(/Backlog-Hinweise/)).toBeNull();
  expect(screen.queryByText(/Einige gespeicherte Vorhaben oder Tabellen/)).toBeNull();
  expect(screen.getByRole('button',{name:'run-a'})).toBeTruthy();
  expect(screen.queryByRole('button',{name:'Große Ansicht öffnen'})).toBeNull();
 });
 it('opens cockpit information and returns to the selected Run without re-reading it',async()=>{
  const read=vi.fn(async(path:string)=>named(path)?detail:inventory) as unknown as ReadTransport;
  render(<BrowserEntry initialCompact transport={read}/>);fireEvent.click(await readySelection('run-a'));
  await screen.findByText('Freigegebenen Umfang umsetzen.');fireEvent.click(screen.getByRole('button',{name:'Vorhaben öffnen'}));
  const heading=await screen.findByRole('heading',{name:'Deliver cockpit',level:1});expect(document.activeElement).toBe(heading);
  expect(screen.queryByRole('group',{name:'Ansicht'})).toBeNull();
  expect(screen.getByRole('button',{name:'Alle Vorhaben'}).closest('nav')?.getAttribute('aria-label')).toBe('Vorhaben-Pfad');
  expect(screen.getByRole('button',{name:'Neu laden'}).closest('.cockpit-brand-header')).toBeTruthy();
  expect(screen.queryByRole('button',{name:'Vorhaben öffnen'})).toBeNull();
  expect(screen.getByRole('region',{name:'So geht dein Vorhaben weiter'})).toBeTruthy();
  expect(screen.queryByRole('heading',{name:'Dokumente'})).toBeNull();
  fireEvent.click(screen.getByRole('button',{name:'Über das Cockpit'}));
  expect(screen.getByRole('dialog',{name:'Dein Projekt im Blick'})).toBeTruthy();
  expect(screen.getByRole('heading',{name:'Dein Begleiter'})).toBeTruthy();
  fireEvent.click(screen.getByRole('button',{name:'Info schließen'}));
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(screen.getByRole('region',{name:'So geht dein Vorhaben weiter'})).toBeTruthy();
  expect(vi.mocked(read).mock.calls.map(c=>c[0])).toEqual(['/api/snapshot','/api/runs/run-a?snapshot=snapshot']);
 });
 it('opens the same cockpit information in the compact view and restores focus',async()=>{
  const read=vi.fn(async(path:string)=>named(path)?detail:inventory) as unknown as ReadTransport;
  render(<App compact initialRunId="run-a" transport={read}/>);
  await screen.findByRole('heading',{name:'Deliver cockpit'});
  const info=screen.getByRole('button',{name:'Über das Cockpit'}); info.focus(); fireEvent.click(info);
  expect(screen.getByRole('dialog',{name:'Dein Projekt im Blick'})).toBeTruthy();
  fireEvent.keyDown(document,{key:'Escape'});
  expect(screen.queryByRole('dialog')).toBeNull(); expect(document.activeElement).toBe(info);
 });
 it('default browser retains the full reader without selecting a Run',async()=>{
  const read=vi.fn(async()=>inventory) as unknown as ReadTransport;render(<BrowserEntry transport={read}/>);
  await screen.findByRole('button',{name:'Deliver cockpit'});expect(screen.getByRole('heading',{name:'Arbeit am Projekt',level:1})).toBeTruthy();
  expect(screen.queryByRole('group',{name:'Ansicht'})).toBeNull();expect(screen.queryByRole('button',{name:/Zurück zur (Übersicht|Statuskarte)/})).toBeNull();expect(read).toHaveBeenCalledTimes(1);
 });
 it('document return restores details and matching source focus',async()=>{
  const resource={resource_id:'source-a',run_id:'run-a',type:'UR',path:'UR.md',registered_reference:'UR.md',status:'registered'};
  const parent={...data,resources:[resource]},newSource={...resource,resource_id:'document-source'};
  const doc:Envelope<ReadingScope>={...fixtureMeta,snapshot_id:'document-snapshot',data:{kind:'document',run:{...parent,resources:[newSource]},document:{resource:newSource,format:'markdown',content:'# Original document\nExact source content',content_digest:'source-digest',links:{}}}};
  const read=vi.fn(async(path:string)=>path.startsWith('/api/documents/')?doc:runScope(parent)) as unknown as ReadTransport;
  render(<App initialRunId="run-a" transport={read}/>);await screen.findByRole('heading',{name:'Deliver cockpit',level:1});
  await screen.findByText('Freigegebenen Umfang umsetzen.');
  fireEvent.click(screen.getByRole('button',{name:'Nachweise und weitere Dokumente'}));
  for(let i=0;i<2;i++){
   fireEvent.click(screen.getByRole('button',{name:/ansehen: Anforderungen/}));
   await screen.findByRole('heading',{name:'Original document'});
   expect(screen.queryByRole('group',{name:'Ansicht'})).toBeNull();expect(screen.getByRole('heading',{name:'Deliver cockpit',level:1})).toBeTruthy();
   expect(document.querySelector('.page-title--document .run-figure')).toBeTruthy();
   fireEvent.click(screen.getByRole('button',{name:/Zurück zur (Übersicht|Statuskarte)/}));await screen.findByRole('heading',{name:'Deliver cockpit',level:1});
   expect(screen.getByRole('heading',{name:'Dokumente'})).toBeTruthy();
   expect(screen.getByRole('button',{name:/ansehen: Anforderungen/})).toBe(document.activeElement);
  }
  expect(vi.mocked(read).mock.calls.map(c=>c[0])).toEqual(['/api/snapshot?run_id=run-a','/api/documents/source-a?snapshot=run-snapshot','/api/runs/run-a?snapshot=document-snapshot','/api/documents/source-a?snapshot=run-snapshot','/api/runs/run-a?snapshot=document-snapshot']);
 });
 it('shows a neutral companion when the Run has no confirmed figure',async()=>{
  const read=vi.fn(async(path:string)=>named(path)?detail:inventory) as unknown as ReadTransport;
  render(<App compact transport={read}/>);fireEvent.click(await readySelection('run-a'));
  await screen.findByText('Freigegebenen Umfang umsetzen.');
  const figure=document.querySelector<HTMLImageElement>('.compact-navigation img.run-figure');
  expect(figure).toBeTruthy();
  const svg=decodeURIComponent(figure!.getAttribute('src')!);
  expect(svg).toContain('#d0e4eb');expect(svg).not.toContain('#ff9b8c');expect(svg).not.toContain('data-gesture');
 });
 it('shows the TP plan only for a confirmed TP work step',async()=>{
  // The plan is drawn while the TP is being drafted; a figure waiting for its approval holds the gate sign.
  const tp:Detail={...data, figure:{mood:'laeuft',reason:{key:'working',gate:'TP'}}, persisted:{...data.persisted!,current_gate:'TP'}, evaluation:{...data.evaluation!,current_gate:'TP'}};
  const read=vi.fn(async(path:string)=>named(path)?runScope(tp):inventory) as unknown as ReadTransport;
  render(<App compact transport={read}/>);fireEvent.click(await readySelection('run-a'));
  await waitFor(()=>expect(document.querySelector('.compact-navigation img.run-figure')).toBeTruthy());
  const svg=decodeURIComponent(document.querySelector<HTMLImageElement>('.compact-navigation img.run-figure')!.src);
  expect(svg).toContain('data-accessory="tp-plan"');expect(svg).toContain('data-tool="planning-pen"');
 });
 it('reads before expansion and preserves the deliberately inspected Run on host expansion',async()=>{
  const read=vi.fn(async(path:string)=>named(path)?detail:inventory) as unknown as ReadTransport,expand=vi.fn();
  const view=render(<App compact transport={read} onExpand={expand}/>);const select=await readySelection();
  expect(screen.getByRole('combobox',{name:'Lifecycle'})).toBeTruthy();expect(read).toHaveBeenCalledTimes(1);expect(screen.queryByText('Freigegebenen Umfang umsetzen.')).toBeNull();
  fireEvent.click(select);await screen.findByText('Freigegebenen Umfang umsetzen.');
  expect(screen.getByText('Host context still unverified')).toBeTruthy();
  expect(screen.getByRole('heading',{name:'In Umsetzung · Umsetzung und Prüfung'})).toBeTruthy();
  expect(screen.getByText('Dokumente · 0',{exact:true})).toBeTruthy();expect(screen.queryByText('Umsetzungs- und Prüfplan',{exact:true})).toBeNull();expect(screen.queryByText('QA',{exact:true})).toBeNull();
  fireEvent.click(screen.getByRole('button',{name:'Vorhaben öffnen'}));expect(expand).toHaveBeenCalledTimes(1);
  view.rerender(<App transport={read} onExpand={expand}/>);expect(screen.getByRole('heading',{name:'Deliver cockpit'})).toBeTruthy();expect(read).toHaveBeenCalledTimes(2);
 });
 it('failed reload retains stale sources and prevents expansion as fresh',async()=>{
  let fail=false;const read=vi.fn(async(path:string)=>{if(fail)throw Error('read_failed');return named(path)?detail:inventory;}) as unknown as ReadTransport;
  render(<App compact transport={read} onExpand={vi.fn()}/>);fireEvent.click(await readySelection('run-a'));
  await screen.findByText('Freigegebenen Umfang umsetzen.');fail=true;fireEvent.click(screen.getByRole('button',{name:'Neu laden'}));
  await screen.findByText('Die Daten konnten nicht gelesen werden. Quelle oder lokalen Dienst prüfen und wiederholen.');
  expect((screen.getByRole('button',{name:'Vorhaben öffnen'}) as HTMLButtonElement).disabled).toBe(true);expect(screen.getByText('Host context still unverified')).toBeTruthy();expect(screen.queryByRole('button',{name:/Approval/})).toBeNull();
 });
 it('refreshes a changed gate coherently through one named capture and retains keyboard focus',async()=>{
  vi.useFakeTimers({toFake:['setInterval','clearInterval']});let updated=false;const next=advanced();
  const read=vi.fn(async(path:string)=>path.startsWith('/api/freshness')?changed:named(path)?updated?next:detail:inventory) as unknown as ReadTransport;
  render(<App compact transport={read} onExpand={vi.fn()}/>);fireEvent.click(await readySelection('run-a'));
  await screen.findByText('Freigegebenen Umfang umsetzen.');const reload=screen.getByRole('button',{name:'Neu laden'});reload.focus();updated=true;
  await tick();await screen.findByText('Qualität prüfen.');expect(document.activeElement).toBe(reload);expect(screen.queryByRole('combobox')).toBeNull();
  expect(screen.getByRole('heading',{name:'Weiterarbeit offen · Qualitätsprüfung'})).toBeTruthy();expect(screen.queryByText(/Kontrolldaten werden gelesen/)).toBeNull();
  expect(vi.mocked(read).mock.calls.map(c=>c[0])).toEqual(['/api/snapshot','/api/runs/run-a?snapshot=snapshot','/api/freshness?snapshot=run-snapshot','/api/snapshot?run_id=run-a']);
 });
 it('pauses outside viewport and while hidden, and checks upon return',async()=>{
  vi.useFakeTimers({toFake:['setInterval','clearInterval']});let visibility!:IntersectionObserverCallback;const disconnect=vi.fn();
  vi.stubGlobal('IntersectionObserver',class{constructor(callback:IntersectionObserverCallback){visibility=callback;}observe(){}disconnect=disconnect;});
  const read=vi.fn(async(path:string)=>path.startsWith('/api/freshness')?{...fixtureMeta,data:{unchanged:true}}:inventory) as unknown as ReadTransport;
  render(<App compact transport={read}/>);await readySelection();await tick();expect(read).toHaveBeenCalledTimes(1);
  await act(async()=>visibility([{isIntersecting:true,intersectionRatio:1} as IntersectionObserverEntry],{} as IntersectionObserver));expect(read).toHaveBeenCalledTimes(2);
  await act(async()=>visibility([{isIntersecting:false,intersectionRatio:0} as IntersectionObserverEntry],{} as IntersectionObserver));await tick();expect(read).toHaveBeenCalledTimes(2);
  vi.spyOn(document,'hidden','get').mockReturnValue(true);await act(async()=>visibility([{isIntersecting:true,intersectionRatio:1} as IntersectionObserverEntry],{} as IntersectionObserver));await tick();expect(read).toHaveBeenCalledTimes(2);
  vi.spyOn(document,'hidden','get').mockReturnValue(false);await act(async()=>document.dispatchEvent(new Event('visibilitychange')));expect(read).toHaveBeenCalledTimes(3);cleanup();expect(disconnect).toHaveBeenCalledTimes(1);
 });
 it('automatic read failure retains stale evidence and recovers only on explicit retry',async()=>{
  vi.useFakeTimers({toFake:['setInterval','clearInterval']});let fail=false;
  const read=vi.fn(async(path:string)=>{if(path.startsWith('/api/freshness'))return changed;if(fail)throw Error('read_failed');return named(path)?detail:inventory;}) as unknown as ReadTransport;
  render(<App compact transport={read} onExpand={vi.fn()}/>);fireEvent.click(await readySelection('run-a'));await screen.findByText('Freigegebenen Umfang umsetzen.');fail=true;await tick();
  await screen.findByText('Die Daten konnten nicht gelesen werden. Quelle oder lokalen Dienst prüfen und wiederholen.');expect((screen.getByRole('button',{name:'Vorhaben öffnen'}) as HTMLButtonElement).disabled).toBe(true);
  const count=vi.mocked(read).mock.calls.length;await tick();expect(read).toHaveBeenCalledTimes(count);fail=false;fireEvent.click(screen.getByRole('button',{name:'Aktualisierung fehlgeschlagen · Wiederholen'}));await screen.findByRole('heading',{name:'In Umsetzung · Umsetzung und Prüfung'});
 });
 it('discards obsolete freshness after deliberate navigation to another Run',async()=>{
  vi.useFakeTimers({toFake:['setInterval','clearInterval']});let finish!:(value:typeof changed)=>void;
  const two=backlog([pointer('run-a','Deliver cockpit'),pointer('run-b','Second run')]);
  const read=vi.fn(async(path:string)=>path.startsWith('/api/freshness')?new Promise<typeof changed>(resolve=>{finish=resolve;}):path.startsWith('/api/runs/run-b')?runScope(runData('run-b','Second run'),'second-snapshot'):named(path)?detail:two) as unknown as ReadTransport;
  render(<App compact transport={read}/>);fireEvent.click(await readySelection('run-a'));await screen.findByText('Freigegebenen Umfang umsetzen.');await tick();
  fireEvent.click(screen.getByRole('button',{name:'Alle Vorhaben'}));fireEvent.click(await readySelection('run-b'));await screen.findByRole('heading',{name:'Second run'});
  await act(async()=>finish(changed));expect(screen.queryByText(/Veraltet/)).toBeNull();expect(screen.getByRole('heading',{name:'Second run'})).toBeTruthy();
  expect(vi.mocked(read).mock.calls.filter(c=>c[0]==='/api/snapshot'||c[0]==='/api/snapshot?view=legacy')).toHaveLength(2);
 });
 it('confirmed selected Run removal returns to stored backlog without selecting a replacement',async()=>{
  vi.useFakeTimers({toFake:['setInterval','clearInterval']});let removed=false;
  const read=vi.fn(async(path:string)=>path.startsWith('/api/freshness')?changed:named(path)?removed?{...backlog([pointer('run-b')]),snapshot_id:'removed-snapshot',data:{...backlog([pointer('run-b')]).data!,removed_run_id:'run-a'}}:detail:inventory) as unknown as ReadTransport;
  render(<App compact transport={read}/>);fireEvent.click(await readySelection('run-a'));await screen.findByText('Freigegebenen Umfang umsetzen.');removed=true;await tick();
  await readySelection('run-b');expect(screen.getByRole('combobox',{name:'Lifecycle'})).toBeTruthy();expect(screen.queryByText('Freigegebenen Umfang umsetzen.')).toBeNull();expect(vi.mocked(read).mock.calls.some(c=>c[0].startsWith('/api/runs/run-b'))).toBe(false);
 });
 it('explicit navigation supersedes a pending background capture without mixing source views',async()=>{
  vi.useFakeTimers({toFake:['setInterval','clearInterval']});let finish!:(value:typeof detail)=>void;
  const two=backlog([pointer('run-a'),pointer('run-b','Second run')]);
  const read=vi.fn(async(path:string)=>path.startsWith('/api/freshness')?changed:path==='/api/snapshot?run_id=run-a'?new Promise<typeof detail>(resolve=>{finish=resolve;}):path.startsWith('/api/runs/run-b')?runScope(runData('run-b','Second run'),'second-snapshot'):named(path)?detail:two) as unknown as ReadTransport;
  render(<App compact transport={read}/>);fireEvent.click(await readySelection('run-a'));await screen.findByText('Freigegebenen Umfang umsetzen.');await tick();await screen.findByRole('button', {name:'Stand wird aktualisiert …'});
  fireEvent.click(screen.getByRole('button',{name:'Alle Vorhaben'}));fireEvent.click(await readySelection('run-b'));await screen.findByRole('heading',{name:'Second run'});
  await act(async()=>finish(advanced()));expect(screen.getByRole('heading',{name:'Second run'})).toBeTruthy();expect(screen.queryByText('Qualität prüfen.')).toBeNull();expect(screen.queryByText(/Kontrolldaten werden gelesen/)).toBeNull();
 });
});
it('expanded Run refreshes quietly and retains open evidence and its exact selection',async()=>{
 const read=vi.fn(async(path:string)=>path.startsWith('/api/freshness')?changed:detail) as unknown as ReadTransport;
 // Settle the initial asynchronous read and its visibility effect before the
 // test emits the event; visible text alone can precede effect registration.
 await act(async()=>{render(<App initialRunId="run-a" transport={read}/>);});
 await screen.findByRole('heading',{name:'Deliver cockpit'});
 fireEvent.click(screen.getByRole('button',{name:'Nachweise und weitere Dokumente'}));
 await screen.findByRole('heading',{name:'Dokumente'});
 const evidence=screen.getByText('Nachweislücken im Run-Dokument · 1').closest('details')!;
 evidence.open=true;
 await act(async()=>document.dispatchEvent(new Event('visibilitychange')));
 await waitFor(()=>expect(vi.mocked(read).mock.calls.filter(c=>c[0]==='/api/snapshot?run_id=run-a')).toHaveLength(2));
 expect(screen.getByText('Nachweislücken im Run-Dokument · 1').closest('details')?.open).toBe(true);
 expect(screen.getByRole('heading',{name:'Nachweise'})).toBeTruthy();expect(screen.queryByText(/Angefragter Run:/)).toBeNull();
 expect(document.querySelector('footer')?.textContent).toContain('Verfügbar');
});
it('inventory failure is visible directly without false empty counts or usable overview action',async()=>{
 const read=vi.fn(async()=>({...fixtureMeta,state:'error',code:'timeout',data:null,retryable:true})) as unknown as ReadTransport;
 render(<App compact transport={read} onExpand={vi.fn()}/>);await screen.findByText('Das Lesen hat das Zeitlimit erreicht. Quelle und Umfang prüfen, dann wiederholen.');
 expect(screen.queryByText(/Backlog-Hinweise/)).toBeNull();expect(screen.queryByText(/0 Backlog-Einträge/)).toBeNull();expect(screen.queryByRole('button',{name:'Große Ansicht öffnen'})).toBeNull();
});
it('opens the exact registered Run State from an unconfirmed inline card and returns using its new parent',async()=>{
 const source={resource_id:'opaque-state',run_id:'run-a',type:'Run State',path:null,registered_reference:'.agdf/control/runs/run-a/RUN_STATE.md',status:'registered'};
 const observed={...data,resources:[source],evaluation:{...data.evaluation!,control_assessment:undefined}},newSource={...source,resource_id:'document-state'};
 const doc:Envelope<ReadingScope>={...fixtureMeta,snapshot_id:'document-snapshot',data:{kind:'document',run:{...observed,resources:[newSource]},document:{resource:newSource,format:'markdown',content:'# Exact Run State\n\nSaved source content.',content_digest:'source-digest',links:{}}}};
 const read=vi.fn(async(path:string)=>path.startsWith('/api/documents/')?doc:runScope(observed)) as unknown as ReadTransport;
 const expand=vi.fn();render(<App compact initialRunId="run-a" transport={read} onExpand={expand}/>);await screen.findByText('Aktuelle Voraussetzungen nicht bestätigt');
 (await screen.findByText('Details',{selector:'summary'})).click();
 fireEvent.click(screen.getByRole('button',{name:'Stand des Vorhabens öffnen'}));await screen.findByText('Originaldokument lesen',{exact:true});fireEvent.click(screen.getByText('Originaldokument lesen',{exact:true}));await screen.findByRole('heading',{name:'Exact Run State'});
 expect(expand).toHaveBeenCalledTimes(1);expect(vi.mocked(read).mock.calls.at(-1)?.[0]).toBe('/api/documents/opaque-state?snapshot=run-snapshot');expect(vi.mocked(read).mock.calls.at(-1)?.[2]).toEqual({target:'target',snapshot:'run-snapshot',replacement:true});
 fireEvent.click(screen.getByRole('button',{name:'Zurück zur Statuskarte'}));await screen.findByText('Aktuelle Voraussetzungen nicht bestätigt');expect(screen.queryByRole('combobox')).toBeNull();expect(screen.getByRole('heading',{name:'Deliver cockpit'})).toBeTruthy();
});
it('SCN-003/008/009: compact active preview and expanded projection share query/order, while other areas reset on return',async()=>{
 const active=Array.from({length:8},(_,i)=>pointer('active-'+i,'Gemeinsames Vorhaben '+i));
 const rows=[...active,{...pointer('later','Planned only'),section:'planned'},{...pointer('done','Archive only'),section:'completed'}];
 const read=vi.fn(async()=>backlog(rows)) as unknown as ReadTransport;
 const view=render(<App compact transport={read} onExpand={vi.fn()}/>);await screen.findByRole('searchbox');
 expect([...document.querySelectorAll('.undertaking-list .run-link')].map(b=>b.firstChild?.textContent)).toEqual([...active.map(r=>r.title),'Archive only']);
 expect(screen.queryByRole('button',{name:'Planned only'})).toBeNull();expect(screen.getByRole('button',{name:'Archive only'})).toBeTruthy();
 fireEvent.change(screen.getByRole('searchbox'),{target:{value:' Gemeinsames '}});
 expect(document.querySelectorAll('.undertaking-list > li')).toHaveLength(8);
 view.rerender(<App transport={read}/>);
 expect((screen.getByRole('searchbox') as HTMLInputElement).value).toBe(' Gemeinsames ');
 expect([...document.querySelectorAll('.undertaking-list .run-link')].map(b=>b.firstChild?.textContent)).toEqual(active.map(r=>r.title));
 chooseArea('Geplant 1 Vorhaben');expect((screen.getByRole('searchbox') as HTMLInputElement).value).toBe('');
 fireEvent.change(screen.getByRole('searchbox'),{target:{value:'Planned'}});
 view.rerender(<App compact transport={read}/>);
 expect((screen.getByRole('searchbox') as HTMLInputElement).value).toBe('Planned');expect(document.activeElement).toBe(screen.getByRole('heading',{name:'AGDF Cockpit'}));
 expect(screen.getByRole('button',{name:'Planned only'})).toBeTruthy();expect(read).toHaveBeenCalledTimes(1);
});
it('SCN-020: exact row return focus; source addition hiding it in compact preview is not reported as removal',async()=>{
 let rows=[pointer('run-a','Selected undertaking')];
 const read=vi.fn(async(path:string)=>named(path)?detail:backlog(rows)) as unknown as ReadTransport;
 render(<App compact transport={read}/>);fireEvent.click(await readySelection());await screen.findByText('Freigegebenen Umfang umsetzen.');
 fireEvent.click(screen.getByRole('button',{name:'Alle Vorhaben'}));await readySelection();expect(document.activeElement).toBe(screen.getByRole('button',{name:'Selected undertaking'}));
 fireEvent.click(await readySelection());await screen.findByText('Freigegebenen Umfang umsetzen.');
 rows=[...rows,...Array.from({length:5},(_,i)=>pointer('new'+i,'New '+i))];
 fireEvent.click(screen.getByRole('button',{name:'Alle Vorhaben'}));
 await readySelection();expect(document.activeElement).toBe(screen.getByRole('button',{name:'Selected undertaking'}));
 expect(screen.queryByText(/nicht mehr im Backlog/)).toBeNull();
 fireEvent.change(screen.getByRole('searchbox'),{target:{value:'run-a'}});await readySelection();
 expect(vi.mocked(read).mock.calls.filter(c=>c[0].startsWith('/api/runs/')).map(c=>c[0])).toEqual(['/api/runs/run-a?snapshot=snapshot','/api/runs/run-a?snapshot=snapshot']);
});
it('SCN-020: removed originating row has explicit removal feedback without a substitute selection',async()=>{
 let removed=false;
 const read=vi.fn(async(path:string)=>named(path)?detail:backlog([pointer(removed?'run-b':'run-a')])) as unknown as ReadTransport;
 render(<App compact transport={read}/>);fireEvent.click(await readySelection());await screen.findByText('Freigegebenen Umfang umsetzen.');removed=true;
 fireEvent.click(screen.getByRole('button',{name:'Alle Vorhaben'}));await screen.findByText('Das zuvor geöffnete Vorhaben ist nicht mehr im gelesenen Bestand enthalten.');
 expect(document.activeElement).toBe(screen.getByRole('combobox',{name:'Bestandsbereich'}));expect(vi.mocked(read).mock.calls.some(c=>c[0].startsWith('/api/runs/run-b'))).toBe(false);
});
it('SCN-020: a valid run key matching a view control still restores the exact row focus',async()=>{
 const key='backlog-search';
 const read=vi.fn(async(path:string)=>named(path)?runScope(runData(key,'Selected run')):backlog([pointer(key,'Stored selected run')])) as unknown as ReadTransport;
 render(<App compact transport={read}/>);fireEvent.click(await readySelection(key));await screen.findByRole('heading',{name:'Selected run'});
 fireEvent.click(screen.getByRole('button',{name:'Alle Vorhaben'}));await readySelection(key);
 expect(document.activeElement).toBe(screen.getByRole('button',{name:'Stored selected run'}));
 expect(document.activeElement).not.toBe(screen.getByRole('searchbox'));
});
it('SCN-004/015/016: compact unavailable count and partial no-match never claim exhaustive zero',async()=>{
 const source=backlog([pointer('bad')]);source.data!.entries[0].selectable=false;
 const view=render(<App compact transport={vi.fn(async()=>source) as unknown as ReadTransport}/>);await screen.findByRole('searchbox');
 fireEvent.change(screen.getByRole('searchbox'),{target:{value:'absent'}});expect(screen.getByText(/weitere Vorhaben können fehlen/)).toBeTruthy();
 view.unmount();const missing=backlog([]);missing.data!.diagnostics=[{code:'work_section_unavailable',section:'active'}];
 render(<App compact transport={vi.fn(async()=>missing) as unknown as ReadTransport}/>);
 await screen.findByText(/Teilweise verfügbar · Runs/);expect(screen.getByText(/weitere Vorhaben können fehlen/)).toBeTruthy();expect(screen.queryByText(/0 Einträge/)).toBeNull();
});
