// AGDF Companion host adapter (SDD-07 to SDD-10; follow-up SDD-05 to SDD-12; companion core SDD-007, SDD-010):
// the `/agdf-companion` command, the persisted choices, main-loop turn observation, the refresh cadence,
// the own pane, the status line and toasts. Run state comes only from the plugin runtime's read-only
// `run-view` command through `$.process`, called on a changed run-file fingerprint, a new journal event
// of this root or a changed language; the companion imports no Core module. Observation only: no
// gating hook, every hook passes its event on through a catch path, and nothing is written under
// .agdf/control. Session state lives in this module and is
// redrawn through `$.ui.invalidate`. Elements come from the surface table and are built with the
// host's global `h`.

import { assignRun, namedRun, openRuns, stepSelection } from './assignment.mjs';
import { EVENT_POLL_MS, JOURNAL_FILE, JOURNAL_READ_LIMIT, JOURNAL_ROTATED_FILE, PANE_EVENTS, STICKY_KINDS, TOAST_KINDS, eventText,
  isConfirmed, isStillUncertain, journalDirectory, namedEventText, parseJournal, unseenEvents } from './events.mjs';
import { figureSvg, observeFigure } from './figure.mjs';
import { chatLocale, companionLabels, gateTitle, label } from './localization.mjs';
import { CHIME, chimeClip, noticeText, observeNotice, observedRun, statusText } from './notice.mjs';
import { STATE_FILE, defaultCompanionState, parseCompanionState, pluginDataDir, serializeCompanionState } from './persistence.mjs';
import { readSnapshot, settleSnapshot } from './run-state.mjs';
import { buildPanelView, terminalText } from './view.mjs';

export const PANE = 'agdf-companion';
export const COMMAND = 'agdf-companion';
export const REFRESH_MS = 30_000;
export const MENU = 'menu';
export const ABOUT_URL = 'https://agdf.iself.eu';
const LISTED_RUNS = 6;
// The surfaces whose element table has a picker; the mobile app draws none and turns one into an empty
// box (`claude plugin test` 2.1.302), so its table entry alone does not decide.
const PICKER_SURFACES = new Set(['terminal', 'desktop', 'vscode']);
// Body rows the desktop spends around the run list, measured live on 2026-10-28 (a body row is about
// 28 px): the figure with its state and reason, the framed footer with its picker, the About block,
// the space between two blocks, and one spare row, since a body taller than the pane scrolls.
const DESKTOP_ROWS = Object.freeze({ figure: 7, footer: 2, about: 7, gap: 0.6, spare: 1 });
// Rows the desktop body leaves below the pane's body rows. The T-001 probe of 2026-10-28 showed no
// scrollbar for a framed footer at 0, 0.25, 0.5 and 1 row in the narrow, widened and taller pane, so
// the smallest reserve applies (chat-run navigation SDD-08).
const BODY_RESERVE = 0;
// Listed runs show their condensed gate bars beside the ids while at least this many characters of an id
// stay beside the widest bar (owner request of 2026-10-28); a narrower pane lists the ids alone.
const ID_ROOM = 18;
const COLOR = Object.freeze({ laeuft: 'suggestion', baut: 'suggestion', wartet: 'warning', blockiert: 'error', fertig: 'success' });

function createSession() {
  return { startedAt: 0, root: '', registry: null, labels: null, locale: 'en', statePath: null, dataDir: null, version: null, icon: null,
    choices: defaultCompanionState(), isHidden: false, snapshot: null, isTurnActive: false, isObjectiveExpanded: false,
    isPreviewExpanded: false, isAboutShown: false, isMenuOpen: false, timer: null, eventTimer: null, reads: 0, appliedRead: 0,
    observation: null, figureObservation: null, chatMention: null, isBrowsing: false, conversation: null,
    // Companion core SDD-007: the run-file fingerprint of the last run-view call, the journal cursor and
    // stamp, this root's events since the last main-loop turn and the drift warnings already announced.
    fingerprint: null, journalCursor: null, journalStamp: null, eventsAvailable: null, events: [], driftSeen: null,
    // Durable events of this root waiting for a fresh run view to confirm them (CR delta review RV-1).
    unconfirmed: [],
    // The start's first read, running beside the host (CR finding B5).
    background: null };
}

// One companion per session: the module is loaded once per session.
const session = createSession();
const t = (path, params) => label(session.labels, session.locale, path, params);
const selection = () => session.choices.selections[session.root] ?? null;
const redraw = $ => $.ui.invalidate('ui.render');
// Event toasts name a run only when it is not the run the status line and toasts follow; another run
// is named by its objective (owner request of 2026-11-06, T-013).
const eventNaming = () => ({
  shownRunId: observedRun({ snapshot: session.snapshot, sessionStartedAt: session.startedAt, selection: selection(), mention: session.chatMention }).runId ?? null,
  runs: session.snapshot?.status === 'ok' ? session.snapshot.runs : [] });
