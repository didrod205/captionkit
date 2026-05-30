# captionkit — Product & Strategy

Why captionkit exists, who it's for, how it's positioned, and how it could sustain itself.

## 1. Why this idea

Captions are everywhere now — accessibility requirements, silent-autoplay social
video, language learning, SEO. But working with subtitle files is painful: a
player wants WebVTT and you have SRT; the captions play a couple seconds off; or
they slowly drift out of sync by the end. Fixing it by hand means editing dozens
of `00:01:23,456` timestamps without breaking a strict, comma-sensitive format —
and one mistake invalidates the file.

captionkit makes it a 10-second job: convert SRT ⇄ WebVTT, shift, scale, and —
the standout — **resync** to repair drift, all locally with exact millisecond
math. It's a "why didn't I have this?" tool the moment your captions are off.

It fits every constraint: **AI can't reliably replace it** (exact timecode math +
strict format output; an LLM corrupts timestamps), **no server**, **no API key**,
**runs in the browser or any JS runtime**, immediate value, broad creator/marketer
audience.

## 2. Competitor analysis

| Tool | What it does | Gaps captionkit fills |
| ---- | ------------ | --------------------- |
| Online SRT→VTT converters | Convert after upload | **Upload** required; ads; convert only (no re-sync) |
| Subtitle Edit / Aegisub (desktop) | Powerful subtitle editors | Heavy installs; overkill for a quick convert/shift; not a library |
| `subtitle` / `srt` npm libs | Parse/serialize | Library-only; usually one format; little re-timing; no app |
| Video editors | Caption tracks | Re-export the whole video to fix a timestamp; not file-level |

**Nobody** offers a tiny, zero-dependency library **and** a friendly **local**
web app that converts **and** re-times (shift/scale/**resync**/fix-overlaps) with
nothing uploaded.

## 3. Differentiation

1. **Local-first** — your subtitle file never leaves the browser.
2. **Re-timing, not just converting** — shift, scale, **drift-fixing resync**,
   overlap repair.
3. **Exact & tested** — integer-millisecond math, spec-valid SRT/WebVTT output.
4. **Library + app from one core** — devs embed it; creators use the studio.
5. **Zero dependencies**, runs anywhere JS does.

## 4. Folder structure

```
captionkit/
├─ src/        timecode.ts · index.ts (parse/serialize/retime)
├─ test/       deterministic timecode/parse/retime tests
├─ web/        Vite convert + re-sync studio → docs/ (GitHub Pages)
├─ .github/    ci · release · pages workflows, templates, FUNDING
└─ README · LICENSE · CONTRIBUTING · CODE_OF_CONDUCT · CHANGELOG · PRODUCT
```

## 9. GitHub Topics

```
subtitles, srt, vtt, webvtt, captions, srt-to-vtt, subtitle-sync,
subtitle-converter, timecode, video, accessibility, zero-dependency
```

## 10. Product Hunt launch copy

**Tagline:** Convert & re-sync subtitles (SRT ⇄ VTT) in your browser — nothing uploaded.

**Description:**
> Captions in the wrong format, playing 2 seconds late, or drifting out of sync
> by the end? captionkit fixes it locally: convert SRT ⇄ WebVTT, shift the
> timing, scale for framerate, and — the magic one — resync to repair gradual
> drift. Drop a file, fix it, download. Your subtitles never leave your browser.
>
> There's also a zero-dependency npm library for media tooling.
>
> Free & open-source (MIT). 🎬

**First comment (maker):** "I had a 40-minute talk whose captions drifted 6
seconds by the end. Every fixer wanted my file uploaded. So I built a local one
that pins the first and last cue and interpolates the rest."

## 11. npm package name

- **Primary:** `captionkit` (brandable, clear, available).
- Discoverability via keyword topics & SEO below.

## 12. SEO keyword strategy

Intent-rich queries:

- "srt to vtt", "vtt to srt", "convert subtitles online free"
- "shift subtitle timing", "fix out of sync subtitles", "resync subtitles"
- "subtitle converter no upload", "edit srt timecodes"
- "subtitle library javascript", "parse srt npm"

Tactics: descriptive `<title>`/meta on the app (done), README phrasing, per-task
docs ("How to fix subtitles that drift out of sync"), GitHub topics, and the
GitHub Pages app as an indexable landing page.

## 13. Monetization (without breaking the free, local promise)

Core stays free, open-source, local forever.

1. **Sponsorship** — Lemon Squeezy (wired up), with a clear "where it goes" note.
2. **Pro / integrations** — a batch desktop/CLI build, a translation-pairing view,
   a captions-QA linter (CPS/line-length/reading-speed) for teams, or editor
   plugins (Premiere/Resolve companion).
3. **Funded features** — orgs sponsor ASS/SSA support or compliance captioning
   checks.

Guardrails: never upload user files, never add telemetry, never paywall the
existing convert/re-time features.
