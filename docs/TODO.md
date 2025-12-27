# TODO (Backlog)

## Now (v0.1)
- [ ] Create `TrainingScreen` with a hardcoded word list
- [ ] Implement input handling (type/backspace/enter)
- [ ] Minimal error highlighting
- [ ] Move to next word when correct
- [ ] Keep input focused after each transition

## Next (v0.2)
- [ ] Add `translations` map (local)
- [ ] Show translation under the word (always visible)
- [ ] Add language selector (UA/RU/DE)
- [ ] Add toggle: voice on/off (optional in v0.2)

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

## US-010 Offline RU translations (FreeDict)

- [ ] US-010a Generator: build RU translations bundle (intersection with 10k)
- [ ] US-010b App: load translations bundle + integrate into TranslationProvider
- [ ] US-010c Docs: attribution/licensing + gitignore for raw dict files

