# XML Generation Feature

## Overview
The CNAB Generator now supports XML format generation for Brazilian banks in addition to the existing CNAB240 format.

## Supported Formats

### CNAB240 Format (Text)
- **Itaú (341)** - CNAB240
- **Banco do Brasil (001)** - CNAB240

### XML Format
- **Bradesco (237)** - FEBRABAN XML
- **Santander (033)** - FEBRABAN XML
- **Caixa Econômica Federal (104)** - FEBRABAN XML

## Architecture

### Backend Components

#### 1. XML Builder (`src/lib/xmlBuilder.js`)
- Generates XML payment remittance files
- Supports FEBRABAN standard XML schema
- Features:
  - XML escaping for special characters
  - Date formatting (ISO 8601)
  - Currency formatting (2 decimal places)
  - Document (CPF/CNPJ) normalization
  - Automatic totals calculation

#### 2. Layout Definitions (`layouts/*.json`)
Each XML bank has a JSON layout file defining:
- Bank code and name
- XML schema details (root element, namespace)
- Field mappings for header and payment records
- Bank-specific configuration (e.g., payment purpose codes)

Example structure:
```json
{
  "bankCode": "237",
  "bankName": "Bradesco",
  "format": "XML",
  "standard": "FEBRABAN",
  "schema": {
    "rootElement": "DocumentoCobranca",
    "namespace": "http://www.bradesco.com.br/cobranca",
    "encoding": "UTF-8"
  },
  "fields": {
    "header": { ... },
    "payment": { ... }
  }
}
```

#### 3. API Updates (`src/index.js`)
- Automatically detects layout format (CNAB vs XML)
- Routes to appropriate builder based on format
- Sets correct Content-Type headers:
  - `text/plain` for CNAB files
  - `application/xml` for XML files

### Frontend Components

#### Updated Components
- **LayoutSelector.tsx**: Displays format information for each bank
- **App.tsx**: Updated footer to show both CNAB and XML banks

## XML File Structure

Generated XML files include:
1. **Header Section**
   - Bank code
   - Company name and document
   - Generation date and time
   - Remittance number

2. **Payments Section**
   - Sequential number
   - Document number
   - Beneficiary information (name, document, bank, agency, account)
   - Payment amount
   - Payment date
   - Payment purpose

3. **Trailer Section**
   - Total number of records
   - Total payment amount

## Usage

### API Request
```bash
curl -X POST http://localhost:3000/api/generate \
  -F "file=@sample.csv" \
  -F "layout=bradesco" \
  -F "companyName=My Company" \
  -F "companyDocument=12345678000199"
```

### Response
- For XML layouts: Returns `.xml` file with `application/xml` content type
- For CNAB layouts: Returns `.txt` file with `text/plain` content type

## Sample XML Output

```xml
<?xml version="1.0" encoding="UTF-8"?>
<DocumentoCobranca xmlns="http://www.bradesco.com.br/cobranca">
  <Header>
    <CodigoBanco>237</CodigoBanco>
    <NomeEmpresa>Test Company</NomeEmpresa>
    <DocumentoEmpresa>12345678000199</DocumentoEmpresa>
    <DataGeracao>2025-11-20</DataGeracao>
    <HoraGeracao>14:38:41</HoraGeracao>
    <NumeroRemessa>1</NumeroRemessa>
  </Header>
  <Pagamentos>
    <Pagamento>
      <NumeroSequencial>1</NumeroSequencial>
      <NumeroDocumento>1</NumeroDocumento>
      <NomeBeneficiario>João Silva</NomeBeneficiario>
      <DocumentoBeneficiario>12345678901</DocumentoBeneficiario>
      <CodigoBanco>237</CodigoBanco>
      <Agencia>1234</Agencia>
      <Conta>12345-6</Conta>
      <ValorPagamento>1500.00</ValorPagamento>
      <DataPagamento>2025-11-20</DataPagamento>
      <FinalidadePagamento>Pagamento</FinalidadePagamento>
      <CodigoFinalidade>98</CodigoFinalidade>
    </Pagamento>
  </Pagamentos>
  <Trailer>
    <QuantidadeRegistros>1</QuantidadeRegistros>
    <ValorTotal>1500.00</ValorTotal>
  </Trailer>
</DocumentoCobranca>
```

## Testing

Test files are located in `examples/`:
- `bradesco_sample.csv` - Sample data for XML generation

### Test Commands
```bash
# Test Bradesco XML generation
curl -X POST http://localhost:3000/api/generate \
  -F "file=@examples/bradesco_sample.csv" \
  -F "layout=bradesco" \
  -o output.xml

# Test Santander XML generation
curl -X POST http://localhost:3000/api/generate \
  -F "file=@examples/bradesco_sample.csv" \
  -F "layout=santander" \
  -o output.xml

# Test Caixa XML generation
curl -X POST http://localhost:3000/api/generate \
  -F "file=@examples/bradesco_sample.csv" \
  -F "layout=caixa" \
  -o output.xml
```

## Adding New XML Banks

To add support for a new bank with XML format:

1. Create a layout file in `layouts/` directory (e.g., `layouts/newbank.json`)
2. Define the bank code, name, and XML schema
3. Map fields for header, payment, and trailer sections
4. Add the layout key to `src/lib/layoutLoader.js` in the `getAllLayouts()` function
5. Test with sample data

## Notes

- XML files use UTF-8 encoding
- Special characters are automatically escaped
- Date format is ISO 8601 (YYYY-MM-DD)
- Currency amounts use 2 decimal places
- The system automatically detects the format based on the layout configuration
