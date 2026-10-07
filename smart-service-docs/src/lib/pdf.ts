import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

/** Renders the A4 element to a PDF Blob. The element must be 794x1123 CSS px. */
export async function elementToPdf(el: HTMLElement): Promise<Blob> {
  const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#ffffff', useCORS: true })
  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
  pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, 210, 297)
  return pdf.output('blob')
}

export function downloadBlob(blob: Blob, filename: string) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 5000)
}

/** Share the PDF through the phone's share sheet (WhatsApp etc.); falls back to download. */
export async function sharePdf(blob: Blob, filename: string, text: string): Promise<'shared' | 'downloaded'> {
  const file = new File([blob], filename, { type: 'application/pdf' })
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: filename, text })
      return 'shared'
    } catch (e) {
      if ((e as Error).name === 'AbortError') return 'shared'
    }
  }
  downloadBlob(blob, filename)
  return 'downloaded'
}
