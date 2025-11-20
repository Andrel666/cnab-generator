import express from 'express'
import multer from 'multer'
import cors from 'cors'
import { parseSpreadsheet } from './lib/spreadsheetParser.js'
import { buildCNAB } from './lib/cnabBuilder.js'
import { buildXML } from './lib/xmlBuilder.js'
import { getAllLayouts, loadLayout } from './lib/layoutLoader.js'

const app = express()
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
})

app.use(cors())
app.use(express.json())

app.get('/api/layouts', async (req, res) => {
  try {
    const layouts = await getAllLayouts()
    res.json({ layouts })
  } catch (error) {
    console.error('Error fetching layouts:', error)
    res.status(500).json({ error: 'Failed to fetch layouts' })
  }
})

app.post('/api/generate', upload.single('file'), async (req, res) => {
  try {
    const { layout, companyName, companyDocument } = req.body
    const file = req.file

    if (!file) {
      return res.status(400).json({ error: 'Missing required field: file' })
    }

    if (!layout) {
      return res.status(400).json({ error: 'Missing required field: layout' })
    }

    console.log('Processing file:', file.originalname, 'layout:', layout)

    const rows = await parseSpreadsheet(file.buffer, file.originalname)
    console.log('Parsed rows:', rows.length)

    const companyData = {
      company_name: companyName || 'EMPRESA EXEMPLO LTDA',
      company_document: companyDocument || '12345678000199'
    }

    // Load layout to determine format
    const layoutConfig = await loadLayout(layout)
    const isXML = layoutConfig.format === 'XML'

    let content
    let filename
    let contentType

    if (isXML) {
      content = await buildXML(layout, rows, companyData)
      filename = `remessa_${layout}_${Date.now()}.xml`
      contentType = 'application/xml; charset=utf-8'
      console.log('Generated XML file')
    } else {
      content = await buildCNAB(layout, rows, companyData)
      const lineCount = content.split('\n').length
      console.log('Generated CNAB lines:', lineCount)
      filename = `cnab_${layout}_${Date.now()}.txt`
      contentType = 'text/plain; charset=utf-8'
    }

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.setHeader('Content-Type', contentType)
    res.send(content)

  } catch (error) {
    console.error('Error generating file:', error)
    res.status(400).json({ error: error.message })
  }
})

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log('CNAB Generator API running on port ' + PORT)
  console.log('Health check: http://localhost:' + PORT + '/health')
  console.log('API endpoint: http://localhost:' + PORT + '/api/generate')
})