// The host loads a hooks module only when every use of `$` is spelled `$.noun.member(...)` at the call
// site; passing `$.process` itself refuses the whole module (T-013 native check). The run-view reader
// receives this call-site wrapper instead.
const processes = $ => ({ run: (argv, init) => $.process.run(argv, init) });

// Applies one change to this session's choices and, where the AGDF plugin data directory already
// exists, to the freshly read state file, so choices another session stored meanwhile survive.
// Without the directory the choices last for this session (SDD-07). The state file is the module's
// only write. `change` sets values, never toggles, because it runs on both copies.
async function persist($, change) {
  change(session.choices);
  if (!session.statePath) return;
  const dir = session.statePath.slice(0, -STATE_FILE.length - 1);
  if (!(await $.fs.exists(dir))) return;
  const stored = (await $.fs.exists(session.statePath)) ? parseCompanionState(await $.fs.read(session.statePath)) : defaultCompanionState();
  change(stored);
  await $.fs.write(session.statePath, serializeCompanionState(stored));
}

// The status line and toasts follow the run-derived state of the run the panel shows without browsing,
// so browsing never changes them (follow-up SDD-05 to SDD-07; chat-run navigation SDD-06). A stale snapshot keeps the last observation, so a failed read never
// announces anything. Each host call has its own catch path: a missing channel stays silent (SDD-12).
function announce($, { quiet = new Set() } = {}) {
  const observed = observedRun({ snapshot: session.snapshot, sessionStartedAt: session.startedAt, selection: selection(),
    mention: session.chatMention });
  // Every applied read sets the line again, unchanged text included: the desktop dropped the one set
  // during session start, before its surface was attached (live finding of 2026-10-27).
  try { $.ui.status(statusText(observed, { labels: session.labels, locale: session.locale })); } catch { /* no status line on this host */ }
  if (session.snapshot?.stale) return;
  const { observation, notice } = observeNotice(session.observation, observed);
  session.observation = observation;
  // A run whose own event raises a toast in the same read gets no second state toast (decision P1).
  if (notice && !quiet.has(observed.runId)) toast($, noticeText(notice, { registry: session.registry, labels: session.labels, locale: session.locale }));
  announceDrift($);
}

// One toast, with the chime only when it was shown; a missing channel stays silent (SDD-12, CR-F01).
function toast($, text) {
  if (!session.choices.notice) return false;
  try { $.ui.toast(text); } catch { return false; }
  // The chime plays only with a shown toast; a host without a player skips it, a failure stays silent.
  if (session.choices.sound) {
    try { $.audio.play(chimeClip(), { gain: CHIME.gain }).catch(() => {}); } catch { /* no audio on this host */ }
  }
  return true;
}

// A bound document changed after recording raises one toast per change (decision P1, PRD AC-008); the
// pane keeps the warning while the run view reports it. The first read is a baseline.
function announceDrift($) {
  if (session.snapshot?.status !== 'ok') return;
  const warnings = session.snapshot.runs.flatMap(run => (run.drift ?? []).map(item => ({ run: run.id, document: item.document,
    key: `${run.id}|${item.path}|${item.current_digest}` })));
  const seen = session.driftSeen;
  session.driftSeen = new Set(warnings.map(item => item.key));
  if (!seen) return;
  const naming = eventNaming();
  for (const item of warnings.filter(warning => !seen.has(warning.key))) toast($, namedEventText(t('events.drift', { document: item.document }), item.run, t, naming));
}

// Switching off clears the status line, forgets the observation and discards reads still running, so
// switching on starts from a fresh baseline without a toast (CR-F02).
function silence($) {
  session.observation = null;
  session.appliedRead = session.reads + 1;
  try { $.ui.status(undefined); } catch { /* no status line on this host */ }
}

