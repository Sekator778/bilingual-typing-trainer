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

### Technical Notes (MVP)
- Words for training are loaded from a local static dictionary file
  (`google-10000-english.txt` or derivative).
- Words are treated as lowercase English alphabet strings (`a–z`).
- Word order may be sequential or randomized for MVP.
- 
## Translation strategy (MVP)

- Translation is a dictionary lookup, not a live translator.
- The app uses a local bundled translation table: `en_word -> {ua|ru|de}`.
- `TranslationProvider` must always return a string (including placeholder `—`).
- UI must not implement translation fallbacks; it renders provider output only.
- Online translation (DeepL/Google/LibreTranslate) is out of scope for MVP and may be added as an optional provider in v1.1.
