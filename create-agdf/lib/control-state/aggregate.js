const STATUS_RANK = { pass: 0, warn: 1, revise: 2, block: 3 };

export function aggregate(results, { allowNoActiveRuns = false } = {}) {
  const runs = [...results].sort((left, right) =>
    left.run_id.localeCompare(right.run_id),
  );
  const status = runs.length
    ? runs.reduce(
        (current, run) =>
          STATUS_RANK[run.status] > STATUS_RANK[current] ? run.status : current,
        "pass",
      )
    : allowNoActiveRuns
      ? "pass"
      : "revise";

  return { status, runs };
}
