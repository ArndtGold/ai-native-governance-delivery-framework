import { existsSync, readFileSync } from "node:fs";
import { join, posix } from "node:path";

export function cleanStatusCell(value) {
  return (value ?? "").replace(/\x60/g, "").trim();
}

export function readTargetFile(targetDir, relativePath) {
  return readFileSync(join(targetDir, relativePath), "utf8");
}

export function addFinding(findings, severity, code, message, path, nextStep) {
  findings.push({
    severity,
    code,
    message,
    path,
    next_step: nextStep,
  });
}

export function nonEmptyTableRows(content) {
  return content
    .split("\n")
    .filter((line) => line.trim().startsWith("|"))
    .filter((line) => !line.includes("---"))
    .map((line) => line.split("|").map((cell) => cell.trim()).filter(Boolean))
    .filter((cells) => cells.some((cell) => cell && !cell.startsWith("`")));
}

export function tableRows(content) {
  return content
    .split("\n")
    .filter((line) => line.trim().startsWith("|"))
    .filter((line) => !line.includes("---"))
    .map((line) => {
      const cells = line.split("|").map((cell) => cell.trim());
      if (cells[0] === "") cells.shift();
      if (cells.at(-1) === "") cells.pop();
      return cells;
    });
}

const compactBacklogHeaders = ["priority", "key", "work item", "status", "artefacts", "current spec", "next step"];
const legacyBacklogHeaders = ["prio", "key", "title", "status", "ur", "brownfield review", "prd", "sd", "tp", "qa", "or", "current spec", "notes"];
const backlogStatusLabels = new Map([
  ["needs ur", "needs_ur"],
  ["awaiting brownfield review", "awaiting_brownfield_review"],
  ["awaiting prd", "awaiting_prd"],
  ["awaiting prd approval", "awaiting_prd_approval"],
  ["awaiting sd", "awaiting_sd"],
  ["awaiting sd approval", "awaiting_sd_approval"],
  ["awaiting tp", "awaiting_tp"],
  ["awaiting tp approval", "awaiting_tp_approval"],
  ["in progress", "in_progress"],
  ["blocked", "blocked"],
  ["awaiting qa", "awaiting_qa"],
  ["awaiting uat", "awaiting_uat"],
  ["awaiting or", "awaiting_or"],
  ["completed", "completed"],
  ["superseded", "superseded"],
  ["abandoned", "abandoned"],
]);
const backlogArtefactLabels = new Map([
  ["ur", "ur"],
  ["brownfield", "brownfield_review"],
  ["prd", "prd"],
  ["sd", "sd"],
  ["tp", "tp"],
  ["qa", "qa"],
  ["or", "or"],
]);
const backlogScopeLabels = new Map([
  ["framework-maintenance", "framework_maintenance"],
  ["external-delivery", "external_delivery"],
]);

