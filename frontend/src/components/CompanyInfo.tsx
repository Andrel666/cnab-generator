interface CompanyInfoProps {
  companyName: string
  companyDocument: string
  onCompanyNameChange: (name: string) => void
  onCompanyDocumentChange: (document: string) => void
}

export default function CompanyInfo({
  companyName,
  companyDocument,
  onCompanyNameChange,
  onCompanyDocumentChange
}: CompanyInfoProps) {
  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Company Information (Optional)</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="companyName" className="block text-sm text-gray-600 mb-1">
            Company Name
          </label>
          <input
            id="companyName"
            type="text"
            value={companyName}
            onChange={(e) => onCompanyNameChange(e.target.value)}
            placeholder="EMPRESA EXEMPLO LTDA"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label htmlFor="companyDocument" className="block text-sm text-gray-600 mb-1">
            CNPJ/CPF
          </label>
          <input
            id="companyDocument"
            type="text"
            value={companyDocument}
            onChange={(e) => onCompanyDocumentChange(e.target.value.replace(/\D/g, ''))}
            placeholder="12345678000199"
            maxLength={14}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  )
}
