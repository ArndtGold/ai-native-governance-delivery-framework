// Shared guidance for passing authored bytes; never an additional file reader,
// an authoring result or authority to record an artefact.
export const AUTHORING_TEXT_HANDOFF = 'Pass Markdown as UTF-8 string data, never executable code. Prefer structured tool input. If the host uses JavaScript, author with its file-editing tool and pass a UTF-8 file read as content; never embed the document in backtick literals.';
