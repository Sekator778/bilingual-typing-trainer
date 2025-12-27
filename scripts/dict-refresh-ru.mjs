#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const ENV_PATH = path.resolve(process.cwd(), '.env.local')
const WORD_LIST_PATH = path.resolve('src/data/raw/google-10000-english.txt')
const BUNDLE_PATH = path.resolve('public/translations.v1.json')
const CACHE_DIR = path.resolve('tools/cache')
const CACHE_PATH = path.join(CACHE_DIR, 'deepl-ru-cache.json')
const PLACEHOLDER = '—'
const DEFAULT_API_BASE = 'https://api-free.deepl.com'
const BATCH_SIZE = 40
const BATCH_DELAY_MS = 250

const loadEnvLocal = () => {
  if (!fs.existsSync(ENV_PATH)) {
    return
  }
  const content = fs.readFileSync(ENV_PATH, 'utf8')
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) {
      continue
    }
    const index = trimmed.indexOf('=')
    if (index <= 0) {
      continue
    }
    const key = trimmed.slice(0, index).trim()
    let value = trimmed.slice(index + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (!process.env[key]) {
      process.env[key] = value
    }
  }
}

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

const readJson = (filePath, fallback) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch {
    return fallback
  }
}

const writeJson = (filePath, obj) => {
  fs.writeFileSync(filePath, `${JSON.stringify(obj, null, 2)}\n`, 'utf8')
}

const pickFirstTranslation = (text) => {
  const line = String(text).split(/\r?\n/)[0].trim()
  if (!line) {
    return ''
  }
  const first = line.split(';')[0].split(' / ')[0].split(' | ')[0].trim()
  return first
}

const normalizeRu = (text) => {
  if (typeof text !== 'string') {
    return ''
  }
  const trimmed = text.trim()
  if (!trimmed || trimmed === PLACEHOLDER || trimmed === 'undefined') {
    return ''
  }
  return trimmed
}

const getEntryRu = (entry) => {
  if (!entry || typeof entry !== 'object') {
    return undefined
  }
  return entry.ru
}

const isMissingRu = (entry) => !normalizeRu(getEntryRu(entry))

const ensureDir = (dirPath) => {
  fs.mkdirSync(dirPath, { recursive: true })
}

const countCoverage = (words, bundle) => {
  let count = 0
  for (const word of words) {
    if (!isMissingRu(bundle[word])) {
      count += 1
    }
  }
  return count
}

const deeplTranslateBatch = async ({ apiBase, authKey, texts }) => {
  const url = `${apiBase.replace(/\/$/, '')}/v2/translate`
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `DeepL-Auth-Key ${authKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: texts,
      source_lang: 'EN',
      target_lang: 'RU',
    }),
  })

  if (!response.ok) {
    const message = await response.text().catch(() => '')
    throw new Error(`DeepL HTTP ${response.status}: ${message.slice(0, 400)}`)
  }

  const json = await response.json()
  return Array.isArray(json.translations)
    ? json.translations.map((item) => item.text)
    : []
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const main = async () => {
  loadEnvLocal()

  const authKey = process.env.DEEPL_AUTH_KEY
  const apiBase = process.env.DEEPL_API_BASE || DEFAULT_API_BASE
  if (!authKey) {
    console.error('Missing DEEPL_AUTH_KEY. Set it in .env.local (not committed).')
    process.exit(2)
  }

  if (!fs.existsSync(WORD_LIST_PATH)) {
    throw new Error(`Word list not found: ${WORD_LIST_PATH}`)
  }
  if (!fs.existsSync(BUNDLE_PATH)) {
    throw new Error(`Bundle not found: ${BUNDLE_PATH}`)
  }

  const words = parseWordList(fs.readFileSync(WORD_LIST_PATH, 'utf8'))
  const wordSet = new Set(words)

  const rawBundle = readJson(BUNDLE_PATH, {})
  const bundle = {}
  for (const [key, value] of Object.entries(rawBundle)) {
    if (!wordSet.has(key)) {
      continue
    }
    bundle[key] = typeof value === 'object' && value !== null ? { ...value } : {}
  }

  ensureDir(CACHE_DIR)
  const cache = readJson(CACHE_PATH, {})
  let updatedFromCache = false

  for (const word of words) {
    if (!isMissingRu(bundle[word])) {
      continue
    }
    const cached = normalizeRu(cache[word])
    if (cached) {
      bundle[word] = { ...(bundle[word] || {}), ru: cached }
      updatedFromCache = true
    }
  }

  const beforeCount = countCoverage(words, bundle)
  console.log(
    `Before: RU coverage ${beforeCount}/${words.length} (${(
      (beforeCount / words.length) *
      100
    ).toFixed(2)}%)`,
  )

  const missing = words.filter((word) => {
    if (!isMissingRu(bundle[word])) {
      return false
    }
    const cached = normalizeRu(cache[word])
    return !cached
  })

  console.log(`Missing for DeepL: ${missing.length}`)
  if (missing.length === 0) {
    if (updatedFromCache) {
      const ordered = {}
      for (const key of Object.keys(bundle).sort()) {
        ordered[key] = bundle[key]
      }
      writeJson(BUNDLE_PATH, ordered)
      console.log('Bundle updated from cache.')
    } else {
      console.log('Nothing to enrich. Exiting.')
    }
    return
  }

  for (let i = 0; i < missing.length; i += BATCH_SIZE) {
    const batch = missing.slice(i, i + BATCH_SIZE)
    const translations = await deeplTranslateBatch({
      apiBase,
      authKey,
      texts: batch,
    })

    for (let j = 0; j < batch.length; j += 1) {
      const word = batch[j]
      const ru = normalizeRu(pickFirstTranslation(translations[j] || ''))
      if (!ru) {
        continue
      }
      cache[word] = ru
      bundle[word] = { ...(bundle[word] || {}), ru }
    }

    writeJson(CACHE_PATH, cache)
    console.log(`Enriched ${Math.min(i + BATCH_SIZE, missing.length)}/${missing.length}`)
    if (BATCH_DELAY_MS > 0) {
      await sleep(BATCH_DELAY_MS)
    }
  }

  const ordered = {}
  for (const key of Object.keys(bundle).sort()) {
    ordered[key] = bundle[key]
  }
  writeJson(BUNDLE_PATH, ordered)

  const afterCount = countCoverage(words, ordered)
  console.log(
    `After: RU coverage ${afterCount}/${words.length} (${(
      (afterCount / words.length) *
      100
    ).toFixed(2)}%)`,
  )
  console.log(`Cache: ${CACHE_PATH}`)
  console.log(`Bundle updated: ${BUNDLE_PATH}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
