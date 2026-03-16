import { useCallback } from 'react'

type Row = Record<string, string | number | boolean | null | undefined>

interface UseCSVDownloadOptions {
  filename?: string
}

export function useCSVDownload(options: UseCSVDownloadOptions = {}) {
  const downloadCSV = useCallback(
    (data: Row[], filename?: string) => {
      if (!data || data.length === 0) return

      const resolvedFilename = filename ?? options.filename ?? 'export'

      // Build headers from keys of the first row
      const headers = Object.keys(data[0])

      // Escape a cell value: wrap in quotes if it contains commas, quotes, or newlines
      const escapeCell = (value: string | number | boolean | null | undefined): string => {
        if (value === null || value === undefined) return ''
        const str = String(value)
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`
        }
        return str
      }

      const csvRows = [
        headers.join(','),
        ...data.map(row => headers.map(header => escapeCell(row[header])).join(',')),
      ]

      const csvString = csvRows.join('\n')
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${resolvedFilename}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    },
    [options.filename]
  )

  return { downloadCSV }
}