import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import { appendFileSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, renameSync, rmSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { fixture } from "../../core/test/control-cockpit-fixtures.js";
import { currentFixture } from "../../core/test/fixtures/current-run.js";
import { replaceFirstScalar } from "../../core/lib/control-state/run-state-edits.js";
import { sealRunState } from "../../core/lib/control-state/run-seal.js";
import { createRun } from "../../core/lib/control-state/run-state-repository.js";
import { parseRunState } from "../../core/lib/control-state/run-state-parser.js";
import { readRunView } from "../../core/lib/companion/run-view.js";
import { runValidatorCli } from "../lib/runtime/validator-application.js";
import { deriveFigureState } from "../../core/lib/companion/figure-state.js";
import { hostSpellingViolations } from "./companion-host-spelling.js";

async function approvalFixture() {
  const f = fixture();
  const route = f.context.call('step.record', { step: 'route', route: 'quick_task', reason: 'Companion adapter fixture', source: f.context.material(f.binding(), 'Brownfield Review', '# Brownfield Review\n\nSmall isolated display fixture.') }, f.binding());
  assert.equal(route.outcome, 'accepted', JSON.stringify(route));
  const p = f.context.call('presentation.prepare', { gate: 'UR' }, f.binding());
  assert.equal(p.outcome, 'accepted', JSON.stringify(p));
  return { ...f, presentationId: p.family_result.presentation_id, approve: () => f.context.call('approval.record', { gate: 'UR', presentation_id: p.family_result.presentation_id, response: 'Approval: UR' }, f.binding()) };
}
function createListedRun(f, id, { empty = false, blocked = false } = {}) {
  const path = createRun(f.root, id);
  const binding = () => ({ run_id: id, expected_revision_id: parseRunState(readFileSync(path, 'utf8')).meta.revision_id });
  // Pin synthetic activity times for deterministic id-order navigation; current
  // typed records still determine the displayed gate and deliberate decisions.
  const pinActivity = () => writeFileSync(path, sealRunState(f.root, replaceFirstScalar(readFileSync(path, 'utf8'), 'updated_at', parseRunState(readFileSync(f.runPath, 'utf8')).meta.updated_at)));
  if (!empty) {
    const ur = f.context.call('step.record', { step: 'ur', title: 'Synthetic listed Run', source: f.context.material(binding(), 'UR', readFileSync(join(f.root, f.documentPath), 'utf8')) }, binding());
    assert.equal(ur.outcome, 'accepted', JSON.stringify(ur));
    const route = f.context.call('step.record', { step: 'route', route: 'quick_task', reason: 'Synthetic listed Run', source: f.context.material(binding(), 'Brownfield Review', '# Brownfield Review\n\nSmall isolated display fixture.') }, binding());
    assert.equal(route.outcome, 'accepted', JSON.stringify(route));
  }
  const requestChange = () => {
    const p = f.context.call('presentation.prepare', { gate: 'UR' }, binding());
    assert.equal(p.outcome, 'accepted', JSON.stringify(p));
    const result = f.context.call('presentation_decision.record', { gate: 'UR', presentation_id: p.family_result.presentation_id, action: 'request_change', comment: 'Synthetic adapter change request' }, binding());
    assert.equal(result.outcome, 'accepted', JSON.stringify(result));
    pinActivity();
  };
  if (blocked) requestChange();
  else pinActivity();
  return { path, requestChange };
}

// The Claude companion host adapter against a fake host (T-006; SCN-001, SCN-006, SCN-010, SCN-011,
// SCN-014; companion core SCN-022): command toggling and persistence, turn observation, refresh and
// stale marking, the pane per surface, catch paths, failure injection, and no write outside the
// companion state file. The run view comes from the plugin runtime's read-only `run-view` command.
const repoRoot = fileURLToPath(new URL("../../..", import.meta.url));
const companionDir = join(repoRoot, "plugins", "agdf", "host-templates", "claude", "companion");
const pluginRoot = "PLUGIN_ROOT";
// The host's JSX factory is a global of the mod environment.
globalThis.h = (tag, props, ...children) => ({ tag, props: props ?? {}, children: children.flat(Infinity).filter(child => child !== null && child !== undefined && child !== false) });
let instance = 0;
// The host loads the module once per session; a query string gives each fake session its own instance.
const freshModule = () => import(`${pathToFileURL(join(companionDir, "register.mjs")).href}?session=${++instance}`);
const { COMMAND, PANE, REFRESH_MS } = await freshModule();
const { EVENT_POLL_MS } = await import(pathToFileURL(join(companionDir, "events.mjs")).href);
const hostPath = path => (path.startsWith(`${pluginRoot}/meta/`) ? join(repoRoot, "plugins", "agdf", "meta", path.slice(pluginRoot.length + 6))
    : path === `${pluginRoot}/.claude-plugin/plugin.json` ? join(repoRoot, "plugins", "agdf", ".claude-plugin", "plugin.json")
      : path === `${pluginRoot}/assets/agdf-icon.svg` ? join(repoRoot, "plugins", "agdf", "assets", "agdf-icon.svg") : path);
// The plugin runtime's local validator, run in this process: the packaged agdf-local.js hands its
// arguments to the same command parser and handler. The spawned command is covered by
// run-view-command-test.js and claude-companion-parity-test.js.
const LOCAL_VALIDATOR = `${pluginRoot}/runtime/agdf-local.js`;
async function runLocal(argv, init) {
  assert.deepEqual([argv[0], argv[1], argv[2], init], ["node", LOCAL_VALIDATOR, "run-view", { timeoutMs: 10_000 }], "the companion runs only the run view");
  const out = [];
  const err = [];
  const exitCode = await runValidatorCli(argv.slice(2), { io: { log: line => out.push(line), error: line => err.push(line) } });
  return reportedView({ exitCode, stdout: out.join("\n"), stderr: err.join("\n") });
}
// A block the run view reports for a run, beyond what its recorded state gives. The status card blocks a
// run only on its own conditions (a recorded review decision is none of them), so the notice, sound and
// race checks set the blocked entry the run view would carry, with the Core-derived figure (companion
// core SDD-001). Real blocks from the status card are covered by the request-change runs below.
const reported = new Map();
const report = (root, runId, fields) => reported.set(`${root}|${runId}`, { ...reported.get(`${root}|${runId}`), ...fields });
const reportBlock = (root, runId, decision) => report(root, runId,
  { status: "blocked", blocking_reason: `synthetic_${decision}`, blocking_text: decision === "revise" ? "revision needed" : "blocked" });
function reportedView(result) {
  if (!reported.size || result.exitCode !== 0) return result;
  const view = JSON.parse(result.stdout);
  view.runs = view.runs.map(entry => {
    const block = reported.get(`${view.root}|${entry.run_id}`);
    if (!block || entry.valid === false) return entry;
    const next = { ...entry, ...block };
    return { ...next, figure: deriveFigureState(next) };
  });
  return { ...result, stdout: JSON.stringify(view) };
}
// A run view without any runs, as during a branch switch or with a missing runs folder.
const emptyView = root => ({ exitCode: 0, stderr: "", stdout: JSON.stringify({ schema_version: "run-view/1", root, language: "en",
  store: { status: "ok", reason: null }, counts: null, diagnosis: { unreadable: [], counts: { unreadable: 0 } }, runs: [], authorizes: false }) });
const pluginVersion = JSON.parse(readFileSync(join(repoRoot, "plugins", "agdf", ".claude-plugin", "plugin.json"), "utf8")).version;
// The surface tables. The mobile app draws no picker, yet the 2.1.302 test engine hands one out there and
// draws it as an empty box, so the fake mobile table carries one too and the companion must not use it.
const SURFACES = {
  desktop: { Box: "Box", Text: "Text", Button: "Button", Svg: "Svg", Select: "Select", Link: "Link" },
  terminal: { Box: "Box", Text: "Text", Button: "Button", Select: "Select", Link: "Link" },
  mobile: { Box: "Box", Text: "Text", Button: "Button", Svg: "Svg", Select: "Select", Link: "Link" },
};

// failChannels: toast and status throw, audio is missing and the settings read rejects (SDD-12).
// failToast: only the toast throws, so a chime without a shown toast would be visible (CR-F01).
function fakeHost({ projectRoot, configDir, failRoot = false, settings = {}, failChannels = false, failToast = false }) {
  const log = { writes: [], opened: [], closed: [], commands: [], invalidations: 0, timers: [], passed: 0, toasts: [], status: [], audio: [], processes: [] };
  const where = { root: projectRoot, conversation: "conversation-1" };
  const fail = () => { throw new Error("channel unavailable"); };
  const $ = {
    plugin: { name: "agdf", root: pluginRoot },
    clock: { now: async () => Date.now(), every: (ms, fn) => { const timer = { ms, fn, cancelled: false, cancel() { this.cancelled = true; } }; log.timers.push(timer); return timer; } },
    session: { root: async () => { if (failRoot) throw new Error("root unavailable"); return where.root; }, id: async () => where.conversation },
    env: { get: async name => ({ CLAUDE_CONFIG_DIR: configDir })[name] },
    settings: { read: async ({ key }) => { if (failChannels) throw new Error("settings unavailable"); return settings[key]; } },
    ...(failChannels ? {} : { audio: { play: async (clip, options) => { log.audio.push({ clip, options }); } } }),
    process: { run: (argv, init) => { log.processes.push(argv); return runLocal(argv, init); } },
    // Listings carry size and time, as the host's list does; the companion reads no run file itself.
    fs: {
      exists: async path => existsSync(hostPath(path)),
      list: async path => readdirSync(hostPath(path)).map(name => {
        const stats = lstatSync(join(hostPath(path), name));
        return { name, kind: stats.isDirectory() ? "dir" : stats.isFile() ? "file" : "other", size: stats.isFile() ? stats.size : 0,
          mtimeMs: stats.isFile() ? stats.mtimeMs : 0, isLink: stats.isSymbolicLink() };
      }),
      read: async path => readFileSync(hostPath(path), "utf8"),
      write: async (path, text) => { log.writes.push(path); writeFileSync(path, text); },
    },
    command: { register: async spec => { log.commands.push(spec); } },
    ui: {
      resolve: e => SURFACES[e.surface],
      invalidate: () => { log.invalidations++; },
      open: async args => { log.opened.push(args); return { isPlaced: true }; },
      close: async args => { log.closed.push(args); },
      toast: failChannels || failToast ? fail : text => { log.toasts.push(text); },
      status: failChannels ? fail : text => { log.status.push(text); },
    },
  };
  const hooks = [];
  const on = (event, matcher, hook) => {
    const item = { event, matcher: hook ? matcher : undefined, hook: hook ?? matcher };
    hooks.push(item);
    return { catch: handler => { item.catch = handler; } };
  };
  const next = async e => { log.passed++; return { passed: e }; };
  // The start and the command read in the background (CR finding B5); the fake host waits for that read,
  // as the next check of a real host would find it applied.
  let idle = async () => {};
  const fire = async (event, e = {}) => {
    const result = await hooks.find(item => item.event === event).hook($, e, next);
    if (event === "session.start" || event === "command.run") await idle();
    return result;
  };
  const attach = module => { idle = module.whenIdle; module.register(on); };
  const liveTimers = () => log.timers.filter(timer => !timer.cancelled).length;
  return { $, on, fire, attach, log, hooks, where, liveTimers };
}
// Background work (the post-turn read) settles over a few event-loop turns.
async function waitFor(condition, label = "condition") {
  for (let turn = 0; turn < 500; turn += 1) {
    if (condition()) return;
    await new Promise(resolve => setImmediate(resolve));
  }
  assert.fail(`timed out waiting for ${label}`);
}
const texts = node => (typeof node === "string" ? [node] : node?.children ? node.children.flatMap(texts) : []);
const find = (node, predicate) => (predicate(node) ? [node] : []).concat(node?.children ? node.children.filter(child => typeof child === "object").flatMap(child => find(child, predicate)) : []);
const buttons = tree => find(tree, node => node.tag === "Button");
const button = (tree, key) => buttons(tree).find(node => node.props.key === key);
const menu = tree => find(tree, node => node.tag === "Select")[0];
// Picks one entry from the footer menu, as the host's `ui.select` chain ends in the picker's `onSelect`;
// hands back the pick unstarted, so a caller may hold it like a button's press.
async function entry(host, key) {
  const picker = menu(await render(host));
  return () => picker.props.onSelect(key, { element: "menu", value: key });
}
// The entry's label as the footer menu offers it.
async function entryLabel(host, key) {
  return menu(await render(host)).props.options.find(option => option.value === key)?.label;
}
const render = (host, surface = "desktop", props = {}) => host.fire("ui.render", { surface, props: { bodyColumns: 40, ...props } });
function controlDigest(root) {
  const hash = createHash("sha256");
  const walk = path => { for (const name of readdirSync(path).sort()) {
    const file = join(path, name);
    if (lstatSync(file).isDirectory()) walk(file); else hash.update(relative(root, file)).update(readFileSync(file));
  } };
  walk(join(root, ".agdf", "control"));
  return hash.digest("hex");
}

const target = await approvalFixture();
const configRoot = mkdtempSync(join(tmpdir(), "agdf-companion-config-"));
const statePath = `${configRoot}/plugins/data/agdf-agdf/companion-state.json`;
mkdirSync(join(configRoot, "plugins", "data", "agdf-agdf"), { recursive: true });
// The MCP server journals below the same data root (companion core SDD-006); an empty journal means no
// AGDF outcome happened yet. The unavailable journal is checked on its own below.
const journal = join(configRoot, "plugins", "data", "agdf-agdf", "companion", "events.jsonl");
mkdirSync(join(configRoot, "plugins", "data", "agdf-agdf", "companion"), { recursive: true });
writeFileSync(journal, "");
// A changed run-file time without changed bytes: the fingerprint a check compares (SDD-007).
let touched = 0;
const touch = root => { const at = new Date(Date.now() + (touched += 1) * 1000); utimesSync(join(root, ".agdf", "control", "runs", "fixture-a", "RUN_STATE.md"), at, at); };
const hosts = [];
const session = async (options = {}) => {
  const host = fakeHost({ projectRoot: target.root, configDir: configRoot, ...options });
  host.attach(await freshModule());
  hosts.push(host);
  return host;
};
try {
  // `init` takes the chat language from the machine; pin it so the expected labels are stable.
  const configPath = join(target.root, ".agdf", "control", "config.json");
  writeFileSync(configPath, `${JSON.stringify({ ...JSON.parse(readFileSync(configPath, "utf8")), chat_language: "en" }, null, 2)}\n`);
  const controlBefore = controlDigest(target.root);

  // SCN-011: observation only. Six hooks, a catch path on every gating-capable one, and the
  // adapter source writes through $.fs.write in one place: the companion state file.
  const first = await session();
  assert.deepEqual(first.hooks.map(item => item.event).sort(), ["command.run", "session.start", "turn.complete", "turn.start", "ui.close", "ui.render"]);
  assert.deepEqual(first.hooks.filter(item => !item.catch).map(item => item.event), ["ui.render"]);
  assert.deepEqual(first.hooks.find(item => item.event === "command.run").matcher, { command: COMMAND });
  assert.deepEqual(first.hooks.find(item => item.event === "ui.close").matcher, { id: PANE });
  const source = readFileSync(join(companionDir, "register.mjs"), "utf8");
  assert.equal(source.match(/\$\.fs\.write\(/gu)?.length, 1, "one write site");
  assert.ok(!/\$\.state\.set|\$\.store\./u.test(source), "no host state or plugin store writes");
  // The host refuses the whole module when `$` or one of its nouns is bound, passed, read or accessed
  // computed or optional; every use must be `$.noun.member(...)` (T-013 finding F1, SCN-023). The checker
  // first proves itself on the forms the host refuses and accepts (delta review of 2026-11-07).
  for (const refused of ["const p = $.process;", "f({ run: $.process.run });", "$['process'].run([]);", "const { process } = $;",
    "const host = $; host.process.run([]);", "const sep = '//'; const p = $.process;", "$.process?.run([]);", "g(...$);", "return $.ui;"]) {
    assert.notDeepEqual(hostSpellingViolations(`export const probe = $ => { ${refused} };`), [], `refused form is detected: ${refused}`);
  }
  for (const accepted of ["$.process.run(argv, init);", "files($);", "const r = `${$.plugin.root}/meta`;", "/* $.process */ const s = '$.ui';"]) {
    assert.deepEqual(hostSpellingViolations(`export const probe = $ => { ${accepted} };`), [], `accepted form passes: ${accepted}`);
  }
  for (const name of readdirSync(companionDir).filter(file => file.endsWith(".mjs"))) {
    assert.deepEqual(hostSpellingViolations(readFileSync(join(companionDir, name), "utf8")), [], `${name} spells every host noun at its call site`);
  }
  for (const item of first.hooks.filter(entry => entry.catch && entry.event !== "command.run")) {
    assert.deepEqual(await item.catch(first.$, { probe: item.event }, async e => ({ passed: e })), { passed: { probe: item.event } }, `${item.event} catch passes the event on`);
  }

  // SCN-001: off by default; the command switches on and off, persists and a new session keeps it.
  await first.fire("session.start", { start: 1 });
  assert.deepEqual([first.log.commands[0].name, first.log.commands[0].description, first.log.commands[0].immediate], [COMMAND, "Switch the AGDF Companion on or off", true]);
  assert.deepEqual([first.log.opened.length, first.log.writes.length, first.log.timers.length], [0, 0, 0]);
  const on = await first.fire("command.run", { command: COMMAND });
  assert.equal(on.text, "AGDF Companion switched on.");
  assert.deepEqual(first.log.opened.at(-1), { id: PANE, title: "AGDF Companion" });
  assert.equal(JSON.parse(readFileSync(statePath, "utf8")).enabled, true);
  assert.deepEqual(first.log.timers.slice(-2).map(timer => timer.ms), [EVENT_POLL_MS, REFRESH_MS]);

  // AC-004: no change in this session, so no run is assigned and open runs are offered.
  let tree = await render(first);
  assert.ok(texts(tree).includes("No run assigned"));
  const runButton = buttons(tree).find(button => button.props.key === "run-fixture-a");
  assert.ok(runButton, "open run offered for selection");
  assert.ok(!buttons(tree).some(button => /approv|continue|reject/iu.test(`${button.props.key} ${button.props.label}`)), "no approval or continuation control");
  await runButton.props.onPress();
  assert.equal(JSON.parse(readFileSync(statePath, "utf8")).selections[target.root], "fixture-a");
  tree = await render(first);
  assert.ok(texts(tree).includes("Selected by you") && texts(tree).includes("waiting for approval"));
  const figureSource = async host => find(await render(host), node => node.tag === "Svg")[0].props.source;
  const waitingFigure = await figureSource(first);
  assert.match(waitingFigure, />UR<\/text>/u);
  assert.match(waitingFigure, /dur="12s"/u);
  assert.match(waitingFigure, /data-gesture/u, "first visible approval plays its gesture");
  await (await entry(first, "retry"))();
  assert.equal(await figureSource(first), waitingFigure, "unchanged read keeps the SVG bytes");

  assert.ok(texts(find(tree, node => node.tag === "Text" && node.props.mono)[0])[0].length <= 40);
  // The stepping buttons show their localized label, which the desktop draws and which names them.
  // They share a row of their own; the count sits on the line above, so the row fits 40 columns
  // even as the terminal's `[ label ]` (live finding of 2026-10-26: the count wrapped between them).
  const steppers = tree => buttons(tree).filter(button => ["previous", "next"].includes(button.props.key)).map(button => [button.props.label, texts(button)]);
  const stepRow = tree => find(tree, node => node.tag === "Box" && node.children.some(child => child.props?.key === "previous"))[0];
  const checkStepping = (tree, names) => {
    assert.deepEqual(steppers(tree), names.map(name => [name, []]));
    const row = stepRow(tree);
    assert.deepEqual(row.children.map(child => child.props.key), ["previous", "next"], "the stepping row holds only the two buttons");
    assert.ok(names.map(name => `[ ${name} ]`).join(" ").length <= 40, "the stepping row fits the default width");
    const column = find(tree, node => node.tag === "Box" && node.children.includes(row))[0];
    assert.match(texts(column.children[0])[0], /\d+ (of|von) \d+/u, "the count stands on its own line above the buttons");
  };
  // The actions open from the panel's foot (owner requests of 2026-10-28): the footer holds the AGDF icon
  // (not on the terminal), the menu and the read time at the right edge, and is the last row. A dim frame
  // sets it off on the desktop, a dim line on the terminal. Where the surface has a picker the menu is one,
  // always showing its neutral entry, the name; the mobile app gets a plain button that opens the entries.
  const ACTIONS = ["still", "retry", "notice", "sound", "about"];
  const parentOf = (tree, node) => find(tree, candidate => candidate.tag === "Box" && candidate.children.includes(node))[0];
  const checkFooter = async (host, surface, names) => {
    const tree = await render(host, surface);
    const trigger = find(tree, node => node.props?.key === "menu")[0];
    const left = parentOf(tree, trigger);
    const footer = parentOf(tree, left);
    const readAt = footer.children[1];
    assert.deepEqual([footer.props.flexDirection, footer.props.justifyContent, footer.children.length], ["row", "space-between", 2]);
    assert.deepEqual([footer.props.borderStyle, footer.props.borderDimColor], surface === "terminal" ? [undefined, undefined] : ["single", true], "a dim frame sets the footer off");
    assert.deepEqual(left.children.map(child => child.tag), { desktop: ["Svg", "Select"], terminal: ["Select"], mobile: ["Svg", "Button"] }[surface]);
    if (surface !== "terminal") assert.equal(left.children[0].props.source, readFileSync(join(repoRoot, "plugins", "agdf", "assets", "agdf-icon.svg"), "utf8"));
    assert.match(texts(readAt)[0], /^(As of|Stand) \d{2}:\d{2}$/u, "the read time stands at the footer's right edge");
    assert.equal(readAt.props.flexShrink, 0, "the read time keeps its width");
    const actions = parentOf(tree, footer);
    assert.deepEqual([actions.children.at(-1), tree.children.at(-1)], [footer, actions], "the footer is the last row");
    if (surface === "terminal") assert.deepEqual(texts(actions.children.at(-2)), ["─".repeat(40)], "a dim line sets the terminal footer off");
    assert.deepEqual(buttons(tree).filter(node => ACTIONS.includes(node.props.key)), [], "no entry is drawn beside the closed menu");
    if (surface !== "mobile") {
      assert.equal(trigger.props.value, "menu", "the menu shows its neutral entry");
      assert.deepEqual(trigger.props.options.map(option => [option.value, option.label]), [["menu", names[0]], ...ACTIONS.map((value, index) => [value, names[index + 1]])]);
      return;
    }
    assert.deepEqual([trigger.props.label, trigger.props.plain], [`${names[0]} ▾`, true]);
    await trigger.props.onPress();
    const open = await render(host, surface);
    const listed = buttons(open).filter(node => ACTIONS.includes(node.props.key));
    assert.deepEqual(listed.map(node => [node.props.key, node.props.label, node.props.plain]), ACTIONS.map((key, index) => [key, names[index + 1], true]));
    const entries = parentOf(open, listed[0]);
    assert.deepEqual([entries.props.borderStyle, entries.props.borderDimColor], ["single", true], "the open entries stand out as a menu");
    assert.equal(parentOf(open, entries), parentOf(open, parentOf(open, parentOf(open, button(open, "menu")))), "the entries stand directly above the footer");
    await button(open, "menu").props.onPress();
    assert.deepEqual(buttons(await render(host, surface)).filter(node => ACTIONS.includes(node.props.key)), [], "the name closes the menu again");
  };
  checkStepping(tree, ["Previous run", "Next run"]);
  for (const surface of ["desktop", "terminal", "mobile"]) {
    await checkFooter(first, surface, ["AGDF Companion", "Stop motion", "Read again", "Notices off", "Sound on", "About"]);
  }
  const configText = readFileSync(configPath, "utf8");
  writeFileSync(configPath, `${JSON.stringify({ ...JSON.parse(configText), chat_language: "de" }, null, 2)}\n`);
  const german = await session();
  await german.fire("session.start");
  writeFileSync(configPath, configText);
  checkStepping(await render(german), ["Vorheriger Run", "Nächster Run"]);
  await checkFooter(german, "desktop", ["AGDF Companion", "Bewegung aus", "Neu lesen", "Meldung aus", "Ton an", "About"]);

  // On the desktop the body is as tall as the pane's body rows less the probed reserve (0 rows, T-001 of
  // run agdf-companion-chat-run-navigation-20261028-01) and the content grows, so the footer sits at the
  // bottom edge (SCN-015); without body rows nothing is sized.
  const sized = await render(first, "desktop", { scroll: { offset: 0, bodyRows: 30 } });
  assert.deepEqual([sized.props.minHeight, sized.children[0].props.flexGrow, sized.children.length], [30, 1, 2]);
  assert.equal((await render(first)).props.minHeight, undefined);
  assert.equal((await render(first, "terminal", { scroll: { offset: 0, bodyRows: 30 } })).props.minHeight, undefined, "the terminal keeps its layout");

  // A pick runs its entry, and the menu shows its neutral entry again. About shows the name, the
  // purpose, the plugin version and the link to agdf.iself.eu on desktop and terminal; its plain button
  // closes it again. The neutral entry and an unknown value run nothing.
  const drawn = first.log.invalidations;
  assert.equal(menu(await render(first)).props.onSelect("menu", { element: "menu", value: "menu" }), undefined);
  assert.equal(menu(await render(first)).props.onSelect("unknown", { element: "menu", value: "unknown" }), undefined);
  assert.equal(first.log.invalidations, drawn, "neither the neutral entry nor an unknown value redraws");
  assert.equal(find(await render(first), node => node.tag === "Link").length, 0, "About is closed by default");
  await (await entry(first, "about"))();
  for (const surface of ["desktop", "terminal"]) {
    const aboutTree = await render(first, surface);
    assert.deepEqual(find(aboutTree, node => node.tag === "Link").map(node => node.props), [{ href: "https://agdf.iself.eu", label: "agdf.iself.eu" }]);
    assert.ok(texts(aboutTree).includes("Shows the state of your AGDF runs beside the chat. Read-only: approvals stay in the chat."));
    assert.ok(texts(aboutTree).includes(`AGDF plugin ${pluginVersion}`));
    assert.equal(menu(aboutTree).props.value, "menu", "the menu shows its neutral entry again after a pick");
  }
  await button(await render(first), "about-close").props.onPress();
  assert.equal(find(await render(first), node => node.tag === "Link").length, 0, "the close button hides About");


  // The desktop run list fills the room the body rows leave (owner request of 2026-10-28): as many open
  // runs as fit, the last row "+ N more" when runs remain, never fewer than six; the terminal keeps six.
  const { listCapacity } = await freshModule();
  const listView = { message: "No run assigned", hint: "No run changed in this session. Choose an open run to show it here." };
  assert.equal(listCapacity(listView, { rows: 10, columns: 40 }), 6, "never fewer than six");
  assert.equal(listCapacity(listView, { rows: 50, columns: 40 }) - listCapacity(listView, { rows: 40, columns: 40 }), 10, "each body row adds a run");
  assert.equal(listCapacity(listView, { rows: 50, columns: 40 }) - listCapacity(listView, { rows: 50, columns: 40, isAboutShown: true }), 7, "About takes its rows");
  assert.ok(listCapacity({ ...listView, hint: "x".repeat(400) }, { rows: 50, columns: 40 }) < listCapacity(listView, { rows: 50, columns: 40 }), "a longer hint takes rows");
  const many = await approvalFixture();
  try {
    const manyConfig = join(many.root, ".agdf", "control", "config.json");
    writeFileSync(manyConfig, `${JSON.stringify({ ...JSON.parse(readFileSync(manyConfig, "utf8")), chat_language: "en" }, null, 2)}\n`);
    for (let index = 1; index <= 12; index += 1) {
      const id = `extra-${String(index).padStart(2, "0")}`;
      createListedRun(many, id, { empty: index === 11, blocked: index === 12 });
    }
    const lister = await session({ projectRoot: many.root });
    await lister.fire("session.start");
    const runsOf = tree => buttons(tree).filter(node => node.props.key.startsWith("run-")).length;
    const moreOf = tree => texts(tree).filter(text => /^\+ \d+ more$/u.test(text));
    const roomy = await render(lister, "desktop", { scroll: { offset: 0, bodyRows: 60 } });
    assert.ok(texts(roomy).includes("13 open runs"));
    assert.deepEqual([runsOf(roomy), moreOf(roomy)], [13, []], "all runs fit a tall pane");
    // Beside each listed id its condensed gate bar, the id shortened in the middle to the room the bar
    // leaves (owner request of 2026-10-28); a pane too narrow for both lists the ids alone.
    const rowsOf = tree => find(tree, node => node.tag === "Box" && node.children[0]?.children?.[0]?.props?.key?.startsWith("run-"));
    const barRows = rowsOf(roomy);
    assert.equal(barRows.length, 13, "every listed run has its bar row");
    const widest = Math.max(...barRows.map(row => texts(row.children[1])[0].length));
    for (const row of barRows) {
      const [idBox, barBox] = row.children;
      const [id, bar] = [idBox.children[0], barBox.children[0]];
      assert.deepEqual([row.props.flexDirection, row.props.justifyContent, idBox.props.flexShrink, barBox.props.flexShrink], ["row", "space-between", 1, 0], "the bar keeps its width");
      assert.deepEqual([bar.tag, bar.props.dimColor, bar.props.mono], ["Text", true, true]);
      assert.match(texts(bar)[0], /^[✓●○]+ \S/u);
      assert.ok(id.props.label.length <= 40 - widest - 2, "every id fits beside the widest bar");
    }
    // The path has one current entry: the route entry stays open while the UR is the current gate.
    assert.deepEqual(texts(barRows[0].children[1]), ["●○ UR"], "a quick task at UR shows its own path");
    const narrow = await render(lister, "desktop", { bodyColumns: 24, scroll: { offset: 0, bodyRows: 60 } });
    assert.deepEqual([rowsOf(narrow).length, runsOf(narrow)], [0, 13], "a narrow pane lists the ids alone");
    assert.ok(buttons(narrow).filter(node => node.props.key.startsWith("run-")).every(node => !node.props.label.includes("…")));
    const { fitRunId } = await freshModule();
    assert.equal(fitRunId("repository-control-compatibility-20260930-01", 29), "repository-contr…-20260930-01");
    assert.equal(fitRunId("extra-01", 20), "extra-01");
    assert.equal(fitRunId("gate-internal-continuation-recovery-20261008-01", 20).length, 20);
    const rows = 26;
    const capacity = listCapacity({ message: "No run assigned", hint: "No run changed in this session. Choose an open run to show it here." }, { rows, columns: 40 });
    const tight = await render(lister, "desktop", { scroll: { offset: 0, bodyRows: rows } });
    assert.ok(capacity < 13 && capacity > 6, "the tight pane shows more than six and fewer than all");
    assert.deepEqual([runsOf(tight), moreOf(tight)], [capacity - 1, [`+ ${13 - capacity + 1} more`]], "the last row says how many remain");
    assert.deepEqual([runsOf(await render(lister, "terminal", { scroll: { offset: 0, bodyRows: rows } })), moreOf(await render(lister, "terminal"))], [6, []], "the terminal keeps six");

    // Chat-run navigation (run agdf-companion-chat-run-navigation-20261028-01). extra-12 is blocked, the
    // other runs wait for an approval, so the status line tells the chat's run from a browsed one.
    const settle = async () => { for (let turn = 0; turn < 60; turn += 1) await new Promise(resolve => setImmediate(resolve)); };
    const ORIGINS = ["Named in the chat", "Changed in this session", "Selected by you"];
    const look = async (host, surface = "desktop") => {
      const tree = await render(host, surface);
      const all = texts(tree);
      return { tree, runId: all.find(text => /^(extra-\d{2}|fixture-a)$/u.test(text)) ?? null, origin: ORIGINS.find(text => all.includes(text)) ?? null };
    };
    const turnComplete = (host, text, extra = {}) => host.hooks.find(item => item.event === "turn.complete").hook(host.$, extra, async () => ({ text }));
    const optionValues = tree => menu(tree).props.options.map(option => option.value);
    // The stepping order is the run view's activity order (newest receipt first, a run without one
    // last; companion core SDD-001), which the logic test pins; the neighbours come from the same view.
    const { openRuns: openOrder } = await import(pathToFileURL(join(companionDir, "assignment.mjs")).href);
    const { snapshotFromRunView } = await import(pathToFileURL(join(companionDir, "run-state.mjs")).href);
    const neighbour = async (id, offset) => {
      const view = await runLocal(["node", LOCAL_VALIDATOR, "run-view", "--dir", many.root, "--json", "--language", "en"], { timeoutMs: 10_000 });
      const order = openOrder(snapshotFromRunView(view.stdout, { now: 0 }).runs).map(run => run.id);
      assert.ok(order.includes(id), `${id} is open`);
      return order[(order.indexOf(id) + offset + order.length) % order.length];
    };

    // SCN-002: a subagent turn names nothing; a main-loop prompt or answer names the chat's run, the
    // last named wins and the answer counts after the prompt. SCN-019: a non-string answer changes nothing.
    await lister.fire("turn.start", { agentId: "sub", text: "look at extra-05" });
    assert.equal((await look(lister)).runId, null, "a subagent turn names no chat run");
    await lister.fire("turn.start", { text: "Weiter mit extra-05." });
    assert.deepEqual([(await look(lister)).runId, (await look(lister)).origin], ["extra-05", "Named in the chat"]);
    assert.deepEqual(await turnComplete(lister, "Next is extra-07, then extra-12."), { text: "Next is extra-07, then extra-12." }, "the answer passes through unchanged");
    await settle();
    assert.deepEqual([(await look(lister)).runId, (await look(lister)).origin], ["extra-12", "Named in the chat"]);
    await turnComplete(lister, 42);
    await settle();
    assert.equal((await look(lister)).runId, "extra-12", "a non-string answer leaves the chat's run");
    assert.equal(lister.log.status.at(-1), "AGDF · UR · blocked", "the status line names the chat's run");

    // SCN-006 and SCN-009: the stepping row stands under the chat's run, without a return control; a
    // step browses, stores the selection and offers the return control in the panel and as first menu entry.
    let chatView = await look(lister);
    assert.ok(button(chatView.tree, "previous") && button(chatView.tree, "next"), "stepping from the chat's run");
    assert.deepEqual([button(chatView.tree, "chat-return"), optionValues(chatView.tree).includes("chat")], [undefined, false]);
    const toastsBefore = lister.log.toasts.length;
    const afterChat = await neighbour("extra-12", 1);
    await button(chatView.tree, "next").props.onPress();
    await settle();
    let browsed = await look(lister);
    assert.deepEqual([browsed.runId, browsed.origin], [afterChat, "Selected by you"]);
    assert.equal(JSON.parse(readFileSync(statePath, "utf8")).selections[many.root], afterChat, "the pick is remembered as today");
    assert.deepEqual([button(browsed.tree, "chat-return")?.props.label, button(browsed.tree, "chat-return")?.props.plain], ["Back to chat run", true]);
    assert.deepEqual([optionValues(browsed.tree)[1], menu(browsed.tree).props.options[1].label], ["chat", "Back to chat run"]);
    const steppingColumn = find(browsed.tree, node => node.tag === "Box" && node.children.includes(button(browsed.tree, "chat-return")))[0];
    assert.equal(steppingColumn.children.at(-1), button(browsed.tree, "chat-return"), "the return control stands below the stepping buttons");

    // SCN-011: browsing never moves the status line or raises a toast for the browsed run.
    assert.equal(lister.log.status.at(-1), "AGDF · UR · blocked");
    assert.equal(lister.log.toasts.length, toastsBefore, "no toast for a browsed run");

    // SCN-009: the return control shows the chat's run again; the menu entry does the same.
    await button(browsed.tree, "chat-return").props.onPress();
    assert.deepEqual([(await look(lister)).runId, (await look(lister)).origin], ["extra-12", "Named in the chat"]);
    await button((await look(lister)).tree, "next").props.onPress();
    await settle();
    await (await entry(lister, "chat"))();
    assert.equal((await look(lister)).runId, "extra-12", "the menu entry returns to the chat's run");

    // SCN-007: the next main-loop turn returns from browsing; a subagent turn does not.
    await button((await look(lister)).tree, "next").props.onPress();
    await settle();
    await lister.fire("turn.start", { agentId: "sub", text: "subagent work" });
    assert.equal((await look(lister)).runId, afterChat, "a subagent turn keeps the browsed run");
    await lister.fire("turn.start", { text: "no run named here" });
    chatView = await look(lister);
    assert.deepEqual([chatView.runId, chatView.origin], ["extra-12", "Named in the chat"], "the main-loop turn returns to the chat's run");
    await turnComplete(lister, "done");
    await settle();

    // SCN-005: the German texts.
    const englishConfig = readFileSync(manyConfig, "utf8");
    writeFileSync(manyConfig, `${JSON.stringify({ ...JSON.parse(englishConfig), chat_language: "de" }, null, 2)}\n`);
    const germanLister = await session({ projectRoot: many.root });
    await germanLister.fire("session.start");
    writeFileSync(manyConfig, englishConfig);
    await germanLister.fire("turn.start", { text: "Weiter mit extra-03" });
    assert.ok(texts(await render(germanLister)).includes("Im Chat genannt"));
    await button(await render(germanLister), "next").props.onPress();
    await settle();
    assert.equal(button(await render(germanLister), "chat-return")?.props.label, "Zurück zum Chat-Run");
    await turnComplete(germanLister, "fertig");
    await settle();

    // Code Review corrections. CR-F07: stepping onto the chat's run follows it again.
    await lister.fire("turn.start", { text: "extra-12" });
    await settle();
    await button((await look(lister)).tree, "next").props.onPress();
    await settle();
    assert.equal((await look(lister)).origin, "Selected by you");
    await button((await look(lister)).tree, "previous").props.onPress();
    await settle();
    assert.deepEqual([(await look(lister)).runId, (await look(lister)).origin], ["extra-12", "Named in the chat"], "a step onto the chat's run is no browsing");

    // A current Run with no UR yet keeps stepping and the way back; old unknown decision scalars are unsupported.
    await lister.fire("turn.start", { text: "Weiter mit extra-11." });
    await settle();
    let odd = await look(lister);
    assert.ok(texts(odd.tree).includes("working"));
    assert.ok(button(odd.tree, "next"), "stepping from an undrafted chat run");
    const afterOdd = await neighbour("extra-11", 1);
    await button(odd.tree, "next").props.onPress();
    await settle();
    odd = await look(lister);
    assert.deepEqual([odd.runId, odd.origin, Boolean(button(odd.tree, "chat-return"))], [afterOdd, "Selected by you", true], "a step from it browses");
    await lister.fire("turn.start", { text: afterOdd });
    await settle();
    await button((await look(lister)).tree, "previous").props.onPress();
    await settle();
    odd = await look(lister);
    assert.deepEqual([texts(odd.tree).includes("working"), Boolean(button(odd.tree, "chat-return")), optionValues(odd.tree)[1]], [true, true, "chat"], "browsing to an undrafted run offers the way back");

    // CR-F02: every recorded mention is announced, also one that names the chat's run again.
    const announced = lister.log.status.length;
    await lister.fire("turn.start", { text: "extra-12 again" });
    await settle();
    assert.ok(lister.log.status.length > announced, "a repeated mention sets the status line");

    // CR-F06 and CR-F05: the turn's own answer (e.answer) counts before the text next(e) returns, and it
    // is matched after the post-turn read, so a run created during the turn counts.
    await turnComplete(lister, "a summary that names extra-04", { answer: "Weiter mit extra-03." });
    await settle();
    assert.equal((await look(lister)).runId, "extra-03", "e.answer is the turn's answer");
    const extra13 = createListedRun(many, 'extra-13');
    await turnComplete(lister, "", { answer: "Created extra-13." });
    await settle();
    assert.deepEqual([(await look(lister)).runId, (await look(lister)).origin], ["extra-13", "Named in the chat"], "a run created during the turn counts");

    // CR-F04: browsing to a run whose state changes raises no toast and keeps the status line on the
    // chat's run; without a chat run neither the return button nor the menu entry appears.
    await lister.fire("turn.start", { text: "extra-12" });
    await settle();
    await turnComplete(lister, "");
    await settle();
    const toward = (await neighbour("extra-12", 1)) === "extra-13" ? "next" : "previous";
    assert.equal(await neighbour("extra-12", toward === "next" ? 1 : -1), "extra-13", "extra-13 stands beside the chat's run");
    await button((await look(lister)).tree, toward).props.onPress();
    await settle();
    assert.equal((await look(lister)).runId, "extra-13");
    const quietToasts = lister.log.toasts.length;
    const quietStatus = lister.log.status.at(-1);
    extra13.requestChange();
    await (await entry(lister, "retry"))();
    await settle();
    assert.equal(texts((await look(lister)).tree).includes("blocked"), true, "the browsed run is now blocked");
    assert.deepEqual([lister.log.toasts.length, lister.log.status.at(-1)], [quietToasts, quietStatus], "no toast and an unchanged status line for the browsed run");

    // CR-F03: a new conversation (a /clear) starts without a chat run.
    lister.where.conversation = "conversation-2";
    await (await entry(lister, "retry"))();
    await settle();
    const cleared = await look(lister);
    assert.deepEqual([cleared.origin === "Named in the chat", Boolean(button(cleared.tree, "chat-return")), optionValues(cleared.tree).includes("chat")], [false, false, false], "a new conversation has no chat run and no way back");
  } finally {
    many.close();
  }

  // SCN-006 with chat-run navigation SCN-012: a main-loop turn keeps a waiting run's state, since the chat
  // asks for the approval during that turn (a working run shows the overlay further below); subagent
  // turns change nothing; completion re-reads.
  // Owner request of 2026-11-11: the pane names the shown run by its title, says whose move it is and
  // keeps the run id as a dim reference after everything a person reads.
  {
    const tree = await render(first), shown = texts(tree);
    const [name, yours, bar, id] = ["Fixture document", "Your turn", shown.find(text => /^[✓●○]/u.test(text)), "fixture-a"].map(text => shown.indexOf(text));
    assert.ok(name >= 0 && name < yours && yours < bar && bar < id, `title, whose move, gate bar, then the run id: ${JSON.stringify(shown)}`);
    assert.ok(shown.some(text => /^Approve .+ \(UR\)$/u.test(text)) && shown.some(text => text === "In the chat with “Approval: UR”"), "the approval and how it is given");
    assert.ok(!shown.some(text => text.startsWith("Approval pending")), "the turn block replaces the reason under the state");
    const idText = find(tree, node => node.tag === "Text" && texts(node)[0] === "fixture-a")[0];
    assert.deepEqual([idText.props.dimColor, idText.props.mono, idText.props.weight], [true, true, undefined], "the run id is a reference, not a heading");
    const terminal = texts(await render(first, "terminal")).join("\n").split("\n");
    assert.ok(terminal.indexOf("Fixture document · Compact Delivery · Step 1 of 2") >= 0 && terminal.some(line => line.startsWith("fixture-a · ")), `the terminal names the run and keeps the id: ${JSON.stringify(terminal)}`);
    const { fitRunName } = await freshModule();
    assert.deepEqual([fitRunName("Status card path marks only one current gate", 20), fitRunName("Short", 20)], ["Status card path ma…", "Short"]);
    // Owner request of 2026-11-12: the goal stays in sight between the run's name and whose move it is;
    // the gate's purpose and the repeated approval step sit behind the (i), which opens and closes them
    // on both surfaces.
    const purpose = "UR clarifies what you want, why and for whom — before anything gets built that nobody needed.";
    for (const surface of ["desktop", "terminal"]) {
      const closed = await render(first, surface), closedText = texts(closed).join("\n");
      assert.equal(button(closed, "info").props.label, "ⓘ Details", `${surface}: the (i) is offered`);
      assert.ok(!closedText.includes(purpose) && !closedText.includes("Review the linked artefact"), `${surface}: the details stay closed by default`);
      const at = text => closedText.indexOf(text);
      assert.ok(at("Fixture document") >= 0 && at("Fixture document") < at("Preserve one explicit intent.") && at("Preserve one explicit intent.") < at("Your turn"),
        `${surface}: name, goal, then whose move it is: ${closedText}`);
      await button(closed, "info").props.onPress();
      const opened = await render(first, surface), openedText = texts(opened).join("\n");
      assert.equal(button(opened, "info").props.label, "ⓘ Hide details");
      assert.ok(openedText.includes(purpose) && openedText.includes("Preserve one explicit intent.") && openedText.includes("Review the linked artefact"),
        `${surface}: the (i) shows the purpose and the repeated step: ${openedText}`);
      await button(opened, "info").props.onPress();
    }
  }
  await first.fire("turn.start", { agentId: "sub" });
  assert.ok(!texts(await render(first)).includes("Claude is working on this turn"));
  await first.fire("turn.start", {});
  assert.deepEqual([texts(await render(first)).includes("waiting for approval"), texts(await render(first)).includes("Claude is working on this turn")], [true, false], "a waiting run stays waiting during a turn");
  // CR-F10: turn.complete answers the host before the post-turn read has finished.
  const reads = first.log.invalidations;
  const realRun = first.$.process.run;
  let releaseList = null;
  first.$.process.run = (argv, init) => new Promise(resolve => { releaseList = () => resolve(realRun(argv, init)); });
  touch(target.root);
  assert.deepEqual(await first.fire("turn.complete", { done: 1 }), { passed: { done: 1 } });
  assert.equal(first.log.invalidations, reads, "the hook returned before its read finished");
  await waitFor(() => releaseList, "the post-turn read");
  first.$.process.run = realRun;
  releaseList();
  await waitFor(() => first.log.invalidations > reads, "the post-turn redraw");
  assert.ok(texts(await render(first)).includes("waiting for approval"));

  // CR-F05: switching off during a turn and on again leaves no stale "working" overlay.
  await first.fire("turn.start", {});
  assert.equal((await first.fire("command.run", { command: COMMAND })).text, "AGDF Companion switched off.");
  await first.fire("turn.complete", {});
  assert.equal((await first.fire("command.run", { command: COMMAND })).text, "AGDF Companion switched on.");
  assert.ok(!texts(await render(first)).includes("Claude is working on this turn"));
  assert.equal(first.liveTimers(), 2, "exactly one journal and one check timer after switching off and on");

  // CR-F07: of overlapping reads, an older one that finishes last never replaces the newer one.
  let releaseEmpty = null;
  first.$.process.run = () => new Promise(resolve => { releaseEmpty = () => resolve(emptyView(target.root)); });
  const slowRead = (await entry(first, "retry"))();
  await waitFor(() => releaseEmpty, "the slow read");
  first.$.process.run = realRun;
  await (await entry(first, "retry"))();
  releaseEmpty();
  await slowRead;
  assert.ok(texts(await render(first)).includes("waiting for approval"), "the newer read stays on screen");

  // AC-010: the still pose persists and removes all motion; the terminal draws text.
  await (await entry(first, "still"))();
  assert.equal(JSON.parse(readFileSync(statePath, "utf8")).still, true);
  const svg = find(await render(first), node => node.tag === "Svg")[0];
  assert.equal(/<animate|<set\b/u.test(svg.props.source), false);
  assert.equal(svg.props.isInteractive, false);
  const terminal = await render(first, "terminal");
  assert.equal(find(terminal, node => node.tag === "Svg").length, 0);
  // For an approval the next step sits behind the (i); the turn line says what to do (2026-11-12).
  assert.match(texts(terminal).join("\n"), /waiting for approval[\s\S]*Your turn: Approve [\s\S]*[✓●○]UR/u);

  // A change in this session takes over from the selection (most recent wins).
  assert.equal(target.approve().outcome, "accepted");
  await (await entry(first, "retry"))();
  tree = await render(first);
  assert.ok(texts(tree).includes("Changed in this session") && texts(tree).includes("working"));

  // Follow-up SCN-009, SCN-011, SCN-013, SCN-014: toasts and the status line follow the shown run's
  // run-derived state. Selecting the waiting run was a baseline and its approval to working raised
  // nothing; a review result that blocks it raises exactly one toast, repeated reads none.
  const lastStatus = () => first.log.status.at(-1);
  const reread = async host => (await entry(host, "retry"))();
  const review = decision => reportBlock(target.root, "fixture-a", decision);
  assert.equal(lastStatus(), "AGDF · Quick Task Execution · working");
  assert.deepEqual(first.log.toasts, [], "no toast for baselines, run switching or a working run");
  await (await entry(first, "still"))();
  await figureSource(first);
  review("revise");
  await reread(first);
  const warningFigure = await figureSource(first);
  assert.match(warningFigure, /data-gesture="\d+".*repeatCount="1"/su);
  await reread(first);
  assert.equal(await figureSource(first), warningFigure);
  await (await entry(first, "still"))();
  assert.deepEqual(first.log.toasts, ["Blocked: Quick Task Execution – revision needed"]);
  assert.equal(lastStatus(), "AGDF · Quick Task Execution · blocked");
  assert.deepEqual(first.log.audio, [], "the sound is off by default");
  // A main-loop turn preserves the canonical desktop figure. The terminal keeps its turn overlay.
  // Every applied read sets the status line again (live finding: the desktop dropped the one set
  // during session start), so the post-turn read repeats the same text.
  const statusCount = first.log.status.length;
  await first.fire("turn.start", {});
  assert.ok(texts(await render(first)).includes("blocked"));
  assert.ok(texts(await render(first, "terminal")).some(text => text.includes("Claude is working on this turn")));
  const beforeTurnRead = first.log.invalidations;
  touch(target.root);
  await first.fire("turn.complete", {});
  await waitFor(() => first.log.invalidations > beforeTurnRead, "the post-turn read");
  assert.equal(first.log.status.length, statusCount + 1, "the post-turn read sets the status line again");
  assert.deepEqual([first.log.status.at(-1), first.log.toasts.length], ["AGDF · Quick Task Execution · blocked", 1], "a turn changes neither the status text nor toasts");
  // CR-F04: the overlay checks on a blocked run, which the overlay covers: a subagent turn shows none, and
  // switching off during a main-loop turn and on again leaves no stale overlay.
  await first.fire("turn.start", { agentId: "sub" });
  assert.ok(!texts(await render(first)).includes("Claude is working on this turn"), "a subagent turn shows no overlay");
  await first.fire("turn.start", {});
  assert.ok(texts(await render(first)).includes("blocked"));
  assert.ok(texts(await render(first, "terminal")).some(text => text.includes("Claude is working on this turn")));
  assert.equal((await first.fire("command.run", { command: COMMAND })).text, "AGDF Companion switched off.");
  await first.fire("turn.complete", {});
  assert.equal((await first.fire("command.run", { command: COMMAND })).text, "AGDF Companion switched on.");
  assert.ok(!texts(await render(first)).includes("Claude is working on this turn"), "no stale overlay after switching off and on");
  // With the sound switched on, the next transition also plays the generated chime once.
  await (await entry(first, "sound"))();
  assert.equal(JSON.parse(readFileSync(statePath, "utf8")).sound, true);
  review("block");
  await reread(first);
  assert.equal(first.log.toasts.at(-1), "Blocked: Quick Task Execution – blocked");
  assert.deepEqual(first.log.audio.map(({ clip, options }) => [clip.mime, options.gain, clip.base64.slice(0, 5)]), [["audio/wav", 0.35, "UklGR"]]);
  // With toasts switched off, a transition raises neither toast nor sound; the choice persists.
  await (await entry(first, "notice"))();
  assert.equal(JSON.parse(readFileSync(statePath, "utf8")).notice, false);
  assert.equal(await entryLabel(first, "notice"), "Notices on");
  review("revise");
  await reread(first);
  assert.deepEqual([first.log.toasts.length, first.log.audio.length], [2, 1], "no toast and no sound while toasts are off");
  assert.equal(lastStatus(), "AGDF · Quick Task Execution · blocked", "the status line still follows the run");
  await (await entry(first, "notice"))();
  await (await entry(first, "sound"))();
  assert.deepEqual([JSON.parse(readFileSync(statePath, "utf8")).notice, JSON.parse(readFileSync(statePath, "utf8")).sound], [true, false]);

  // SDD-07 / CR-F01, follow-up SDD-08: the person's close mark (the host's `origin: { kind: "person" }`)
  // hides the pane for this session but keeps reading, so the status line and toasts stay current; a
  // close by the plugin itself does not hide it.
  await first.fire("ui.close", { id: PANE, origin: { kind: "plugin" } });
  assert.equal(first.liveTimers(), 2, "a plugin close leaves the refresh running");
  await first.fire("ui.close", { id: PANE, origin: { kind: "person" } });
  assert.equal(first.liveTimers(), 2, "the person's close keeps the refresh running");
  await first.fire("turn.start", {});
  assert.ok(!texts(await render(first)).includes("Claude is working on this turn"), "no turn overlay is tracked for a hidden pane");
  review("block");
  touch(target.root);
  const beforeHiddenRead = first.log.invalidations;
  await first.fire("turn.complete", {});
  await waitFor(() => first.log.invalidations > beforeHiddenRead, "the post-turn read with the pane hidden");
  assert.equal(first.log.toasts.at(-1), "Blocked: Quick Task Execution – blocked", "a hidden pane still raises toasts");
  assert.equal(first.log.toasts.length, 3);
  // CR-F06: the command brings a hidden pane back without changing the stored choice.
  const opensBefore = first.log.opened.length;
  assert.equal((await first.fire("command.run", { command: COMMAND })).text, "AGDF Companion switched on.");
  assert.equal(JSON.parse(readFileSync(statePath, "utf8")).enabled, true, "showing a hidden pane keeps the stored choice");
  assert.equal(first.log.opened.length, opensBefore + 1);
  assert.equal(first.liveTimers(), 2);
  // CR-F07: overlapping starts (closed and reopened during a slow read) leave exactly one timer.
  const pending = [];
  first.$.process.run = (argv, init) => new Promise(resolve => { pending.push(() => resolve(realRun(argv, init))); });
  await first.fire("ui.close", { id: PANE, origin: { kind: "person" } });
  const reopenA = first.fire("command.run", { command: COMMAND });
  await waitFor(() => pending.length === 1, "the first reopen's read");
  await first.fire("ui.close", { id: PANE, origin: { kind: "person" } });
  const reopenB = first.fire("command.run", { command: COMMAND });
  await waitFor(() => pending.length === 2, "the second reopen's read");
  first.$.process.run = realRun;
  pending.forEach(release => release());
  await Promise.all([reopenA, reopenB]);
  assert.equal(first.liveTimers(), 2, "overlapping starts leave one timer of each kind");
  const off = await first.fire("command.run", { command: COMMAND });
  assert.equal(off.text, "AGDF Companion switched off.");
  assert.equal(JSON.parse(readFileSync(statePath, "utf8")).enabled, false);
  assert.deepEqual(first.log.closed.at(-1), { id: PANE });
  assert.equal(first.log.status.at(-1), undefined, "switching off clears the status line");
  assert.equal(first.liveTimers(), 0, "switching off stops reading");
  await first.fire("command.run", { command: COMMAND });

  // A new session keeps the choice and the remembered selection.
  const second = await session();
  await second.fire("session.start");
  assert.equal(second.log.opened.length, 1, "the enabled choice reopens the pane");
  assert.ok(texts(await render(second)).includes("fixture-a"));

  // CR-F04: a session writes only its own change into the freshly read file, so a choice another
  // session stored meanwhile survives.
  const stillBefore = JSON.parse(readFileSync(statePath, "utf8")).still;
  await (await entry(first, "still"))();
  assert.equal(JSON.parse(readFileSync(statePath, "utf8")).still, !stillBefore);
  await second.fire("command.run", { command: COMMAND });
  const stored = JSON.parse(readFileSync(statePath, "utf8"));
  assert.deepEqual([stored.enabled, stored.still, stored.selections[target.root]], [false, !stillBefore, "fixture-a"],
    "the second session's switch-off keeps the first session's still pose and the selection");
  await second.fire("command.run", { command: COMMAND });

  // CR-F09: a snapshot without any runs (a missing runs folder) never drops the selection.
  const secondRun = second.$.process.run;
  second.$.process.run = async () => emptyView(target.root);
  await (await entry(second, "retry"))();
  assert.equal(JSON.parse(readFileSync(statePath, "utf8")).selections[target.root], "fixture-a");
  second.$.process.run = secondRun;

  // CR-F08: the panel follows a project-root change (`/cd`, worktree move) at the next read.
  // The other project has a valid control folder without runs; a runs folder without config.json is
  // no AGDF control for the run view and reads as unreadable.
  const otherCleanup = [];
  const otherProject = currentFixture({ after(fn) { otherCleanup.push(fn); } }).root;
  second.where.root = otherProject;
  second.$.process.run = async () => ({ exitCode: 1, stdout: "" });
  await (await entry(second, "retry"))();
  assert.ok(!texts(await render(second)).includes("fixture-a"), "a failed project switch cannot show the previous Run");
  assert.doesNotMatch(await figureSource(second), /<animate/u);
  assert.ok(!(await figureSource(second)).includes('d="M74 63q7 6 14 0"'), "a failed read does not smile");
  second.$.process.run = secondRun;
  await (await entry(second, "retry"))();
  assert.ok(texts(await render(second)).includes("Starting grid empty."), "a project without runs shows the empty starting grid");
  // A readable project without an assigned run idles: the figure smiles, blinks unless the still pose is
  // chosen, and never gestures.
  const smile = 'd="M74 63q7 6 14 0"';
  const stillIdle = await figureSource(second);
  assert.doesNotMatch(stillIdle, /<animate/u, "this session chose the still pose");
  assert.ok(stillIdle.includes(smile), "the still pose keeps the smile");
  await (await entry(second, "still"))();
  const idleFigure = await figureSource(second);
  assert.match(idleFigure, /attributeName="ry"/u, "without an assigned run the figure blinks");
  assert.ok(idleFigure.includes(smile), "without an assigned run the figure smiles");
  assert.doesNotMatch(idleFigure, /data-gesture=/u, "without an assigned run the figure never gestures");
  await (await entry(second, "still"))();
  assert.doesNotMatch(await figureSource(second), /<animate/u);
  second.where.root = target.root;
  await (await entry(second, "retry"))();
  assert.ok(texts(await render(second)).includes("fixture-a"));
  for (const fn of otherCleanup.reverse()) fn();

  // TPR-F01: a remembered run that is superseded later is closed, so the next read drops the
  // selection and no longer offers it. The runs predate the session, so none counts as changed in it.
  const closing = fixture();
  try {
    const closingHost = await session();
    await closingHost.fire("session.start");
    closingHost.where.root = closing.root;
    await (await entry(closingHost, "retry"))();
    await buttons(await render(closingHost)).find(button => button.props.key === "run-fixture-a").props.onPress();
    assert.equal(JSON.parse(readFileSync(statePath, "utf8")).selections[closing.root], "fixture-a");
    const runPath = join(closing.root, ".agdf", "control", "runs", "fixture-a", "RUN_STATE.md");
    writeFileSync(runPath, sealRunState(closing.root, replaceFirstScalar(readFileSync(runPath, "utf8"), "lifecycle", "superseded")));
    await (await entry(closingHost, "retry"))();
    assert.equal(JSON.parse(readFileSync(statePath, "utf8")).selections[closing.root], undefined, "a selection on a superseded run is dropped");
    tree = await render(closingHost);
    assert.ok(texts(tree).includes("No open runs in this project."));
    assert.deepEqual(buttons(tree).filter(button => button.props.key.startsWith("run-")), []);
    assert.doesNotMatch(find(tree, node => node.tag === "Svg")[0].props.source, /overview-tablet/u, "a superseded run did not finish, so no tablet");
    writeFileSync(runPath, sealRunState(closing.root, replaceFirstScalar(readFileSync(runPath, "utf8"), "lifecycle", "completed")));
    await (await entry(closingHost, "retry"))();
    tree = await render(closingHost);
    assert.ok(texts(tree).includes("All runs across the line. 🏁"));
    assert.match(find(tree, node => node.tag === "Svg")[0].props.source, /data-accessory="overview-tablet"/u, "every run done shows the tablet");
  } finally {
    closing.close();
  }

  // SCN-010: a transient read failure keeps the last state with a marker; retry restores it.
  // Companion core SCN-022: a process failure, a timeout, a failing exit code and malformed output keep
  // the last view with the marker.
  for (const failure of [async () => { throw new Error("spawn node ENOENT"); }, async () => { throw new Error("process timed out after 10000 ms"); },
    async () => ({ exitCode: 1, stdout: "", stderr: "usage" }), async () => ({ exitCode: 0, stdout: "{", stderr: "" })]) {
    second.$.process.run = failure;
    await (await entry(second, "retry"))();
    tree = await render(second);
    assert.ok(texts(tree).some(line => line.startsWith("Read failed at")) && texts(tree).includes("fixture-a"), String(failure));
  }
  second.$.process.run = secondRun;
  await (await entry(second, "retry"))();
  assert.ok(!texts(await render(second)).some(line => line.startsWith("Read failed at")));

  // SCN-014: failure injection. A failing session start passes its event on and registers nothing;
  // a failing render draws one neutral line; a failing command answers with text.
  const broken = await session({ failRoot: true });
  assert.deepEqual(await broken.fire("session.start", { marker: 1 }), { passed: { marker: 1 } });
  assert.equal(broken.log.commands.length, 0);
  const renderFailure = await render(broken);
  assert.equal(renderFailure.tag, "Text");
  assert.match(texts(renderFailure)[0], /^AGDF Companion: /u);
  broken.$.ui.open = async () => { throw new Error("no surface"); };
  assert.match((await broken.fire("command.run", { command: COMMAND })).text, /^agdf-companion: /u);
  assert.deepEqual(await broken.hooks.find(item => item.event === "command.run").catch(), { text: "agdf-companion: unavailable" });

  // CR-F03: an invalid or foreign state file reads as fresh defaults that still accept a selection.
  writeFileSync(statePath, "{ not json");
  const recovered = await session();
  await recovered.fire("session.start");
  await recovered.fire("command.run", { command: COMMAND });
  await buttons(await render(recovered)).find(button => button.props.key === "run-fixture-a").props.onPress();
  assert.equal(JSON.parse(readFileSync(statePath, "utf8")).selections[target.root], "fixture-a", "a selection after an invalid state file is stored");

  // Follow-up SCN-023: throwing toast and status channels, a missing audio channel and a rejecting
  // settings read stay silent; the pane, reading, switches and the event chain keep working.
  const silent = await session({ failChannels: true });
  assert.deepEqual(await silent.fire("session.start", { marker: 2 }), { passed: { marker: 2 } });
  assert.equal(silent.log.opened.length, 1, "the enabled companion opens its pane despite failing channels");
  await (await entry(silent, "sound"))();
  review("revise");
  await reread(silent);
  assert.ok(texts(await render(silent)).includes("fixture-a"), "the pane still draws the run");
  assert.deepEqual(await silent.fire("turn.complete", { marker: 3 }), { passed: { marker: 3 } });
  assert.equal((await silent.fire("command.run", { command: COMMAND })).text, "AGDF Companion switched off.");
  assert.equal((await silent.fire("command.run", { command: COMMAND })).text, "AGDF Companion switched on.");
  await (await entry(silent, "sound"))();

  // Follow-up SCN-021 (adapter part): without AGDF control the companion speaks the language of
  // Claude's `language` setting; with a config the AGDF chat language wins; a failing read is English.
  const plain = mkdtempSync(join(tmpdir(), "agdf-companion-plain-"));
  try {
    const languageOf = async (projectRoot, settings, failChannels = false) => {
      const host = await session({ projectRoot, settings, failChannels });
      await host.fire("session.start");
      await reread(host);
      return texts(await render(host));
    };
    assert.ok((await languageOf(plain, { language: "Deutsch" })).some(line => line.startsWith("Kein AGDF-Kontrollordner")), "German from the setting");
    assert.ok((await languageOf(plain, { language: "de" })).some(line => line.startsWith("Kein AGDF-Kontrollordner")), "German from the tag");
    assert.ok((await languageOf(plain, {})).some(line => line.startsWith("No AGDF control folder")), "English without a setting");
    assert.ok((await languageOf(plain, { language: "Deutsch" }, true)).some(line => line.startsWith("No AGDF control folder")), "English when the read fails");
    // CR-F05: an English label of the shown run proves that the config (en) wins over the setting (de).
    const configured = await languageOf(target.root, { language: "de" });
    assert.ok(configured.includes("fixture-a") && configured.includes("Next step") && !configured.includes("Nächster Schritt"),
      "the AGDF config (en) wins over the setting");
  } finally {
    rmSync(plain, { recursive: true, force: true });
  }

  // CR-F01, CR-F02, CR-F03 on a run of their own: a chime never plays without a shown toast; a read
  // still running when the companion is switched off is discarded, so switching on stays a fresh
  // baseline; a failing state-file write while switching off still stops reading, clears the status
  // line and closes the pane.
  const race = await approvalFixture();
  try {
    const raceConfig = join(race.root, ".agdf", "control", "config.json");
    writeFileSync(raceConfig, `${JSON.stringify({ ...JSON.parse(readFileSync(raceConfig, "utf8")), chat_language: "en" }, null, 2)}\n`);
    const raceReview = decision => reportBlock(race.root, "fixture-a", decision);
    const host = await session({ projectRoot: race.root, failToast: true });
    await host.fire("session.start");
    if (!JSON.parse(readFileSync(statePath, "utf8")).enabled) await host.fire("command.run", { command: COMMAND });
    await buttons(await render(host)).find(button => button.props.key === "run-fixture-a").props.onPress();
    if (await entryLabel(host, "sound") === "Sound on") {
      await (await entry(host, "sound"))();
    }
    assert.equal(JSON.parse(readFileSync(statePath, "utf8")).sound, true, "the sound is on for the toast-failure check");
    assert.equal(race.approve().outcome, "accepted");
    await reread(host);
    raceReview("revise");
    await reread(host);
    assert.deepEqual([host.log.toasts.length, host.log.audio.length], [0, 0], "no chime when the toast could not be shown");
    await (await entry(host, "sound"))();

    // A read that captured the run state before the switch-off finishes after the switch-on.
    const toastsBefore = first.log.toasts.length;
    const raceHost = await session({ projectRoot: race.root });
    await raceHost.fire("session.start");
    await reread(raceHost);
    const realRaceRun = raceHost.$.process.run;
    // Run views are held with the content they captured. The read started before the switch-off
    // finishes first, the read of the switch-on second.
    const held = [];
    raceHost.$.process.run = async (argv, init) => {
      const captured = await realRaceRun(argv, init);
      return new Promise(resolve => { held.push(() => resolve(captured)); });
    };
    const oldRead = reread(raceHost);
    await waitFor(() => held.length === 1, "the held read");
    raceReview("block");
    assert.equal((await raceHost.fire("command.run", { command: COMMAND })).text, "AGDF Companion switched off.");
    const switchOn = raceHost.fire("command.run", { command: COMMAND });
    await waitFor(() => held.length === 2, "the switch-on read");
    held[0]();
    await oldRead;
    held[1]();
    assert.equal((await switchOn).text, "AGDF Companion switched on.");
    raceHost.$.process.run = realRaceRun;
    await reread(raceHost);
    assert.deepEqual(raceHost.log.toasts, [], "switching on stays a fresh baseline although an older read finished later");
    assert.equal(first.log.toasts.length, toastsBefore);

    // Switching off with a failing state-file write.
    const realWrite = raceHost.$.fs.write;
    raceHost.$.fs.write = async () => { throw new Error("read-only"); };
    const closedBefore = raceHost.log.closed.length;
    assert.match((await raceHost.fire("command.run", { command: COMMAND })).text, /read-only/u);
    assert.deepEqual([raceHost.log.status.at(-1), raceHost.liveTimers(), raceHost.log.closed.length], [undefined, 0, closedBefore + 1],
      "a failing write still clears the status line, stops reading and closes the pane");
    raceHost.$.fs.write = realWrite;
    await raceHost.fire("command.run", { command: COMMAND });
    assert.equal(JSON.parse(readFileSync(statePath, "utf8")).enabled, true);
  } finally {
    race.close();
  }

  // Companion core SCN-011 (SDD-007, decision P1): the journal is read every 2 seconds. A new line of
  // this project root reads the run view once and raises its toast within that tick; lines of other
  // roots and malformed lines are skipped; without a changed fingerprint, event or language no run-view
  // call happens. SCN-014: a drift warning of the run view raises one toast and stays in the pane.
  const evented = await approvalFixture();
  try {
    const eventConfig = join(evented.root, ".agdf", "control", "config.json");
    const englishText = `${JSON.stringify({ ...JSON.parse(readFileSync(eventConfig, "utf8")), chat_language: "en" }, null, 2)}\n`;
    writeFileSync(eventConfig, englishText);
    const host = await session({ projectRoot: evented.root });
    await host.fire("session.start");
    if (!JSON.parse(readFileSync(statePath, "utf8")).enabled) await host.fire("command.run", { command: COMMAND });
    const calls = () => host.log.processes.length;
    const settleLong = async () => { for (let turn = 0; turn < 400; turn += 1) await new Promise(resolve => setImmediate(resolve)); };
    const tick = async ms => { for (const timer of host.log.timers.filter(item => !item.cancelled && item.ms === ms)) timer.fn(); await settleLong(); };
    const line = fields => JSON.stringify({ schema_version: "companion-event/1", id: randomUUID(), at: new Date(Date.now() + 60_000).toISOString(),
      root: evented.root, run_id: "fixture-a", gate: "UR", kind: "approval_requested", outcome: "accepted", reason: null,
      operation_id: randomUUID(), review: null, ...fields });
    const append = (...lines) => appendFileSync(journal, lines.map(value => `${value}\n`).join(""));
    const shown = async () => texts(await render(host, "desktop", { bodyColumns: 80 }));

    let before = calls();
    await tick(EVENT_POLL_MS);
    await tick(REFRESH_MS);
    assert.equal(calls(), before, "quiet ticks call no run view");
    append(line({ root: join(tmpdir(), "another-project") }), "{not json", "{\"schema_version\":\"companion-event/1\",\"kind\":\"approval_requ");
    const toastsBefore = host.log.toasts.length;
    await tick(EVENT_POLL_MS);
    assert.deepEqual([calls(), host.log.toasts.length], [before, toastsBefore], "other roots and malformed lines change nothing");
    // The same root in another spelling: separators and, for a drive path, case.
    const spelled = /^[a-z]:\\/iu.test(evented.root) ? evented.root.replaceAll("\\", "/").toUpperCase() : `${evented.root}/`;
    append(line({ root: spelled }));
    await tick(EVENT_POLL_MS);
    assert.equal(calls(), before + 1, "a new event reads the run view once");
    // No run is shown yet, so each event names its run by its title after the text (owner requests
    // of 2026-11-06, T-013, and 2026-11-11).
    assert.match(host.log.toasts.at(-1), /^Approval requested for \S.* · Fixture document$/u, "approval requested is a toast");
    assert.equal(host.log.toasts.length, toastsBefore + 1, "the run's own state toast is not repeated beside its event");
    assert.ok((await shown()).some(text => /^\d{2}:\d{2} Approval requested for .* · Fixture document$/u.test(text)), "the pane lists the event with its time");

    // Approval recorded and write rejected stay in the pane; effect unknown is a toast; run completed
    // waits for the run view to confirm it.
    const quiet = host.log.toasts.length;
    append(line({ kind: "approval_recorded" }), line({ kind: "write_rejected", outcome: "rejected", reason: "stale_revision" }));
    await tick(EVENT_POLL_MS);
    assert.equal(host.log.toasts.length, quiet, "pane-only kinds raise no toast");
    assert.ok((await shown()).some(text => text.endsWith("Call rejected (stale_revision) · Fixture document")));
    append(line({ kind: "effect_unknown", outcome: "effect_unknown", reason: "dispatch_timeout", gate: "EVIDENCE" }));
    await tick(EVENT_POLL_MS);
    assert.equal(host.log.toasts.at(-1), "Effect unknown – check the operation status · Fixture document");
    const completedBefore = host.log.toasts.length;
    append(line({ kind: "run_completed", gate: "OR" }));
    await tick(EVENT_POLL_MS);
    assert.equal(host.log.toasts.length, completedBefore, "an unconfirmed completion is no toast");

    // AC-007: the review facts of the newest staging show size, digest, source match and the preview.
    append(line({ kind: "material_staged", gate: "UR", review: [{ slot: "UR", source: "staged", path: null, digest: `sha256:${"a".repeat(64)}`,
      bytes: 14, preview: "# UR\nCorrupt 4Z", truncated: false, source_match: "not_determinable" }] }));
    await tick(EVENT_POLL_MS);
    let lines = await shown();
    assert.ok(lines.includes("UR: 14 bytes, sha256:aaaaaaaa… · source not determinable – please check the preview"), JSON.stringify(lines));
    assert.ok(lines.includes("# UR"), "the first preview line is shown");
    await button(await render(host), "preview").props.onPress();
    assert.ok((await shown()).includes("# UR\nCorrupt 4Z"), "the expanded preview shows the bounded text");
    // A main-loop turn clears the pane entries; an uncertain outcome stays until its run recorded a later
    // operation (CR finding B7; this one is dated after every run activity).
    await host.fire("turn.start", { text: "next" });
    lines = await shown();
    assert.ok(!lines.some(text => /^\d{2}:\d{2} (Approval requested|Call rejected|Material staged)/u.test(text)), "the next main-loop turn clears the event entries");
    assert.ok(lines.some(text => text.endsWith("Effect unknown – check the operation status · Fixture document")), "an uncertain outcome stays past the turn");
    await host.fire("turn.complete", {});
    await settleLong();

    // Review finding 2: the run view compares bound evidence reports too, so a changed file in the
    // run's evidence folder reads it again.
    const evidenceDir = join(evented.root, ".agdf", "control", "runs", "fixture-a", "evidence");
    mkdirSync(evidenceDir, { recursive: true });
    writeFileSync(join(evidenceDir, "EVIDENCE-review-finding-2.md"), "# Evidence\n");
    await tick(REFRESH_MS);
    const evidenceCalls = calls();
    await tick(REFRESH_MS);
    assert.equal(calls(), evidenceCalls, "an unchanged evidence folder reads nothing");
    writeFileSync(join(evidenceDir, "EVIDENCE-review-finding-2.md"), "# Evidence\n\nchanged after recording\n");
    await tick(REFRESH_MS);
    assert.equal(calls(), evidenceCalls + 1, "a changed evidence report reads the run view");
    // The 30-second check reads the run view only on a changed fingerprint or language.
    before = calls();
    await tick(REFRESH_MS);
    assert.equal(calls(), before, "no change, no call");
    touch(evented.root);
    await tick(REFRESH_MS);
    assert.equal(calls(), before + 1, "a changed run file reads the run view");
    writeFileSync(eventConfig, englishText.replace("\"chat_language\": \"en\"", "\"chat_language\": \"de\""));
    await tick(REFRESH_MS);
    const languageCall = host.log.processes.at(-1);
    assert.deepEqual([calls(), languageCall[languageCall.indexOf("--language") + 1]], [before + 2, "de"], "a changed language reads the run view in that language");
    writeFileSync(eventConfig, englishText);
    await tick(REFRESH_MS);

    // SCN-014 (adapter part): a drift warning of the run view raises one toast and stays in the pane of
    // the shown run.
    await buttons(await render(host)).find(item => item.props.key === "run-fixture-a").props.onPress();
    const driftToasts = host.log.toasts.length;
    report(evented.root, "fixture-a", { drift: [{ document: "PRD", path: ".agdf/control/runs/fixture-a/documents/PRD.md",
      recorded_digest: `sha256:${"1".repeat(64)}`, current_digest: `sha256:${"2".repeat(64)}` }] });
    await (await entry(host, "retry"))();
    assert.equal(host.log.toasts.at(-1), "PRD changed after recording", "the shown run's drift toast names no run");
    assert.ok((await shown()).some(text => text.startsWith("PRD changed after recording (recorded sha256:11111111…, now sha256:22222222…).")));
    await (await entry(host, "retry"))();
    assert.equal(host.log.toasts.length, driftToasts + 1, "a known drift is announced once");
    reported.delete(`${evented.root}|fixture-a`);

    // CR finding B4: an approval recorded for a gate the run view does not show fulfilled is not shown;
    // one for a fulfilled gate is. B7: an uncertain outcome older than the run's last activity leaves at
    // the next read. B8: "read again" also reads the journal.
    assert.equal(evented.approve().outcome, "accepted");
    const fulfilled = readRunView(evented.root, { language: "en", runIds: ["fixture-a"] }).runs.find(item => item.run_id === "fixture-a").path.find(step => step.status === "fulfilled")?.gate;
    assert.equal(fulfilled, "UR", "the approved UR is fulfilled on the path");
    append(line({ kind: "approval_recorded", gate: "QA" }), line({ kind: "approval_recorded", gate: fulfilled }),
      line({ kind: "effect_unknown", outcome: "effect_unknown", reason: "dispatch_timeout", gate: "EVIDENCE", at: "2000-01-01T00:00:00.000Z" }));
    await tick(EVENT_POLL_MS);
    lines = await shown();
    assert.equal(lines.filter(text => /^\d{2}:\d{2} Approval recorded for /u.test(text)).length, 1, `only the confirmed approval is shown: ${JSON.stringify(lines)}`);
    assert.equal(lines.filter(text => /^\d{2}:\d{2} Effect unknown – check the operation status$/u.test(text)).length, 2, "the shown run's events name no run");
    await (await entry(host, "retry"))();
    assert.equal((await shown()).filter(text => /^\d{2}:\d{2} Effect unknown – check the operation status$/u.test(text)).length, 1,
      "an uncertain outcome before the run's last activity leaves; the later one stays");
    const retryToasts = host.log.toasts.length;
    append(line({}));
    await (await entry(host, "retry"))();
    assert.equal(host.log.toasts.length, retryToasts + 1, "read again reads the journal too");

    // CR finding B6: lines written before a rotation that the last read had not seen are still read.
    const rotatedJournal = join(dirname(journal), "events.1.jsonl");
    const rotationToasts = host.log.toasts.length;
    append(line({}));
    renameSync(journal, rotatedJournal);
    writeFileSync(journal, `${line({})}\n`);
    await tick(EVENT_POLL_MS);
    assert.equal(host.log.toasts.length, rotationToasts + 2, "both the rotated and the current line are announced");
    rmSync(rotatedJournal);

    // CR finding B1: a failed run-view read keeps no fingerprint, so the next check reads again.
    const realRun = host.$.process.run;
    host.$.process.run = async argv => { host.log.processes.push(argv); throw new Error("timed out"); };
    touch(evented.root);
    before = calls();
    await tick(REFRESH_MS);
    assert.equal(calls(), before + 1, "the changed run file is read and the read fails");
    host.$.process.run = realRun;
    await tick(REFRESH_MS);
    assert.equal(calls(), before + 2, "the next check reads again although nothing changed");
    await tick(REFRESH_MS);
    assert.equal(calls(), before + 2, "after a good read the check is quiet again");

    // CR delta review RV-1: a durable event that arrives while the run view cannot be read waits for a
    // fresh view instead of being dropped, and is shown once that view confirms it.
    await host.fire("turn.start", { text: "next" });
    await host.fire("turn.complete", {});
    await settleLong();
    const approvedShown = async () => (await shown()).filter(text => /^\d{2}:\d{2} Approval recorded for /u.test(text)).length;
    assert.equal(await approvedShown(), 0, "the main-loop turn cleared the pane");
    host.$.process.run = async argv => { host.log.processes.push(argv); throw new Error("spawn node ENOENT"); };
    append(line({ kind: "approval_recorded", gate: fulfilled }));
    await tick(EVENT_POLL_MS);
    assert.equal(await approvedShown(), 0, "not shown while the run view cannot confirm it");
    host.$.process.run = realRun;
    await tick(REFRESH_MS);
    await tick(EVENT_POLL_MS);
    assert.equal(await approvedShown(), 1, "shown once a fresh run view confirms it");
    await tick(EVENT_POLL_MS);
    assert.equal(await approvedShown(), 1, "shown only once");

    // CR finding B2: a new conversation is noticed at the next check, which drops the chat's run.
    await host.fire("turn.complete", { answer: "Continuing with fixture-a." });
    await settleLong();
    const origin = async () => texts(await render(host, "desktop", { bodyColumns: 80 })).includes("Named in the chat");
    assert.equal(await origin(), true, "the answer named the chat's run");
    host.where.conversation = "conversation-2";
    await tick(REFRESH_MS);
    assert.equal(await origin(), false, "a new conversation starts without a chat run");

    // CR finding B3: after a root change the journal is filtered by the new root, and the old root's
    // pane entries leave.
    const elsewhere = mkdtempSync(join(tmpdir(), "agdf-companion-elsewhere-"));
    host.where.root = elsewhere;
    const movedToasts = host.log.toasts.length;
    append(line({ root: elsewhere, run_id: "elsewhere-run" }));
    await tick(EVENT_POLL_MS);
    assert.match(host.log.toasts.at(-1) ?? "", /^Approval requested for .* · elsewhere-run$/u, "the new root's event is announced");
    assert.equal(host.log.toasts.length, movedToasts + 1);
    assert.ok(!(await shown()).some(text => /^\d{2}:\d{2} .*(fixture-a|Fixture document)$/u.test(text)), "the old root's entries leave the pane");
    host.where.root = evented.root;
    await tick(EVENT_POLL_MS);
    await tick(REFRESH_MS);
    rmSync(elsewhere, { recursive: true, force: true });

    // A missing journal shows "events unavailable"; the run state is still read.
    renameSync(journal, `${journal}.away`);
    await tick(EVENT_POLL_MS);
    assert.ok((await shown()).includes("Events unavailable; the run state is still read."));
    renameSync(`${journal}.away`, journal);
    await tick(EVENT_POLL_MS);
    assert.ok(!(await shown()).includes("Events unavailable; the run state is still read."));
    await host.fire("command.run", { command: COMMAND });
    await host.fire("command.run", { command: COMMAND });
  } finally {
    evented.close();
  }

  // CR finding B5: session start passes on before the run-view process returns; the read lands later.
  {
    const enabler = await session();
    await enabler.fire("session.start");
    if (!JSON.parse(readFileSync(statePath, "utf8")).enabled) await enabler.fire("command.run", { command: COMMAND });
    const slow = await session();
    const realRun = slow.$.process.run;
    let release = null;
    slow.$.process.run = (argv, init) => new Promise(resolve => { release = () => resolve(realRun(argv, init)); });
    const passed = slow.log.passed;
    await slow.hooks.find(item => item.event === "session.start").hook(slow.$, {}, async e => { slow.log.passed++; return e; });
    assert.equal(slow.log.passed, passed + 1, "session start passed on");
    await waitFor(() => typeof release === "function", "the background run-view call");
    assert.equal(slow.log.processes.length, 0, "the run-view process has not returned yet");
    release();
    await waitFor(() => slow.log.processes.length === 1, "the background read lands");
  }

  // SDD-07: without the plugin data directory the choices last for the session only.
  const noData = mkdtempSync(join(tmpdir(), "agdf-companion-nodata-"));
  const sessionOnly = fakeHost({ projectRoot: target.root, configDir: noData });
  sessionOnly.attach(await freshModule());
  await sessionOnly.fire("session.start");
  assert.equal((await sessionOnly.fire("command.run", { command: COMMAND })).text, "AGDF Companion switched on.");
  assert.deepEqual([sessionOnly.log.writes.length, existsSync(join(noData, "plugins"))], [0, false]);
  rmSync(noData, { recursive: true, force: true });

  // AC-007: the companion wrote only its state file; run states it read are byte-identical, apart
  // from the one canonical approval this test performed itself.
  const writes = hosts.flatMap(host => host.log.writes);
  const commands = hosts.flatMap(host => host.log.processes);
  assert.ok(commands.length > 0 && commands.every(argv => argv[2] === "run-view" && !argv.includes("--write")), "every process call is the read-only run view");
  assert.ok(writes.length > 0 && writes.every(path => path === statePath), JSON.stringify([...new Set(writes)]));
  assert.ok(!writes.some(path => path.includes(".agdf")), "nothing written under .agdf/control");
  const controlAfterApproval = controlDigest(target.root);
  assert.notEqual(controlBefore, controlAfterApproval, "the test's own canonical approval changed the run");
  const third = await session();
  await third.fire("session.start");
  await render(third);
  await (await entry(third, "retry"))();
  assert.equal(controlDigest(target.root), controlAfterApproval, "companion reads leave the control state byte-identical");
} finally {
  target.close();
  rmSync(configRoot, { recursive: true, force: true });
}

console.log("Claude companion adapter tests passed");
