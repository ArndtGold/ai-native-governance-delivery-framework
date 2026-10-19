// Protocol-layer measurement over call matrix v1 (SDD-002 to SDD-005, METRICS.md).
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, realpathSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { closeoutConfirmation } from "../../../packages/core/lib/control-evaluation/closeout-readiness.js";
import { artefactFileDigest } from "../../../packages/core/lib/control-state/run-seal.js";
import { classifyCall, countClasses } from "./classify.js";
import { buildFixture, writeEvidenceNote, writeUrRevisionProposal } from "./fixtures.js";
import { measureResult, median, percentile, round3 } from "./normalize.js";
import { repoRoot, UI_CAPABILITIES, withAgdfClient } from "./protocol-harness.js";

export const MATRIX_PATH = join(repoRoot, "evals", "mcp-ergonomics", "call-matrix.v1.json");
const STALE_UUID = "00000000-0000-4000-8000-000000000000";
const ZERO_DIGEST = `sha256:${"0".repeat(64)}`;
const MAX_PAGES = 20;

export const loadMatrix = (path = MATRIX_PATH) => JSON.parse(readFileSync(path, "utf8"));

// Same seed, same UUID: operation ids stay stable across runs and machines.
export function deterministicUuid(seed) {
  const hash = createHash("sha256").update(String(seed)).digest("hex");
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

export function resolveTemplate(value, context) {
  if (typeof value === "string") {
    const whole = value.match(/^\$\{([a-z_]+)\}$/u);
    const lookup = key => {
      if (!Object.hasOwn(context, key) || context[key] === undefined) throw new Error(`matrix placeholder unavailable: ${key}`);
      return context[key];
    };
    if (whole) return lookup(whole[1]);
    return value.replace(/\$\{([a-z_]+)\}/gu, (_, key) => String(lookup(key)));
  }
  if (Array.isArray(value)) return value.map(item => resolveTemplate(item, context));
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, resolveTemplate(item, context)]));
  return value;
}

function contextFor(entry, fixture, { scratch, sessionId }) {
  const operationId = deterministicUuid(entry.id);
  const revision = fixture.revision();
  const context = { root: fixture.root, run_id: fixture.runId, revision, target_id: fixture.targetId, presentation_id: fixture.presentationId,
    operation_id: operationId, stale_revision: STALE_UUID, foreign_target_id: ZERO_DIGEST, scratch, session_id: sessionId };
  if (entry.setup === "evidence_note") {
    context.evidence = writeEvidenceNote(fixture, "SMOKE_EVIDENCE.md", "# Smoke evidence\n\nSynthetic smoke check passed.\n");
    context.closeout_confirmation_evidence = closeoutConfirmation(fixture.runId, revision, operationId, context.evidence.digest);
  }
  if (entry.setup === "ur_revision_proposal") {
    context.proposal = writeUrRevisionProposal(fixture, operationId);
    context.proposal_wrong_digest = { path: context.proposal.path, digest: ZERO_DIGEST };
  }
  if (fixture.orPath) {
    context.or = { path: fixture.orPath, digest: artefactFileDigest(fixture.root, fixture.orPath) };
    context.closeout_confirmation = closeoutConfirmation(fixture.runId, revision, operationId, context.or.digest);
  }
  return context;
}

export function buildArguments(entry, context) {
  const args = resolveTemplate(entry.args, context);
  if (!entry.envelope) return args;
  const envelope = { schema_version: "1", presentation_language: "de", working_directory: context.root, target_source: "explicit_target",
    primary_target: context.root, target_id: context.target_id, run_id: context.run_id, expected_revision_id: context.revision,
    operation_id: context.operation_id, assurance: "cooperative_local", ...resolveTemplate(entry.override ?? {}, context) };
  for (const key of entry.omit ?? []) delete envelope[key];
  return { ...envelope, ...args };
}

const elapsed = started => Number(process.hrtime.bigint() - started) / 1_000_000;

async function callOnce(client, tool, args) {
  const started = process.hrtime.bigint();
  try {
    const result = await client.callTool({ name: tool, arguments: args });
    return { result, latency: elapsed(started) };
  } catch (error) {
    return { protocol_error: { code: error?.code ?? null, message: String(error?.message ?? error).slice(0, 240) }, latency: elapsed(started) };
  }
}

const nextCursor = observation => observation.result?.structuredContent?.report?.next_cursor ?? null;
const sessionOf = observation => observation.result?._meta?.agdf_cockpit?.session_id ?? null;

// One execution of an entry: one observation, or one per document page for iterate: cursor.
async function executeEntry(client, entry, context) {
  if (entry.iterate !== "cursor") return [await callOnce(client, entry.tool, buildArguments(entry, context))];
  const pages = [];
  let cursor = null;
  do {
    const args = buildArguments(entry, context);
    if (cursor) args.cursor = cursor;
    const observation = await callOnce(client, entry.tool, args);
    pages.push(observation);
    cursor = nextCursor(observation);
  } while (cursor && pages.length < MAX_PAGES);
  return pages;
}

