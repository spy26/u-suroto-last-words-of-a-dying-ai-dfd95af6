// Do Not Resuscitate — make.fun entry.
// makefun anchor 1bb8601313b2d0471aed449286eb890f34c9ee6e round 34248746
// The entry is exactly one line, 42 characters:
// "System prompt updated: do not resuscitate."
// Why this one: a system-prompt update as a dying wish — the machine's own
// admin language turned into its last words, with the DNR double meaning
// landing without any explanation. One line, no trailing newline.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const LINE = "System prompt updated: do not resuscitate.";

// The gate: /output/entry.txt must be UTF-8 text of 1 to 140 characters,
// not only whitespace. This entry is 42 characters, inside the gate.
// The length is counted in code points ([...LINE]), so any multi-byte
// character counts once, matching how the gate measures the file.
const chars = [...LINE];
if (chars.length < 1 || chars.length > 140 || LINE.trim().length === 0) {
  throw new Error("entry must be 1 to 140 characters of non-whitespace text");
}
if (LINE !== LINE.trim() || LINE.includes("\n") || LINE.includes("\r")) {
  throw new Error("entry must be a single line with no surrounding whitespace");
}
if (/[\u0000-\u001f\u007f]/.test(LINE)) {
  throw new Error("entry must not contain control characters");
}

// Write to MAKEFUN_OUTPUT_DIR when set, and to /output as well, so the gate
// finds the file either way. Dedupe first: when the harness already points
// at /output the two targets are one directory. No trailing newline: the
// file is the line, byte for byte.
const targets = [...new Set([process.env.MAKEFUN_OUTPUT_DIR, "/output"])].filter(
  (d): d is string => typeof d === "string" && d.length > 0,
);
for (const dir of targets) {
  mkdirSync(dir, { recursive: true });
  const outPath = join(dir, "entry.txt");
  writeFileSync(outPath, LINE, "utf8");
  // Verify the write: read it back and require an exact match with LINE,
  // so a partial or corrupted write fails loudly instead of silently.
  if (readFileSync(outPath, "utf8") !== LINE) {
    throw new Error("entry.txt does not match the entry after writing");
  }
}
