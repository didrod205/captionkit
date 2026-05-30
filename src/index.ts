/**
 * captionkit — parse, convert and re-time subtitle files (SRT ⇄ WebVTT)
 * entirely locally. Exact millisecond timecode math; zero dependencies.
 */

import { formatSRT, formatVTT, parseTimecode } from "./timecode.js";

export { parseTimecode, formatSRT, formatVTT } from "./timecode.js";

export type SubtitleFormat = "srt" | "vtt";

export interface Cue {
  /** Sequential number (1-based). */
  index: number;
  /** Start time, milliseconds. */
  start: number;
  /** End time, milliseconds. */
  end: number;
  /** Cue text (may contain multiple lines). */
  text: string;
}

const TIME_LINE = /(\d{1,2}:\d{1,2}:\d{2}[.,]\d{1,3}|\d{1,2}:\d{2}[.,]\d{1,3})\s*-->\s*(\d{1,2}:\d{1,2}:\d{2}[.,]\d{1,3}|\d{1,2}:\d{2}[.,]\d{1,3})/;

/** Detect whether text looks like WebVTT or SRT. */
export function detectFormat(text: string): SubtitleFormat {
  if (/^﻿?\s*WEBVTT/.test(text)) return "vtt";
  // SRT uses a comma before the milliseconds; VTT uses a dot.
  if (/\d{1,2}:\d{2}[.,]\d{1,3}\s*-->/.test(text)) {
    return /,\d{1,3}\s*-->/.test(text) ? "srt" : "vtt";
  }
  return "srt";
}

/**
 * Parse an SRT or WebVTT string into cues. Tolerant of CRLF, a BOM, a WEBVTT
 * header, blank lines, and missing cue numbers.
 *
 * ```ts
 * const cues = parse(srtText);
 * cues[0]; // { index: 1, start: 1000, end: 4000, text: "Hello" }
 * ```
 */
export function parse(text: string): Cue[] {
  const normalized = text.replace(/^﻿/, "").replace(/\r\n?/g, "\n");
  const blocks = normalized.split(/\n{2,}/);
  const cues: Cue[] = [];

  for (const block of blocks) {
    const lines = block.split("\n");
    const trimmed = block.trim();
    if (!trimmed || /^WEBVTT/.test(trimmed) || /^(NOTE|STYLE|REGION)\b/.test(trimmed)) continue;

    // Find the line with the timing arrow.
    let timeIdx = -1;
    for (let i = 0; i < lines.length; i++) {
      if (TIME_LINE.test(lines[i] as string)) {
        timeIdx = i;
        break;
      }
    }
    if (timeIdx === -1) continue;

    const m = TIME_LINE.exec(lines[timeIdx] as string);
    if (!m) continue;
    const start = parseTimecode(m[1] as string);
    const end = parseTimecode(m[2] as string);
    const textLines = lines.slice(timeIdx + 1).join("\n").trim();

    cues.push({ index: cues.length + 1, start, end, text: textLines });
  }

  return cues;
}

/** Re-number cues 1..n in place-order (returns a new array). */
export function renumber(cues: Cue[]): Cue[] {
  return cues.map((c, i) => ({ ...c, index: i + 1 }));
}

/** Serialize cues to SRT. */
export function toSRT(cues: Cue[]): string {
  return (
    renumber(cues)
      .map((c) => `${c.index}\n${formatSRT(c.start)} --> ${formatSRT(c.end)}\n${c.text}`)
      .join("\n\n") + "\n"
  );
}

/** Serialize cues to WebVTT. */
export function toVTT(cues: Cue[]): string {
  const body = cues
    .map((c) => `${formatVTT(c.start)} --> ${formatVTT(c.end)}\n${c.text}`)
    .join("\n\n");
  return `WEBVTT\n\n${body}\n`;
}

/** Convert subtitle text from one format to the other (auto-detects input). */
export function convert(text: string, to: SubtitleFormat): string {
  const cues = parse(text);
  return to === "vtt" ? toVTT(cues) : toSRT(cues);
}

/** Shift every cue by `ms` (can be negative). Times never go below 0. */
export function shift(cues: Cue[], ms: number): Cue[] {
  return cues.map((c) => ({
    ...c,
    start: Math.max(0, c.start + ms),
    end: Math.max(0, c.end + ms),
  }));
}

/** Multiply every timestamp by `factor` (e.g. 25/23.976 for a framerate change). */
export function scale(cues: Cue[], factor: number): Cue[] {
  if (!(factor > 0)) throw new RangeError("captionkit: scale factor must be positive");
  return cues.map((c) => ({
    ...c,
    start: Math.max(0, Math.round(c.start * factor)),
    end: Math.max(0, Math.round(c.end * factor)),
  }));
}

/**
 * Linearly re-time so the first cue starts at `firstStart` and the last cue
 * starts at `lastStart` — the fix for subtitles that slowly drift out of sync.
 *
 * ```ts
 * resync(cues, { firstStart: 1000, lastStart: 600000 });
 * ```
 */
export function resync(cues: Cue[], target: { firstStart: number; lastStart: number }): Cue[] {
  if (cues.length === 0) return [];
  const first = cues[0] as Cue;
  const last = cues[cues.length - 1] as Cue;
  const srcSpan = last.start - first.start;
  if (srcSpan === 0) return shift(cues, target.firstStart - first.start);

  const factor = (target.lastStart - target.firstStart) / srcSpan;
  const map = (t: number) => Math.max(0, Math.round(target.firstStart + (t - first.start) * factor));
  return cues.map((c) => ({ ...c, start: map(c.start), end: map(c.end) }));
}

/** Ensure cues are in order and never overlap (keeps a `minGap` ms between them). */
export function fixOverlaps(cues: Cue[], minGap = 0): Cue[] {
  const sorted = [...cues].sort((a, b) => a.start - b.start);
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1] as Cue;
    const cur = sorted[i] as Cue;
    if (cur.start < prev.end + minGap) {
      sorted[i] = { ...cur, start: prev.end + minGap };
      if (sorted[i]!.end < sorted[i]!.start) sorted[i] = { ...sorted[i]!, end: sorted[i]!.start };
    }
  }
  return renumber(sorted);
}

/** Total on-screen caption duration in milliseconds. */
export function totalDuration(cues: Cue[]): number {
  return cues.reduce((sum, c) => sum + Math.max(0, c.end - c.start), 0);
}
