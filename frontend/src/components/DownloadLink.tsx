interface DownloadLinkProps {
  downloadUrl: string | null
  filename: string | null
}

export default function DownloadLink({ downloadUrl, filename }: DownloadLinkProps) {
  if (!downloadUrl) return null

  return (
    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
      <h3 className="text-sm font-medium text-green-800 mb-2">CNAB file generated successfully!</h3>
      <a
        href={downloadUrl}
        download={filename || 'cnab.txt'}
        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Download {filename}
      </a>
    </div>
  )
}
