# Contributing to captionkit

Thanks for taking the time to contribute! 🎉 captionkit aims to be a small,
dependency-free, **correct** subtitle toolkit. Contributions are reviewed with
that in mind.

## Getting started

```bash
git clone https://github.com/didrod205/captionkit.git
cd captionkit
npm install
```

| Command | What it does |
| ------- | ------------ |
| `npm test` | Run the test suite (Vitest). |
| `npm run test:watch` | Re-run tests on change. |
| `npm run typecheck` | Type-check without emitting. |
| `npm run build` | Build the library (`dist/`). |
| `npm run build:web` | Build the web app (`docs/`). |
| `npm run dev` | Run the web app locally (`vite`). |

## Good contributions

- **More formats** (ASS/SSA, SBV, SAMI) — add a parser/serializer.
- **More re-timing tools** (split/merge files, cap line length, CPS warnings).
- **Robustness** for messy real-world files (with a test fixture).

## Rules of the road

1. Every change needs tests. Subtitles are all about edge cases — keep all times
   in integer milliseconds and assert exact values.
2. `npm run typecheck` and `npm test` must pass.
3. Keep the public API small and the package **zero-dependency**.
4. Preserve timecode precision; never lose the millisecond field.

## Reporting bugs

Open an issue with a **minimal subtitle snippet** that reproduces it, the
operation, and what you expected vs. got.

By contributing you agree your contributions are licensed under the project's
[MIT License](./LICENSE).
