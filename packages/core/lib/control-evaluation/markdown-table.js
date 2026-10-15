// Shared bounded table observation; callers retain their own semantic policy.
export function section(markdown, title) {
  const lines = markdown.replace(/\r\n?/gu, "\n").split("\n");
  const wanted = title.toLowerCase();
  const start = lines.findIndex((line) => {
    const heading = line.match(/^#{2,6}\s+(?:\d+\.\s*)?(.+?)\s*#*\s*$/u);
    return heading?.[1]?.trim()?.toLowerCase() === wanted;
  });
  if (start < 0) return null;
  const level = (lines[start].match(/^#+/u) ?? [""])[0].length;
  let end = start + 1;
  while (end < lines.length) {
    const next = lines[end].match(/^(#{2,6})\s+/u);
    if (next && next[1].length <= level) break;
    end += 1;
  }
  return lines.slice(start + 1, end).join("\n");
}

export function tableRows(markdown, title, requiredColumns) {
  const body = section(markdown, title);
  if (body === null) return { rows: [], error: `${title} section is missing` };
  const lines = body.split("\n");
  for (let index = 0; index < lines.length - 1; index += 1) {
    const headerLine = lines[index].trim();
    if (!headerLine.startsWith("|") || !/^\|?[\s:|-]+\|?$/u.test(lines[index + 1].trim())) continue;
    const headers = headerLine.replace(/^\||\|$/gu, "").split("|").map((cell) => cell.trim().toLowerCase().replace(/[^a-z0-9]+/gu, "_").replace(/^_|_$/gu, ""));
    if (!requiredColumns.every((column) => headers.includes(column))) continue;
    const rows = [];
    for (let cursor = index + 2; cursor < lines.length; cursor += 1) {
      const line = lines[cursor].trim();
      if (!line.startsWith("|")) break;
      if (/^\|?[\s:|-]+\|?$/u.test(line)) continue;
      const cells = line.replace(/^\||\|$/gu, "").split("|").map((cell) => cell.trim().replace(/^`|`$/gu, ""));
      rows.push(Object.fromEntries(headers.map((header, cellIndex) => [header, cells[cellIndex] ?? ""])));
    }
    return { rows, error: null };
  }
  return { rows: [], error: `${title} table is missing or malformed` };
}