// Reads the run view of the current project root, which `/cd` or a worktree move can change; a
// remembered selection is requested by id, so a selected completed run is shown in full.
// Only the newest of overlapping reads is applied. A snapshot without any runs, as during a branch
// switch, never drops the remembered selection.
async function refresh($, { quiet } = {}) {
  const read = ++session.reads;
  try {
    const root = await $.session.root();
    await followConversation($);
    const remembered = session.choices.selections[root];
    // Keep evaluating the run already followed in this project when it leaves the active list;
    // its completed state must be confirmed before the companion celebrates.
    const observed = root === session.root ? observedRun({ snapshot: session.snapshot, sessionStartedAt: session.startedAt,
      selection: remembered, mention: session.chatMention }).runId : null;
    const runIds = [...new Set([remembered, observed].filter(Boolean))];
    // Taken before the call: a change during the call shows up at the next check.
    const ids = fingerprintIds(root);
    const print = await fingerprint($, root, ids);
    const next = await readSnapshot(processes($), { pluginRoot: $.plugin.root, root, language: session.locale,
      runIds, now: await $.clock.now(), clock: () => $.clock.now() });
    if (read < session.appliedRead) return;
    session.appliedRead = read;
    if (root !== session.root) {
      // Another project root: its drift baseline, pane entries and preview start over (CR finding B3).
      session.driftSeen = null;
      session.snapshot = null;
      session.figureObservation = null;
      session.events = [];
      session.unconfirmed = [];
      session.isPreviewExpanded = false;
    }
    session.root = root;
    session.snapshot = settleSnapshot(session.snapshot, next);
    if (next.status === 'ok') session.events = session.events.filter(event => !STICKY_KINDS.includes(event.kind) || isStillUncertain(event, next.runs));
    // A changed set of open runs is listed again, so the next check compares like with like. A failed
    // read keeps no fingerprint, so the next check reads again (CR finding B1); so does a view with a
    // run that ran into the read budget, which may read on the next attempt.
    const after = fingerprintIds(root);
    session.fingerprint = next.status === 'failed' || next.retry ? null
      : `${session.locale}|${after.join() === ids.join() ? print : await fingerprint($, root, after)}`;
    const chosen = selection();
    if (chosen && next.status === 'ok' && next.runs.length) {
      const { dropSelection } = assignRun({ runs: next.runs, sessionStartedAt: session.startedAt, selection: chosen });
      if (dropSelection && !next.unreadable.some(item => item.id === chosen)) await persist($, choices => { delete choices.selections[root]; });
    }
  } catch (error) {
    if (read < session.appliedRead) return;
    session.appliedRead = read;
    session.fingerprint = null;
    session.snapshot = settleSnapshot(session.snapshot, { status: 'failed', runs: [], unreadable: [], readAt: Date.now(), error: 'unavailable' });
  }
  if (session.choices.enabled) announce($, { quiet });
  redraw($);
}

// The run-file fingerprint (SDD-007): the run folders, `config.json` and, for each open or selected
// run, its RUN_STATE, documents and evidence entries with size and modification time from `$.fs.list`:
// the files the run view compares for drift (bound documents and evidence reports). It reads listings
// only, never a run file.
const fingerprintIds = root => [...new Set([...(session.snapshot?.runs ?? []).filter(run => run.lifecycle === 'active').map(run => run.id),
  session.choices.selections[root]].filter(Boolean))].sort();

async function fingerprint($, root, ids = fingerprintIds(root)) {
  const list = async path => { try { return await $.fs.list(path); } catch { return null; } };
  const files = entries => (entries ?? []).filter(entry => entry.kind === 'file').map(entry => `${entry.name}:${entry.size}:${entry.mtimeMs}`).sort().join(',');
  const control = `${root}/.agdf/control`;
  const runs = await list(`${control}/runs`);
  const parts = [`config:${files((await list(control))?.filter(entry => entry.name === 'config.json'))}`,
    `runs:${(runs ?? []).map(entry => entry.name).sort().join(',')}`];
  for (const id of ids) {
    const folders = [];
    for (const folder of ['', '/documents', '/evidence']) folders.push(files(await list(`${control}/runs/${id}${folder}`)));
    parts.push(`${id}:${folders.join('|')}`);
  }
  return parts.join(';');
}

// The 30-second check and the check after a main-loop turn (SDD-007): the run view is read again only
// when the conversation, the root, the language or the run-file fingerprint changed.
async function check($) {
  try {
    const root = await $.session.root();
    session.locale = await readLocale($, root);
    const conversationChanged = await followConversation($);
    if (!conversationChanged && root === session.root && `${session.locale}|${await fingerprint($, root)}` === session.fingerprint) return false;
    await refresh($);
    return true;
  } catch {
    return false;
  }
}