export function normalizeBacklogHeader(value) {
  return value.replace(/`/g, "").trim().toLowerCase();
}

export function markdownLink(value) {
  const match = value.trim().match(/^\[([^\]]+)\]\(([^)]+)\)$/);
  return match ? { label: match[1].trim(), target: match[2].trim() } : null;
}

export function resolvedBacklogLinkTarget(target) {
  if (!target
    || target.startsWith("/")
    || target.includes("\\")
    || /^[a-z][a-z0-9+.-]*:/i.test(target)) {
    return null;
  }
  const resolved = posix.normalize(posix.join(".agdf/control", target));
  if (resolved === ".." || resolved.startsWith("../")) return null;
  return resolved;
}

export function normalizedBacklogLinkTarget(value, findings, backlogPath, label) {
  const link = markdownLink(value);
  if (!link) return value.trim();
  const resolved = resolvedBacklogLinkTarget(link.target);
  if (!resolved) {
    if (findings) {
      addFinding(
        findings,
        "revise",
        "AGDF_BACKLOG_LINK_TARGET_INVALID",
        `Backlog ${label} link must be relative to MASTER_BACKLOG.md: ${link.target || "<empty>"}.`,
        backlogPath,
        "Use a document-relative artefact target such as artefacts/<key>/UR.md.",
      );
    }
    return link.target;
  }
  return resolved;
}

export function normalizeBacklogStatus(value, findings, backlogPath) {
  const cleaned = cleanStatusCell(value ?? "");
  const lookup = cleaned.replaceAll("_", " ").toLowerCase();
  const normalized = backlogStatusLabels.get(lookup);
  if (normalized) return normalized;
  if (/^[a-z][a-z0-9_]*$/.test(cleaned)) return cleaned;
  if (findings && filled(cleaned)) {
    addFinding(
      findings,
      "revise",
      "AGDF_BACKLOG_STATUS_UNKNOWN",
      `MASTER_BACKLOG.md uses an unknown human status label: ${cleaned}.`,
      backlogPath,
      "Use a documented human status label or a supported legacy snake_case value.",
    );
  }
  return cleaned;
}

export function normalizeBacklogScope(workItem, findings, backlogPath) {
  const match = (workItem ?? "").match(/^\[([^\]]+)\]/);
  if (!match) return undefined;
  const cleaned = match[1].trim();
  const lookup = cleaned.replaceAll("_", " ").toLowerCase().replaceAll(" ", "-");
  const normalized = backlogScopeLabels.get(lookup);
  if (normalized) return normalized;
  if (findings) {
    addFinding(
      findings,
      "revise",
      "AGDF_BACKLOG_SCOPE_LABEL_UNKNOWN",
      `MASTER_BACKLOG.md uses an unknown Work item scope tag: [${cleaned}].`,
      backlogPath,
      "Use [framework-maintenance] or [external-delivery], or remove the bracketed tag.",
    );
  }
  return cleaned;
}

export function emptyBacklogPointer() {
  return {
    prio: "",
    key: "",
    title: "",
    scope: "",
    status: "",
    ur: "",
    brownfield_review: "",
    prd: "",
    sd: "",
    tp: "",
    qa: "",
    or: "",
    current_spec: "",
    notes: "",
  };
}

export function parseCompactArtefacts(value, pointer, findings, backlogPath) {
  if (!filled(value)) return;
  const seen = new Set();
  for (const entry of value.split(/\s+·\s+/)) {
    const link = markdownLink(entry);
    if (!link) {
      if (findings) {
        addFinding(
          findings,
          "revise",
          "AGDF_BACKLOG_ARTEFACT_LINK_INVALID",
          `Compact Artefacts entry is not a Markdown link: ${entry}.`,
          backlogPath,
          "Use [UR](artefacts/<key>/UR.md) style links separated by a middle dot.",
        );
      }
      continue;
    }
    const field = backlogArtefactLabels.get(link.label.toLowerCase());
    if (!field) {
      if (findings) {
        addFinding(
          findings,
          "revise",
          "AGDF_BACKLOG_ARTEFACT_LABEL_UNKNOWN",
          `Compact Artefacts uses an unknown label: ${link.label}.`,
          backlogPath,
          "Use UR, Brownfield, PRD, SD, TP, QA or OR.",
        );
      }
      continue;
    }
    if (seen.has(field)) {
      if (findings) {
        addFinding(
          findings,
          "revise",
          "AGDF_BACKLOG_ARTEFACT_LABEL_DUPLICATE",
          `Compact Artefacts repeats the ${link.label} link.`,
          backlogPath,
          "Keep exactly one link per artefact type.",
        );
      }
      continue;
    }
    seen.add(field);
    pointer[field] = normalizedBacklogLinkTarget(entry, findings, backlogPath, link.label);
  }
}

export function parseBacklogSection(section, findings = null, backlogPath = ".agdf/control/MASTER_BACKLOG.md") {
  const rows = tableRows(section);
  if (rows.length === 0) return [];
  const headers = rows[0].map(normalizeBacklogHeader);
  const layout = headers.join("|") === compactBacklogHeaders.join("|")
    ? "compact"
    : headers.join("|") === legacyBacklogHeaders.join("|")
      ? "legacy"
      : "unknown";

  if (layout === "unknown") {
    if (findings) {
      addFinding(
        findings,
        "revise",
        "AGDF_BACKLOG_LAYOUT_UNKNOWN",
        `MASTER_BACKLOG.md uses an unsupported table layout: ${headers.join(", ")}.`,
        backlogPath,
        "Use the canonical compact layout or the supported legacy 13-column layout.",
      );
    }
    return [];
  }

  return rows.slice(1)
    .filter((cells) => cells.some((cell) => filled(cell)))
    .map((cells) => {
      const pointer = emptyBacklogPointer();
      if (layout === "legacy") {
        [
          pointer.prio,
          pointer.key,
          pointer.title,
          pointer.status,
          pointer.ur,
          pointer.brownfield_review,
          pointer.prd,
          pointer.sd,
          pointer.tp,
          pointer.qa,
          pointer.or,
          pointer.current_spec,
          pointer.notes,
        ] = cells.map((cell) => cell ?? "");
        pointer.status = normalizeBacklogStatus(pointer.status, findings, backlogPath);
        return pointer;
      }

      pointer.prio = cells[0] ?? "";
      pointer.key = cleanStatusCell(cells[1] ?? "");
      pointer.title = cells[2] ?? "";
      pointer.scope = normalizeBacklogScope(cells[2], findings, backlogPath) ?? "";
      pointer.status = normalizeBacklogStatus(cells[3], findings, backlogPath);
      parseCompactArtefacts(cells[4] ?? "", pointer, findings, backlogPath);
      pointer.current_spec = normalizedBacklogLinkTarget(cells[5] ?? "", findings, backlogPath, "Current spec");
      pointer.notes = cells[6] ?? "";
      return pointer;
    });
}

export function hasFilledTableRow(content, firstCellPattern) {
  return tableRows(content)
    .filter((cells) => firstCellPattern.test(cells[0] ?? ""))
    .some((cells) => cells.slice(1).some((cell) => cell && !cell.startsWith("`")));
}

export function isPlaceholderValue(value) {
  return !value || (value.startsWith("`") && value.includes("|"));
}

export function hasFilledEvidenceRow(content) {
  const evidenceSection = content.match(/## Evidence([\s\S]*?)(?:\n## |\n# |$)/)?.[1] ?? "";
  return tableRows(evidenceSection)
    .filter((cells) => cells[0] !== "Evidence")
    .some((cells) => {
      const [evidence, source, covers] = cells;
      return Boolean(evidence || source || covers);
    });
}

export function allowNoActiveRuns(targetDir) {
  const configPath = join(targetDir, ".agdf", "control", "config.json");
  if (!existsSync(configPath)) return false;
  try {
    return JSON.parse(readFileSync(configPath, "utf8")).allow_no_active_runs === true;
  } catch {
    return false;
  }
}

export function markdownSection(content, heading) {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return content.match(new RegExp(`(?:^|\\n)## ${escaped}\\s*\\n([\\s\\S]*?)(?:\\n## |\\n# |$)`))?.[1] ?? "";
}

export function filled(value) {
  return Boolean(value && !isPlaceholderValue(value) && value.trim() !== "");
}

export function runSelectionRecovery(target) {
  const directSelection = "Pass --run <run_id> or set AGDF_RUN_ID to select the intended run";
  return ["doctor", "delivery-map"].includes(target)
    ? `${directSelection}, or use --all-active to evaluate every active run independently.`
    : `${directSelection}.`;
}

export function parseQualityContracts(content) {
  const parsed = JSON.parse(content);
  if (!Array.isArray(parsed.contracts) || parsed.contracts.length === 0) {
    throw new Error("contracts must be a non-empty array");
  }
  for (const contract of parsed.contracts) {
    if (!contract.code || !contract.impact || !contract.required_evidence) {
      throw new Error(`contract ${contract.code ?? "<unknown>"} is missing code, impact or required_evidence`);
    }
  }
  return parsed;
}

