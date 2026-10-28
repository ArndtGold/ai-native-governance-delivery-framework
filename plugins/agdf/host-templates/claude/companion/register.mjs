// AGDF Companion host adapter (SDD-07 to SDD-10; follow-up SDD-05 to SDD-12): the `/agdf-companion`
// command, the persisted choices, main-loop turn observation, the refresh cadence, the own pane, the
// status line and toasts. Observation only: no gating hook, every hook passes its event on through a
// catch path, and nothing is written under .agdf/control. Session state lives in this module and is
// redrawn through `$.ui.invalidate`. Elements come from the surface table and are built with the
// host's global `h`.

import { assignRun, stepSelection } from './assignment.mjs';
import { figureSvg } from './figure.mjs';
import { chatLocale, label } from './localization.mjs';
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
// Listed runs show their condensed gate bars beside the ids while at least this many characters of an id
// stay beside the widest bar (owner request of 2026-10-28); a narrower pane lists the ids alone.
const ID_ROOM = 18;
const COLOR = Object.freeze({ laeuft: 'suggestion', baut: 'suggestion', wartet: 'warning', blockiert: 'error', fertig: 'success' });

function createSession() {
  return { startedAt: 0, root: '', registry: null, labels: null, locale: 'en', statePath: null, version: null, icon: null,
    choices: defaultCompanionState(), isHidden: false, snapshot: null, isTurnActive: false, isObjectiveExpanded: false,
    isAboutShown: false, isMenuOpen: false, timer: null, reads: 0, appliedRead: 0, observation: null };
}

// One companion per session: the module is loaded once per session.
const session = createSession();
const t = (path, params) => label(session.labels, session.locale, path, params);
const selection = () => session.choices.selections[session.root] ?? null;
const redraw = $ => $.ui.invalidate('ui.render');
// File access for the host-independent reader, each call spelled on `$` (read-only).
const files = $ => ({ exists: path => $.fs.exists(path), list: path => $.fs.list(path), read: path => $.fs.read(path) });

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

// The status line and toasts follow the shown run's run-derived state after each applied read
// (follow-up SDD-05 to SDD-07). A stale snapshot keeps the last observation, so a failed read never
// announces anything. Each host call has its own catch path: a missing channel stays silent (SDD-12).
function announce($) {
  const observed = observedRun({ snapshot: session.snapshot, sessionStartedAt: session.startedAt, selection: selection() });
  // Every applied read sets the line again, unchanged text included: the desktop dropped the one set
  // during session start, before its surface was attached (live finding of 2026-10-27).
  try { $.ui.status(statusText(observed, { labels: session.labels, locale: session.locale })); } catch { /* no status line on this host */ }
  if (session.snapshot?.stale) return;
  const { observation, notice } = observeNotice(session.observation, observed);
  session.observation = observation;
  if (!notice || !session.choices.notice) return;
  try {
    $.ui.toast(noticeText(observed.runId, notice, { registry: session.registry, labels: session.labels, locale: session.locale }));
  } catch {
    return; // no toast on this host, and so no chime either (CR-F01)
  }
  // The chime plays only with a shown toast; a host without a player skips it, a failure stays silent.
  if (session.choices.sound) {
    try { $.audio.play(chimeClip(), { gain: CHIME.gain }).catch(() => {}); } catch { /* no audio on this host */ }
  }
}

// Switching off clears the status line, forgets the observation and discards reads still running, so
// switching on starts from a fresh baseline without a toast (CR-F02).
function silence($) {
  session.observation = null;
  session.appliedRead = session.reads + 1;
  try { $.ui.status(undefined); } catch { /* no status line on this host */ }
}

