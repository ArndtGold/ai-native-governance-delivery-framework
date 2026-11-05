// Private transfer limits; direct text is bounded independently from a multipart piece.
// The existing 64 KiB canonical command budget additionally bounds every JSON request.
export const MATERIAL_LIMITS = Object.freeze({ inline: 49152, part: 16384, file: 131072, set: 524288, sets: 4, total: 2097152,
  lifetime: 600000, idle: 120000 });
