🎯 Key Stack & Library Choices

We'll utilise the library cnab240‑nodejs from npm (by s2way) for CNAB 240 generation. 
GitHub

For CNAB 400 support we’ll build minimal additional logic (since fewer libraries directly support 400) or use layout metadata technique.

Spreadsheet parsing: npm package xlsx (SheetJS) to parse .xlsx/.csv files.

Layout definitions: JSON files in layouts/itau.json and layouts/bb.json.

Backend: Express.js server with a single endpoint /generate (file upload + layout key → returns .txt).

No authentication, no DB in MVP.

🗂 Project Structure
/cnab-generator-mvp
  /layouts
    itau.json
    bb.json
  /samples
    payments_itau.xlsx
    payments_bb.csv
  /src
    /lib
      layoutLoader.js
      spreadsheetParser.js
      cnabBuilder.js
    index.js        ← Express server entry
  package.json
  README.md

⚙️ Detailed Implementation Steps
1. Setup & Dependencies

npm init -y

npm install express multer xlsx cnab240-nodejs zod

express: HTTP server

multer: file upload middleware

xlsx: parse spreadsheet

cnab240-nodejs: CNAB 240 generation lib 
GitHub

zod: schema validation of layout/data

Create layouts/itau.json and layouts/bb.json (with field definitions etc).

2. Layout Metadata Model

Example of layouts/itau.json:

{
  "bankCode": "341",
  "standard": "CNAB240",
  "records": {
    "HEADER_ARQUIVO": { "start":1, "end":240, "fields": [ /* … */ ] },
    "HEADER_LOTE": { /* … */ },
    "SEGMENT_A": { /* … */ },
    "TRAILER_LOTE": { /* … */ },
    "TRAILER_ARQUIVO": { /* … */ }
  }
}


This ensures dynamic parsing/building of any record type.

3. Spreadsheet Parsing (spreadsheetParser.js)

Accept .xlsx or .csv via multer upload.

Use xlsx package: load file buffer → parse first sheet into JSON rows.

Validate that required columns exist (per layout).

Map each row to internal record representation (e.g., paymentDate, amount, beneficiaryName, etc).

4. CNAB Builder (cnabBuilder.js)

Use layoutLoader to load JSON layout by bank key (“itau” or “bb”).

Build each record type: iterate through records metadata.

For each field: compute string with:

For numeric: right‑align, zero‑pad.

For alphanumeric: left‑align, space‑pad.

Use start-end positions to slice correctly.

If using cnab240-nodejs library: integrate it where possible for standard parts (header, trailer).

After building all records, ensure:

Every line is exactly 240 (or 400) characters.

Field fillers (zeros/spaces) used appropriately.

Concatenate lines with \r\n (or \n if acceptable).

Return result as a string.

5. Express Server (index.js)
const express = require('express');
const multer = require('multer');
const { parseSpreadsheet } = require('./lib/spreadsheetParser');
const { buildCNAB } = require('./lib/cnabBuilder');

const upload = multer({ storage: multer.memoryStorage() });
const app = express();

app.post('/generate', upload.single('file'), async (req, res) => {
  try {
    const layoutKey = req.body.layout; // 'itau' or 'bb'
    const rows = await parseSpreadsheet(req.file.buffer, req.file.originalname);
    const output = await buildCNAB(layoutKey, rows);
    const filename = `cnab_${layoutKey}_${Date.now()}.txt`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'text/plain');
    res.send(output);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

6. Validation & Error Handling

Use Zod schemas to enforce required fields in each spreadsheet row.

In buildCNAB, throw if a line length != expected.

Catch invalid layouts or unsupported layoutKey.

Return JSON error with descriptive message.

7. Testing & Samples

Use sample spreadsheets (in /samples) for both Itaú and Banco do Brasil.

Manually inspect the .txt output: each line exactly 240 chars for CNAB240, or 400 chars if CNAB400.

Validate numeric fields: value formatting (integer field with implied decimals).

Edge cases: empty file, missing columns, unsupported layout key → should return error.

8. Deployment

For MVP: host on e.g. Heroku, Render, or any Node.js capable server.

No DB → simple and lightweight.

Provide a simple HTML form (optional) for manual test or integrate with frontend later.

🧪 MVP Deliverables (Within ~1 Week)

☑ Express server with /generate endpoint.

☑ Spreadsheet upload parsing for CSV/XLSX.

☑ Layout metadata for Itaú + Banco do Brasil.

☑ CNAB 240 generation working for both banks (with fixed width validation).

☑ Support for CNAB 400 (basic version) flagged via layout standard property.

☑ Return downloadable .txt file.

☑ Clear error/success responses.

☑ README with usage instructions (how to run locally, sample input, test output).

☑ Sample files for both banks.

☑ Minimal UI or Postman instructions to test.