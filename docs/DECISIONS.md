## System Design Decisions

- MVP is frontend-only (React + TS)
- No PostgreSQL, no backend for MVP
- Translation is local-first (static dictionaries)
- Pronunciation via Web Speech API
- All providers are abstracted and replaceable
- Backend may be added later without UI changes

### Technical Notes (MVP)
- Words for training are loaded from a local static dictionary file
  (`google-10000-english.txt` or derivative).
- Words are treated as lowercase English alphabet strings (`a–z`).
- Word order may be sequential or randomized for MVP.

