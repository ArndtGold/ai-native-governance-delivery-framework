// A bounded lexical view for the adapter's deliberately narrow TOML readers.
// Keep UTF-16 offsets and line endings so edits and hashes always use original
// bytes. Comments and multiline string payloads cannot supply tables, enabled
// fields or ownership markers. This is not a general TOML parser: unsupported
// MCP shapes still fail the existing structural/ownership checks.
export function codexConfigSyntax(content) {
  if (Buffer.byteLength(content) > 65_536) throw Error('AGDF_MCP_CODEX_CONFIG_INVALID');
  const syntax = content.split('');
  const hide = (start, end) => {
    for (let i = start; i < end; i++) if (content[i] !== '\n' && content[i] !== '\r') syntax[i] = ' ';
  };
  for (let i = 0; i < content.length;) {
    if (content[i] === '#') {
      const end = content.indexOf('\n', i);
      hide(i, end < 0 ? content.length : end);
      i = end < 0 ? content.length : end;
      continue;
    }
    const quote = content[i];
    if (quote !== '"' && quote !== "'") { i++; continue; }
    const start = i, multiline = content.startsWith(quote.repeat(3), i);
    i += multiline ? 3 : 1;
    let closed = false;
    while (i < content.length) {
      if (quote === '"' && content[i] === '\\') {
        if (!multiline && /[\r\n]/u.test(content[i + 1] ?? '')) throw Error('AGDF_MCP_CODEX_CONFIG_INVALID');
        i += 2; continue;
      }
      if (!multiline && /[\r\n]/u.test(content[i])) throw Error('AGDF_MCP_CODEX_CONFIG_INVALID');
      if (content[i] !== quote) { i++; continue; }
      if (!multiline) { i++; closed = true; break; }
      let end = i;
      while (content[end] === quote) end++;
      const count = end - i;
      if (count > 5) throw Error('AGDF_MCP_CODEX_CONFIG_INVALID');
      i = end;
      if (count >= 3) { closed = true; break; }
    }
    if (!closed) throw Error('AGDF_MCP_CODEX_CONFIG_INVALID');
    if (multiline) {
      hide(start, i);
      // Keep a non-boolean placeholder so a multiline enabled value is unknown,
      // rather than mistaken for a missing field with its default value.
      syntax[start] = quote; syntax[start + 1] = quote;
    }
  }
  return syntax.join('');
}
