## System Design Decisions

- MVP is frontend-only (React + TS)
- No PostgreSQL, no backend for MVP
- Translation is local-first (static dictionaries)
- Pronunciation via Web Speech API
- All providers are abstracted and replaceable
- Backend may be added later without UI changes
- Session starts on Space; Space is not counted as a typed character
- Session history stored in localStorage (`typing.history.v1`) for MVP
- Training stats show words completed only (no target count yet)
- History view reachable via a small header button
- Pronunciation uses Web Speech API; auto-speak default OFF and stored in localStorage (`btt.autoSpeak`)
- Shortcut for speak: Alt+S (Option+S on macOS)

### Word packs (v1.1)
- Training words come from level-specific packs in `src/data/packs/*.txt`.
- Pack format is one word per line, lowercase `a-z` (parser normalizes, filters, and deduplicates).
- WordProvider shuffles the pack, serves words sequentially, and reshuffles after exhaustion.
- Default level is `B1`, stored in localStorage (`typing.level.v1`).
- Empty/invalid packs fall back to a small safe list with a lightweight UI notice.

### Mistakes-only mode (v1.1)
- A word counts as a mistake once per attempt if any incorrect characters were typed before commit.
- Mistakes are stored globally but filtered by the active level pack in Mistakes mode.

### Session presets (v1.1)
- Presets support `byWords` and `byTime` plus `infinite` (default).
- `byWords` completes when `wordsCompleted >= targetWords`; `byTime` completes when elapsed time meets duration.
- Completed sessions are marked `completed`; early exits are stored as `interrupted`.
- Default commit behavior: Enter is required to commit a word.
- Optional setting (Training settings): auto-advance on exact match, which commits without Enter.

## Translation strategy (MVP)

- Translation is a dictionary lookup, not a live translator.
- The app uses a local bundled translation table: `en_word -> {ua|ru|de}`.
- `TranslationProvider` must always return a string (including placeholder `—`).
- UI must not implement translation fallbacks; it renders provider output only.
- Online translation (DeepL/Google/LibreTranslate) is out of scope for MVP and may be added as an optional provider in v1.1.
