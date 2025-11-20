# CNAB Generator / Gerador de CNAB

[English](#english) | [Português](#português)

---

## English

A full-stack application to generate CNAB240 and XML payment files for Brazilian banks from spreadsheet data (XLSX/CSV).

### Features

- Upload spreadsheets (XLSX, XLS, or CSV)
- Support for multiple bank formats:
  - **CNAB240**: Itaú (341), Banco do Brasil (001)
  - **XML**: Bradesco (237), Santander (033), Caixa (104)
- Automatic format detection based on selected bank
- Modern React frontend with Tailwind CSS
- RESTful API backend with Express.js
- File validation and error handling
- Real-time generation and download
- Support for Portuguese and English column names

### Tech Stack

#### Backend
- Node.js + Express
- xlsx (SheetJS) for spreadsheet parsing
- Multer for file uploads
- CORS enabled

#### Frontend
- React 18 + TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Responsive design

### Getting Started

#### Prerequisites

- Node.js v18 or higher
- npm or yarn

#### Installation

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

#### Running the Application

**Start the backend server:**
```bash
npm start
# Server runs on http://localhost:3000
```

**Start the frontend dev server (in another terminal):**
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
```

**Open your browser:** Navigate to `http://localhost:5173`

### User Guide

#### Step 1: Prepare Your Spreadsheet

Create a spreadsheet (XLSX, XLS, or CSV) with the following columns:

**Portuguese column names:**
| Column | Description | Example |
|--------|-------------|---------|
| nome | Recipient name | João Silva |
| agencia | Agency number | 1234 |
| conta | Account number | 12345-6 |
| valor | Payment amount | 1500.00 |
| data_pagamento or data | Payment date | 2024-01-15 or 15/01/2024 |
| cpf or cnpj | Document number (optional) | 12345678901 |
| banco | Bank code (optional) | 237 |

**English column names:**
| Column | Description | Example |
|--------|-------------|---------|
| beneficiary_name | Recipient name | João Silva |
| beneficiary_agency | Agency number | 1234 |
| beneficiary_account | Account number | 12345-6 |
| amount | Payment amount | 1500.00 |
| payment_date | Payment date | 2024-01-15 or 15/01/2024 |
| beneficiary_document | Document number (optional) | 12345678901 |
| beneficiary_bank | Bank code (optional) | 237 |

**Notes:**
- You can mix Portuguese and English column names
- If `banco` (bank) is not provided, it will be auto-detected from the agency number
- Date formats accepted: YYYY-MM-DD or DD/MM/YYYY

#### Step 2: Upload Your File

1. Open the application in your browser (`http://localhost:5173`)
2. Click "Choose File" or drag and drop your spreadsheet
3. Supported formats: .xlsx, .xls, .csv (max 10MB)

#### Step 3: Select Bank Format

Choose the bank from the dropdown:
- **Itaú (341) - CNAB240**: Generates a .txt file with CNAB240 format
- **Banco do Brasil (001) - CNAB240**: Generates a .txt file with CNAB240 format
- **Bradesco (237) - XML**: Generates an .xml file
- **Santander (033) - XML**: Generates an .xml file
- **Caixa (104) - XML**: Generates an .xml file

#### Step 4: Enter Company Information (Optional)

- **Company Name**: Your company name
- **Company Document**: Your CNPJ or CPF

#### Step 5: Generate and Download

1. Click "Generate CNAB File" button
2. Wait for the file to be generated (usually instant)
3. The file will automatically download:
   - CNAB banks: `cnab_[bank]_[timestamp].txt`
   - XML banks: `remessa_[bank]_[timestamp].xml`

### API Usage

#### Get Available Layouts
```bash
curl http://localhost:3000/api/layouts
```

#### Generate CNAB File
```bash
curl -X POST http://localhost:3000/api/generate \
  -F "file=@my_payments.csv" \
  -F "layout=itau" \
  -F "companyName=My Company" \
  -F "companyDocument=12345678000199" \
  -o output.txt
```

#### Generate XML File
```bash
curl -X POST http://localhost:3000/api/generate \
  -F "file=@my_payments.csv" \
  -F "layout=bradesco" \
  -F "companyName=My Company" \
  -F "companyDocument=12345678000199" \
  -o output.xml
```

### Troubleshooting

**Error: "Missing required columns"**
- Make sure your spreadsheet has all required columns
- Column names are case-insensitive
- Accepts both Portuguese and English names

**Error: "Unsupported file type"**
- Only .xlsx, .xls, and .csv files are supported
- Make sure file extension is correct

**Error: "File too large"**
- Maximum file size is 10MB
- Consider splitting large files

### Adding Support for More Banks

Want to add a new bank? Follow these steps:

#### For CNAB240 Format

1. **Create a layout file** in the `layouts/` directory (e.g., `layouts/sicoob.json`):

```json
{
  "bankCode": "756",
  "bankName": "Sicoob",
  "standard": "CNAB240",
  "records": {
    "HEADER_ARQUIVO": {
      "type": "0",
      "fields": [
        { "name": "bank_code", "start": 1, "end": 3, "type": "numeric", "length": 3 },
        { "name": "company_name", "start": 31, "end": 60, "type": "alpha", "length": 30 }
        // ... more fields
      ]
    },
    "HEADER_LOTE": { /* ... */ },
    "SEGMENTO_A": { /* ... */ },
    "TRAILER_LOTE": { /* ... */ },
    "TRAILER_ARQUIVO": { /* ... */ }
  }
}
```

2. **Add the bank key** to `src/lib/layoutLoader.js`:

```javascript
const keys = ['itau', 'bb', 'bradesco', 'santander', 'caixa', 'sicoob']
```

3. **Test** with sample data:

```bash
curl -X POST http://localhost:3000/api/generate \
  -F "file=@my_payments.csv" \
  -F "layout=sicoob" \
  -o output.txt
```

#### For XML Format

1. **Create an XML layout file** in the `layouts/` directory (e.g., `layouts/safra.json`):

```json
{
  "bankCode": "422",
  "bankName": "Safra",
  "format": "XML",
  "standard": "FEBRABAN",
  "version": "1.0",
  "schema": {
    "rootElement": "RemessaPagamento",
    "namespace": "http://www.safra.com.br/remessa",
    "encoding": "UTF-8",
    "version": "1.0"
  },
  "fields": {
    "header": {
      "codigoBanco": "422",
      "nomeEmpresa": "company_name",
      "documentoEmpresa": "company_document",
      "dataGeracao": "generation_date",
      "horaGeracao": "generation_time",
      "numeroRemessa": "remittance_number"
    },
    "payment": {
      "numeroDocumento": "document_number",
      "nomeBeneficiario": "beneficiary_name",
      "documentoBeneficiario": "beneficiary_document",
      "codigoBanco": "beneficiary_bank",
      "agencia": "beneficiary_agency",
      "conta": "beneficiary_account",
      "valorPagamento": "amount",
      "dataPagamento": "payment_date",
      "finalidadePagamento": "payment_purpose",
      "codigoFinalidade": "01"
    }
  }
}
```

2. **Add the bank key** to `src/lib/layoutLoader.js` (same as above)

3. **Test** with sample data:

```bash
curl -X POST http://localhost:3000/api/generate \
  -F "file=@my_payments.csv" \
  -F "layout=safra" \
  -o output.xml
```

#### Field Type Reference

**CNAB240 Fields:**
- `type: "numeric"` - Numbers, zero-padded on the left
- `type: "alpha"` - Text, space-padded on the right
- `start` and `end` - Positions in the 240-character line (1-based)

**XML Fields:**
- Field values are mapped from spreadsheet columns
- Automatic XML escaping for special characters
- Date formatting (ISO 8601)
- Currency formatting (2 decimal places)

For more details, see:
- [docs/xml_generation.md](docs/xml_generation.md) - XML format guide
- [layouts/itau.json](layouts/itau.json) - CNAB240 example
- [layouts/bradesco.json](layouts/bradesco.json) - XML example

### License

MIT

---

## Português

Uma aplicação full-stack para gerar arquivos de pagamento CNAB240 e XML para bancos brasileiros a partir de planilhas (XLSX/CSV).

### Funcionalidades

- Upload de planilhas (XLSX, XLS ou CSV)
- Suporte para múltiplos formatos bancários:
  - **CNAB240**: Itaú (341), Banco do Brasil (001)
  - **XML**: Bradesco (237), Santander (033), Caixa (104)
- Detecção automática de formato baseada no banco selecionado
- Interface React moderna com Tailwind CSS
- API RESTful backend com Express.js
- Validação de arquivos e tratamento de erros
- Geração e download em tempo real
- Suporte para nomes de colunas em português e inglês

### Stack Tecnológica

#### Backend
- Node.js + Express
- xlsx (SheetJS) para processamento de planilhas
- Multer para upload de arquivos
- CORS habilitado

#### Frontend
- React 18 + TypeScript
- Vite para build
- Tailwind CSS para estilização
- Design responsivo

### Começando

#### Pré-requisitos

- Node.js v18 ou superior
- npm ou yarn

#### Instalação

1. Clone o repositório:
```bash
git clone <repository-url>
cd CNAB-generator
```

2. Instale as dependências do backend:
```bash
npm install
```

3. Instale as dependências do frontend:
```bash
cd frontend
npm install
cd ..
```

#### Executando a Aplicação

**Inicie o servidor backend:**
```bash
npm start
# Servidor roda em http://localhost:3000
```

**Inicie o servidor frontend (em outro terminal):**
```bash
cd frontend
npm run dev
# Frontend roda em http://localhost:5173
```

**Abra seu navegador:** Acesse `http://localhost:5173`

### Guia do Usuário

#### Passo 1: Prepare Sua Planilha

Crie uma planilha (XLSX, XLS ou CSV) com as seguintes colunas:

**Nomes de colunas em português:**
| Coluna | Descrição | Exemplo |
|--------|-----------|---------|
| nome | Nome do beneficiário | João Silva |
| agencia | Número da agência | 1234 |
| conta | Número da conta | 12345-6 |
| valor | Valor do pagamento | 1500.00 |
| data_pagamento ou data | Data do pagamento | 2024-01-15 ou 15/01/2024 |
| cpf ou cnpj | Número do documento (opcional) | 12345678901 |
| banco | Código do banco (opcional) | 237 |

**Nomes de colunas em inglês:**
| Coluna | Descrição | Exemplo |
|--------|-----------|---------|
| beneficiary_name | Nome do beneficiário | João Silva |
| beneficiary_agency | Número da agência | 1234 |
| beneficiary_account | Número da conta | 12345-6 |
| amount | Valor do pagamento | 1500.00 |
| payment_date | Data do pagamento | 2024-01-15 ou 15/01/2024 |
| beneficiary_document | Número do documento (opcional) | 12345678901 |
| beneficiary_bank | Código do banco (opcional) | 237 |

**Observações:**
- Você pode misturar nomes de colunas em português e inglês
- Se `banco` não for fornecido, será detectado automaticamente pelo número da agência
- Formatos de data aceitos: AAAA-MM-DD ou DD/MM/AAAA

#### Passo 2: Faça Upload do Arquivo

1. Abra a aplicação no navegador (`http://localhost:5173`)
2. Clique em "Escolher Arquivo" ou arraste e solte sua planilha
3. Formatos suportados: .xlsx, .xls, .csv (máx 10MB)

#### Passo 3: Selecione o Formato do Banco

Escolha o banco no dropdown:
- **Itaú (341) - CNAB240**: Gera um arquivo .txt no formato CNAB240
- **Banco do Brasil (001) - CNAB240**: Gera um arquivo .txt no formato CNAB240
- **Bradesco (237) - XML**: Gera um arquivo .xml
- **Santander (033) - XML**: Gera um arquivo .xml
- **Caixa (104) - XML**: Gera um arquivo .xml

#### Passo 4: Informe os Dados da Empresa (Opcional)

- **Nome da Empresa**: Nome da sua empresa
- **Documento da Empresa**: Seu CNPJ ou CPF

#### Passo 5: Gere e Baixe

1. Clique no botão "Generate CNAB File"
2. Aguarde a geração do arquivo (geralmente instantânea)
3. O arquivo será baixado automaticamente:
   - Bancos CNAB: `cnab_[banco]_[timestamp].txt`
   - Bancos XML: `remessa_[banco]_[timestamp].xml`

### Uso da API

#### Obter Layouts Disponíveis
```bash
curl http://localhost:3000/api/layouts
```

#### Gerar Arquivo CNAB
```bash
curl -X POST http://localhost:3000/api/generate \
  -F "file=@meus_pagamentos.csv" \
  -F "layout=itau" \
  -F "companyName=Minha Empresa" \
  -F "companyDocument=12345678000199" \
  -o saida.txt
```

#### Gerar Arquivo XML
```bash
curl -X POST http://localhost:3000/api/generate \
  -F "file=@meus_pagamentos.csv" \
  -F "layout=bradesco" \
  -F "companyName=Minha Empresa" \
  -F "companyDocument=12345678000199" \
  -o saida.xml
```

### Solução de Problemas

**Erro: "Missing required columns"**
- Certifique-se de que sua planilha possui todas as colunas obrigatórias
- Nomes de colunas não diferenciam maiúsculas/minúsculas
- Aceita nomes em português e inglês

**Erro: "Unsupported file type"**
- Apenas arquivos .xlsx, .xls e .csv são suportados
- Verifique se a extensão do arquivo está correta

**Erro: "File too large"**
- Tamanho máximo do arquivo é 10MB
- Considere dividir arquivos grandes

### Exemplos de Planilhas

Veja os arquivos de exemplo na pasta `examples/`:
- `examples/itau_sample_remessa.csv` - Exemplo para Itaú (CNAB240)
- `examples/bradesco_sample.csv` - Exemplo para Bradesco (XML)

### Licença

MIT

---

Built with ❤️ for the Brazilian banking community / Feito com ❤️ para a comunidade bancária brasileira
