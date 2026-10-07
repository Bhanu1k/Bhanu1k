export const inr = (n: number) =>
  new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0)

export const qtyFmt = (n: number) => new Intl.NumberFormat('en-IN').format(n || 0)

/** ISO yyyy-mm-dd -> dd.mm.yyyy (quotation) or dd/mm/yyyy (challan) */
export function fmtDate(iso: string, sep = '.'): string {
  const [y, m, d] = iso.split('-')
  return y && m && d ? `${d}${sep}${m}${sep}${y}` : ''
}

export const today = () => new Date().toISOString().slice(0, 10)