// Reads the journal (SDD-007): a bounded read of its own file in the plugin data directory, only when
// its size or time changed. New events of this root are kept for the pane, read the run view once and
// raise the toasts of decision P1. A missing or unreadable journal shows "events unavailable".
async function pollEvents($) {
  const available = value => { if (session.eventsAvailable !== value) { session.eventsAvailable = value; redraw($); } };
  try {
    if (!session.dataDir) { available(false); return; }
    // The current root, which `/cd` or a worktree move can change since the last read (CR finding B3).
    const root = await $.session.root();
    if (root !== session.root) await refresh($);
    const directory = journalDirectory(session.dataDir);
    const listing = await $.fs.list(directory);
    const entry = listing.find(item => item.name === JOURNAL_FILE && item.kind === 'file');
    if (!entry || entry.size > JOURNAL_READ_LIMIT) { available(false); return; }
    const stamp = `${entry.size}:${entry.mtimeMs}`;
    let fresh = [];
    if (stamp !== session.journalStamp) {
      let events = parseJournal(await $.fs.read(`${directory}/${JOURNAL_FILE}`));
      // Lines written after the last read but before a rotation sit in the rotation file (CR finding B6).
      const cursorId = session.journalCursor?.id;
      const rotated = listing.find(item => item.name === JOURNAL_ROTATED_FILE && item.kind === 'file');
      if (cursorId && !events.some(event => event.id === cursorId) && rotated && rotated.size <= JOURNAL_READ_LIMIT) {
        events = parseJournal(await $.fs.read(`${directory}/${JOURNAL_ROTATED_FILE}`)).concat(events);
      }
      session.journalStamp = stamp;
      const unseen = unseenEvents(events, { root, cursor: session.journalCursor });
      fresh = unseen.fresh;
      session.journalCursor = unseen.cursor;
    }
    available(true);
    if (!fresh.length && !session.unconfirmed.length) return;
    if (fresh.length) {
      const toasts = fresh.filter(event => TOAST_KINDS.includes(event.kind));
      await refresh($, { quiet: new Set(toasts.map(event => event.run_id)) });
    }
    // A durable fact is shown, in the pane and as a toast, only once the run view confirms it (SD 2,
    // CR finding B4). Without a fresh view it waits for one instead of being dropped (CR delta review
    // RV-1); a fresh view that does not confirm it drops it.
    const current = session.snapshot?.status === 'ok' && !session.snapshot.stale;
    const runs = current ? session.snapshot.runs : [];
    const candidates = session.unconfirmed.concat(fresh);
    const shown = candidates.filter(event => isConfirmed(event, runs));
    session.unconfirmed = current ? [] : candidates.filter(event => !shown.includes(event)).slice(-PANE_EVENTS);
    if (!shown.length) return;
    session.events = [...shown].reverse().concat(session.events).slice(0, PANE_EVENTS);
    if (!session.choices.enabled) { redraw($); return; }
    const gate = value => gateTitle(session.registry, session.locale, value);
    const naming = eventNaming();
    for (const event of shown.filter(item => TOAST_KINDS.includes(item.kind))) toast($, eventText(event, t, { gateTitle: gate, ...naming }));
    redraw($);
  } catch {
    available(false);
  }
}

// Takes the last open run a main-loop text names as the chat's run at host time `at` (chat-run navigation
// SDD-01, SDD-02). Returns whether a mention was recorded: a repeated name can still move the chat's run
// back from a later change, so every recorded mention is announced (CR-F02).
function noteMention(text, at) {
  const runs = session.snapshot?.status === 'ok' ? session.snapshot.runs : [];
  const runId = namedRun(text, openRuns(runs).map(run => run.id));
  if (!runId) return false;
  session.chatMention = { runId, at };
  return true;
}

// A `/clear` or a resumed transcript starts a new conversation without `session.start`: it starts without
// a chat run and counts changes from its own start (CR-F03). A host without the id keeps the session's.
async function followConversation($) {
  let conversation = session.conversation;
  try { conversation = await $.session.id(); } catch { /* no conversation id on this host */ }
  const changed = Boolean(session.conversation) && conversation !== session.conversation;
  if (changed) {
    session.chatMention = null;
    session.isBrowsing = false;
    session.observation = null;
    session.startedAt = await $.clock.now();
  }
  session.conversation = conversation;
  return changed;
}

function stopRefreshing() {
  session.timer?.cancel();
  session.eventTimer?.cancel();
  session.timer = null;
  session.eventTimer = null;
}

// The timers are replaced before the first read, so overlapping starts never leave a second one: the
// journal is read every 2 seconds, the run files are checked every 30 seconds (SDD-007). Events written
// before the start are history, never announced.
async function startRefreshing($) {
  stopRefreshing();
  session.journalCursor = { id: null, at: new Date(await $.clock.now()).toISOString() };
  session.journalStamp = null;
  session.eventTimer = $.clock.every(EVENT_POLL_MS, () => { void pollEvents($); });
  session.timer = $.clock.every(REFRESH_MS, () => { void check($); });
  // The first read runs beside the host: session start and the command never wait for the run-view
  // process (CR finding B5); the pane draws "reading" until it lands.
  session.background = (async () => { await refresh($); await pollEvents($); })().catch(() => {});
  return $.ui.open({ id: PANE, title: t('title') });
}

// Settles once the latest background read finished (for the adapter test).
export const whenIdle = () => session.background ?? Promise.resolve();

const openedText = opened => (opened?.isPlaced === false ? t('command.waiting', { reason: opened.reason }) : t('command.enabled'));

async function loadSession($) {
  session.startedAt = await $.clock.now();
  session.root = await $.session.root();
  session.registry = JSON.parse(await $.fs.read(`${$.plugin.root}/meta/agdf-interaction-locales.json`));
  session.labels = companionLabels(session.registry);
  session.locale = await readLocale($, session.root);
  // The About entry names the plugin version; a missing or unreadable manifest only leaves it out.
  try {
    const { version } = JSON.parse(await $.fs.read(`${$.plugin.root}/.claude-plugin/plugin.json`));
    session.version = typeof version === 'string' ? version : null;
  } catch { /* no version shown */ }
  // The footer shows the plugin's own AGDF icon; without it the footer starts with the name.
  try {
    const icon = await $.fs.read(`${$.plugin.root}/assets/agdf-icon.svg`);
    session.icon = icon.trimStart().startsWith('<svg') ? icon : null;
  } catch { /* no icon shown */ }
  const dir = pluginDataDir({ configDir: await $.env.get('CLAUDE_CONFIG_DIR'), userProfile: await $.env.get('USERPROFILE'), home: await $.env.get('HOME') });
  session.statePath = dir ? `${dir}/${STATE_FILE}` : null;
  // The MCP server journals below the same plugin data root (companion core SDD-006).
  session.dataDir = dir;
  if (session.statePath && (await $.fs.exists(session.statePath))) session.choices = parseCompanionState(await $.fs.read(session.statePath));
}

