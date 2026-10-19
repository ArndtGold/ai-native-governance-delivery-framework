// Byte normalization for MCP ergonomics metrics (SDD-004). Metrics are taken from the exact
// text and structured content a client received, after two replacements that make runs
// comparable: known roots become fixed placeholders and every `*_ms` value becomes 0.
// Raw bytes stay available as informational values.

const MS_VALUE = /("[A-Za-z0-9_]*_ms"\s*:\s*)-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/gu;

// Raw, forward-slash, JSON-escaped, doubly JSON-escaped (an escaped path inside text that is JSON-encoded
// again, for example a markdown table cell in a dispatch result) and slash-escaped forms.
function pathForms(path) {
  const forward = path.replaceAll("\\", "/");
  const forms = new Set([path, forward, path.replaceAll("\\", "\\\\"), path.replaceAll("\\", "\\\\\\\\"), forward.replaceAll("/", "\\/")]);
  return [...forms].filter(Boolean).sort((left, right) => right.length - left.length);
}

// roots: [{ path, token }]. Longer roots are replaced first so nested roots keep their own token.
export function normalizeText(text, roots = []) {
  let value = String(text ?? "");
  const ordered = [...roots].filter(root => root?.path).sort((left, right) => right.path.length - left.path.length);
  for (const { path, token } of ordered) {
    for (const form of pathForms(path)) value = value.replaceAll(form, token);
  }
  return value.replace(MS_VALUE, "$10");
}

export function normalizeJson(value, roots = []) {
  return value === undefined ? "" : normalizeText(JSON.stringify(value), roots);
}

export const byteLength = text => Buffer.byteLength(String(text ?? ""), "utf8");

// Fixed estimate rule: ceil(normalized UTF-8 bytes / 4). Not a tokenizer count.
export const estimateTokens = bytes => Math.ceil(Number(bytes) / 4);

export function contentText(result) {
  return (Array.isArray(result?.content) ? result.content : [])
    .filter(item => item?.type === "text").map(item => item.text ?? "").join("");
}

export function measureResult(result, roots = []) {
  const rawText = contentText(result);
  const text = normalizeText(rawText, roots);
  const structured = normalizeJson(result?.structuredContent, roots);
  const textBytes = byteLength(text);
  return {
    text_bytes_raw: byteLength(rawText),
    text_bytes: textBytes,
    structured_bytes: byteLength(structured),
    est_tokens: estimateTokens(textBytes),
  };
}

export function median(values) {
  const sorted = [...values].filter(Number.isFinite).sort((left, right) => left - right);
  if (!sorted.length) return null;
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

export function percentile(values, fraction) {
  const sorted = [...values].filter(Number.isFinite).sort((left, right) => left - right);
  if (!sorted.length) return null;
  return sorted[Math.min(sorted.length - 1, Math.max(0, Math.ceil(sorted.length * fraction) - 1))];
}

export const round3 = value => value === null ? null : Math.round(value * 1000) / 1000;
