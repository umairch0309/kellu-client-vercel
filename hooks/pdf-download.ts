import { useCallback } from 'react'

type Row = Record<string, string | number | boolean | null | undefined>

interface PDFDownloadOptions {
  filename?: string
  title?: string
  subtitle?: string
}

export function usePDFDownload(options: PDFDownloadOptions = {}) {
  const downloadPDF = useCallback(
    (data: Row[], downloadOptions?: PDFDownloadOptions) => {
      if (!data || data.length === 0) return

      const filename = downloadOptions?.filename ?? options.filename ?? 'export'
      const title = downloadOptions?.title ?? options.title ?? 'Report'
      const subtitle = downloadOptions?.subtitle ?? options.subtitle ?? ''
      const headers = Object.keys(data[0])
      const colWidth = Math.floor(100 / headers.length)

      const headerRow = headers
        .map(h => `<th style="background:#28AFB0;color:white;padding:8px 12px;text-align:left;font-size:11px;font-weight:600;border:none;">${h}</th>`)
        .join('')

      const bodyRows = data
        .map((row, i) => {
          const isTotal = String(row[headers[0]]).toUpperCase() === 'TOTAL'
          const bg = isTotal ? '#F3F4F6' : i % 2 === 0 ? '#ffffff' : '#F9FAFB'
          const fontWeight = isTotal ? '700' : '400'
          const cells = headers
            .map(h => {
              const val = row[h] ?? ''
              return `<td style="padding:7px 12px;font-size:11px;color:#1F271B;border-bottom:1px solid #EAEBED;font-weight:${fontWeight};">${val}</td>`
            })
            .join('')
          return `<tr style="background:${bg};">${cells}</tr>`
        })
        .join('')

      const now = new Date()
      const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

      const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1F271B; background: white; }
    .page { padding: 40px; max-width: 900px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-bottom: 20px; border-bottom: 2px solid #28AFB0; }
    .brand { display: flex; flex-direction: column; gap: 2px; }
    .brand-name { font-size: 20px; font-weight: 700; color: #1F271B; }
    .brand-tag { font-size: 11px; color: #28AFB0; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; }
    .meta { text-align: right; }
    .meta-title { font-size: 16px; font-weight: 700; color: #1F271B; }
    .meta-subtitle { font-size: 11px; color: #1F271B; opacity: 0.55; margin-top: 3px; }
    .meta-date { font-size: 10px; color: #1F271B; opacity: 0.4; margin-top: 6px; }
    table { width: 100%; border-collapse: collapse; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
    th { ${colWidth}%; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .page { padding: 20px; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="brand">
        <span class="brand-name">Admin Panel</span>
        <span class="brand-tag">Generated Report</span>
      </div>
      <div class="meta">
        <div class="meta-title">${title}</div>
        ${subtitle ? `<div class="meta-subtitle">${subtitle}</div>` : ''}
        <div class="meta-date">Generated on ${dateStr}</div>
      </div>
    </div>
    <table>
      <thead><tr>${headerRow}</tr></thead>
      <tbody>${bodyRows}</tbody>
    </table>
  </div>
</body>
</html>`

      const blob = new Blob([html], { type: 'text/html;charset=utf-8;' })
      const url = URL.createObjectURL(blob)

      const printWindow = window.open(url, '_blank')
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.focus()
          printWindow.print()
          // Clean up after print dialog closes
          printWindow.onafterprint = () => {
            printWindow.close()
            URL.revokeObjectURL(url)
          }
        }
      }
    },
    [options]
  )

  return { downloadPDF }
}