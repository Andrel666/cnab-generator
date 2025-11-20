import { ChangeEvent, useRef } from 'react'

interface FileUploadProps {
  onFileSelect: (file: File | null) => void
  selectedFile: File | null
}

export default function FileUpload({ onFileSelect, selectedFile }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    
    if (file) {
      const validExtensions = ['xlsx', 'xls', 'csv']
      const extension = file.name.split('.').pop()?.toLowerCase()
      
      if (!extension || !validExtensions.includes(extension)) {
        alert('Invalid file type. Please upload .xlsx or .csv file')
        onFileSelect(null)
        return
      }
      
      if (file.size > 10 * 1024 * 1024) {
        alert('File size exceeds 10MB limit')
        onFileSelect(null)
        return
      }
    }
    
    onFileSelect(file)
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Spreadsheet File
      </label>
      <div
        onClick={handleClick}
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="text-gray-600">
          {selectedFile ? (
            <div>
              <svg className="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="mt-2 font-medium">{selectedFile.name}</p>
              <p className="text-sm text-gray-500">{(selectedFile.size / 1024).toFixed(2)} KB</p>
            </div>
          ) : (
            <div>
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="mt-2">Click to upload or drag and drop</p>
              <p className="text-sm text-gray-500">XLSX, XLS or CSV (max 10MB)</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
