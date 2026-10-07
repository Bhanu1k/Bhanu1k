const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

function below100(n: number): string {
  if (n < 20) return ONES[n]
  return TENS[Math.floor(n / 10)] + (n % 10 ? '-' + ONES[n % 10] : '')
}

function below1000(n: number): string {
  const h = Math.floor(n / 100)
  const r = n % 100
  return [h ? ONES[h] + ' Hundred' : '', r ? below100(r) : ''].filter(Boolean).join(' ')
}

/** Indian numbering (Thousand / Lakh / Crore). 48250 -> "Forty-Eight Thousand Two Hundred Fifty Only" */
export function amountInWords(amount: number): string {
  const rupees = Math.floor(Math.round(amount * 100) / 100)
  const paise = Math.round((amount - rupees) * 100)
  if (rupees === 0 && paise === 0) return 'Zero Only'
  const parts: string[] = []
  const crore = Math.floor(rupees / 10000000)
  const lakh = Math.floor((rupees % 10000000) / 100000)
  const thousand = Math.floor((rupees % 100000) / 1000)
  const rest = rupees % 1000
  if (crore) parts.push(below1000(crore) + ' Crore')
  if (lakh) parts.push(below100(lakh) + ' Lakh')
  if (thousand) parts.push(below100(thousand) + ' Thousand')
  if (rest) parts.push(below1000(rest))
  let out = parts.join(' ')
  if (paise) out += (out ? ' and ' : '') + below100(paise) + ' Paise'
  return out + ' Only'
}
