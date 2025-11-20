import { loadLayout } from './layoutLoader.js'

/**
 * Formats a value according to XML requirements
 */
function formatXMLValue(value, field) {
  if (value === null || value === undefined || value === '') {
    return ''
  }

  let str = String(value).trim()

  // Escape XML special characters
  str = str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

  return str
}

/**
 * Formats a date to ISO 8601 format (YYYY-MM-DD)
 */
function formatDate(dateValue) {
  if (!dateValue) {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  let date
  if (dateValue instanceof Date) {
    date = dateValue
  } else {
    const str = String(dateValue).trim()

    // Try DD/MM/YYYY format
    if (str.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      const [day, month, year] = str.split('/')
      date = new Date(year, month - 1, day)
    }
    // Try YYYY-MM-DD format
    else if (str.match(/^\d{4}-\d{2}-\d{2}$/)) {
      date = new Date(str)
    }
    // Try parsing as-is
    else {
      date = new Date(str)
    }
  }

  if (isNaN(date.getTime())) {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  return date.toISOString().split('T')[0]
}

/**
 * Formats a time to HH:MM:SS format
 */
function formatTime() {
  const now = new Date()
  return now.toTimeString().split(' ')[0]
}

/**
 * Formats a currency amount to decimal format with 2 decimal places
 */
function formatAmount(value) {
  if (value === null || value === undefined || value === '') {
    return '0.00'
  }

  let num
  if (typeof value === 'number') {
    num = value
  } else {
    const str = String(value).trim().replace(/[^\d,.-]/g, '').replace(',', '.')
    num = parseFloat(str)
  }

  if (isNaN(num)) {
    return '0.00'
  }

  return num.toFixed(2)
}

/**
 * Cleans and formats CPF/CNPJ
 */
function formatDocument(value) {
  if (!value) return ''
  return String(value).replace(/[^\d]/g, '')
}

/**
 * Builds XML header section
 */
function buildHeader(layout, companyData, remittanceNumber = 1) {
  const { header } = layout.fields
  const { schema } = layout

  let xml = `<?xml version="${schema.version}" encoding="${schema.encoding}"?>\n`
  xml += `<${schema.rootElement} xmlns="${schema.namespace}">\n`
  xml += `  <Header>\n`
  xml += `    <CodigoBanco>${formatXMLValue(layout.bankCode)}</CodigoBanco>\n`
  xml += `    <NomeEmpresa>${formatXMLValue(companyData.company_name || '')}</NomeEmpresa>\n`
  xml += `    <DocumentoEmpresa>${formatDocument(companyData.company_document || '')}</DocumentoEmpresa>\n`
  xml += `    <DataGeracao>${formatDate()}</DataGeracao>\n`
  xml += `    <HoraGeracao>${formatTime()}</HoraGeracao>\n`
  xml += `    <NumeroRemessa>${remittanceNumber}</NumeroRemessa>\n`
  xml += `  </Header>\n`
  xml += `  <Pagamentos>\n`

  return xml
}

/**
 * Builds a payment record in XML format
 */
function buildPayment(layout, paymentData, sequenceNumber) {
  const { payment } = layout.fields

  let xml = `    <Pagamento>\n`
  xml += `      <NumeroSequencial>${sequenceNumber}</NumeroSequencial>\n`
  xml += `      <NumeroDocumento>${formatXMLValue(paymentData.document_number || sequenceNumber)}</NumeroDocumento>\n`
  xml += `      <NomeBeneficiario>${formatXMLValue(paymentData.beneficiary_name)}</NomeBeneficiario>\n`
  xml += `      <DocumentoBeneficiario>${formatDocument(paymentData.beneficiary_document || '')}</DocumentoBeneficiario>\n`
  xml += `      <CodigoBanco>${formatXMLValue(paymentData.beneficiary_bank || layout.bankCode)}</CodigoBanco>\n`
  xml += `      <Agencia>${formatXMLValue(paymentData.beneficiary_agency)}</Agencia>\n`
  xml += `      <Conta>${formatXMLValue(paymentData.beneficiary_account)}</Conta>\n`
  xml += `      <ValorPagamento>${formatAmount(paymentData.amount)}</ValorPagamento>\n`
  xml += `      <DataPagamento>${formatDate(paymentData.payment_date)}</DataPagamento>\n`
  xml += `      <FinalidadePagamento>${formatXMLValue(paymentData.payment_purpose || 'Pagamento')}</FinalidadePagamento>\n`
  xml += `      <CodigoFinalidade>${payment.codigoFinalidade}</CodigoFinalidade>\n`
  xml += `    </Pagamento>\n`

  return xml
}

/**
 * Builds XML footer section
 */
function buildFooter(layout, totalRecords, totalAmount) {
  const { schema } = layout

  let xml = `  </Pagamentos>\n`
  xml += `  <Trailer>\n`
  xml += `    <QuantidadeRegistros>${totalRecords}</QuantidadeRegistros>\n`
  xml += `    <ValorTotal>${formatAmount(totalAmount)}</ValorTotal>\n`
  xml += `  </Trailer>\n`
  xml += `</${schema.rootElement}>\n`

  return xml
}

/**
 * Main function to build XML file
 */
export async function buildXML(layoutKey, payments, companyData = {}) {
  const layout = await loadLayout(layoutKey)

  if (!layout || layout.format !== 'XML') {
    throw new Error(`Layout ${layoutKey} is not configured for XML format`)
  }

  if (!Array.isArray(payments) || payments.length === 0) {
    throw new Error('No payment records provided')
  }

  let xml = buildHeader(layout, companyData)

  let totalAmount = 0
  payments.forEach((payment, index) => {
    xml += buildPayment(layout, payment, index + 1)
    const amount = parseFloat(formatAmount(payment.amount))
    totalAmount += amount
  })

  xml += buildFooter(layout, payments.length, totalAmount)

  return xml
}
