import { forwardRef } from 'react'
import { amountInWords } from '../lib/words'
import { fmtDate, inr, qtyFmt } from '../lib/format'
import { calcTotals, type Company, type DocData } from '../lib/types'

interface Props { doc: DocData; company: Company }

function Header({ company, title }: { company: Company; title: string }) {
  return (
    <div className="text-center">
      <div className="text-right text-[13px]">Mob- {company.mobile}</div>
      <div className="mt-1 text-[30px] font-bold tracking-wide" style={{ fontFamily: 'Georgia, serif' }}>{company.name}</div>
      <div className="text-[11px]">{company.iso}</div>
      <div className="text-[13px] font-semibold">{company.distributor}</div>
      <div className="mt-3 text-[20px] font-bold underline">{title}</div>
    </div>
  )
}

function Footer({ company }: { company: Company }) {
  return (
    <div className="absolute bottom-6 left-12 right-12 text-[11px]">
      <div className="mb-2 flex justify-between gap-4 border-t border-black pt-2">
        <div>
          <div>GST Provisional ID: {company.gstin}</div>
          <div>PAN No : {company.pan}</div>
          <div>ESI Registration No : {company.esi}</div>
          <div>Provident Fund Registration No : {company.pf}</div>
        </div>
        <div>
          <div>Bank Details: Bank: {company.bank.bank}</div>
          <div>A/c No: {company.bank.account}</div>
          <div>Branch: {company.bank.branch}</div>
          <div>RTGS NO: {company.bank.rtgs}</div>
          <div>MICR NO: {company.bank.micr}</div>
        </div>
      </div>
      <div className="text-center">
        <div>{company.headOffice}</div>
        <div>{company.branches}</div>
        <div>Service- {company.service}, E-mail: {company.email}</div>
      </div>
    </div>
  )
}

export const QuotationSheet = forwardRef<HTMLDivElement, Props>(({ doc, company }, ref) => {
  const t = calcTotals(doc)
  return (
    <div ref={ref} className="sheet">
      <Header company={company} title="QUOTATION" />
      <div className="mt-4 flex justify-between">
        <div>Ref. No. {doc.number}</div>
        <div>Date- {fmtDate(doc.date)}</div>
      </div>
      <div className="mt-3">
        <div>To,</div>
        {doc.attention && <div>{doc.attention}</div>}
        <div className="font-semibold">{doc.customerName}</div>
        <div className="pre">{doc.customerAddress}</div>
      </div>
      {doc.subject && <div className="mt-3 text-center font-bold underline">Sub: {doc.subject}</div>}
      <table className="mt-3 text-[13px]">
        <thead>
          <tr><th style={{ width: 44 }}>SL. No.</th><th>ITEM DESCRIPTION</th><th style={{ width: 44 }}>QTY</th><th style={{ width: 52 }}>UOM</th><th style={{ width: 96 }}>UNIT RATE (Rs.)</th><th style={{ width: 100 }}>NET VALUE (Rs.)</th></tr>
        </thead>
        <tbody>
          {doc.items.map((it, i) => (
            <tr key={i}>
              <td className="text-center">{String(i + 1).padStart(2, '0')}.</td>
              <td className="pre">{it.desc}</td>
              <td className="text-center">{String(it.qty).padStart(2, '0')}</td>
              <td className="text-center">{it.uom}</td>
              <td className="text-right">{inr(it.rate)}</td>
              <td className="text-right">{inr(it.qty * it.rate)}</td>
            </tr>
          ))}
          {doc.gstMode === 'extra' && doc.gstPercent > 0 && (
            <>
              <tr><td colSpan={5} className="text-right">SUB TOTAL</td><td className="text-right">{inr(t.subtotal)}</td></tr>
              <tr><td colSpan={5} className="text-right">GST @ {doc.gstPercent}%</td><td className="text-right">{inr(t.gst)}</td></tr>
            </>
          )}
          <tr><td colSpan={5} className="text-right font-bold">TOTAL</td><td className="text-right font-bold">{inr(t.total)}</td></tr>
        </tbody>
      </table>
      <div className="mt-2 font-semibold">Rupees In Word: {amountInWords(t.total)}</div>
      <div className="mt-4 font-bold underline">Terms &amp; Conditions</div>
      <ol className="ml-5 list-decimal text-[13px]">
        {doc.terms.filter(Boolean).map((x, i) => <li key={i}>{x}</li>)}
      </ol>
      <div className="mt-5">
        <div>Yours Faithfully,</div>
        <div className="font-bold">{company.name}</div>
        <div>(Sale &amp; Service Centre)</div>
        <div>MOB: {company.mobile}</div>
      </div>
      <Footer company={company} />
    </div>
  )
})

export const ChallanSheet = forwardRef<HTMLDivElement, Props>(({ doc, company }, ref) => {
  const line = 'border-b border-black'
  return (
    <div ref={ref} className="sheet">
      <div className="text-center text-[20px] font-bold">DELIVERY CHALLAN</div>
      <div className="mt-1 flex justify-between text-[13px]">
        <div>Challan No.- {doc.number}</div>
        <div className="text-right">Mob- {company.mobile},<br />{company.mobile2}</div>
      </div>
      <div className="-mt-6 text-center text-[30px] font-bold tracking-wide" style={{ fontFamily: 'Georgia, serif' }}>{company.name}</div>
      <div className="text-center text-[12px]">(Sales &amp; Service Centre)</div>
      <div className="mt-1 text-center text-[11px]">
        <div>{company.headOffice}</div>
        <div>{company.branches}</div>
        <div>E-mail : {company.email}</div>
      </div>

      <div className="mt-8 flex gap-6">
        <div className="flex-1">
          <div className={line + ' font-semibold'}>To&nbsp;{doc.customerName}</div>
          <div className={line + ' pre min-h-[44px]'}>{doc.customerAddress}</div>
          <div className={line + ' mt-3'}>P.O. No.&nbsp;{doc.poNo}</div>
        </div>
        <div className="w-[240px]">
          <div className={line}>Challan Date&nbsp;{fmtDate(doc.date, '/')}</div>
          <div className={line + ' pre mt-2 min-h-[44px]'}>Phone&nbsp;{doc.customerPhone}</div>
          <div className={line + ' mt-3'}>P.O. Date&nbsp;{doc.poDate ? fmtDate(doc.poDate) : ''}</div>
        </div>
      </div>

      <table className="mt-6">
        <thead><tr><th style={{ width: 60 }}>SL. No.</th><th>DESCRIPTION</th><th style={{ width: 160 }}>QUANTITY</th></tr></thead>
        <tbody>
          {doc.items.map((it, i) => (
            <tr key={i}>
              <td className="text-center">{String(i + 1).padStart(2, '0')})</td>
              <td className="pre">{it.desc}</td>
              <td className="text-center">{qtyFmt(it.qty)} {it.uom}</td>
            </tr>
          ))}
          {Array.from({ length: Math.max(0, 8 - doc.items.length) }).map((_, i) => (
            <tr key={'e' + i}><td>&nbsp;</td><td /><td /></tr>
          ))}
        </tbody>
      </table>

      <div className="absolute bottom-16 left-12 right-12 flex justify-between text-[13px]">
        <div>
          <div>Received by</div>
          <div>Signature ……………………………………………</div>
          <div>Date -</div><div>Stamp -</div><div>Ph. No. -</div>
        </div>
        <div>
          <div className="font-bold">For {company.name}</div>
          <div className="mt-6">Authorised Signature ………………………………</div>
          <div>Date –</div><div>Stamp -</div>
        </div>
      </div>
    </div>
  )
})
