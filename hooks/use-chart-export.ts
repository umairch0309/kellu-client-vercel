"use client"

import { useRef, useCallback, useState } from "react"

type ExportFormat = "png" | "pdf"

interface UseChartExportOptions {
  filename?: string
  backgroundColor?: string
  scale?: number
}

interface UseChartExportReturn {
  chartRef: React.RefObject<HTMLDivElement>
  exportChart: (format?: ExportFormat) => Promise<void>
  isExporting: boolean
  exportingFormat: ExportFormat | null
}

export function useChartExport(options: UseChartExportOptions = {}): UseChartExportReturn {
  const {
    filename = "chart-export",
    backgroundColor = "#ffffff",
    scale = 2, // 2x for retina-quality output
  } = options

  const chartRef = useRef<HTMLDivElement>(null)
  const [exportingFormat, setExportingFormat] = useState<ExportFormat | null>(null)

  const isExporting = exportingFormat !== null

  const exportChart = useCallback(
    async (format: ExportFormat = "png") => {
      if (!chartRef.current) return

      setExportingFormat(format)

      try {
        // Dynamically import html2canvas to keep bundle size down
        const html2canvas = (await import("html2canvas")).default

        const canvas = await html2canvas(chartRef.current, {
          backgroundColor,
          scale,
          useCORS: true,
          logging: false,
        })

        if (format === "png") {
          // PNG: trigger direct download
          const link = document.createElement("a")
          link.download = `${filename}.png`
          link.href = canvas.toDataURL("image/png")
          link.click()
        } else if (format === "pdf") {
          // PDF: embed the canvas image into a PDF via jsPDF
          const { jsPDF } = await import("jspdf")

          const imgData = canvas.toDataURL("image/png")
          const imgWidth = canvas.width
          const imgHeight = canvas.height

          // A4 landscape in mm
          const pdfWidth = 297
          const pdfHeight = 210

          // Scale image to fit the page with padding
          const padding = 10
          const availableWidth = pdfWidth - padding * 2
          const availableHeight = pdfHeight - padding * 2
          const ratio = Math.min(availableWidth / imgWidth, availableHeight / imgHeight)

          const scaledWidth = imgWidth * ratio
          const scaledHeight = imgHeight * ratio

          // Center on page
          const xOffset = (pdfWidth - scaledWidth) / 2
          const yOffset = (pdfHeight - scaledHeight) / 2

          const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" })
          pdf.addImage(imgData, "PNG", xOffset, yOffset, scaledWidth, scaledHeight)
          pdf.save(`${filename}.pdf`)
        }
      } catch (err) {
        console.error("[useChartExport] Export failed:", err)
      } finally {
        setExportingFormat(null)
      }
    },
    [filename, backgroundColor, scale]
  )

  return { chartRef, exportChart, isExporting, exportingFormat }
}