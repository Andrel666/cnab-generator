import { useState, useEffect } from 'react'
import FileUpload from './components/FileUpload'
import LayoutSelector from './components/LayoutSelector'
import CompanyInfo from './components/CompanyInfo'
import GenerateButton from './components/GenerateButton'
import StatusMessage from './components/StatusMessage'
import DownloadLink from './components/DownloadLink'

interface Layout {
  key: string
  bankCode: string
  bankName: string
  standard: string
  format?: string
}

interface StatusMsg {
  type: 'success' | 'error' | 'info'
  message: string
}

function App() {
  const [layouts, setLayouts] = useState<Layout[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedLayout, setSelectedLayout] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [companyDocument, setCompanyDocument] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [statusMessage, setStatusMessage] = useState<StatusMsg | null>(null)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [filename, setFilename] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/layouts')
      .then(res => res.json())
      .then(data => setLayouts(data.layouts || []))
      .catch(err => {
        console.error('Failed to fetch layouts:', err)
        setLayouts([
          { key: 'itau', bankCode: '341', bankName: 'Itaú Unibanco', standard: 'CNAB240' },
          { key: 'bb', bankCode: '001', bankName: 'Banco do Brasil', standard: 'CNAB240' }
        ])
      })
  }, [])

  const handleGenerate = async () => {
    if (!selectedFile || !selectedLayout) return

    setIsGenerating(true)
    setStatusMessage(null)
    setDownloadUrl(null)

    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('layout', selectedLayout)
    if (companyName) formData.append('companyName', companyName)
    if (companyDocument) formData.append('companyDocument', companyDocument)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        
        const contentDisposition = response.headers.get('Content-Disposition')
        const filenameMatch = contentDisposition?.match(/filename="(.+)"/)
        const generatedFilename = filenameMatch ? filenameMatch[1] : 'cnab.txt'

        setDownloadUrl(url)
        setFilename(generatedFilename)
        setStatusMessage({ type: 'success', message: 'CNAB file generated successfully!' })
      } else {
        const error = await response.json()
        setStatusMessage({ type: 'error', message: error.error || 'Failed to generate CNAB file' })
      }
    } catch (error) {
      setStatusMessage({ type: 'error', message: 'Network error. Please ensure the backend is running.' })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            CNAB Generator
          </h1>
          <p className="text-gray-600 mb-8">
            Upload your spreadsheet and generate CNAB240 files for Brazilian banks
          </p>

          {statusMessage && (
            <StatusMessage
              type={statusMessage.type}
              message={statusMessage.message}
              onClose={() => setStatusMessage(null)}
            />
          )}

          <FileUpload
            onFileSelect={setSelectedFile}
            selectedFile={selectedFile}
          />

          <LayoutSelector
            layouts={layouts}
            selectedLayout={selectedLayout}
            onLayoutSelect={setSelectedLayout}
          />

          <CompanyInfo
            companyName={companyName}
            companyDocument={companyDocument}
            onCompanyNameChange={setCompanyName}
            onCompanyDocumentChange={setCompanyDocument}
          />

          <GenerateButton
            disabled={!selectedFile || !selectedLayout}
            isGenerating={isGenerating}
            onClick={handleGenerate}
          />

          <DownloadLink
            downloadUrl={downloadUrl}
            filename={filename}
          />
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>CNAB240: Itaú (341), Banco do Brasil (001)</p>
          <p>XML: Bradesco (237), Santander (033), Caixa (104)</p>
          <p className="mt-1">File formats: XLSX, XLS, CSV (max 10MB)</p>
        </div>
      </div>
    </div>
  )
}

export default App
