/**
 * Timecode parsing/formatting for SRT (`00:01:23,456`) and WebVTT
 * (`00:01:23.456`, with an optional hour part). All times are tracked in
 * integer milliseconds so the math stays exact.
 */

/** Parse `HH:MM:SS,mmm` / `MM:SS.mmm` (SRT or VTT) into milliseconds. */
export function parseTimecode(tc: string): number {
  const m = /^\s*(?:(\d+):)?(\d{1,2}):(\d{2})[.,](\d{1,3})\s*$/.exec(tc);
  if (!m) throw new SyntaxError(`captionkit: invalid timecode "${tc}"`);
  const hours = m[1] ? Number(m[1]) : 0;
  const minutes = Number(m[2]);
  const seconds = Number(m[3]);
  const millis = Number((m[4] as string).padEnd(3, "0"));
  return ((hours * 60 + minutes) * 60 + seconds) * 1000 + millis;
}

const pad = (n: number, len: number): string => String(n).padStart(len, "0");

function parts(ms: number): { h: number; m: number; s: number; ms: number } {
  const clamped = Math.max(0, Math.round(ms));
  return {
    h: Math.floor(clamped / 3_600_000),
    m: Math.floor((clamped % 3_600_000) / 60_000),
    s: Math.floor((clamped % 60_000) / 1000),
    ms: clamped % 1000,
  };
}

/** Format milliseconds as an SRT timecode `HH:MM:SS,mmm`. */
export function formatSRT(ms: number): string {
  const p = parts(ms);
  return `${pad(p.h, 2)}:${pad(p.m, 2)}:${pad(p.s, 2)},${pad(p.ms, 3)}`;
}

/** Format milliseconds as a WebVTT timecode `HH:MM:SS.mmm`. */
export function formatVTT(ms: number): string {
  const p = parts(ms);
  return `${pad(p.h, 2)}:${pad(p.m, 2)}:${pad(p.s, 2)}.${pad(p.ms, 3)}`;
}
