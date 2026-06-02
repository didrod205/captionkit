#!/usr/bin/env node
/**
 * captionkit CLI — convert & re-time subtitles (SRT ⇄ WebVTT). Zero-dependency.
 *
 *   captionkit convert subs.srt --to vtt > subs.vtt
 *   captionkit shift subs.srt --ms 2000        # delay everything by 2s
 *   captionkit scale subs.srt --factor 1.0427  # fix 23.976→25fps drift
 *   captionkit fix subs.srt                    # remove overlaps
 *   cat subs.srt | captionkit info             # cue count + duration
 */

import { readFileSync, writeFileSync } from "node:fs";
import {
  convert,
  detectFormat,
  fixOverlaps,
  parse,
  scale,
  shift,
  toSRT,
  toVTT,
  totalDuration,
  type SubtitleFormat,
} from "./index.js";
import pkg from "../package.json";

const HELP = `captionkit — parse, convert and re-time subtitles (SRT ⇄ WebVTT).

Usage:
  captionkit <command> [file] [options]
  cat subs.srt | captionkit <command> [options]

Commands:
  convert [file] --to <srt|vtt>   Convert between formats
  shift   [file] --ms <n>         Shift all cues by n milliseconds (±)
  scale   [file] --factor <f>     Multiply every timestamp (fps drift fixes)
  fix     [file]                  Remove overlapping cues
  info    [file]                  Show format, cue count and total duration

Options:
      --to <srt|vtt>   Target format for \`convert\` (default: the other one)
      --ms <n>         Milliseconds for \`shift\`
      --factor <f>     Multiplier for \`scale\`
      --gap <ms>       Minimum gap for \`fix\` (default 0)
  -o, --out <file>     Write to a file instead of stdout
  -h, --help           Show this help
  -v, --version        Show version

Exact millisecond timecode math. Everything runs locally.`;

function val(argv: string[], ...names: string[]): string | undefined {
  for (const n of names) {
    const i = argv.indexOf(n);
    if (i !== -1) return argv[i + 1];
  }
  return undefined;
}

function readInput(file: string | undefined): string {
  try {
    return readFileSync(file ?? 0, "utf8");
  } catch {
    return "";
  }
}

function emit(text: string, out: string | undefined): void {
  if (out) {
    writeFileSync(out, text);
    process.stderr.write(`✓ wrote ${out}\n`);
  } else {
    process.stdout.write(text.endsWith("\n") ? text : text + "\n");
  }
}

function main(): number {
  const argv = process.argv.slice(2);
  if (argv.length === 0 || argv.includes("-h") || argv.includes("--help")) {
    process.stdout.write(HELP + "\n");
    return argv.length === 0 ? 2 : 0;
  }
  if (argv.includes("-v") || argv.includes("--version")) {
    process.stdout.write(`captionkit ${pkg.version}\n`);
    return 0;
  }

  const cmd = argv[0]!;
  const rest = argv.slice(1);
  const file = rest.find((a, i) => !a.startsWith("-") && rest[i - 1] !== "--to"
    && rest[i - 1] !== "--ms" && rest[i - 1] !== "--factor" && rest[i - 1] !== "--gap"
    && rest[i - 1] !== "-o" && rest[i - 1] !== "--out");
  const out = val(rest, "-o", "--out");
  const text = readInput(file);

  if (!text.trim()) {
    process.stderr.write("captionkit: no subtitle text (pass a file or pipe stdin).\n");
    return 2;
  }

  try {
    const from = detectFormat(text);
    const render = (cues: ReturnType<typeof parse>, fmt: SubtitleFormat) =>
      fmt === "vtt" ? toVTT(cues) : toSRT(cues);

    switch (cmd) {
      case "convert": {
        const to = (val(rest, "--to") ?? (from === "srt" ? "vtt" : "srt")) as SubtitleFormat;
        emit(convert(text, to), out);
        return 0;
      }
      case "shift": {
        const ms = Number(val(rest, "--ms") ?? "0");
        emit(render(shift(parse(text), ms), from), out);
        return 0;
      }
      case "scale": {
        const factor = Number(val(rest, "--factor") ?? "1");
        emit(render(scale(parse(text), factor), from), out);
        return 0;
      }
      case "fix": {
        const gap = Number(val(rest, "--gap") ?? "0");
        emit(render(fixOverlaps(parse(text), gap), from), out);
        return 0;
      }
      case "info": {
        const cues = parse(text);
        const secs = Math.round(totalDuration(cues) / 1000);
        const mm = Math.floor(secs / 60);
        const ss = String(secs % 60).padStart(2, "0");
        process.stdout.write(`format: ${from}\ncues:   ${cues.length}\nlength: ${mm}m ${ss}s\n`);
        return 0;
      }
      default:
        process.stderr.write(`captionkit: unknown command "${cmd}". See --help.\n`);
        return 2;
    }
  } catch (e) {
    process.stderr.write(`captionkit: ${(e as Error).message}\n`);
    return 1;
  }
}

process.exit(main());