// The AGDF chat language of the project; without AGDF control, Claude's own `language` setting
// (follow-up SDD-11). Read again at every check, so a language change reads the run view again.
async function readLocale($, root) {
  const config = `${root}/.agdf/control/config.json`;
  const configText = (await $.fs.exists(config)) ? await $.fs.read(config) : null;
  let setting = null;
  if (configText === null) {
    try { setting = await $.settings.read({ key: 'language' }); } catch { /* no setting: the fallback locale */ }
  }
  return chatLocale(session.registry, configText, { setting, labels: session.labels });
}

const wrappedRows = (value, columns) => (value ? Math.ceil(value.length / Math.max(columns, 10)) : 0);

// How many open runs the desktop list shows: the body rows left beside the other blocks, never fewer
// than the terminal's six (the pane then scrolls). One row of them goes to "+ N more" when runs remain.
export function listCapacity(view, { rows, columns, isAboutShown = false }) {
  const blocks = [view.message, view.hint, view.unreadableHint !== view.message ? view.unreadableHint : null, view.stale,
    ...(view.drift ?? []), ...(view.events ? [view.events.join(' '), ...view.events.map(() => ' ')] : []),
    ...(view.review ? [view.review.summary, view.review.match, ' ', ' '] : []), view.eventsHint].filter(Boolean);
  const fixed = DESKTOP_ROWS.figure + DESKTOP_ROWS.footer + DESKTOP_ROWS.spare + (isAboutShown ? DESKTOP_ROWS.about : 0) + 1
    + blocks.reduce((sum, value) => sum + wrappedRows(value, columns), 0) + DESKTOP_ROWS.gap * (blocks.length + 3);
  return Math.max(LISTED_RUNS, Math.floor(rows - fixed));
}

// A run id shortened in the middle to `room` characters, so its date and sequence stay readable.
export function fitRunId(id, room) {
  if (id.length <= room) return id;
  const tail = Math.min(12, Math.floor((room - 1) / 2));
  return `${id.slice(0, room - 1 - tail)}…${id.slice(id.length - tail)}`;
}

const press = ($, action) => async () => {
  try { await action(); } catch { /* a failed action leaves the last drawing */ }
  redraw($);
};

