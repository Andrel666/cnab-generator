import { readFile } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const layoutCache = new Map()

export async function loadLayout(layoutKey) {
  if (layoutCache.has(layoutKey)) {
    return layoutCache.get(layoutKey)
  }

  const layoutPath = join(__dirname, '../../layouts', `${layoutKey}.json`)
  
  try {
    const data = await readFile(layoutPath, 'utf-8')
    const layout = JSON.parse(data)
    layoutCache.set(layoutKey, layout)
    return layout
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`Layout '${layoutKey}' not found. Available layouts: itau, bb`)
    }
    throw new Error(`Failed to load layout: ${error.message}`)
  }
}

export async function getAllLayouts() {
  const layouts = []
  const keys = ['itau', 'bb', 'bradesco', 'santander', 'caixa']

  for (const key of keys) {
    try {
      const layout = await loadLayout(key)
      layouts.push({
        key,
        bankCode: layout.bankCode,
        bankName: layout.bankName,
        standard: layout.standard || layout.format,
        format: layout.format || 'CNAB240'
      })
    } catch (error) {
      console.error(`Failed to load layout ${key}:`, error)
    }
  }

  return layouts
}