// Reads the run states of the current project root, which `/cd` or a worktree move can change.
// Only the newest of overlapping reads is applied. A snapshot without any runs, as during a branch
// switch, never drops the remembered selection.
async function refresh($) {
  const read = ++session.reads;
  try {
    const root = await $.session.root();
    const next = await readSnapshot(files($), root, { now: await $.clock.now() });
    if (read < session.appliedRead) return;
    session.appliedRead = read;
    session.root = root;
    session.snapshot = settleSnapshot(session.snapshot, next);
    const chosen = selection();
    if (chosen && next.status === 'ok' && next.runs.length) {
      const { dropSelection } = assignRun({ runs: next.runs, sessionStartedAt: session.startedAt, selection: chosen });
      if (dropSelection && !next.unreadable.some(item => item.id === chosen)) await persist($, choices => { delete choices.selections[root]; });
    }
  } catch (error) {
    if (read < session.appliedRead) return;
    session.appliedRead = read;
    session.snapshot = settleSnapshot(session.snapshot, { status: 'failed', runs: [], unreadable: [], readAt: Date.now(), error: String(error?.message ?? error) });
  }
  if (session.choices.enabled) announce($);
  redraw($);
}

function stopRefreshing() {
  session.timer?.cancel();
  session.timer = null;
}

// The timer is replaced before the first read, so overlapping starts never leave a second timer.
async function startRefreshing($) {
  stopRefreshing();
  session.timer = $.clock.every(REFRESH_MS, () => { void refresh($); });
  await refresh($);
  return $.ui.open({ id: PANE, title: t('title') });
}

const openedText = opened => (opened?.isPlaced === false ? t('command.waiting', { reason: opened.reason }) : t('command.enabled'));

async function loadSession($) {
  session.startedAt = await $.clock.now();
  session.root = await $.session.root();
  session.labels = JSON.parse(await $.fs.read(`${$.plugin.root}/companion/locales.json`));
  session.registry = JSON.parse(await $.fs.read(`${$.plugin.root}/meta/agdf-interaction-locales.json`));
  const config = `${session.root}/.agdf/control/config.json`;
  const configText = (await $.fs.exists(config)) ? await $.fs.read(config) : null;
  // Without AGDF control, Claude's own `language` setting chooses the language (follow-up SDD-11).
  let setting = null;
  if (configText === null) {
    try { setting = await $.settings.read({ key: 'language' }); } catch { /* no setting: the fallback locale */ }
  }
  session.locale = chatLocale(session.registry, configText, { setting, labels: session.labels });
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
  if (session.statePath && (await $.fs.exists(session.statePath))) session.choices = parseCompanionState(await $.fs.read(session.statePath));
}

const wrappedRows = (value, columns) => (value ? Math.ceil(value.length / Math.max(columns, 10)) : 0);

