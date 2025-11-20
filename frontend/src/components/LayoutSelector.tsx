interface Layout {
  key: string
  bankCode: string
  bankName: string
  standard: string
  format?: string
}

interface LayoutSelectorProps {
  layouts: Layout[]
  selectedLayout: string
  onLayoutSelect: (layout: string) => void
}

export default function LayoutSelector({ layouts, selectedLayout, onLayoutSelect }: LayoutSelectorProps) {
  return (
    <div className="mb-6">
      <label htmlFor="layout" className="block text-sm font-medium text-gray-700 mb-2">
        Bank Layout
      </label>
      <select
        id="layout"
        value={selectedLayout}
        onChange={(e) => onLayoutSelect(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">Select a bank...</option>
        {layouts.map((layout) => (
          <option key={layout.key} value={layout.key}>
            {layout.bankName} ({layout.bankCode}) - {layout.format || layout.standard}
          </option>
        ))}
      </select>
    </div>
  )
}
