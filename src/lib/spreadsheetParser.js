import * as XLSX from 'xlsx'

export async function parseSpreadsheet(buffer, filename) {
  const ext = filename.toLowerCase().split('.').pop()
  
  if (!['xlsx', 'xls', 'csv'].includes(ext)) {
    throw new Error('Unsupported file type. Please upload .xlsx or .csv')
  }

  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json(firstSheet, { defval: '' })

    if (rows.length === 0) {
      throw new Error('Spreadsheet is empty')
    }

    const columnMapping = {
      'agencia': 'beneficiary_agency',
      'conta': 'beneficiary_account',
      'nome': 'beneficiary_name',
      'cpf': 'beneficiary_document',
      'cnpj': 'beneficiary_document',
      'valor': 'amount',
      'data_pagamento': 'payment_date',
      'data': 'payment_date',
      'banco': 'beneficiary_bank',
      'beneficiary_name': 'beneficiary_name',
      'beneficiary_bank': 'beneficiary_bank',
      'beneficiary_agency': 'beneficiary_agency',
      'beneficiary_account': 'beneficiary_account',
      'amount': 'amount',
      'payment_date': 'payment_date'
    }

    const normalizedRows = rows.map((row) => {
      const normalized = {}
      for (const [key, value] of Object.entries(row)) {
        const normalizedKey = key.trim().toLowerCase().replace(/\s+/g, '_')
        const mappedKey = columnMapping[normalizedKey] || normalizedKey
        normalized[mappedKey] = value
      }

      if (!normalized.beneficiary_bank && normalized.beneficiary_agency) {
        const agencyStr = String(normalized.beneficiary_agency)
        if (agencyStr.startsWith('341') || agencyStr.length >= 4) {
          normalized.beneficiary_bank = '341'
        } else {
          normalized.beneficiary_bank = '001'
        }
      }

      return normalized
    })

    const requiredColumns = [
      'beneficiary_name',
      'beneficiary_agency',
      'beneficiary_account',
      'amount',
      'payment_date'
    ]

    const firstRow = normalizedRows[0]
    const missingColumns = requiredColumns.filter(col => !(col in firstRow))

    if (missingColumns.length > 0) {
      throw new Error('Missing required columns: ' + missingColumns.join(', '))
    }

    return normalizedRows
  } catch (error) {
    if (error.message.includes('Missing required columns')) {
      throw error
    }
    throw new Error('Failed to parse spreadsheet: ' + error.message)
  }
}
