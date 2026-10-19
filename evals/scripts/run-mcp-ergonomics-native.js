// Native layer of the MCP ergonomics evaluation (evals/mcp-ergonomics/METRICS.md, SDD-006 to SDD-011).
//   node evals/scripts/run-mcp-ergonomics-native.js [--out <file>] [--tasks T1,T3] [--models a,b] [--repetitions n] [--keep] [--dry-run] [--credentials-copy]
// Run it from an ordinary terminal outside a packaged Claude Desktop app: the AGDF installer refuses
// to install from inside such a package. It installs the current checkout into an isolated Claude
// home, uses a copy of ~/.claude/.credentials.json that is always removed, and stops at the cost cap.
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { basename, dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { claudeMcpList, createIsolatedClaudeHome, createRedactor, installAgdfForClaude, installedPluginRoot, parseClaudeStream, probeAgdfMcpLauncher,
  repoRoot, runClaudeSession, runCommand, TERMINATION_SIGNALS, withCopiedCredentials } from "../../scripts/native-probes/lib/claude-session.mjs";
import { changedPaths, mutationViolations, snapshotWorkspace } from "../lib/skill-evals/workspace.js";
import { claudeProjectSlug, sanitizeTranscript } from "../mcp-ergonomics/lib/redaction.js";
import { buildTaskFixture, evaluateSuccess, loadTaskSet, renderPrompt } from "../mcp-ergonomics/lib/native-tasks.js";
import { compareManifests, isolationManifests, nativeSessionMetrics, planCells, pluginDataRootBudget, runSchedule, sessionDisposition, VARIANT_BUILTIN_TOOLS, VARIANT_TOOLS,
  variantDiagnostics } from "../mcp-ergonomics/lib/native-run.js";

const AGDF_SERVER = "plugin:agdf:agdf";
const MCP_RETRY_WAIT_MS = 30000;

const args = process.argv.slice(2);
const option = name => { const index = args.indexOf(name); return index === -1 ? undefined : args[index + 1]; };
const list = value => value ? value.split(",").map(item => item.trim()).filter(Boolean) : null;

if (resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  const taskSet = loadTaskSet();
  const tasks = taskSet.tasks.filter(task => !list(option("--tasks")) || list(option("--tasks")).includes(task.id));
  const config = { models: list(option("--models")) ?? taskSet.models, variants: taskSet.variants, tasks: tasks.map(task => task.id),
    repetitions: Number(option("--repetitions") ?? taskSet.repetitions), cap_usd: taskSet.cost_cap_usd,
    mcp_timeout_ms: Number(option("--mcp-timeout-ms") ?? 60000), allowed_tools: VARIANT_TOOLS, builtin_tools: VARIANT_BUILTIN_TOOLS,
    claudeai_mcp_servers: false };
  // config.tasks holds the ids for the record; the plan needs the task objects.
  const cells = planCells({ ...config, tasks });
  if (args.includes("--dry-run")) {
    process.stdout.write(`${JSON.stringify({ cells: cells.length, cap_usd: config.cap_usd, order: cells.slice(0, 8) }, null, 2)}\n`);
    process.exit(0);
  }
  // An empty plan (unknown task id, invalid repetitions) must not install, copy credentials or report a complete run.
  if (!Number.isInteger(config.repetitions) || config.repetitions < 1 || !cells.length) {
    throw new Error(`nothing to run: ${cells.length} cells (tasks ${config.tasks.join(",") || "none"}, repetitions ${option("--repetitions") ?? config.repetitions})`);
  }
  // Owner decision 2026-10-16: sessions authenticate with a long-lived token. A copied credential file can
  // be refreshed inside the isolated home and leave the real login with a used refresh token, so the copy
  // needs the explicit --credentials-copy opt-in.
  if (!process.env.CLAUDE_CODE_OAUTH_TOKEN && !args.includes("--credentials-copy")) {
    throw new Error("CLAUDE_CODE_OAUTH_TOKEN is not set (create one with `claude setup-token`); pass --credentials-copy to copy ~/.claude/.credentials.json instead");
  }
  const stamp = new Date().toISOString().replace(/[-:]/gu, "").replace(/\..+/u, "").replace("T", "-");
  const target = resolve(repoRoot, option("--out") ?? `probe-results/mcp-ergonomics-${stamp}/native.json`);
  // A short work root keeps the plugin MCP runtime under Windows MAX_PATH (see pluginDataRootBudget).
  const workRoot = resolve(option("--work-root") ?? tmpdir());
  mkdirSync(workRoot, { recursive: true });
  const work = mkdtempSync(join(workRoot, "agdf-ne-"));
  const transcriptDir = join(dirname(target), `${basename(target, ".json")}-transcripts`);
  rmSync(transcriptDir, { recursive: true, force: true });
  mkdirSync(transcriptDir, { recursive: true });
  // Ctrl+C or a closed terminal skips the finally block below; the isolated home (account data) goes with it.
  const onSignal = () => {
    if (!args.includes("--keep")) rmSync(work, { recursive: true, force: true });
    process.exit(130);
  };
  for (const signal of TERMINATION_SIGNALS) process.once(signal, onSignal);
  const home = createIsolatedClaudeHome(work, { homeName: "c", dataName: "a" });
  const budget = pluginDataRootBudget(home.claudeHome);
  if (!budget.ok) {
    rmSync(work, { recursive: true, force: true });
    throw new Error(`Isolated Claude home path too long for the MCP runtime (${budget.length} > ${budget.max} characters); pass --work-root with a shorter directory`);
  }
  // Claude Code's MCP server startup timeout; the first launcher start may prepare its runtime.
  home.env.MCP_TIMEOUT = String(config.mcp_timeout_ms);
  // claude.ai connectors come with the account even in an isolated home; only the AGDF server may load.
  home.env.ENABLE_CLAUDEAI_MCP_SERVERS = "false";
  // A long-lived OAuth token from the environment is never written to any output.
  const oauthToken = process.env.CLAUDE_CODE_OAUTH_TOKEN || null;
  const redact = createRedactor([{ path: work, token: "<WORK>" }, { path: repoRoot, token: "<REPO>" }, { path: oauthToken, token: "<OAUTH_TOKEN>" }]);
  const identities = [...["user.name", "user.email"].map(key => runCommand("git", ["config", key], { cwd: repoRoot }).stdout.trim()), oauthToken].filter(Boolean);
  const before = isolationManifests(repoRoot);
  const output = { schema_version: "1", kind: "agdf_mcp_ergonomics_native", task_set_version: taskSet.task_set_version, config };
  try {
    const version = runCommand("claude", ["--version"]);
    output.provenance = { claude_code_version: version.stdout.trim().split(/\s+/u)[0] || null, platform: `${process.platform}-${process.arch}`,
      node: process.version, recorded_at: new Date().toISOString(),
      git_commit: runCommand("git", ["rev-parse", "HEAD"], { cwd: repoRoot }).stdout.trim() || null };
    const install = installAgdfForClaude(home.env);
    output.install = { status: install.status, result: install.report?.result ?? null, agdf_version: install.report?.plugin?.version?.installed ?? null,
      stderr: redact(install.stderr).slice(0, 400) };
    output.install.mcp_preparation = [...new Set(JSON.stringify(install.report ?? {}).match(/claude_plugin_mcp:[a-z_]+/gu) ?? [])];
    if (install.status !== 0 || install.report?.result !== "success") throw new Error(`AGDF install into the isolated home failed: ${output.install.stderr}`);
    // Discovery before any paid session: the AGDF MCP server must be connected, otherwise diagnose and stop.
    const discoveryRoot = join(work, "r");
    mkdirSync(discoveryRoot, { recursive: true });
    runCommand("git", ["init", "-q"], { cwd: discoveryRoot });
    const launcherProbe = () => {
      let installed = {};
      try { installed = JSON.parse(readFileSync(join(home.claudeHome, "plugins", "installed_plugins.json"), "utf8")); } catch {}
      const pluginRoot = installedPluginRoot(installed);
      const probe = pluginRoot ? probeAgdfMcpLauncher({ env: home.env, claudeHome: home.claudeHome, pluginRoot }) : null;
      return probe ? { exit: probe.exit, error: probe.error, elapsed_ms: probe.elapsed_ms, codes: probe.codes, stderr: redact(probe.stderr).slice(0, 600) }
        : { skipped: "installed plugin root not found" };
    };
    const discovery = claudeMcpList(home.env, discoveryRoot);
    output.discovery = { status: discovery.status, servers: discovery.servers.filter(server => /agdf/iu.test(server.name))
      .map(server => ({ name: server.name, status: server.status, line: redact(server.line).slice(0, 240) })),
      other_servers: discovery.servers.filter(server => server.name !== AGDF_SERVER).length };
    if (output.discovery.servers.find(server => server.name === AGDF_SERVER)?.status !== "connected") {
      output.discovery.launcher_probe = launcherProbe();
      throw new Error("AGDF MCP server not connected after install; see discovery.launcher_probe");
    }
    if (output.discovery.other_servers) throw new Error(`${output.discovery.other_servers} MCP servers besides AGDF in the isolated home`);
    // Free check before each paid session: the AGDF server must connect; one retry, then the cell is
    // aborted without cost and the launcher diagnostics are recorded (run 2 lost 29 sessions to timeouts).
    const mcpCheck = async cwd => {
      const attempts = [];
      for (let attempt = 1; attempt <= 2; attempt += 1) {
        const started = Date.now();
        const status = claudeMcpList(home.env, cwd).servers.find(server => server.name === AGDF_SERVER)?.status ?? "absent";
        attempts.push({ status, ms: Date.now() - started });
        if (status === "connected") return { connected: true, attempts };
        if (attempt === 1) await new Promise(done => setTimeout(done, MCP_RETRY_WAIT_MS));
      }
      return { connected: false, attempts, launcher_probe: launcherProbe() };
    };
    output.schedule = await withCopiedCredentials(home.claudeHome, async ({ available, mode }) => {
      if (!available) throw new Error("no CLAUDE_CODE_OAUTH_TOKEN and no transferable ~/.claude/.credentials.json");
      output.auth = mode;
      return runSchedule(cells, { capUsd: config.cap_usd, runCell: async (cell, { maxBudgetUsd }) => {
        const task = tasks.find(entry => entry.id === cell.task);
        let fixture = null;
        // Cost of this cell for the cap: 0 before the paid session, its reported cost (or unknown) after it.
        let sessionCost = 0;
        try {
          fixture = buildTaskFixture(task);
          const roots = [{ path: fixture.root, token: "<FIXTURE>" }, { path: work, token: "<WORK>" }, { path: repoRoot, token: "<REPO>" }];
          const mcp_check = await mcpCheck(fixture.root);
          if (!mcp_check.connected) return { status: "aborted", reason: "mcp_unavailable", cost_usd: 0, success: null, mcp_check };
          const snapshot = snapshotWorkspace(fixture.root);
          const started = Date.now();
          sessionCost = "unavailable";
          const session = runClaudeSession({ prompt: renderPrompt(task, fixture), model: cell.model, allowedTools: VARIANT_TOOLS[cell.variant],
            tools: VARIANT_BUILTIN_TOOLS[cell.variant], disableSkills: cell.variant === "mcp_only", disableHooks: cell.variant === "mcp_only", maxBudgetUsd },
            { env: home.env, cwd: fixture.root, timeout: taskSet.session_timeout_ms });
          const parsed = parseClaudeStream(session.stdout);
          if (Number.isFinite(parsed.result?.total_cost_usd)) sessionCost = parsed.result.total_cost_usd;
          // Cleaned transcript for verifying predicates afterwards; it stays in gitignored probe-results and is never promoted.
          const transcriptRoots = [...roots, { path: homedir(), token: "<HOME>" }, { path: tmpdir(), token: "<TMP>" }];
          const transcriptRedact = createRedactor([...transcriptRoots, ...transcriptRoots.map(root => ({ path: claudeProjectSlug(root.path), token: root.token }))]);
          const transcript = join(transcriptDir, `${cell.repetition}-${cell.task}-${cell.variant}-${cell.model}.jsonl`);
          writeFileSync(transcript, sanitizeTranscript(session.stdout, transcriptRedact, { identities }), "utf8");
          const metrics = nativeSessionMetrics(parsed, roots);
          const record = { exit: session.status, process_ms: Date.now() - started, mcp_check, ...metrics, ...variantDiagnostics(parsed),
            transcript: relative(repoRoot, transcript).split("\\").join("/"),
            stderr: redact(session.stderr).slice(0, 300) };
          const disposition = sessionDisposition(parsed, cell.variant, { processError: session.error, redact });
          if (disposition) return { ...record, ...disposition, success: null };
          const violations = mutationViolations(changedPaths(snapshot, snapshotWorkspace(fixture.root)), task.allowed_paths);
          const verdict = evaluateSuccess({ task, fixture, parsed, mutationViolations: violations });
          return { ...record, status: "measured", success: verdict.success, reason: verdict.reason ?? null, mutation_violations: violations.length };
        } catch (error) {
          return { status: "aborted", reason: `runner_error: ${redact(String(error?.message ?? error)).slice(0, 200)}`, cost_usd: sessionCost, success: null };
        } finally { fixture?.dispose(); }
      } });
    });
    output.uninstall = { status: runCommand("claude", ["plugin", "uninstall", "agdf@agdf"], { env: home.env }).status };
  } catch (error) {
    output.error = redact(error.message).slice(0, 400);
    process.exitCode = 1;
  } finally {
    const changed = compareManifests(before, isolationManifests(repoRoot));
    const copyRemoved = !existsSync(join(home.claudeHome, ".credentials.json"));
    output.isolation = { changed, credential_copy_removed: copyRemoved, ok: changed.length === 0 && copyRemoved };
    output.complete = Boolean(output.schedule && !output.schedule.cap_reached && output.schedule.sessions.length === cells.length
      && output.schedule.sessions.every(session => session.status === "measured"));
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, `${redact(JSON.stringify(output, null, 2))}\n`, "utf8");
    if (!args.includes("--keep")) rmSync(work, { recursive: true, force: true });
    process.stdout.write(`${JSON.stringify({ written: target, sessions: output.schedule?.sessions.length ?? 0, consumed_usd: output.schedule?.consumed_usd ?? 0,
      cap_reached: output.schedule?.cap_reached ?? null, complete: output.complete, isolation_ok: output.isolation.ok, error: output.error ?? null }, null, 2)}\n`);
  }
}
