const PLACEHOLDER = '—'

export const normalizeRu = (text) => {
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

export const isMissingRu = (entry) => !normalizeRu(getEntryRu(entry))

export const filterBundle = (rawBundle, wordSet) => {
  if (!rawBundle || typeof rawBundle !== 'object') {
    return {}
  }

  const bundle = {}
  for (const [key, value] of Object.entries(rawBundle)) {
    if (!wordSet.has(key)) {
      continue
    }
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      bundle[key] = { ...value }
    } else {
      bundle[key] = {}
    }
  }
  return bundle
}

export const applyCacheToBundle = (words, bundle, cache) => {
  const nextBundle = { ...bundle }
  let updatedFromCache = false

  for (const word of words) {
    if (!isMissingRu(nextBundle[word])) {
      continue
    }
    const cached = normalizeRu(cache[word])
    if (!cached) {
      continue
    }
    const base =
      nextBundle[word] && typeof nextBundle[word] === 'object'
        ? { ...nextBundle[word] }
        : {}
    base.ru = cached
    nextBundle[word] = base
    updatedFromCache = true
  }

  return { bundle: nextBundle, updatedFromCache }
}

export const getMissingWords = (words, bundle, cache) => {
  return words.filter((word) => {
    if (!isMissingRu(bundle[word])) {
      return false
    }
    const cached = normalizeRu(cache[word])
    return !cached
  })
}
