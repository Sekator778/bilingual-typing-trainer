import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')

const WORD_LIST_PATH = path.join(
  repoRoot,
  'src',
  'data',
  'raw',
  'google-10000-english.txt',
)
const DICT_DIR = path.join(repoRoot, 'tools', 'dicts', 'eng-rus', 'eng-rus')
const IDX_PATH = path.join(DICT_DIR, 'eng-rus.idx.gz')
const DICT_PATH = path.join(DICT_DIR, 'eng-rus.dict.dz')
const OUTPUT_PATH = path.join(repoRoot, 'public', 'translations.v1.json')
const PLACEHOLDER = '—'

const parseWordList = (raw) => {
  const words = []
  const seen = new Set()
  for (const line of raw.split(/\r?\n/)) {
    const normalized = line.trim().toLowerCase()
    if (!normalized || !/^[a-z]+$/.test(normalized) || seen.has(normalized)) {
      continue
    }
    seen.add(normalized)
    words.push(normalized)
  }
  return words
}

const normalizeRu = (value) => {
  if (typeof value !== 'string') {
    return ''
  }
  const trimmed = value.trim()
  if (!trimmed || trimmed === PLACEHOLDER || trimmed === 'undefined') {
    return ''
  }
  return trimmed
}

const hasValue = (value) => {
  if (typeof value === 'string') {
    return value.trim().length > 0 && value.trim() !== PLACEHOLDER
  }
  return Boolean(value)
}

const cleanTranslation = (text) => {
  return text.replace(/\[\[|\]\]/g, '').replace(/\s+/g, ' ').trim()
}

const extractTranslation = (definition) => {
  const divRegex = /<div>([^<]*[А-Яа-яЁё][^<]*)<\/div>/g
  for (const match of definition.matchAll(divRegex)) {
    const candidate = cleanTranslation(match[1])
    if (candidate && /[А-Яа-яЁё]/.test(candidate)) {
      return candidate
    }
  }

  const stripped = definition.replace(/<[^>]+>/g, ' ')
  const plain = stripped.replace(/\s+/g, ' ').trim()
  const fallback = plain.match(/([А-Яа-яЁё][^;,.]+)/)
  if (fallback) {
    const candidate = cleanTranslation(fallback[1])
    if (candidate && /[А-Яа-яЁё]/.test(candidate)) {
      return candidate
    }
  }

  return null
}

const loadDictionaryBuffers = () => {
  const idxCompressed = fs.readFileSync(IDX_PATH)
  const dictCompressed = fs.readFileSync(DICT_PATH)
  return {
    idx: zlib.gunzipSync(idxCompressed),
    dict: zlib.gunzipSync(dictCompressed),
  }
}

const loadExistingBundle = () => {
  if (!fs.existsSync(OUTPUT_PATH)) {
    return {}
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf8'))
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

const buildBundle = () => {
  const rawWordList = fs.readFileSync(WORD_LIST_PATH, 'utf8')
  const words = parseWordList(rawWordList)
  const wordSet = new Set(words)
  const existing = loadExistingBundle()
  const { idx, dict } = loadDictionaryBuffers()

  const ruMap = new Map()

  let offset = 0
  while (offset < idx.length) {
    const zero = idx.indexOf(0, offset)
    if (zero === -1) {
      break
    }
    const word = idx.slice(offset, zero).toString('utf8')
    const entryOffset = idx.readUInt32BE(zero + 1)
    const size = idx.readUInt32BE(zero + 5)

    if (wordSet.has(word)) {
      const definition = dict.slice(entryOffset, entryOffset + size).toString('utf8')
      const translation = extractTranslation(definition)
      if (translation && !ruMap.has(word)) {
        ruMap.set(word, translation)
      }
    }

    offset = zero + 9
  }

  const result = {}
  let ruCount = 0

  for (const word of words) {
    const base =
      existing[word] && typeof existing[word] === 'object' ? { ...existing[word] } : {}
    const ruFromDict = ruMap.get(word)

    if (ruFromDict) {
      base.ru = ruFromDict
    } else if (!normalizeRu(base.ru)) {
      delete base.ru
    }

    if (normalizeRu(base.ru)) {
      ruCount += 1
    }

    const hasOtherLang = Object.entries(base).some(
      ([key, value]) => key !== 'ru' && hasValue(value),
    )
    if (normalizeRu(base.ru) || hasOtherLang) {
      result[word] = base
    }
  }

  const coverage = ((ruCount / words.length) * 100).toFixed(2)
  console.log(`RU coverage: ${ruCount}/${words.length} (${coverage}%)`)

  const orderedKeys = Object.keys(result).sort()
  const orderedResult = {}
  for (const key of orderedKeys) {
    orderedResult[key] = result[key]
  }

  return orderedResult
}

const bundle = buildBundle()
fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(bundle, null, 2)}\n`)
console.log(`Wrote ${Object.keys(bundle).length} entries to ${OUTPUT_PATH}`)
