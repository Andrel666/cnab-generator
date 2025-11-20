# CNAB Generator MVP

A full-stack application to generate CNAB240 files for Brazilian banks from spreadsheet data (XLSX/CSV).

## Features

- Upload spreadsheets (XLSX, XLS, or CSV)
- Support for multiple bank layouts (Itaú, Banco do Brasil)
- Generate CNAB240 compliant files
- Modern React frontend with Tailwind CSS
- RESTful API backend with Express.js
- File validation and error handling
- Real-time generation and download

## Tech Stack

### Backend
- Node.js + Express
- xlsx (SheetJS) for spreadsheet parsing
- Zod for validation
- Multer for file uploads
- CORS enabled

### Frontend
- React 18 + TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Responsive design

## Project Structure

```
CNAB-generator/
├── docs/                    # Documentation
│   ├── api_definition.md
│   ├── frontend_task_list.md
│   └── backend_task_list.md
├── layouts/                 # Bank layout definitions
│   ├── itau.json
│   └── bb.json
├── samples/                 # Sample input files
│   ├── payments_itau.csv
│   └── payments_bb.csv
├── src/                     # Backend source code
│   ├── lib/
│   │   ├── layoutLoader.js
│   │   ├── spreadsheetParser.js
│   │   └── cnabBuilder.js
│   └── index.js            # Express server
├── frontend/               # Frontend application
│   ├── src/
│   │   ├── components/
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
└── package.json           # Backend dependencies
```

## Getting Started

### Prerequisites

- Node.js v18 or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd CNAB-generator
```

2. Install backend dependencies:
```bash
npm install
```

3. Install frontend dependencies:
```bash
cd frontend
npm install
cd ..
```

### Running the Application

#### Development Mode

1. Start the backend server (in one terminal):
```bash
npm start
# Server runs on http://localhost:3000
```

2. Start the frontend dev server (in another terminal):
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
```

3. Open your browser and navigate to `http://localhost:5173`

#### Production Mode

1. Build the frontend:
```bash
cd frontend
npm run build
cd ..
```

2. Serve the frontend build (optional, you can use any static file server):
```bash
cd frontend
npm run preview
```

3. Start the backend:
```bash
npm start
```

## Usage

### Via Web Interface

1. Open the application in your browser
2. Click "Upload" or drag-and-drop your spreadsheet file (.xlsx, .xls, or .csv)
3. Select the bank layout from the dropdown (Itaú or Banco do Brasil)
4. (Optional) Enter company name and CNPJ/CPF
5. Click "Generate CNAB File"
6. Download the generated CNAB file

### Via API (cURL)

```bash
curl -X POST http://localhost:3000/api/generate \
  -F "file=@samples/payments_itau.csv" \
  -F "layout=itau" \
  -F "companyName=MINHA EMPRESA LTDA" \
  -F "companyDocument=12345678000199" \
  -o cnab_output.txt
```

### Spreadsheet Format

Your input spreadsheet must have the following columns:

| Column Name          | Description                  | Example          |
|---------------------|------------------------------|------------------|
| Beneficiary Name    | Recipient name               | JOAO DA SILVA    |
| Beneficiary Bank    | Bank code                    | 341              |
| Beneficiary Agency  | Agency number                | 1234             |
| Beneficiary Account | Account number               | 123456789        |
| Amount              | Payment amount               | 150.50           |
| Payment Date        | Payment date (YYYY-MM-DD)    | 2024-01-15       |

See `samples/payments_itau.csv` for a complete example.

## API Endpoints

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### GET /api/layouts
Get list of available bank layouts.

**Response:**
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

### POST /api/generate
Generate CNAB file from spreadsheet.

**Request:** multipart/form-data
- `file`: Spreadsheet file (.xlsx, .xls, or .csv)
- `layout`: Layout key ("itau" or "bb")
- `companyName` (optional): Company name
- `companyDocument` (optional): CNPJ or CPF

**Response:** CNAB text file (240 characters per line)

## Testing

Test the backend with sample data:

```bash
# Using Itaú layout
curl -X POST http://localhost:3000/api/generate \
  -F "file=@samples/payments_itau.csv" \
  -F "layout=itau" \
  -o test_itau.txt

# Using Banco do Brasil layout
curl -X POST http://localhost:3000/api/generate \
  -F "file=@samples/payments_bb.csv" \
  -F "layout=bb" \
  -o test_bb.txt

# Verify output (all lines should be exactly 240 characters)
awk '{print length}' test_itau.txt
```

## Adding New Bank Layouts

To add support for a new bank:

1. Create a new JSON file in `layouts/` directory (e.g., `layouts/caixa.json`)
2. Define the CNAB240 structure following the format in existing layouts
3. The layout will be automatically loaded and available in the frontend dropdown

Layout JSON structure:
```json
{
  "bankCode": "104",
  "bankName": "Caixa Econômica Federal",
  "standard": "CNAB240",
  "records": {
    "HEADER_ARQUIVO": { ... },
    "HEADER_LOTE": { ... },
    "SEGMENTO_A": { ... },
    "TRAILER_LOTE": { ... },
    "TRAILER_ARQUIVO": { ... }
  }
}
```

## Validation

The application performs the following validations:

- File type: Only .xlsx, .xls, and .csv are accepted
- File size: Maximum 10MB
- Required columns: All required columns must be present
- CNAB format: All output lines are exactly 240 characters
- Field formatting: Numeric fields are zero-padded, alpha fields are space-padded

## Error Handling

The API returns appropriate HTTP status codes:

- `200 OK`: Successful CNAB generation
- `400 Bad Request`: Missing fields, invalid file, or parsing errors
- `500 Internal Server Error`: Unexpected server errors

Error response format:
```json
{
  "error": "Error message description"
}
```

## Environment Variables

- `PORT`: Backend server port (default: 3000)

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Support

For issues or questions, please open an issue on GitHub.

## Roadmap

Future enhancements:
- Additional bank support (Caixa, Santander, Bradesco)
- CNAB400 support
- Batch file processing
- CNAB file validation
- Field mapping interface
- Export templates

---

Built with ❤️ for the Brazilian banking community