// How many open runs the desktop list shows: the body rows left beside the other blocks, never fewer
// than the terminal's six (the pane then scrolls). One row of them goes to "+ N more" when runs remain.
export function listCapacity(view, { rows, columns, isAboutShown = false }) {
  const blocks = [view.message, view.hint, view.stale].filter(Boolean);
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

function body($, e, view) {
  const { Box, Text, Button, Svg, Link, Select } = $.ui.resolve(e);
  const isTerminal = e.surface === 'terminal' || !Svg;
  const rows = e.props?.scroll?.bodyRows;
  const fits = Number.isInteger(rows) && rows > 0;
  const columns = Number.isInteger(e.props?.bodyColumns) ? e.props.bodyColumns : 40;
  const select = runId => press($, async () => {
    const root = session.root;
    await persist($, choices => { choices.selections[root] = runId; });
    await refresh($);
  });
  const step = offset => press($, async () => {
    const next = stepSelection(view.openRuns, view.runId ?? selection(), offset);
    if (next) await select(next)();
  });
  const toggle = key => async () => { const value = !session.choices[key]; await persist($, choices => { choices[key] = value; }); };
  const commands = [
    ['still', session.choices.still ? t('actions.stillOff') : t('actions.stillOn'), toggle('still')],
    ['retry', t('actions.retry'), () => refresh($)],
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
  const capacity = !isTerminal && fits ? listCapacity(view, { rows, columns, isAboutShown: session.isAboutShown }) : LISTED_RUNS;
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
  const runList = view.originKind !== 'session' && view.openRuns.length
    ? (view.runId
      // The count has its own line, so the two stepping buttons fit the default width. The desktop
      // draws a Button's label, which also names it, so the label is the visible localized text.
      ? h(Box, { flexDirection: 'column' },
        h(Text, { dimColor: true }, view.openCount),
        h(Box, { flexDirection: 'row', gap: 1, alignItems: 'center' },
          h(Button, { key: 'previous', label: t('actions.previous'), onPress: step(-1) }),
          h(Button, { key: 'next', label: t('actions.next'), onPress: step(1) })))
      : h(Box, { flexDirection: 'column' },
        h(Text, { dimColor: true }, view.openCount),
        ...listed.map(runRow),
        !isTerminal && view.openRuns.length > listed.length ? h(Text, { dimColor: true }, t('fields.moreRuns', { count: view.openRuns.length - listed.length })) : null))
    : null;
  if (isTerminal) {
    return h(Box, { flexDirection: 'column', gap: 1 },
      h(Text, { color: COLOR[view.mood] }, terminalText(view, { labels: session.labels, locale: session.locale })), runList, about, actions);
  }
  const figure = h(Svg, { source: figureSvg(view.mood, { still: session.choices.still, title: `${view.title}: ${view.stateLabel}` }),
    alt: `${view.title}: ${view.stateLabel}`, width: 200, height: 140, isInteractive: !session.choices.still });
  // The body is one row less than the pane's body rows (all of them overflow it by a few pixels) and the
  // content grows, so the footer sits at the bottom edge; a taller body scrolls with the footer last (live
  // probe of 2026-10-28: a cell count sizes the body, a percentage does not).
  return h(Box, { flexDirection: 'column', gap: 1, ...(fits ? { minHeight: rows - 1 } : {}) }, h(Box, { flexDirection: 'column', gap: 1, flexGrow: 1 },
    h(Box, { flexDirection: 'column', alignItems: 'center' },
      figure,
      h(Text, { color: COLOR[view.mood], size: 'heading', weight: 'bold' }, view.stateLabel),
      view.reason ? h(Text, { dimColor: true, wrap: 'truncate-end' }, view.reason) : null),
    view.message ? h(Text, {}, view.message) : null,
    view.hint ? h(Text, { dimColor: true }, view.hint) : null,
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
      if (e.agentId === undefined && session.choices.enabled && !session.isHidden) {
        session.isTurnActive = true;
        redraw($);
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
        // The read runs after the host has its answer, never inside the hook; a hidden pane keeps
        // the status line and toasts current (follow-up SDD-08).
        if (session.choices.enabled) void refresh($);
      }
    } catch { /* observation only */ }
    return answered;
  }).catch(passOn);

  // Closing the pane by its own mark hides only the pane for this session (SDD-07); reading goes on
  // for the status line and toasts until the companion is switched off (follow-up SDD-08). The host
  // stamps `origin` as `{ kind: 'plugin' | 'person' | 'unload' }`.
  on('ui.close', { id: PANE }, async ($, e, next) => {
    try {
      if (e.origin?.kind === 'person') session.isHidden = true;
    } catch { /* observation only */ }
    return next(e);
  }).catch(passOn);

  // A logic failure draws a neutral line instead of the panel; it never throws into the host.
  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    try {
      return body($, e, buildPanelView({ snapshot: session.snapshot, sessionStartedAt: session.startedAt, selection: selection(),
        isTurnActive: session.isTurnActive, registry: session.registry, labels: session.labels, locale: session.locale,
        columns: e.props?.bodyColumns ?? Infinity, isObjectiveExpanded: session.isObjectiveExpanded }));
    } catch (error) {
      const { Text } = $.ui.resolve(e);
      return h(Text, { dimColor: true }, `AGDF Companion: ${String(error?.message ?? error).slice(0, 200)}`);
    }
  });
};
