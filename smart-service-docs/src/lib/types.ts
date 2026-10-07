export type DocType = 'quotation' | 'challan'

export interface Item { desc: string; qty: number; uom: string; rate: number }

export interface DocData {
  type: DocType
  number: string
  date: string // ISO
  customerName: string
  customerAddress: string
  customerPhone: string
  attention: string // "The Manager" (quotation) 
  subject: string
  items: Item[]
  gstMode: 'extra' | 'none'
  gstPercent: number
  terms: string[]
  poNo: string
  poDate: string // ISO
}

export interface DocRow {
  id: string
  type: DocType
  number: string
  doc_date: string
  customer_name: string
  total: number
  data: DocData
  updated_at: string
}

export interface Company {
  name: string
  iso: string
  distributor: string
  mobile: string
  mobile2: string
  service: string
  email: string
  headOffice: string
  branches: string
  gstin: string
  pan: string
  esi: string
  pf: string
  bank: { bank: string; account: string; branch: string; rtgs: string; micr: string }
  quotationPrefix: string
  challanPrefix: string
  defaultTerms: string[]
}

export const DEFAULT_COMPANY: Company = {
  name: 'SMART SERVICE',
  iso: '(ISO 9001:2015 & ISO: 14001:2015 & OHSAS 18001:2007 CERTIFIED COMPANY)',
  distributor: 'Authorized Distributor of VOLTAS & KENT',
  mobile: '9002584557',
  mobile2: '9804478422',
  service: '8373064501',
  email: 'smartservice10@gmail.com',
  headOffice: 'Head Office: 1no HPL Link Road, Manjushree, Khudiram Square (Near Classic INN), PO- Khanjanchak, PIN 721602',
  branches: 'Br. Office: Noamundi, Jharkhand   Br. Office: Joda, Orissa.',
  gstin: '19ANOPP6358D1ZH',
  pan: 'ANOPP6358D',
  esi: '41000512720001099',
  pf: 'WBCAL61097',
  bank: { bank: 'ICICI BANK LTD', account: '110105500058', branch: 'Haldia', rtgs: 'ICIC0001101', micr: '721229002' },
  quotationPrefix: 'SS/',
  challanPrefix: 'SS/',
  defaultTerms: [
    'Payment: 100% payment shall be made after submission of the Tax Invoice and delivery of the materials.',
    'GST: GST @ 18% will be charged extra as applicable.',
    'Delivery: Delivery is included in our scope for the Haldia area.',
  ],
}

export function calcTotals(d: Pick<DocData, 'items' | 'gstMode' | 'gstPercent'>) {
  const subtotal = d.items.reduce((s, i) => s + (Number(i.qty) || 0) * (Number(i.rate) || 0), 0)
  const gst = d.gstMode === 'extra' ? Math.round(subtotal * d.gstPercent) / 100 : 0
  return { subtotal, gst, total: subtotal + gst }
}
