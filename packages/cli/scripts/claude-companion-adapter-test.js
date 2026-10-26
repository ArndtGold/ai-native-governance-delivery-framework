import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { approvalFixture, fixture } from "../../core/test/control-cockpit-fixtures.js";
import { replaceFirstScalar } from "../../core/lib/control-state/run-state-edits.js";
import { sealRunState } from "../../core/lib/control-state/run-seal.js";

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
  : path.startsWith(`${pluginRoot}/meta/`) ? join(repoRoot, "plugins", "agdf", "meta", path.slice(pluginRoot.length + 6)) : path);

function fakeHost({ projectRoot, configDir, failRoot = false }) {
  const log = { writes: [], opened: [], closed: [], commands: [], invalidations: 0, timers: [], passed: 0 };
  const where = { root: projectRoot };
  const $ = {
    plugin: { name: "agdf", root: pluginRoot },
    clock: { now: async () => Date.now(), every: (ms, fn) => { const timer = { ms, fn, cancelled: false, cancel() { this.cancelled = true; } }; log.timers.push(timer); return timer; } },
    session: { root: async () => { if (failRoot) throw new Error("root unavailable"); return where.root; } },
    env: { get: async name => ({ CLAUDE_CONFIG_DIR: configDir })[name] },
    fs: {
      exists: async path => existsSync(hostPath(path)),
      list: async path => readdirSync(hostPath(path)).map(name => ({ name, kind: lstatSync(join(hostPath(path), name)).isDirectory() ? "dir" : "file", isLink: false })),
      read: async path => readFileSync(hostPath(path), "utf8"),
      write: async (path, text) => { log.writes.push(path); writeFileSync(path, text); },
    },
    command: { register: async spec => { log.commands.push(spec); } },
    ui: {
      resolve: e => (e.surface === "terminal" ? { Box: "Box", Text: "Text", Button: "Button" } : { Box: "Box", Text: "Text", Button: "Button", Svg: "Svg" }),
      invalidate: () => { log.invalidations++; },
      open: async args => { log.opened.push(args); return { isPlaced: true }; },
      close: async args => { log.closed.push(args); },
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
const render = (host, surface = "desktop") => host.fire("ui.render", { surface, props: { bodyColumns: 40 } });
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
  assert.deepEqual([first.log.commands[0].name, first.log.commands[0].description, first.log.commands[0].immediate], [COMMAND, "Switch the AGDF companion on or off", true]);
  assert.deepEqual([first.log.opened.length, first.log.writes.length, first.log.timers.length], [0, 0, 0]);
  const on = await first.fire("command.run", { command: COMMAND });
  assert.equal(on.text, "AGDF companion switched on.");
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
  // The stepping buttons draw ◀ and ▶; their label is the localized accessible name.
  const steppers = tree => buttons(tree).filter(button => ["previous", "next"].includes(button.props.key)).map(button => [button.props.label, texts(button)]);
  assert.deepEqual(steppers(tree), [["Previous run", ["◀"]], ["Next run", ["▶"]]]);
  const configText = readFileSync(configPath, "utf8");
  writeFileSync(configPath, `${JSON.stringify({ ...JSON.parse(configText), chat_language: "de" }, null, 2)}\n`);
  const german = await session();
  await german.fire("session.start");
  writeFileSync(configPath, configText);
  assert.deepEqual(steppers(await render(german)), [["Vorheriger Run", ["◀"]], ["Nächster Run", ["▶"]]]);

  // SCN-006: main-loop turns drive läuft; subagent turns change nothing; completion re-reads.
  await first.fire("turn.start", { agentId: "sub" });
  assert.ok(!texts(await render(first)).includes("Claude is working on this turn"));
  await first.fire("turn.start", {});
  assert.ok(texts(await render(first)).includes("Claude is working on this turn"));
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
  assert.equal((await first.fire("command.run", { command: COMMAND })).text, "AGDF companion switched off.");
  await first.fire("turn.complete", {});
  assert.equal((await first.fire("command.run", { command: COMMAND })).text, "AGDF companion switched on.");
  assert.ok(!texts(await render(first)).includes("Claude is working on this turn"));
  assert.equal(first.liveTimers(), 1, "exactly one refresh timer after switching off and on");

  // CR-F07: of overlapping reads, an older one that finishes last never replaces the newer one.
  let releaseEmpty = null;
  first.$.fs.list = () => new Promise(resolve => { releaseEmpty = () => resolve([]); });
  const slowRead = buttons(await render(first)).find(button => button.props.key === "retry").props.onPress();
  await waitFor(() => releaseEmpty, "the slow read");
  first.$.fs.list = realList;
  await buttons(await render(first)).find(button => button.props.key === "retry").props.onPress();
  releaseEmpty();
  await slowRead;
  assert.ok(texts(await render(first)).includes("waiting for approval"), "the newer read stays on screen");

  // AC-010: the still pose persists and removes all motion; the terminal draws text.
  await buttons(await render(first)).find(button => button.props.key === "still").props.onPress();
  assert.equal(JSON.parse(readFileSync(statePath, "utf8")).still, true);
  const svg = find(await render(first), node => node.tag === "Svg")[0];
  assert.equal(/<animate|<set\b/u.test(svg.props.source), false);
  assert.equal(svg.props.isInteractive, false);
  const terminal = await render(first, "terminal");
  assert.equal(find(terminal, node => node.tag === "Svg").length, 0);
  assert.match(texts(terminal).join("\n"), /waiting for approval[\s\S]*[✓●○]UR[\s\S]*Next step: /u);

  // A change in this session takes over from the selection (most recent wins).
  assert.equal(target.approve().outcome, "approved");
  await buttons(await render(first)).find(button => button.props.key === "retry").props.onPress();
  tree = await render(first);
  assert.ok(texts(tree).includes("Changed in this session") && texts(tree).includes("working"));

  // SDD-07 / CR-F01: the person's close mark (the host's `origin: { kind: "person" }`) hides the pane
  // for this session and stops reading; a close by the plugin itself does not hide it.
  await first.fire("ui.close", { id: PANE, origin: { kind: "plugin" } });
  assert.equal(first.liveTimers(), 1, "a plugin close leaves the refresh running");
  await first.fire("ui.close", { id: PANE, origin: { kind: "person" } });
  assert.equal(first.liveTimers(), 0, "the person's close stops the refresh");
  // CR-F06: the command brings a hidden pane back without changing the stored choice.
  const opensBefore = first.log.opened.length;
  assert.equal((await first.fire("command.run", { command: COMMAND })).text, "AGDF companion switched on.");
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
  assert.equal(off.text, "AGDF companion switched off.");
  assert.equal(JSON.parse(readFileSync(statePath, "utf8")).enabled, false);
  assert.deepEqual(first.log.closed.at(-1), { id: PANE });
  await first.fire("command.run", { command: COMMAND });

  // A new session keeps the choice and the remembered selection.
  const second = await session();
  await second.fire("session.start");
  assert.equal(second.log.opened.length, 1, "the enabled choice reopens the pane");
  assert.ok(texts(await render(second)).includes("fixture-a"));

  // CR-F04: a session writes only its own change into the freshly read file, so a choice another
  // session stored meanwhile survives.
  const stillBefore = JSON.parse(readFileSync(statePath, "utf8")).still;
  await buttons(await render(first)).find(button => button.props.key === "still").props.onPress();
  assert.equal(JSON.parse(readFileSync(statePath, "utf8")).still, !stillBefore);
  await second.fire("command.run", { command: COMMAND });
  const stored = JSON.parse(readFileSync(statePath, "utf8"));
  assert.deepEqual([stored.enabled, stored.still, stored.selections[target.root]], [false, !stillBefore, "fixture-a"],
    "the second session's switch-off keeps the first session's still pose and the selection");
  await second.fire("command.run", { command: COMMAND });

  // CR-F09: a snapshot without any runs (a missing runs folder) never drops the selection.
  const realExists = second.$.fs.exists;
  second.$.fs.exists = async path => (path.endsWith("/.agdf/control/runs") ? false : realExists(path));
  await buttons(await render(second)).find(button => button.props.key === "retry").props.onPress();
  assert.equal(JSON.parse(readFileSync(statePath, "utf8")).selections[target.root], "fixture-a");
  second.$.fs.exists = realExists;

  // CR-F08: the panel follows a project-root change (`/cd`, worktree move) at the next read.
  const otherProject = mkdtempSync(join(tmpdir(), "agdf-companion-other-"));
  mkdirSync(join(otherProject, ".agdf", "control", "runs"), { recursive: true });
  second.where.root = otherProject;
  await buttons(await render(second)).find(button => button.props.key === "retry").props.onPress();
  assert.ok(texts(await render(second)).includes("No open runs in this project."));
  second.where.root = target.root;
  await buttons(await render(second)).find(button => button.props.key === "retry").props.onPress();
  assert.ok(texts(await render(second)).includes("fixture-a"));
  rmSync(otherProject, { recursive: true, force: true });

  // TPR-F01: a remembered run that is superseded later is closed, so the next read drops the
  // selection and no longer offers it. The runs predate the session, so none counts as changed in it.
  const closing = fixture();
  try {
    const closingHost = await session();
    await closingHost.fire("session.start");
    closingHost.where.root = closing.root;
    await buttons(await render(closingHost)).find(button => button.props.key === "retry").props.onPress();
    await buttons(await render(closingHost)).find(button => button.props.key === "run-fixture-a").props.onPress();
    assert.equal(JSON.parse(readFileSync(statePath, "utf8")).selections[closing.root], "fixture-a");
    const runPath = join(closing.root, ".agdf", "control", "runs", "fixture-a", "RUN_STATE.md");
    writeFileSync(runPath, sealRunState(closing.root, replaceFirstScalar(readFileSync(runPath, "utf8"), "lifecycle", "superseded")));
    await buttons(await render(closingHost)).find(button => button.props.key === "retry").props.onPress();
    assert.equal(JSON.parse(readFileSync(statePath, "utf8")).selections[closing.root], undefined, "a selection on a superseded run is dropped");
    tree = await render(closingHost);
    assert.ok(texts(tree).includes("No open runs in this project."));
    assert.deepEqual(buttons(tree).filter(button => button.props.key.startsWith("run-")), []);
  } finally {
    closing.close();
  }

  // SCN-010: a transient read failure keeps the last state with a marker; retry restores it.
  second.$.fs.list = async () => { throw new Error("EIO"); };
  await buttons(await render(second)).find(button => button.props.key === "retry").props.onPress();
  tree = await render(second);
  assert.ok(texts(tree).some(line => line.startsWith("Read failed at")) && texts(tree).includes("fixture-a"));
  delete second.$.fs.list;
  second.$.fs.list = async path => readdirSync(path).map(name => ({ name, kind: lstatSync(join(path, name)).isDirectory() ? "dir" : "file", isLink: false }));
  await buttons(await render(second)).find(button => button.props.key === "retry").props.onPress();
  assert.ok(!texts(await render(second)).some(line => line.startsWith("Read failed at")));

  // SCN-014: failure injection. A failing session start passes its event on and registers nothing;
  // a failing render draws one neutral line; a failing command answers with text.
  const broken = await session({ failRoot: true });
  assert.deepEqual(await broken.fire("session.start", { marker: 1 }), { passed: { marker: 1 } });
  assert.equal(broken.log.commands.length, 0);
  const renderFailure = await render(broken);
  assert.equal(renderFailure.tag, "Text");
  assert.match(texts(renderFailure)[0], /^AGDF companion: /u);
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

  // SDD-07: without the plugin data directory the choices last for the session only.
  const noData = mkdtempSync(join(tmpdir(), "agdf-companion-nodata-"));
  const sessionOnly = fakeHost({ projectRoot: target.root, configDir: noData });
  (await freshModule()).register(sessionOnly.on);
  await sessionOnly.fire("session.start");
  assert.equal((await sessionOnly.fire("command.run", { command: COMMAND })).text, "AGDF companion switched on.");
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
  await buttons(await render(third)).find(button => button.props.key === "retry").props.onPress();
  assert.equal(controlDigest(target.root), controlAfterApproval, "companion reads leave the control state byte-identical");
} finally {
  target.close();
  rmSync(configRoot, { recursive: true, force: true });
}

console.log("Claude companion adapter tests passed");
