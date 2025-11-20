# Backend Task List

## Core Modules to Build

### 1. Layout Loader (`src/lib/layoutLoader.js`)
**Purpose**: Load and validate bank layout JSON files

**Functions**:
- `loadLayout(layoutKey)` - Load layout by key ("itau", "bb")
- `getAllLayouts()` - Return list of available layouts
- `validateLayout(layoutData)` - Validate layout structure using Zod

**Features**:
- Dynamic loading from `layouts/` directory
- Caching for performance
- Error handling for missing/malformed layouts
- Support for CNAB240 and CNAB400 standards

**Exports**:
```javascript
export async function loadLayout(layoutKey) {
  // Returns layout object or throws error
}

export async function getAllLayouts() {
  // Returns array of { key, bankCode, bankName, standard }
}
```

---

### 2. Spreadsheet Parser (`src/lib/spreadsheetParser.js`)
**Purpose**: Parse uploaded spreadsheets into structured data

**Functions**:
- `parseSpreadsheet(buffer, filename)` - Main parsing function
- `parseXLSX(buffer)` - Handle Excel files
- `parseCSV(buffer)` - Handle CSV files
- `validateColumns(data, requiredColumns)` - Ensure required columns exist

**Features**:
- Support for `.xlsx` and `.csv` formats using `xlsx` library
- Column name normalization (trim, lowercase)
- Row-by-row validation
- Error reporting with line numbers
- Handle empty rows and cells

**Expected Input Columns** (example for payments):
- `beneficiaryName` - Recipient name
- `beneficiaryDocument` - CPF/CNPJ
- `beneficiaryBank` - Bank code
- `beneficiaryAgency` - Agency number
- `beneficiaryAccount` - Account number
- `amount` - Payment amount (numeric)
- `paymentDate` - Date in YYYY-MM-DD format
- `paymentType` - Payment type code

**Exports**:
```javascript
export async function parseSpreadsheet(buffer, filename) {
  // Returns array of row objects
}
```

---

### 3. CNAB Builder (`src/lib/cnabBuilder.js`)
**Purpose**: Build CNAB files from data and layout

**Functions**:
- `buildCNAB(layoutKey, rows)` - Main CNAB generation function
- `buildHeader(layout, metadata)` - Generate header record
- `buildDetailRecords(layout, rows)` - Generate detail records
- `buildTrailer(layout, metadata)` - Generate trailer record
- `formatField(value, field)` - Format individual field values
- `padField(value, length, type, align)` - Pad fields to fixed width

**Features**:
- Strict fixed-width formatting
- Field type handling:
  - Numeric: right-align, zero-pad
  - Alphanumeric: left-align, space-pad
- Line length validation (240 or 400 chars)
- Sequential numbering for records
- Checksum/totals calculation for trailers
- Date formatting (DDMMYYYY)
- Amount formatting (implied decimals, e.g., 100.50 → "00000010050")

**Exports**:
```javascript
export async function buildCNAB(layoutKey, rows) {
  // Returns CNAB content as string with \n line endings
}
```

**Internal Field Formatting Logic**:
```javascript
function formatField(value, field) {
  const { type, length, decimals, default: defaultValue } = field
  let formatted = value !== undefined ? String(value) : (defaultValue || '')
  
  if (type === 'num') {
    // Handle numeric fields with implied decimals
    if (decimals) {
      formatted = (parseFloat(formatted) * Math.pow(10, decimals)).toFixed(0)
    }
    return formatted.padStart(length, '0')
  } else {
    // Alphanumeric fields
    return formatted.substring(0, length).padEnd(length, ' ')
  }
}
```

---

### 4. Validation Module (`src/lib/validation.js`)
**Purpose**: Zod schemas for input validation

**Schemas**:
- `LayoutSchema` - Validate layout JSON structure
- `RowSchema` - Validate spreadsheet row data
- `GenerateRequestSchema` - Validate API request

**Features**:
- Type checking
- Required field validation
- Format validation (dates, amounts, etc.)
- Custom error messages

**Exports**:
```javascript
export const LayoutSchema = z.object({
  bankCode: z.string(),
  standard: z.enum(['CNAB240', 'CNAB400']),
  records: z.object({...}),
})

export const RowSchema = z.object({
  beneficiaryName: z.string().min(1),
  amount: z.number().positive(),
  // ... other fields
})
```

---

### 5. Express Server (`src/index.js`)
**Purpose**: HTTP server with file upload endpoint

**Features**:
- Single endpoint: `POST /api/generate`
- File upload handling with Multer
- CORS support
- Error handling middleware
- Request logging
- File size limits (10MB max)

**Main Logic**:
```javascript
import express from 'express'
import multer from 'multer'
import cors from 'cors'
import { parseSpreadsheet } from './lib/spreadsheetParser.js'
import { buildCNAB } from './lib/cnabBuilder.js'

const app = express()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })

app.use(cors())
app.use(express.json())

app.post('/api/generate', upload.single('file'), async (req, res) => {
  try {
    const { layout } = req.body
    const file = req.file
    
    // Validation
    if (!file) throw new Error('Missing required field: file')
    if (!layout) throw new Error('Missing required field: layout')
    
    // Parse spreadsheet
    const rows = await parseSpreadsheet(file.buffer, file.originalname)
    
    // Generate CNAB
    const cnabContent = await buildCNAB(layout, rows)
    
    // Return file
    const filename = `cnab_${layout}_${Date.now()}.txt`
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.setHeader('Content-Type', 'text/plain')
    res.send(cnabContent)
    
  } catch (error) {
    console.error(error)
    res.status(400).json({ error: error.message })
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`CNAB Generator API running on port ${PORT}`)
})
```

---

## Testing Checklist

- [ ] Load valid layout JSON
- [ ] Handle missing layout file
- [ ] Parse Excel spreadsheet
- [ ] Parse CSV spreadsheet
- [ ] Validate required columns
- [ ] Handle empty spreadsheet
- [ ] Generate CNAB with correct line length
- [ ] Verify field alignment and padding
- [ ] Test numeric field formatting
- [ ] Test date formatting
- [ ] Test amount formatting with decimals
- [ ] Verify header/trailer records
- [ ] Handle invalid file format
- [ ] Handle oversized file
- [ ] Return proper error messages
- [ ] Test endpoint with cURL
- [ ] Test endpoint with Postman/frontend

---

## Error Handling Strategy

1. **Validation Errors (400)**:
   - Missing file or layout
   - Invalid file type
   - Missing required columns
   - Invalid data format

2. **Not Found Errors (404)**:
   - Layout not found

3. **Server Errors (500)**:
   - File parsing errors
   - CNAB generation errors
   - Unexpected exceptions

**Error Response Format**:
```json
{
  "error": "Clear, actionable error message",
  "details": "Optional additional context"
}
```

---

## Performance Considerations

- Cache loaded layouts in memory
- Stream large files instead of loading entirely
- Limit concurrent requests if needed
- Add request timeout (30s default)
- Log slow requests for optimization

---

## Dependencies

- `express` - HTTP server
- `multer` - File upload middleware
- `xlsx` - Spreadsheet parsing
- `zod` - Schema validation
- `cors` - CORS support

---

## Future Enhancements (Post-MVP)

- Background job processing for large files
- Webhook notifications on completion
- CNAB validation endpoint
- Layout configuration via API
- Batch file generation
- CNAB400 support
- Additional bank layouts (Caixa, Santander, etc.)
