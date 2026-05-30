<div align="center">

# 🎬 captionkit

### Convert and re-sync subtitles — SRT ⇄ WebVTT, shift, fix drift — locally.

[![npm version](https://img.shields.io/npm/v/captionkit.svg?color=success)](https://www.npmjs.com/package/captionkit)
[![bundle size](https://img.shields.io/bundlephobia/minzip/captionkit?label=gzip)](https://bundlephobia.com/package/captionkit)
[![CI](https://github.com/didrod205/captionkit/actions/workflows/ci.yml/badge.svg)](https://github.com/didrod205/captionkit/actions/workflows/ci.yml)
[![types](https://img.shields.io/npm/types/captionkit.svg)](https://www.npmjs.com/package/captionkit)
[![license](https://img.shields.io/npm/l/captionkit.svg)](./LICENSE)

**[🌐 Try the free web app →](https://didrod205.github.io/captionkit/)** &nbsp;·&nbsp; drop a `.srt` or `.vtt`, fix the sync, download. Nothing uploaded.

</div>

---

You exported captions and the player won't take them (it wants WebVTT, you have
SRT). Or the subtitles play **2 seconds late**. Or they slowly **drift out of
sync** by the end of the video. Fixing this by hand means editing dozens of
`00:01:23,456` timestamps without breaking the format — and one stray comma or
missing millisecond makes the whole file invalid.

**captionkit** does it correctly: convert **SRT ⇄ WebVTT**, **shift** every cue,
**scale**/**resync** to fix drift, and **fix overlaps** — with exact
millisecond timecode math, **zero dependencies**, and **100% locally**.

> 📸 _Screenshot / demo GIF:_ `./web/screenshot.png` — record the [live app](https://didrod205.github.io/captionkit/) dropping an out-of-sync SRT and nudging it into place.

## Why it exists

- **AI can't reliably do this.** Re-timing every cue and emitting spec-valid
  SRT/WebVTT (comma vs dot, `WEBVTT` header, numbering rules, CRLF) is exact,
  fiddly format work — a chatbot will quietly corrupt a timestamp. It's a job for
  a small, tested, deterministic tool.
- **Privacy & friction.** Online subtitle converters make you upload your file
  and wait. captionkit runs on your machine, instantly.
- **The drift fix is the "aha".** `resync` linearly maps the first and last cue
  to where they *should* be — repairing subtitles that slip out of sync as the
  video goes on. Most tools only do a flat shift.

## Who it's for

**Video creators & YouTubers**, **marketers** (captioned social video),
**educators**, **accessibility teams**, translators, and **developers** building
media tooling who want a tiny subtitle library.

## Install

**No install —** just open the **[web app](https://didrod205.github.io/captionkit/)**.

For the library:

```bash
npm install captionkit
```

Zero dependencies. ESM + CJS + TypeScript types. Runs in the browser, Node, Deno and Bun.

## Usage

```ts
import { parse, convert, shift, resync, toVTT } from "captionkit";

// Convert SRT → WebVTT (auto-detects the input)
convert(srtText, "vtt");

// Parse, then re-time
const cues = parse(srtText);
shift(cues, 2500);                 // everything 2.5s later
shift(cues, -1000);                // …or earlier (clamped at 0)

// Fix drift: map the first cue to 1.0s and the last to 10:00.0
resync(cues, { firstStart: 1000, lastStart: 600000 });

toVTT(cues); // serialize back out
```

### More re-timing

```ts
import { scale, fixOverlaps, totalDuration } from "captionkit";

scale(cues, 25 / 23.976);   // framerate conversion
fixOverlaps(cues, 40);      // no two cues overlap (40ms min gap)
totalDuration(cues);        // total on-screen time (ms)
```

## API

| Function | Description |
| -------- | ----------- |
| `parse(text)` | Parse SRT or WebVTT → `Cue[]` (`{ index, start, end, text }`, ms). |
| `toSRT(cues)` / `toVTT(cues)` / `convert(text, to)` | Serialize / convert. |
| `detectFormat(text)` | `"srt"` or `"vtt"`. |
| `shift(cues, ms)` | Offset all cues. |
| `scale(cues, factor)` | Multiply all timestamps. |
| `resync(cues, { firstStart, lastStart })` | Linear drift correction. |
| `fixOverlaps(cues, minGap?)` | Remove overlaps. |
| `renumber` / `totalDuration` | Helpers. |
| `parseTimecode` / `formatSRT` / `formatVTT` | Timecode ⇄ ms. |

## FAQ

**Is my subtitle file uploaded anywhere?**
No. Everything runs on your device — no server, no telemetry, works offline.

**What formats are supported?**
SRT and WebVTT today. ASS/SSA and SBV are on the roadmap — [open an issue](https://github.com/didrod205/captionkit/issues).

**What's the difference between shift, scale and resync?**
*Shift* adds a fixed offset (captions are uniformly early/late). *Scale*
multiplies timestamps (framerate mismatch). *Resync* pins the first and last cue
to target times and interpolates the rest — the fix for gradual drift.

**Will it keep my line breaks and styling?**
Multi-line cue text is preserved. Inline WebVTT tags pass through as text; full
ASS styling is not converted (yet).

**Can I use it in a build or batch script?**
Yes — the library works in Node; map the functions over your files.

## Contributing

Contributions welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md) and the
[Code of Conduct](./CODE_OF_CONDUCT.md).

```bash
git clone https://github.com/didrod205/captionkit.git
cd captionkit
npm install
npm test          # run the suite
npm run dev       # run the web app locally
```

## 💖 Sponsor

captionkit is free, MIT-licensed, and built in spare time. If it saved you from
hand-editing timestamps, please consider supporting it:

- ⭐ **Star this repo** — free, and it genuinely helps others find it.
- 🍋 **[Sponsor via Lemon Squeezy](https://elab-studio.lemonsqueezy.com/checkout/buy/5d059b89-51d0-456b-b33a-ed56994f7010)** — one-time or recurring support.

**Where your support goes:** more formats (ASS/SSA, SBV, SAMI), split/merge,
characters-per-second warnings, an auto-shift-by-waveform helper, a CLI,
keeping the free web app online, and fast issue responses.

## License

[MIT](./LICENSE) © captionkit contributors