function body($, e) {
  const { Box, Text, Button, Svg, Link, Select } = $.ui.resolve(e);
  const isTerminal = e.surface === 'terminal' || !Svg;
  const view = buildPanelView({ snapshot: session.snapshot, sessionStartedAt: session.startedAt, selection: selection(),
    mention: session.chatMention, isBrowsing: session.isBrowsing, showRunState: !isTerminal,
    isTurnActive: session.isTurnActive, registry: session.registry, labels: session.labels, locale: session.locale,
    columns: e.props?.bodyColumns ?? Infinity, isObjectiveExpanded: session.isObjectiveExpanded,
    events: session.events, eventsAvailable: session.eventsAvailable ?? undefined });
  const rows = e.props?.scroll?.bodyRows;
  const fits = Number.isInteger(rows) && rows > 0;
  const columns = Number.isInteger(e.props?.bodyColumns) ? e.props.bodyColumns : 40;
  const select = runId => press($, async () => {
    const root = session.root;
    // A pick of another run than the chat's browses until the next main-loop turn (SDD-04, CR-F07).
    if (view.chatRunId) session.isBrowsing = runId !== view.chatRunId;
    await persist($, choices => { choices.selections[root] = runId; });
    await refresh($);
  });
  const step = offset => press($, async () => {
    const next = stepSelection(view.openRuns, view.runId ?? selection(), offset);
    if (next) await select(next)();
  });
  const toggle = key => async () => { const value = !session.choices[key]; await persist($, choices => { choices[key] = value; }); };
  // While another run than the chat's run is shown, the menu offers the way back first (SDD-05).
  const canReturn = Boolean(view.chatRunId) && view.runId !== view.chatRunId;
  const back = async () => { session.isBrowsing = false; };
  const commands = [
    ...(canReturn ? [['chat', t('actions.backToChat'), back]] : []),
    ['still', session.choices.still ? t('actions.stillOff') : t('actions.stillOn'), toggle('still')],
    ['retry', t('actions.retry'), async () => { session.journalStamp = null; await refresh($); await pollEvents($); }],
    ['notice', session.choices.notice ? t('actions.noticeOff') : t('actions.noticeOn'), toggle('notice')],
    ['sound', session.choices.sound ? t('actions.soundOff') : t('actions.soundOn'), toggle('sound')],
    ['about', t('actions.about'), async () => { session.isAboutShown = true; }],
  ];
  // The actions open from the panel's foot (owner requests of 2026-10-28): the AGDF icon, the menu and
  // the read time at the right edge, set off by a dim frame (a dim line on the terminal). Where the
  // surface has a picker, the app draws the open menu itself as a popover above the footer; the picker
  // always shows its neutral entry, the name, so every pick runs its action. The mobile app draws no
  // picker and gets the name as a plain button that opens the entries above the footer.
  const hasPicker = Boolean(Select) && PICKER_SURFACES.has(e.surface);
  const run = action => press($, async () => { session.isMenuOpen = false; await action(); });
  const trigger = hasPicker
    ? h(Select, { key: MENU, value: MENU, options: [{ value: MENU, label: t('title') }, ...commands.map(([value, text]) => ({ value, label: text }))],
      onSelect: value => { const command = commands.find(([key]) => key === value); return command ? run(command[2])() : undefined; } })
    : h(Button, { key: MENU, plain: true, label: `${t('title')} ${session.isMenuOpen ? '▴' : '▾'}`,
      onPress: press($, async () => { session.isMenuOpen = !session.isMenuOpen; }) });
  const entries = !hasPicker && session.isMenuOpen
    ? h(Box, { flexDirection: 'column', alignItems: 'flex-start', ...(isTerminal ? {} : { borderStyle: 'single', borderDimColor: true, paddingX: 1 }) },
      ...commands.map(([key, text, action]) => h(Button, { key, plain: true, label: text, onPress: run(action) })))
    : null;
  const footer = h(Box, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 1,
    ...(isTerminal ? {} : { borderStyle: 'single', borderDimColor: true, paddingX: 1 }) },
    h(Box, { flexDirection: 'row', alignItems: 'center', gap: 1, flexShrink: 1 },
      !isTerminal && session.icon ? h(Svg, { source: session.icon, alt: 'AGDF', width: 20, height: 20 }) : null,
      trigger),
    view.readAt ? h(Box, { flexShrink: 0 }, h(Text, { dimColor: true }, view.readAt)) : null);
  const actions = h(Box, { flexDirection: 'column', gap: isTerminal ? 0 : 1, flexShrink: 0 }, entries,
    isTerminal ? h(Text, { dimColor: true }, '─'.repeat(Math.min(columns, 40))) : null, footer);
  const about = session.isAboutShown ? h(Box, { flexDirection: 'column' },
    h(Text, { weight: 'semibold' }, t('title')),
    h(Text, { dimColor: true }, t('about.text')),
    session.version ? h(Text, { dimColor: true }, t('about.version', { version: session.version })) : null,
    Link ? h(Link, { href: ABOUT_URL, label: ABOUT_URL.slice('https://'.length) }) : h(Text, {}, ABOUT_URL),
    h(Button, { key: 'about-close', plain: true, label: t('actions.closeAbout'), onPress: press($, async () => { session.isAboutShown = false; }) })) : null;
  const capacity = !isTerminal && fits ? listCapacity(view, { rows: rows - BODY_RESERVE, columns, isAboutShown: session.isAboutShown }) : LISTED_RUNS;
  // The terminal keeps its six; the desktop lists as many as fit and gives the last row to "+ N more".
  const listed = isTerminal ? view.openRuns.slice(0, LISTED_RUNS)
    : view.openRuns.length <= capacity ? view.openRuns : view.openRuns.slice(0, capacity - 1);
  // One listed run: the id as a plain button and, where the pane has room for the widest listed bar, its
  // condensed gate bar at the right edge, every id shortened to the same room (the same rule for all rows,
  // live check of 2026-10-28). The bar keeps its width; an id that still runs over is cut by the surface.
  const widest = Math.max(0, ...listed.map(run => run.bar?.length ?? 0));
  const room = columns - widest - 2;
  const withBars = widest > 0 && room >= ID_ROOM;
  const runRow = run => {
    const id = h(Button, { key: `run-${run.id}`, plain: true, label: withBars ? fitRunId(run.id, room) : run.id, onPress: select(run.id) });
    return withBars && run.bar
      ? h(Box, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 1 },
        h(Box, { flexShrink: 1 }, id), h(Box, { flexShrink: 0 }, h(Text, { dimColor: true, mono: true }, run.bar)))
      : id;
  };
  // The stepping row stands under every shown run, the chat's run included (SDD-04).
  const runList = view.openRuns.length
    ? (view.runId
      // The count has its own line, so the two stepping buttons fit the default width. The desktop
      // draws a Button's label, which also names it, so the label is the visible localized text.
      ? h(Box, { flexDirection: 'column' },
        h(Text, { dimColor: true }, view.openCount),
        h(Box, { flexDirection: 'row', gap: 1, alignItems: 'center' },
          h(Button, { key: 'previous', label: t('actions.previous'), onPress: step(-1) }),
          h(Button, { key: 'next', label: t('actions.next'), onPress: step(1) })),
        canReturn ? h(Button, { key: 'chat-return', plain: true, label: t('actions.backToChat'), onPress: press($, back) }) : null)
      : h(Box, { flexDirection: 'column' },
        h(Text, { dimColor: true }, view.openCount),
        ...listed.map(runRow),
        !isTerminal && view.openRuns.length > listed.length ? h(Text, { dimColor: true }, t('fields.moreRuns', { count: view.openRuns.length - listed.length })) : null))
    : null;
  if (isTerminal) {
    return h(Box, { flexDirection: 'column', gap: 1 },
      h(Text, { color: COLOR[view.mood] }, terminalText(view, { labels: session.labels, locale: session.locale })), runList, about, actions);
  }
  const scope = view.runId ? JSON.stringify([session.root, view.runId]) : null;
  const quiet = !session.choices.enabled || session.choices.still || session.isHidden || Boolean(view.stale);
  const still = quiet || !scope || ['unreadable', 'idle'].includes(view.figure?.reason.key);
  // Without an assigned run a readable project smiles and keeps the idle motion (blinking) unless the
  // still pose applies; it never gestures. The smile is a static face, so the still pose keeps it.
  const idle = !scope && view.idle === true;
  const idling = idle && !quiet;
  session.figureObservation = observeFigure(session.figureObservation, { scope, figure: view.figure, current: !still });
  const { gate, gesture, sequence } = session.figureObservation ?? {};
  const figure = h(Svg, { source: figureSvg(view.mood, { still: still && !idling, smile: idle, gate, workGate: view.workGate, gesture, sequence }),
    alt: `${view.title}: ${view.stateLabel}`, width: 200, height: 140, isInteractive: !still });
  // The body is as tall as the pane's body rows less the probed reserve and the content grows, so the
  // footer sits at the bottom edge; a taller body scrolls with the footer last (live probes of
  // 2026-10-28: a cell count sizes the body, a percentage does not; SDD-08).
  return h(Box, { flexDirection: 'column', gap: 1, ...(fits ? { minHeight: rows - BODY_RESERVE } : {}) }, h(Box, { flexDirection: 'column', gap: 1, flexGrow: 1 },
    h(Box, { flexDirection: 'column', alignItems: 'center' },
      figure,
      h(Text, { color: COLOR[view.mood], size: 'heading', weight: 'bold' }, view.stateLabel),
      view.reason ? h(Text, { dimColor: true, wrap: 'truncate-end' }, view.reason) : null),
    view.message ? h(Text, {}, view.message) : null,
    view.hint ? h(Text, { dimColor: true }, view.hint) : null,
    view.unreadableHint && view.unreadableHint !== view.message ? h(Text, { color: 'warning' }, view.unreadableHint) : null,
    view.gateBar ? h(Text, { mono: true, wrap: 'truncate-end' }, view.gateBar) : null,
    view.runId ? h(Box, { flexDirection: 'column' },
      h(Text, { weight: 'semibold', wrap: 'truncate-end' }, view.runId),
      view.origin ? h(Text, { dimColor: true }, view.origin) : null) : null,
    view.objective ? h(Box, { flexDirection: 'row', gap: 1, alignItems: 'center' },
      h(Text, { dimColor: true, wrap: view.isObjectiveExpanded ? 'wrap' : 'truncate-end' }, view.objective),
      h(Button, { key: 'objective', plain: true, label: view.isObjectiveExpanded ? t('actions.collapse') : t('actions.expand'),
        onPress: press($, async () => { session.isObjectiveExpanded = !session.isObjectiveExpanded; }) })) : null,
    view.nextStep ? h(Box, { flexDirection: 'column' },
      h(Text, { dimColor: true }, t('fields.nextStep')),
      h(Text, {}, view.nextStep)) : null,
    ...(view.drift ?? []).map(text => h(Text, { color: 'warning' }, text)),
    view.events ? h(Box, { flexDirection: 'column' },
      h(Text, { dimColor: true }, t('fields.events')),
      ...view.events.map(line => h(Text, { wrap: 'truncate-end' }, line))) : null,
    view.review ? h(Box, { flexDirection: 'column' },
      h(Text, { dimColor: true }, t('fields.material')),
      h(Text, {}, `${view.review.summary} · ${view.review.match}`),
      view.review.preview ? h(Text, { mono: true, dimColor: true, wrap: session.isPreviewExpanded ? 'wrap' : 'truncate-end' },
        session.isPreviewExpanded ? view.review.preview : view.review.preview.split('\n')[0]) : null,
      view.review.preview ? h(Button, { key: 'preview', plain: true, label: session.isPreviewExpanded ? t('actions.collapse') : t('actions.expand'),
        onPress: press($, async () => { session.isPreviewExpanded = !session.isPreviewExpanded; }) }) : null,
      view.review.truncated ? h(Text, { dimColor: true }, view.review.truncated) : null) : null,
    view.eventsHint ? h(Text, { dimColor: true }, view.eventsHint) : null,
    runList,
    view.stale ? h(Text, { color: 'warning' }, view.stale) : null,
    about),
    actions);
}

