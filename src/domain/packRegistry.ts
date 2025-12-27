import type { Level } from './levels'

type PackRegistry = Record<Level, string>

const packModules = import.meta.glob('../data/packs/*.txt', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const toPackName = (filePath: string): Level | null => {
  const parts = filePath.split('/')
  const fileName = parts[parts.length - 1]
  if (!fileName) {
    return null
  }
  const baseName = fileName.replace(/\.txt$/i, '').trim()
  if (!baseName) {
    return null
  }
  return baseName.toUpperCase()
}

const registry: PackRegistry = Object.entries(packModules).reduce((acc, [path, raw]) => {
  const name = toPackName(path)
  if (!name) {
    return acc
  }
  acc[name] = typeof raw === 'string' ? raw : String(raw)
  return acc
}, {} as PackRegistry)

export const getPackNames = (): Level[] => Object.keys(registry).sort()

export const getPackRaw = (level: Level): string => registry[level] ?? ''

export const formatPackLabel = (level: Level): string =>
  level.replace(/[-_]+/g, ' ').toUpperCase()
