# API Definition

## Base URL
- Development: `http://localhost:3000`
- Production: TBD

## Endpoints

### POST /api/generate

Generate a CNAB file from an uploaded spreadsheet using the specified bank layout.

#### Request

**Headers:**
```
Content-Type: multipart/form-data
```

**Body (Form Data):**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file | File | Yes | Spreadsheet file (.xlsx or .csv) containing payment data |
| layout | String | Yes | Bank layout key: "itau" or "bb" |

**Example using cURL:**
```bash
curl -X POST http://localhost:3000/api/generate \
  -F "file=@payments.xlsx" \
  -F "layout=itau"
```

**Example using fetch:**
```javascript
const formData = new FormData()
formData.append('file', selectedFile)
formData.append('layout', 'itau')

const response = await fetch('/api/generate', {
  method: 'POST',
  body: formData,
})
```

#### Response

**Success (200 OK):**

**Headers:**
```
Content-Type: text/plain
Content-Disposition: attachment; filename="cnab_itau_1732089234567.txt"
```

**Body:**
```
<CNAB file content as plain text>
```

The response is a downloadable `.txt` file containing the generated CNAB240 or CNAB400 content. Each line in the file is exactly 240 or 400 characters (depending on the layout standard).

**Error Responses:**

**400 Bad Request:**
```json
{
  "error": "Missing required field: file"
}
```

```json
{
  "error": "Missing required field: layout"
}
```

```json
{
  "error": "Unsupported file type. Please upload .xlsx or .csv"
}
```

```json
{
  "error": "Layout 'santander' not found. Available layouts: itau, bb"
}
```

```json
{
  "error": "Invalid spreadsheet format. Missing required column: 'beneficiaryName'"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Failed to generate CNAB file: <specific error message>"
}
```

## Future Endpoints (Post-MVP)

### GET /api/layouts
List all available bank layouts.

**Response (200 OK):**
```json
{
  "layouts": [
    {
      "key": "itau",
      "bankCode": "341",
      "bankName": "Itaú Unibanco",
      "standard": "CNAB240"
    },
    {
      "key": "bb",
      "bankCode": "001",
      "bankName": "Banco do Brasil",
      "standard": "CNAB240"
    }
  ]
}
```

### GET /api/layouts/:key
Get detailed information about a specific layout.

### POST /api/validate
Validate a spreadsheet without generating CNAB.
