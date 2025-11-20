# Frontend Task List

## Components to Build

### 1. File Upload Component
- **File**: `src/components/FileUpload.tsx`
- **Features**:
  - Accept `.xlsx` and `.csv` files only
  - Drag-and-drop support
  - File size validation (max 10MB)
  - Visual feedback on file selection
  - Display selected filename
  - Error messages for invalid files

### 2. Layout Selector Component
- **File**: `src/components/LayoutSelector.tsx`
- **Features**:
  - Dropdown menu with available layouts
  - Options: Itaú (341), Banco do Brasil (001)
  - Display bank code and name
  - Required field validation
  - Default placeholder text

### 3. Generate Button Component
- **File**: `src/components/GenerateButton.tsx`
- **Features**:
  - Disabled state when no file/layout selected
  - Loading spinner during generation
  - Success/error visual feedback
  - Keyboard accessible

### 4. Status Message Component
- **File**: `src/components/StatusMessage.tsx`
- **Features**:
  - Success, error, and info message states
  - Color-coded backgrounds (green, red, blue)
  - Auto-dismiss after 5 seconds (optional)
  - Close button

### 5. Download Link Component
- **File**: `src/components/DownloadLink.tsx`
- **Features**:
  - Only visible after successful generation
  - Download button with icon
  - Display generated filename
  - File size information
  - Preview first 10 lines (optional)

### 6. Main App Container
- **File**: `src/App.tsx`
- **Features**:
  - Layout composition
  - State management for file, layout, status
  - API call to `/api/generate` endpoint
  - Error boundary handling
  - Responsive design (mobile-friendly)

## State Management

Use React `useState` for:
- `selectedFile: File | null`
- `selectedLayout: string | null` (e.g., "itau", "bb")
- `isGenerating: boolean`
- `statusMessage: { type: 'success' | 'error' | 'info', text: string } | null`
- `downloadUrl: string | null`
- `generatedFilename: string | null`

## API Integration

### POST /api/generate
```typescript
const formData = new FormData()
formData.append('file', selectedFile)
formData.append('layout', selectedLayout)

const response = await fetch('/api/generate', {
  method: 'POST',
  body: formData,
})

if (response.ok) {
  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  setDownloadUrl(url)
  setGeneratedFilename(response.headers.get('Content-Disposition') || 'cnab.txt')
} else {
  const error = await response.json()
  setStatusMessage({ type: 'error', text: error.message })
}
```

## Validation Rules

1. File must be selected
2. Layout must be selected
3. File extension must be `.xlsx` or `.csv`
4. File size must be < 10MB
5. Show specific error messages for each validation failure

## UI/UX Requirements

- Clean, minimal design
- Clear visual hierarchy
- Responsive (works on mobile, tablet, desktop)
- Accessible (keyboard navigation, ARIA labels)
- Loading states for async operations
- Clear error messages with actionable advice

## Future Enhancements (Post-MVP)

- Multi-language support with i18next
- Batch file processing
- CNAB preview before download
- Layout configuration editor
- Field mapping interface for custom layouts
