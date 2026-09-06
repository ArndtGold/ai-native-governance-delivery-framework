import { discoverRuns } from "./run-state-reader.js";
export function resolveRuns(
  root,
  { runIdArg, runIdEnv, allActive = false } = {},
) {
  if (
    (allActive && (runIdArg || runIdEnv)) ||
    (runIdArg && runIdEnv && runIdArg !== runIdEnv)
  )
    throw Error("AGDF_SELECTOR_CONFLICT");
  const runs = discoverRuns(root),
    active = runs.filter((r) => r.valid && r.meta.lifecycle === "active");
  const findings = runs
    .filter((run) => !run.valid)
    .flatMap((run) =>
      run.findings.map((finding) => ({ ...finding, run_id: run.run_id })),
    );
  if (allActive)
    return { selection_source: "all_active", runs: active, findings };
  const id = runIdArg || runIdEnv;
  if (id) {
    const run = runs.find((r) => r.run_id === id);
    if (!run?.valid) {
      throw Error(
        `AGDF_RUN_NOT_SELECTABLE:${id}; discovered=${runs.map((item) => item.run_id).join(",")}; next=select a valid run`,
      );
    }
    return {
      selection_source: runIdArg ? "cli" : "environment",
      run,
      active_run_ids: active.map((r) => r.run_id),
    };
  }
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
