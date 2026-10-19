// Pure text normalization shared by source and seal readers; preserves the existing byte semantics.
export function normalizeLineEndings(content) {
  return content.replace(/\r\n/g, "\n");
}

export function canonicalRunText(content) {
  return normalizeLineEndings(String(content ?? "")).replace(/^﻿/u, "");
}
