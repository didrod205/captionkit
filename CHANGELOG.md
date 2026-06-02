# Changelog

All notable changes to this project are documented in this file. The format is
based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this
project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0]

### Added

- **Command-line interface** (`captionkit` bin), zero-dependency: `convert` (SRT⇄VTT), `shift` (--ms), `scale` (--factor), `fix` (remove overlaps), and `info`. Reads a file or stdin; writes stdout or `-o`.

## [0.1.0]

### Added

- Initial release.
- `parse` (SRT & WebVTT, tolerant of BOM/CRLF/headers/missing numbers),
  `toSRT`, `toVTT`, `convert`, `detectFormat`.
- Re-timing: `shift`, `scale`, `resync` (linear drift correction),
  `fixOverlaps`, `renumber`, `totalDuration`.
- Exact millisecond `parseTimecode` / `formatSRT` / `formatVTT`.
- Free, local-only web app (convert + re-sync + download) on GitHub Pages.
- Zero runtime dependencies; ESM + CJS + TypeScript types.

[Unreleased]: https://github.com/didrod205/captionkit/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/didrod205/captionkit/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/didrod205/captionkit/releases/tag/v0.1.0
