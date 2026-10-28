import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { approvalFixture, fixture } from "../../core/test/control-cockpit-fixtures.js";
import { replaceFirstScalar } from "../../core/lib/control-state/run-state-edits.js";
import { sealRunState } from "../../core/lib/control-state/run-seal.js";
import { recordRunStep } from "../../core/lib/control-state/run-steps.js";
import { policyForRunContent } from "../../core/lib/control-evaluation/run-step-policy.js";

// The Claude companion host adapter against a fake host (T-006; SCN-001, SCN-006, SCN-010, SCN-011,
// SCN-014): command toggling and persistence, turn observation, refresh and stale marking, the pane per
// surface, catch paths, failure injection, and no write outside the companion state file.
const repoRoot = fileURLToPath(new URL("../../..", import.meta.url));
const companionDir = join(repoRoot, "plugins", "agdf", "host-templates", "claude", "companion");
const pluginRoot = "PLUGIN_ROOT";
// The host's JSX factory is a global of the mod environment.
globalThis.h = (tag, props, ...children) => ({ tag, props: props ?? {}, children: children.flat(Infinity).filter(child => child !== null && child !== undefined && child !== false) });
let instance = 0;
// The host loads the module once per session; a query string gives each fake session its own instance.
const freshModule = () => import(`${pathToFileURL(join(companionDir, "register.mjs")).href}?session=${++instance}`);
const { COMMAND, PANE, REFRESH_MS } = await freshModule();
const hostPath = path => (path.startsWith(`${pluginRoot}/companion/`) ? join(companionDir, path.slice(pluginRoot.length + 11))
  : path.startsWith(`${pluginRoot}/meta/`) ? join(repoRoot, "plugins", "agdf", "meta", path.slice(pluginRoot.length + 6))
    : path === `${pluginRoot}/.claude-plugin/plugin.json` ? join(repoRoot, "plugins", "agdf", ".claude-plugin", "plugin.json")
      : path === `${pluginRoot}/assets/agdf-icon.svg` ? join(repoRoot, "plugins", "agdf", "assets", "agdf-icon.svg") : path);
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
  const log = { writes: [], opened: [], closed: [], commands: [], invalidations: 0, timers: [], passed: 0, toasts: [], status: [], audio: [] };
  const where = { root: projectRoot, conversation: "conversation-1" };
  const fail = () => { throw new Error("channel unavailable"); };
  const $ = {
    plugin: { name: "agdf", root: pluginRoot },
    clock: { now: async () => Date.now(), every: (ms, fn) => { const timer = { ms, fn, cancelled: false, cancel() { this.cancelled = true; } }; log.timers.push(timer); return timer; } },
    session: { root: async () => { if (failRoot) throw new Error("root unavailable"); return where.root; }, id: async () => where.conversation },
    env: { get: async name => ({ CLAUDE_CONFIG_DIR: configDir })[name] },
    settings: { read: async ({ key }) => { if (failChannels) throw new Error("settings unavailable"); return settings[key]; } },
    ...(failChannels ? {} : { audio: { play: async (clip, options) => { log.audio.push({ clip, options }); } } }),
    fs: {
      exists: async path => existsSync(hostPath(path)),
      list: async path => readdirSync(hostPath(path)).map(name => ({ name, kind: lstatSync(join(hostPath(path), name)).isDirectory() ? "dir" : "file", isLink: false })),
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
  const fire = (event, e = {}) => hooks.find(item => item.event === event).hook($, e, next);
  const liveTimers = () => log.timers.filter(timer => !timer.cancelled).length;
  return { $, on, fire, log, hooks, where, liveTimers };
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
const hosts = [];
const session = async (options = {}) => {
  const host = fakeHost({ projectRoot: target.root, configDir: configRoot, ...options });
  (await freshModule()).register(host.on);
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
  assert.equal(first.log.timers.at(-1).ms, REFRESH_MS);

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
    const runText = readFileSync(many.runPath, "utf8");
    for (let index = 1; index <= 12; index += 1) {
      const id = `extra-${String(index).padStart(2, "0")}`;
      mkdirSync(join(many.root, ".agdf", "control", "runs", id), { recursive: true });
      const extraText = runText.replaceAll("fixture-a", id);
      // extra-12 is blocked, so the status line tells the chat's run from a browsed one (chat-run navigation).
      // extra-11 is in an unknown state (Code Review CR-F01).
      const stateText = index === 12 ? extraText.replace(/^- decision: in_progress$/mu, "- decision: revise")
        : index === 11 ? extraText.replace(/^- decision: in_progress$/mu, "- decision: mystery").replace("| What is missing? | Exact Approval: UR. |", "| What is missing? | No approval is pending. |") : extraText;
      if (index >= 11) assert.notEqual(stateText, extraText, "the fixture is derived");
      writeFileSync(join(many.root, ".agdf", "control", "runs", id, "RUN_STATE.md"), sealRunState(many.root, stateText));
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
    assert.deepEqual(texts(barRows[0].children[1]), ["●● UR"], "a quick task at UR shows its own path");
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
    await button(chatView.tree, "next").props.onPress();
    await settle();
    let browsed = await look(lister);
    assert.deepEqual([browsed.runId, browsed.origin], ["fixture-a", "Selected by you"]);
    assert.equal(JSON.parse(readFileSync(statePath, "utf8")).selections[many.root], "fixture-a", "the pick is remembered as today");
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
    assert.equal((await look(lister)).runId, "fixture-a", "a subagent turn keeps the browsed run");
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

    // CR-F01: a chat run or a browsed run in an unknown state keeps stepping and the way back.
    await lister.fire("turn.start", { text: "Weiter mit extra-11." });
    await settle();
    let odd = await look(lister);
    assert.ok(texts(odd.tree).includes("Run state not readable: run state matches no known state"));
    assert.ok(button(odd.tree, "next"), "stepping from an unknown-state chat run");
    await button(odd.tree, "next").props.onPress();
    await settle();
    odd = await look(lister);
    assert.deepEqual([odd.runId, odd.origin, Boolean(button(odd.tree, "chat-return"))], ["extra-12", "Selected by you", true], "a step from it browses");
    await lister.fire("turn.start", { text: "extra-12" });
    await settle();
    await button((await look(lister)).tree, "previous").props.onPress();
    await settle();
    odd = await look(lister);
    assert.deepEqual([texts(odd.tree).includes("Run state not readable: run state matches no known state"), Boolean(button(odd.tree, "chat-return")), optionValues(odd.tree)[1]], [true, true, "chat"], "browsing to an unknown-state run offers the way back");

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
    mkdirSync(join(many.root, ".agdf", "control", "runs", "extra-13"), { recursive: true });
    writeFileSync(join(many.root, ".agdf", "control", "runs", "extra-13", "RUN_STATE.md"), sealRunState(many.root, runText.replaceAll("fixture-a", "extra-13")));
    await turnComplete(lister, "", { answer: "Created extra-13." });
    await settle();
    assert.deepEqual([(await look(lister)).runId, (await look(lister)).origin], ["extra-13", "Named in the chat"], "a run created during the turn counts");

    // CR-F04: browsing to a run whose state changes raises no toast and keeps the status line on the
    // chat's run; without a chat run neither the return button nor the menu entry appears.
    await lister.fire("turn.start", { text: "extra-12" });
    await settle();
    await turnComplete(lister, "");
    await settle();
    await button((await look(lister)).tree, "next").props.onPress();
    await settle();
    assert.equal((await look(lister)).runId, "extra-13");
    const quietToasts = lister.log.toasts.length;
    const quietStatus = lister.log.status.at(-1);
    writeFileSync(join(many.root, ".agdf", "control", "runs", "extra-13", "RUN_STATE.md"),
      sealRunState(many.root, runText.replaceAll("fixture-a", "extra-13").replace(/^- decision: in_progress$/mu, "- decision: revise")));
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
  await first.fire("turn.start", { agentId: "sub" });
  assert.ok(!texts(await render(first)).includes("Claude is working on this turn"));
  await first.fire("turn.start", {});
  assert.deepEqual([texts(await render(first)).includes("waiting for approval"), texts(await render(first)).includes("Claude is working on this turn")], [true, false], "a waiting run stays waiting during a turn");
  // CR-F10: turn.complete answers the host before the post-turn read has finished.
  const reads = first.log.invalidations;
  const realList = first.$.fs.list;
  let releaseList = null;
  first.$.fs.list = path => new Promise(resolve => { releaseList = () => resolve(realList(path)); });
  assert.deepEqual(await first.fire("turn.complete", { done: 1 }), { passed: { done: 1 } });
  assert.equal(first.log.invalidations, reads, "the hook returned before its read finished");
  await waitFor(() => releaseList, "the post-turn read");
  first.$.fs.list = realList;
  releaseList();
  await waitFor(() => first.log.invalidations > reads, "the post-turn redraw");
  assert.ok(texts(await render(first)).includes("waiting for approval"));

  // CR-F05: switching off during a turn and on again leaves no stale "working" overlay.
  await first.fire("turn.start", {});
  assert.equal((await first.fire("command.run", { command: COMMAND })).text, "AGDF Companion switched off.");
  await first.fire("turn.complete", {});
  assert.equal((await first.fire("command.run", { command: COMMAND })).text, "AGDF Companion switched on.");
  assert.ok(!texts(await render(first)).includes("Claude is working on this turn"));
  assert.equal(first.liveTimers(), 1, "exactly one refresh timer after switching off and on");

  // CR-F07: of overlapping reads, an older one that finishes last never replaces the newer one.
  let releaseEmpty = null;
  first.$.fs.list = () => new Promise(resolve => { releaseEmpty = () => resolve([]); });
  const slowRead = (await entry(first, "retry"))();
  await waitFor(() => releaseEmpty, "the slow read");
  first.$.fs.list = realList;
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
  assert.match(texts(terminal).join("\n"), /waiting for approval[\s\S]*[✓●○]UR[\s\S]*Next step: /u);

  // A change in this session takes over from the selection (most recent wins).
  assert.equal(target.approve().outcome, "approved");
  await (await entry(first, "retry"))();
  tree = await render(first);
  assert.ok(texts(tree).includes("Changed in this session") && texts(tree).includes("working"));

  // Follow-up SCN-009, SCN-011, SCN-013, SCN-014: toasts and the status line follow the shown run's
  // run-derived state. Selecting the waiting run was a baseline and its approval to working raised
  // nothing; a review result that blocks it raises exactly one toast, repeated reads none.
  const lastStatus = () => first.log.status.at(-1);
  const reread = async host => (await entry(host, "retry"))();
  const review = decision => {
    const result = recordRunStep(target.root, { runId: "fixture-a", revisionId: target.revision(), step: "review", decision, evidence: `companion adapter test: ${decision}` },
      { policy: policyForRunContent, date: "2026-10-27" });
    assert.equal(result.outcome, "recorded", JSON.stringify(result));
  };
  assert.equal(lastStatus(), "AGDF · Quick Task Execution · working");
  assert.deepEqual(first.log.toasts, [], "no toast for baselines, run switching or a working run");
  review("revise");
  await reread(first);
  await reread(first);
  assert.deepEqual(first.log.toasts, ["fixture-a is blocked: Quick Task Execution – revision needed"]);
  assert.equal(lastStatus(), "AGDF · Quick Task Execution · blocked");
  assert.deepEqual(first.log.audio, [], "the sound is off by default");
  // A main-loop turn shows its overlay in the pane but changes neither the status line nor toasts.
  // Every applied read sets the status line again (live finding: the desktop dropped the one set
  // during session start), so the post-turn read repeats the same text.
  const statusCount = first.log.status.length;
  await first.fire("turn.start", {});
  assert.ok(texts(await render(first)).includes("Claude is working on this turn"));
  const beforeTurnRead = first.log.invalidations;
  await first.fire("turn.complete", {});
  await waitFor(() => first.log.invalidations > beforeTurnRead, "the post-turn read");
  assert.equal(first.log.status.length, statusCount + 1, "the post-turn read sets the status line again");
  assert.deepEqual([first.log.status.at(-1), first.log.toasts.length], ["AGDF · Quick Task Execution · blocked", 1], "a turn changes neither the status text nor toasts");
  // CR-F04: the overlay checks on a blocked run, which the overlay covers: a subagent turn shows none, and
  // switching off during a main-loop turn and on again leaves no stale overlay.
  await first.fire("turn.start", { agentId: "sub" });
  assert.ok(!texts(await render(first)).includes("Claude is working on this turn"), "a subagent turn shows no overlay");
  await first.fire("turn.start", {});
  assert.ok(texts(await render(first)).includes("Claude is working on this turn"));
  assert.equal((await first.fire("command.run", { command: COMMAND })).text, "AGDF Companion switched off.");
  await first.fire("turn.complete", {});
  assert.equal((await first.fire("command.run", { command: COMMAND })).text, "AGDF Companion switched on.");
  assert.ok(!texts(await render(first)).includes("Claude is working on this turn"), "no stale overlay after switching off and on");
  // With the sound switched on, the next transition also plays the generated chime once.
  await (await entry(first, "sound"))();
  assert.equal(JSON.parse(readFileSync(statePath, "utf8")).sound, true);
  review("block");
  await reread(first);
  assert.equal(first.log.toasts.at(-1), "fixture-a is blocked: Quick Task Execution – blocked");
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
  assert.equal(first.liveTimers(), 1, "a plugin close leaves the refresh running");
  await first.fire("ui.close", { id: PANE, origin: { kind: "person" } });
  assert.equal(first.liveTimers(), 1, "the person's close keeps the refresh running");
  await first.fire("turn.start", {});
  assert.ok(!texts(await render(first)).includes("Claude is working on this turn"), "no turn overlay is tracked for a hidden pane");
  review("block");
  const beforeHiddenRead = first.log.invalidations;
  await first.fire("turn.complete", {});
  await waitFor(() => first.log.invalidations > beforeHiddenRead, "the post-turn read with the pane hidden");
  assert.equal(first.log.toasts.at(-1), "fixture-a is blocked: Quick Task Execution – blocked", "a hidden pane still raises toasts");
  assert.equal(first.log.toasts.length, 3);
  // CR-F06: the command brings a hidden pane back without changing the stored choice.
  const opensBefore = first.log.opened.length;
  assert.equal((await first.fire("command.run", { command: COMMAND })).text, "AGDF Companion switched on.");
  assert.equal(JSON.parse(readFileSync(statePath, "utf8")).enabled, true, "showing a hidden pane keeps the stored choice");
  assert.equal(first.log.opened.length, opensBefore + 1);
  assert.equal(first.liveTimers(), 1);
  // CR-F07: overlapping starts (closed and reopened during a slow read) leave exactly one timer.
  const pending = [];
  first.$.fs.list = path => new Promise(resolve => { pending.push(() => resolve(realList(path))); });
  await first.fire("ui.close", { id: PANE, origin: { kind: "person" } });
  const reopenA = first.fire("command.run", { command: COMMAND });
  await waitFor(() => pending.length === 1, "the first reopen's read");
  await first.fire("ui.close", { id: PANE, origin: { kind: "person" } });
  const reopenB = first.fire("command.run", { command: COMMAND });
  await waitFor(() => pending.length === 2, "the second reopen's read");
  first.$.fs.list = realList;
  pending.forEach(release => release());
  await Promise.all([reopenA, reopenB]);
  assert.equal(first.liveTimers(), 1, "overlapping starts leave one refresh timer");
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
  const realExists = second.$.fs.exists;
  second.$.fs.exists = async path => (path.endsWith("/.agdf/control/runs") ? false : realExists(path));
  await (await entry(second, "retry"))();
  assert.equal(JSON.parse(readFileSync(statePath, "utf8")).selections[target.root], "fixture-a");
  second.$.fs.exists = realExists;

  // CR-F08: the panel follows a project-root change (`/cd`, worktree move) at the next read.
  const otherProject = mkdtempSync(join(tmpdir(), "agdf-companion-other-"));
  mkdirSync(join(otherProject, ".agdf", "control", "runs"), { recursive: true });
  second.where.root = otherProject;
  await (await entry(second, "retry"))();
  assert.ok(texts(await render(second)).includes("No open runs in this project."));
  second.where.root = target.root;
  await (await entry(second, "retry"))();
  assert.ok(texts(await render(second)).includes("fixture-a"));
  rmSync(otherProject, { recursive: true, force: true });

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
  } finally {
    closing.close();
  }

  // SCN-010: a transient read failure keeps the last state with a marker; retry restores it.
  second.$.fs.list = async () => { throw new Error("EIO"); };
  await (await entry(second, "retry"))();
  tree = await render(second);
  assert.ok(texts(tree).some(line => line.startsWith("Read failed at")) && texts(tree).includes("fixture-a"));
  delete second.$.fs.list;
  second.$.fs.list = async path => readdirSync(path).map(name => ({ name, kind: lstatSync(join(path, name)).isDirectory() ? "dir" : "file", isLink: false }));
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
    const raceReview = decision => {
      const result = recordRunStep(race.root, { runId: "fixture-a", revisionId: race.revision(), step: "review", decision, evidence: `companion race test: ${decision}` },
        { policy: policyForRunContent, date: "2026-10-27" });
      assert.equal(result.outcome, "recorded", JSON.stringify(result));
    };
    const host = await session({ projectRoot: race.root, failToast: true });
    await host.fire("session.start");
    if (!JSON.parse(readFileSync(statePath, "utf8")).enabled) await host.fire("command.run", { command: COMMAND });
    await buttons(await render(host)).find(button => button.props.key === "run-fixture-a").props.onPress();
    if (await entryLabel(host, "sound") === "Sound on") {
      await (await entry(host, "sound"))();
    }
    assert.equal(JSON.parse(readFileSync(statePath, "utf8")).sound, true, "the sound is on for the toast-failure check");
    assert.equal(race.approve().outcome, "approved");
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
    const realRead = raceHost.$.fs.read;
    // Reads of the shown run's state are held with the content they captured. The read started before
    // the switch-off finishes first, the read of the switch-on second.
    const held = [];
    raceHost.$.fs.read = async path => {
      if (!/[\\/]runs[\\/]fixture-a[\\/]RUN_STATE\.md$/u.test(path)) return realRead(path);
      const captured = await realRead(path);
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
    raceHost.$.fs.read = realRead;
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

  // SDD-07: without the plugin data directory the choices last for the session only.
  const noData = mkdtempSync(join(tmpdir(), "agdf-companion-nodata-"));
  const sessionOnly = fakeHost({ projectRoot: target.root, configDir: noData });
  (await freshModule()).register(sessionOnly.on);
  await sessionOnly.fire("session.start");
  assert.equal((await sessionOnly.fire("command.run", { command: COMMAND })).text, "AGDF Companion switched on.");
  assert.deepEqual([sessionOnly.log.writes.length, existsSync(join(noData, "plugins"))], [0, false]);
  rmSync(noData, { recursive: true, force: true });

  // AC-007: the companion wrote only its state file; run states it read are byte-identical, apart
  // from the one canonical approval this test performed itself.
  const writes = hosts.flatMap(host => host.log.writes);
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
