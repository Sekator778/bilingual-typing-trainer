# TODO (Backlog)

## Now (v0.1)
- [x] Create `TrainingScreen` with a hardcoded word list
- [x] Implement input handling (type/backspace/enter)
- [x] Minimal error highlighting
- [x] Move to next word when correct
- [x] Keep input focused after each transition

## Next (v0.2)
- [x] Add `translations` map (local)
- [x] Show translation under the word (always visible)
- [x] Add language selector (UA/RU/DE)
- [x] Add toggle: voice on/off (optional in v0.2)

## Later (v0.3)
- [x] Implement WPM + accuracy
- [x] Persist settings + session history
- [x] Add History screen
- [x] US-004 Pronunciation (TTS, Web Speech API)
- [x] (Polish) 1-line ellipsis translation

## v1.0
- [ ] UI polish (zero-distraction)
- [ ] Deploy
- [ ] Documentation cleanup

## v1.1
- [x] US-005 Level selection + word packs
- [ ] Topics v1.1.1 (pack filtering)
- [x] US-006 Mistakes-only mode
- [ ] US-007 Presets (time/word count)

## US-010 Offline RU translations (FreeDict)

- [ ] US-010a Generator: build RU translations bundle (intersection with 10k)
- [ ] US-010b App: load translations bundle + integrate into TranslationProvider
- [ ] US-010c Docs: attribution/licensing + gitignore for raw dict files
