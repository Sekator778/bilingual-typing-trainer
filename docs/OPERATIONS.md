# Operations

## Dictionary refresh (RU)

This pipeline updates `public/translations.v1.json` using offline FreeDict first,
then DeepL to fill the remaining gaps. All API calls are done locally; the app
never calls DeepL at runtime.

### Prerequisites

- `.env.local` with your DeepL key:

```env
DEEPL_AUTH_KEY=your_key_here
# Optional: DEEPL_API_BASE=https://api-free.deepl.com
```

- FreeDict files present under `tools/dicts/eng-rus/eng-rus/` (see US-010).

### Refresh flow

```bash
npm run build:ru
npm run dict:refresh:ru
```

### Outputs

- `public/translations.v1.json` (updated bundle)
- `tools/cache/deepl-ru-cache.json` (cache, gitignored)

### Notes

- Existing RU entries are never overwritten unless missing.
- The script prints coverage before/after and is safe to rerun.

## Export / Import progress

Users can export their progress from the History screen and import it later on
another device. Import replaces history and merges mistakes to retain the
highest mistake counts.
