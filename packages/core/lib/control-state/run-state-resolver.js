import { discoverRuns, readSelectedRun } from "./run-state-reader.js";
export function resolveRuns(
  root,
  { runIdArg, runIdEnv, allActive = false } = {},
) {
  if (
    (allActive && (runIdArg || runIdEnv)) ||
    (runIdArg && runIdEnv && runIdArg !== runIdEnv)
  )
    throw Error("AGDF_SELECTOR_CONFLICT");
  const id = runIdArg || runIdEnv;
  if (id) {
    const run = readSelectedRun(root, id);
    if (!run.valid) {
      const unsupported = run.findings.some(finding => finding.classification === 'unsupported_version');
      throw Object.assign(Error(`${unsupported ? 'AGDF_RUN_VERSION_UNSUPPORTED' : 'AGDF_RUN_NOT_SELECTABLE'}:${id}; next=${unsupported ? 'use a compatible reader; preserve original history' : 'select a valid run'}`),
        { findings: run.findings, run_path: run.path });
    }
    return { selection_source: runIdArg ? 'cli' : 'environment', run,
      active_run_ids: run.meta.lifecycle === 'active' ? [id] : [] };
  }
  const runs = discoverRuns(root),
    active = runs.filter((r) => r.valid && r.meta.lifecycle === "active");
  const findings = runs
    .filter((run) => !run.valid)
    .flatMap((run) =>
      run.findings.map((finding) => ({ ...finding, run_id: run.run_id })),
    );
  if (allActive)
    return { selection_source: "all_active", runs: active, findings };
  if (active.length !== 1)
    throw Error(
      active.length
        ? `AGDF_ACTIVE_RUN_AMBIGUOUS:${active.map((r) => r.run_id)}`
        : "AGDF_ACTIVE_RUN_MISSING",
    );
  return {
    selection_source: "single_active",
    run: active[0],
    active_run_ids: [active[0].run_id],
  };
}