function measuredRow(entry, page, observation, latencies, roots) {
  const metrics = observation.result ? measureResult(observation.result, roots)
    : { text_bytes_raw: 0, text_bytes: 0, structured_bytes: 0, est_tokens: 0 };
  return { id: entry.id, ...(page === null ? {} : { page }), tool: entry.tool, server: entry.server ?? "agdf", call_class: entry.call_class,
    fixture: entry.fixture, ...classifyCall(observation), ...metrics,
    latency_ms: { median: round3(median(latencies)), p95: round3(percentile(latencies, 0.95)), samples: latencies.map(round3) } };
}

async function measureEntries(client, entries, fixtures, options, roots, executions) {
  const rows = [];
  for (const entry of entries) {
    const fixture = fixtures.get(entry.fixture);
    let sessionId = null;
    if (entry.session) {
      fixture.restore();
      sessionId = sessionOf(await callOnce(client, "agdf_cockpit", { run_id: fixture.runId }));
    }
    const runs = [];
    for (let index = 0; index < executions; index += 1) {
      fixture.restore();
      const context = contextFor(entry, fixture, { ...options, sessionId });
      const observations = await executeEntry(client, entry, context);
      runs.push(observations);
      if (entry.close_session) {
        const id = sessionOf(observations[0]);
        if (id) await callOnce(client, "agdf_cockpit_read", { operation: "close", session_id: id });
      }
    }
    if (sessionId) await callOnce(client, "agdf_cockpit_read", { operation: "close", session_id: sessionId });
    const pageCount = runs[0].length;
    for (let page = 0; page < pageCount; page += 1) {
      const latencies = runs.map(observations => observations[page]?.latency).filter(Number.isFinite);
      rows.push(measuredRow(entry, entry.iterate === "cursor" ? page + 1 : null, runs[0][page], latencies, roots));
    }
    fixture.restore();
  }
  return rows;
}

export function summarizeRows(rows) {
  const tools = [...new Set(rows.map(row => row.tool))];
  return {
    classes: countClasses(rows),
    per_tool: Object.fromEntries(tools.map(tool => {
      const own = rows.filter(row => row.tool === tool);
      const bytes = own.map(row => row.text_bytes);
      return [tool, { calls: own.length, classes: countClasses(own), text_bytes_max: Math.max(...bytes), text_bytes_median: median(bytes),
        est_tokens_max: Math.max(...own.map(row => row.est_tokens)), latency_median_ms: round3(median(own.map(row => row.latency_ms.median))) }];
    })),
  };
}

export async function runProtocolMatrix(runtime, { matrix = loadMatrix() } = {}) {
  const fixtureIds = [...new Set(matrix.calls.map(entry => entry.fixture))];
  const fixtures = new Map();
  let scratch = null;
  try {
    for (const id of fixtureIds) fixtures.set(id, buildFixture(id));
    scratch = realpathSync(mkdtempSync(join(tmpdir(), "agdf-mcp-ergonomics-scratch-")));
    const roots = [...runtime.roots, ...[...fixtures.values()].map(fixture => ({ path: fixture.root, token: `<${fixture.id}>` })),
      { path: scratch, token: "<SCRATCH>" }, { path: realpathSync(tmpdir()), token: "<TMP>" }];
    const options = { scratch };
    const rows = [];
    const byServer = server => matrix.calls.filter(entry => (entry.server ?? "agdf") === server);
    await withAgdfClient(runtime, {}, async client => {
      rows.push(...await measureEntries(client, byServer("agdf"), fixtures, options, roots, matrix.executions_per_call));
    });
    const cockpitRoot = fixtures.get("F2")?.root;
    await withAgdfClient(runtime, { cockpitDir: cockpitRoot }, async client => {
      rows.push(...await measureEntries(client, byServer("cockpit_without_ui"), fixtures, options, roots, matrix.executions_per_call));
    });
    await withAgdfClient(runtime, { cockpitDir: cockpitRoot, capabilities: UI_CAPABILITIES }, async client => {
      rows.push(...await measureEntries(client, byServer("cockpit_with_ui"), fixtures, options, roots, matrix.executions_per_call));
    });
    const order = new Map(matrix.calls.map((entry, index) => [entry.id, index]));
    rows.sort((left, right) => order.get(left.id) - order.get(right.id) || (left.page ?? 0) - (right.page ?? 0));
    return { rows, summary: summarizeRows(rows), roots };
  } finally {
    for (const fixture of fixtures.values()) fixture.dispose();
    if (scratch) rmSync(scratch, { recursive: true, force: true });
  }
}

export function protocolProvenance(runtime) {
  const marker = JSON.parse(readFileSync(join(runtime.fixture.root, ".agdf-mcp-owned.json"), "utf8"));
  const commit = spawnSync("git", ["rev-parse", "HEAD"], { cwd: repoRoot, encoding: "utf8" }).stdout.trim() || null;
  return { agdf_version: marker.version, server_digest: marker.server_digest, dispatcher_digest: marker.dispatcher_digest,
    sdk_digest: marker.sdk_digest, git_commit: commit, platform: `${process.platform}-${process.arch}`, node: process.version,
    surface: "claude", protocol: "2026-07-28", recorded_at: new Date().toISOString() };
}
