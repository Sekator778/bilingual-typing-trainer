#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const URL = 'https://raw.githubusercontent.com/Berehulia/Oxford-3000-5000/main/oxford-5000.csv'
const OUT_DIR = path.resolve('src/data/packs')

// Карта нормализации уровней (на случай, если в CSV они записаны странно)
const LEVEL_MAP = {
    a1: 'a1',
    a2: 'a2',
    b1: 'b1',
    b2: 'b2',
    c1: 'c1',
    c2: 'c2',
}

const ensureDir = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
    }
}

const main = async () => {
    console.log(`⬇️  Downloading Oxford 5000 from GitHub...`)

    try {
        const response = await fetch(URL)
        if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`)
        const text = await response.text()

        console.log(`✅ Downloaded. Parsing...`)

        const lines = text.split(/\r?\n/).filter(line => line.trim())
        if (lines.length === 0) throw new Error('File is empty')

        // Пытаемся понять структуру CSV по заголовку
        // Ожидаем что-то типа: Word,Part of speech,CEFR
        const header = lines[0].toLowerCase().split(',')

        // Ищем индексы колонок
        let wordIdx = header.findIndex(h => h.includes('word') || h.includes('headword'))
        let levelIdx = header.findIndex(h => h.includes('cefr') || h.includes('level'))

        // Если заголовков нет или они не найдены, пробуем стандартную разметку (0 - слово, 2 - уровень)
        if (wordIdx === -1) wordIdx = 0
        if (levelIdx === -1) levelIdx = 2

        console.log(`ℹ️  Columns detected: Word [${wordIdx}], Level [${levelIdx}]`)

        const packs = {}

        // Пропускаем заголовок
        for (let i = 1; i < lines.length; i++) {
            const parts = lines[i].split(',') // Простой сплит, так как в этих списках обычно нет запятых внутри слов

            const word = parts[wordIdx]?.trim().toLowerCase()
            const rawLevel = parts[levelIdx]?.trim().toLowerCase()

            if (!word || !rawLevel) continue

            // Очищаем слово от лишнего (иногда бывает "word (n.)")
            const cleanWord = word.split(' ')[0].replace(/[^a-z-]/g, '')

            if (!cleanWord) continue

            // Определяем уровень
            const level = LEVEL_MAP[rawLevel] || 'other'

            if (!packs[level]) packs[level] = new Set()
            packs[level].add(cleanWord)
        }

        ensureDir(OUT_DIR)

        let totalWords = 0
        for (const [level, wordsSet] of Object.entries(packs)) {
            if (level === 'other') continue // Пропускаем неопознанные уровни, если хотим чистоты

            const filePath = path.join(OUT_DIR, `${level}.txt`)
            const content = Array.from(wordsSet).sort().join('\n')

            fs.writeFileSync(filePath, content)
            console.log(`📦 Created ${level}.txt: ${wordsSet.size} words`)
            totalWords += wordsSet.size
        }

        console.log(`\n🎉 Done! Extracted ${totalWords} words into ${OUT_DIR}`)
        console.log(`👉 Now run: node scripts/generate-packs.mjs`)

    } catch (error) {
        console.error('❌ Error:', error.message)
    }
}

main()