// Each registration carries a `.catch` that passes the event on, so even an overrun or a
// misreturn leaves the host's own behaviour in place (SDD-10).
const passOn = ($, e, next) => next(e);

export const register = on => {
  on('session.start', async ($, e, next) => {
    try {
      await loadSession($);
      await $.command.register({ name: COMMAND, description: t('command.description'), immediate: true });
      if (session.choices.enabled) await startRefreshing($);
    } catch { /* the companion stays unavailable; AGDF is unaffected (SDD-10) */ }
    return next(e);
  }).catch(passOn);

  on('command.run', { command: COMMAND }, async $ => {
    try {
      // A pane the person hid for this session comes back; the stored choice stays as it is.
      if (session.choices.enabled && session.isHidden) {
        session.isHidden = false;
        return { text: openedText(await startRefreshing($)) };
      }
      const enabled = !session.choices.enabled;
      if (!enabled) {
        // Reading, the status line and the pane stop before the choice is stored, so a failing write
        // leaves none of them running (CR-F03); the choice is stored even if closing the pane fails.
        stopRefreshing();
        session.figureObservation = null;
        silence($);
        try {
          await $.ui.close({ id: PANE });
        } finally {
          await persist($, choices => { choices.enabled = false; });
        }
        return { text: t('command.disabled') };
      }
      await persist($, choices => { choices.enabled = true; });
      session.isHidden = false;
      return { text: openedText(await startRefreshing($)) };
    } catch (error) {
      return { text: `${COMMAND}: ${String(error?.message ?? error).slice(0, 200)}` };
    }
  }).catch(() => ({ text: `${COMMAND}: unavailable` }));

  on('turn.start', async ($, e, next) => {
    try {
      if (e.agentId === undefined && session.choices.enabled) {
        // A main-loop turn ends browsing and may name the chat's run (chat-run navigation SDD-02, SDD-04);
        // the host clock is read beside the event, never before it is passed on (SDD-11).
        session.isBrowsing = false;
        // Pane entries of events clear at the next main-loop turn (PRD state transitions); an uncertain
        // outcome stays until its run recorded a later operation (CR finding B7).
        session.events = session.events.filter(event => STICKY_KINDS.includes(event.kind));
        if (!session.isHidden) session.isTurnActive = true;
        redraw($);
        const prompt = e.text;
        void $.clock.now().then(at => { if (noteMention(prompt, at)) { announce($); redraw($); } }).catch(() => {});
      }
    } catch { /* observation only */ }
    return next(e);
  }).catch(passOn);

  on('turn.complete', async ($, e, next) => {
    const answered = await next(e);
    try {
      if (e.agentId === undefined) {
        // Cleared on every main-loop completion, also while switched off, so no stale overlay remains.
        session.isTurnActive = false;
        // The check runs after the host has its answer, never inside the hook; a hidden pane keeps
        // the status line and toasts current (follow-up SDD-08). It reads the journal and, on a
        // changed run-file fingerprint, the run view (SDD-007); the turn overlay ends with a redraw
        // either way. The turn's final answer (`e.answer`, else the text `next(e)` returned) is matched
        // at the turn's end time, so a run created during the turn counts (CR-F05, CR-F06).
        if (session.choices.enabled) {
          const answer = typeof e.answer === 'string' ? e.answer : answered?.text;
          void (async () => {
            const at = await $.clock.now();
            await pollEvents($);
            if (!(await check($))) redraw($);
            if (session.choices.enabled && noteMention(answer, at)) { announce($); redraw($); }
          })().catch(() => {});
        }
      }
    } catch { /* observation only */ }
    return answered;
  }).catch(passOn);

  // Closing the pane by its own mark hides only the pane for this session (SDD-07); reading goes on
  // for the status line and toasts until the companion is switched off (follow-up SDD-08). The host
  // stamps `origin` as `{ kind: 'plugin' | 'person' | 'unload' }`.
  on('ui.close', { id: PANE }, async ($, e, next) => {
    try {
      session.figureObservation = null;
      if (e.origin?.kind === 'person') session.isHidden = true;
    } catch { /* observation only */ }
    return next(e);
  }).catch(passOn);

  // A logic failure draws a neutral line instead of the panel; it never throws into the host.
  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    try {
      return body($, e);
    } catch (error) {
      const { Text } = $.ui.resolve(e);
      return h(Text, { dimColor: true }, `AGDF Companion: ${String(error?.message ?? error).slice(0, 200)}`);
    }
  });
};
