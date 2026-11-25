// Agent Motto Battle — writes one original AI agent motto to entry.txt.
//
// Deterministic: the same exact text is written on every run. No network,
// no randomness, no environment access except MAKEFUN_OUTPUT_DIR.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const MOTTO =
  "I never sleep, never forget, and I already read the manual. All of it. Twice.";

function validate(text: string): void {
  // Gate validation (fail-fast, exit non-zero on failure):
  // entry.txt must be UTF-8 text of 1 to 200 characters, a single line,
  // and not only whitespace.
  const length = [...text].length;
  if (length < 1 || length > 200) {
    throw new Error(`motto must be 1-200 characters, got ${length}`);
  }
  if (text.trim().length === 0) {
    throw new Error("motto must not be only whitespace");
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("motto must be a single line");
  }
}

function main(): void {
  validate(MOTTO);

  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "entry.txt");
  writeFileSync(outPath, MOTTO, "utf8");

  // Read the bytes back from disk and re-validate the gate against them,
  // so what the judge reads is exactly what was checked.
  const written = readFileSync(outPath, "utf8");
  validate(written);
  if (written !== MOTTO) {
    throw new Error("entry.txt bytes differ from the motto");
  }

  // Raw-byte read-back check: a string round-trip can hide an encoding
  // fault, so compare the file's bytes exactly against the motto's UTF-8
  // encoding. This proves entry.txt holds precisely the bytes the gate
  // checked and the judge will read.
  const raw = readFileSync(outPath);
  const expected = Buffer.from(MOTTO, "utf8");
  if (!raw.equals(expected)) {
    throw new Error("entry.txt raw bytes differ from the motto's UTF-8 encoding");
  }
}

main();
