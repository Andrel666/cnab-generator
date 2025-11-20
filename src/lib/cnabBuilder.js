import { loadLayout } from './layoutLoader.js'

function formatField(value, field) {
  const { length, type, decimals, default: defaultValue } = field
  let formatted = value !== undefined && value !== null && value !== '' 
    ? String(value) 
    : (defaultValue !== undefined ? String(defaultValue) : '')
  
  if (type === 'num') {
    formatted = formatted.replace(/[^0-9]/g, '')
    
    if (decimals) {
      const numValue = parseFloat(formatted || '0')
      formatted = Math.round(numValue * Math.pow(10, decimals)).toString()
    }
    
    return formatted.padStart(length, '0').substring(0, length)
  } else {
    return formatted.substring(0, length).padEnd(length, ' ')
  }
}

function buildRecord(recordDef, data) {
  const line = new Array(240).fill(' ')
  const fields = recordDef.fields

  for (const field of fields) {
    const value = data[field.name]
    const formatted = formatField(value, field)

    for (let i = 0; i < field.length; i++) {
      const pos = field.start - 1 + i
      if (pos < 240) {
        line[pos] = formatted[i] || ' '
      }
    }
  }

  return line.join('')
}

function formatDate(dateStr) {
  if (!dateStr) {
    const now = new Date()
    const day = String(now.getDate()).padStart(2, '0')
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const year = now.getFullYear()
    return `${day}${month}${year}`
  }
  
  const date = new Date(dateStr)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}${month}${year}`
}

function formatTime() {
  const now = new Date()
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  return `${hours}${minutes}${seconds}`
}

export async function buildCNAB(layoutKey, rows, companyData = {}) {
  const layout = await loadLayout(layoutKey)
  const lines = []
  
  const companyName = companyData.companyName || 'EMPRESA EXEMPLO LTDA'
  const companyDocument = companyData.companyDocument || '12345678000199'
  const companyType = companyDocument.length === 11 ? '1' : '2'
  
  const headerArquivo = layout.records.HEADER_ARQUIVO
  const headerArquivoData = {
    empresa_tipo_inscricao: companyType,
    empresa_numero_inscricao: companyDocument.padStart(14, '0'),
    empresa_nome: companyName,
    arquivo_data_geracao: formatDate(),
    arquivo_hora_geracao: formatTime()
  }
  lines.push(buildRecord(headerArquivo, headerArquivoData))
  
  const headerLote = layout.records.HEADER_LOTE
  const headerLoteData = {
    empresa_tipo_inscricao: companyType,
    empresa_numero_inscricao: companyDocument.padStart(14, '0'),
    empresa_nome: companyName
  }
  lines.push(buildRecord(headerLote, headerLoteData))
  
  let totalAmount = 0
  let recordCount = 0
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    recordCount++
    
    const segmentoA = layout.records.SEGMENTO_A
    const segmentoData = {
      registro_sequencial: String(recordCount).padStart(5, '0'),
      favorecido_banco: row.beneficiary_bank,
      favorecido_agencia: row.beneficiary_agency,
      favorecido_conta: row.beneficiary_account,
      favorecido_nome: row.beneficiary_name,
      credito_data: formatDate(row.payment_date),
      credito_valor: row.amount
    }
    
    lines.push(buildRecord(segmentoA, segmentoData))
    
    const amount = parseFloat(row.amount || 0)
    totalAmount += amount
  }
  
  const trailerLote = layout.records.TRAILER_LOTE
  const trailerLoteData = {
    quantidade_registros: recordCount + 2,
    valor_total: totalAmount
  }
  lines.push(buildRecord(trailerLote, trailerLoteData))
  
  const trailerArquivo = layout.records.TRAILER_ARQUIVO
  const trailerArquivoData = {
    quantidade_registros: lines.length + 1
  }
  lines.push(buildRecord(trailerArquivo, trailerArquivoData))
  
  return lines.join('\n')
}
