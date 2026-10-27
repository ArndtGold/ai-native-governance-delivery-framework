// AGDF companion host adapter (SDD-07 to SDD-10): the `/agdf-companion` command, the persisted
// choices, main-loop turn observation, the refresh cadence and the own pane. Observation only: no
// gating hook, every hook passes its event on through a catch path, and nothing is written under
// .agdf/control. Session state lives in this module and is redrawn through `$.ui.invalidate`.
// Elements come from the surface table and are built with the host's global `h`.

import { assignRun, stepSelection } from './assignment.mjs';
import { figureSvg } from './figure.mjs';
import { chatLocale, label } from './localization.mjs';
import { STATE_FILE, defaultCompanionState, parseCompanionState, pluginDataDir, serializeCompanionState } from './persistence.mjs';
import { readSnapshot, settleSnapshot } from './run-state.mjs';
import { buildPanelView, terminalText } from './view.mjs';

export const PANE = 'agdf-companion';
export const COMMAND = 'agdf-companion';
export const REFRESH_MS = 30_000;
const LISTED_RUNS = 6;
const COLOR = Object.freeze({ laeuft: 'suggestion', wartet: 'warning', blockiert: 'error', fertig: 'success' });

function createSession() {
  return { startedAt: 0, root: '', registry: null, labels: null, locale: 'en', statePath: null,
    choices: defaultCompanionState(), isHidden: false, snapshot: null, isTurnActive: false, isObjectiveExpanded: false,
    timer: null, reads: 0, appliedRead: 0 };
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
  session.locale = chatLocale(session.registry, (await $.fs.exists(config)) ? await $.fs.read(config) : null);
  const dir = pluginDataDir({ configDir: await $.env.get('CLAUDE_CONFIG_DIR'), userProfile: await $.env.get('USERPROFILE'), home: await $.env.get('HOME') });
  session.statePath = dir ? `${dir}/${STATE_FILE}` : null;
  if (session.statePath && (await $.fs.exists(session.statePath))) session.choices = parseCompanionState(await $.fs.read(session.statePath));
}

const press = ($, action) => async () => {
  try { await action(); } catch { /* a failed action leaves the last drawing */ }
  redraw($);
};

function body($, e, view) {
  const { Box, Text, Button, Svg } = $.ui.resolve(e);
  const isTerminal = e.surface === 'terminal' || !Svg;
  const select = runId => press($, async () => {
    const root = session.root;
    await persist($, choices => { choices.selections[root] = runId; });
    await refresh($);
  });
  const step = offset => press($, async () => {
    const next = stepSelection(view.openRuns, view.runId ?? selection(), offset);
    if (next) await select(next)();
  });
  // The read time has its own line below the two buttons, so neither wraps at the default width.
  const actions = h(Box, { flexDirection: 'column' },
    h(Box, { flexDirection: 'row', gap: 1, alignItems: 'center' },
      h(Button, { key: 'still', label: session.choices.still ? t('actions.stillOff') : t('actions.stillOn'),
        onPress: press($, async () => { const still = !session.choices.still; await persist($, choices => { choices.still = still; }); }) }),
      h(Button, { key: 'retry', label: t('actions.retry'), onPress: press($, () => refresh($)) })),
    view.readAt ? h(Text, { dimColor: true }, view.readAt) : null);
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
        ...view.openRuns.slice(0, LISTED_RUNS).map(run => h(Button, { key: `run-${run.id}`, plain: true, label: run.id, onPress: select(run.id) }))))
    : null;
  if (isTerminal) {
    return h(Box, { flexDirection: 'column', gap: 1 },
      h(Text, { color: COLOR[view.mood] }, terminalText(view, { labels: session.labels, locale: session.locale })), runList, actions);
  }
  const figure = h(Svg, { source: figureSvg(view.mood, { still: session.choices.still, title: `${view.title}: ${view.stateLabel}` }),
    alt: `${view.title}: ${view.stateLabel}`, width: 200, height: 140, isInteractive: !session.choices.still });
  return h(Box, { flexDirection: 'column', gap: 1 },
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
      await persist($, choices => { choices.enabled = enabled; });
      if (!enabled) {
        stopRefreshing();
        await $.ui.close({ id: PANE });
        return { text: t('command.disabled') };
      }
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
        // The read runs after the host has its answer, never inside the hook.
        if (session.choices.enabled && !session.isHidden) void refresh($);
      }
    } catch { /* observation only */ }
    return answered;
  }).catch(passOn);

  // Closing the pane by its own mark hides it for this session only (SDD-07). The host stamps
  // `origin` as `{ kind: 'plugin' | 'person' | 'unload' }`.
  on('ui.close', { id: PANE }, async ($, e, next) => {
    try {
      if (e.origin?.kind === 'person') {
        session.isHidden = true;
        stopRefreshing();
      }
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
      return h(Text, { dimColor: true }, `AGDF companion: ${String(error?.message ?? error).slice(0, 200)}`);
    }
  });
};
