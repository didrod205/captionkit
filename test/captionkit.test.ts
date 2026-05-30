import { describe, expect, it } from "vitest";
import {
  convert,
  detectFormat,
  fixOverlaps,
  formatSRT,
  formatVTT,
  parse,
  parseTimecode,
  resync,
  scale,
  shift,
  toSRT,
  toVTT,
  totalDuration,
  type Cue,
} from "../src/index.js";

const SRT = `1
00:00:01,000 --> 00:00:04,000
Hello world

2
00:00:05,500 --> 00:00:08,250
Second line
wraps here
`;

const VTT = `WEBVTT

00:00:01.000 --> 00:00:04.000
Hello world

00:00:05.500 --> 00:00:08.250
Second line
`;

describe("timecode", () => {
  it("parses SRT and VTT timecodes", () => {
    expect(parseTimecode("00:00:01,000")).toBe(1000);
    expect(parseTimecode("00:01:23.456")).toBe(83456);
    expect(parseTimecode("01:00:00,000")).toBe(3_600_000);
    expect(parseTimecode("00:05.250")).toBe(5250); // MM:SS.mmm
  });

  it("formats both styles", () => {
    expect(formatSRT(83456)).toBe("00:01:23,456");
    expect(formatVTT(83456)).toBe("00:01:23.456");
    expect(formatSRT(1000)).toBe("00:00:01,000");
  });

  it("throws on invalid input", () => {
    expect(() => parseTimecode("nope")).toThrow(SyntaxError);
  });
});

describe("parse", () => {
  it("parses SRT into cues", () => {
    const cues = parse(SRT);
    expect(cues).toHaveLength(2);
    expect(cues[0]).toMatchObject({ index: 1, start: 1000, end: 4000, text: "Hello world" });
    expect(cues[1]!.text).toBe("Second line\nwraps here");
  });

  it("parses VTT (header, dot timecodes, no cue numbers)", () => {
    const cues = parse(VTT);
    expect(cues).toHaveLength(2);
    expect(cues[0]).toMatchObject({ start: 1000, end: 4000, text: "Hello world" });
  });

  it("tolerates CRLF and a BOM", () => {
    const cues = parse("﻿1\r\n00:00:01,000 --> 00:00:02,000\r\nHi\r\n");
    expect(cues[0]).toMatchObject({ start: 1000, end: 2000, text: "Hi" });
  });

  it("skips NOTE/STYLE blocks in VTT", () => {
    const cues = parse("WEBVTT\n\nNOTE this is a comment\n\n00:00:01.000 --> 00:00:02.000\nHi");
    expect(cues).toHaveLength(1);
  });
});

describe("detectFormat", () => {
  it("detects vtt and srt", () => {
    expect(detectFormat(VTT)).toBe("vtt");
    expect(detectFormat(SRT)).toBe("srt");
  });
});

describe("convert", () => {
  it("SRT → VTT", () => {
    const out = convert(SRT, "vtt");
    expect(out.startsWith("WEBVTT")).toBe(true);
    expect(out).toContain("00:00:01.000 --> 00:00:04.000");
    expect(out).not.toContain(",000");
  });

  it("VTT → SRT", () => {
    const out = convert(VTT, "srt");
    expect(out).toContain("1\n00:00:01,000 --> 00:00:04,000");
    expect(out).toContain(",");
  });

  it("round-trips SRT → VTT → SRT", () => {
    expect(toSRT(parse(convert(SRT, "vtt")))).toBe(toSRT(parse(SRT)));
  });
});

describe("retiming", () => {
  const cues = parse(SRT);

  it("shifts forward and backward (clamped at 0)", () => {
    expect(shift(cues, 2000)[0]).toMatchObject({ start: 3000, end: 6000 });
    expect(shift(cues, -5000)[0]!.start).toBe(0);
  });

  it("scales timestamps", () => {
    const out = scale(cues, 2);
    expect(out[0]).toMatchObject({ start: 2000, end: 8000 });
    expect(() => scale(cues, 0)).toThrow(RangeError);
  });

  it("resyncs first/last cue to targets (fixes drift)", () => {
    const out = resync(cues, { firstStart: 0, lastStart: 9000 });
    expect(out[0]!.start).toBe(0);
    expect(out[out.length - 1]!.start).toBe(9000);
  });

  it("fixes overlaps with a minimum gap", () => {
    const overlapping: Cue[] = [
      { index: 1, start: 0, end: 3000, text: "a" },
      { index: 2, start: 2000, end: 4000, text: "b" },
    ];
    const out = fixOverlaps(overlapping, 100);
    expect(out[1]!.start).toBeGreaterThanOrEqual(out[0]!.end + 100);
  });
});

describe("helpers", () => {
  it("computes total on-screen duration", () => {
    expect(totalDuration(parse(SRT))).toBe(3000 + 2750);
  });

  it("renumbers on serialize", () => {
    const cues = parse(SRT).slice(1); // starts at index 2
    expect(toSRT(cues).startsWith("1\n")).toBe(true);
  });
});
