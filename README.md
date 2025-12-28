# Bilingual Typing Trainer

[![CI](https://github.com/Sekator778/bilingual-typing-trainer/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/Sekator778/bilingual-typing-trainer/actions/workflows/ci.yml)

A zero-distraction touch-typing trainer that pairs English typing practice with instant translation and optional pronunciation.

A zero-distraction touch-typing trainer for English words with:
- always-visible translation (RU/UA/DE)
- English pronunciation (Web Speech / TTS)
- session presets (by time / by words)
- mistakes-only mode (focused repetition)
- progress tracking (WPM, accuracy, history)
- export/import progress (local-first)
- offline-first translations bundle with an ops pipeline for dictionary refresh

## Why this exists

Most typing trainers improve speed but don’t help you retain vocabulary meaning.
This app aims to combine touch typing with vocabulary learning:
you type an English word, see the translation immediately, and can listen to pronunciation.

## Features

### Training
- Single-word training with realtime error highlighting
- Commit rule:
  - Default: **Enter** commits the word
  - Optional: **Auto-advance** commits on exact match (no Enter)
- Space-to-start flow to avoid accidental start
- Presets:
  - Infinite
  - By words (e.g. 25/50/100)
  - By time (e.g. 3/5/10 minutes)
- Summary screen after session completion

### Vocabulary
- Translation line is always visible (no hover/click/popups)
- Translation language: **RU / UA / DE**
- Translation provider returns a string (includes placeholder `—` when missing)
- Optional offline dictionary refresh pipeline (see “Operations”)

### Pronunciation
- Speak button near the word
- Auto-speak toggle
- Shortcut support
- Graceful fallback when TTS is unavailable

### Progress
- Session stats: WPM, accuracy, words completed, duration
- History list with metadata (level, mode, preset, outcome)
- Mistakes store per word and “Mistakes only” mode
- Export/Import progress (JSON snapshot)

## Base Setup (Start Screen)

Use the Setup screen to configure a session before training:
- Choose a word pack (level)
- Pick a mode: Normal or Mistakes only
- Select a preset length (infinite, by words, by time)
- Set translation language (RU/UA/DE)
- Toggle auto-advance and auto-speak
- Start training

## Tech Stack
- Vite + React + TypeScript
- Vitest + Testing Library
- Web Speech API for pronunciation
- Local-first persistence (localStorage)
- Offline dictionary bundles in `public/`

## Project Structure (high level)

- `src/`
  - `domain/` — providers, stores, stats, presets, settings
  - `data/` — word lists, packs, static translations
  - screens: `SetupScreen`, `TrainingScreen`, `HistoryScreen`, `SummaryScreen`
- `public/`
  - `translations.v1.json` — generated translations bundle
- `scripts/`
  - dictionary build/refresh scripts (offline)
- `docs/`
  - `DECISIONS.md` — architecture & product decisions
  - `OPERATIONS.md` — runbooks (dictionary refresh, etc.)
  - `ATTRIBUTION.md` — data sources and licensing

## Getting Started

### Requirements
- Node.js 18+ (recommended: latest LTS)
- npm

### Install
```bash
npm install
````

### Run locally

```bash
npm run dev
```

### Tests / Lint / Build

```bash
npm run test:run
npm run lint
npm run build
```

## Word Packs (Levels)

The trainer supports curated level packs (A2/B1/B2/TOEFL/TECH).
Packs are plain text files (one word per line, `a-z` only).

## Translations: Offline-first bundle

The app loads translations from:

* `public/translations.v1.json` (bundle)
* optional static translations in code (fallback/other langs)

If a word has no translation, the UI shows a placeholder `—`.

## Operations (Maintainers)

### Build RU bundle from FreeDict (base)

See `docs/OPERATIONS.md` for exact steps and file placement.

### Refresh/enrich translations (DeepL, offline only)

This is an **offline maintenance step** that updates `public/translations.v1.json`.
It is never called from the browser runtime and requires an API key in `.env.local`.

See `docs/OPERATIONS.md`.

## Export / Import

Export creates a JSON snapshot (settings + history + mistakes).
Import validates schema and applies the snapshot (with safe merge rules).

## Data Sources & Licensing

Dictionary sources and licenses are documented in:

* `docs/ATTRIBUTION.md`

## Roadmap / Ideas

* Topics (IT/Daily/Business) as a filter over packs
* UA/DE dictionary pipelines similar to RU
* IndexedDB storage (optional) for larger datasets
* Admin dictionary UI (requires backend + auth)

## Contributing

PRs welcome. Please:

* keep changes small and well-tested
* run `npm run test:run && npm run lint && npm run build` before submitting

## License

See repository license file(s) and `docs/ATTRIBUTION.md` for third-party data licensing.
