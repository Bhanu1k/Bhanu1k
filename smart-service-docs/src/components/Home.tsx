import { useEffect, useMemo, useState } from 'react'
import { deleteDoc, listDocs } from '../lib/db'
import { fmtDate, inr } from '../lib/format'
import type { DocRow, DocType } from '../lib/types'

interface Props {
  onNew: (type: DocType) => void
  onOpen: (id: string) => void
  onCopy: (row: DocRow) => void
  onConvert: (row: DocRow) => void
  onSettings: () => void
  onLogout: () => void
}

export function Home({ onNew, onOpen, onCopy, onConvert, onSettings, onLogout }: Props) {
  const [rows, setRows] = useState<DocRow[]>([])
  const [q, setQ] = useState('')
  const [tab, setTab] = useState<'all' | DocType>('all')
  const [err, setErr] = useState('')

  const load = () => listDocs().then(setRows).catch((e) => setErr(e.message))
  useEffect(() => { load() }, [])

  const shown = useMemo(() => {
    const s = q.trim().toLowerCase()
    return rows.filter((r) => (tab === 'all' || r.type === tab) && (!s || (r.number + ' ' + r.customer_name).toLowerCase().includes(s)))
  }, [rows, q, tab])

  return (
    <div className="mx-auto max-w-2xl p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-sky-900">Smart Service Docs</h1>
        <div className="flex gap-2">
          <button className="btn-ghost" onClick={onSettings}>Settings</button>
          <button className="btn-ghost" onClick={onLogout}>Logout</button>
        </div>
      </div>
      <div className="mb-4 grid grid-cols-2 gap-3">
        <button className="btn-primary py-4 text-base" onClick={() => onNew('quotation')}>+ New Quotation</button>
        <button className="btn-primary bg-emerald-700 py-4 text-base hover:bg-emerald-800" onClick={() => onNew('challan')}>+ New Delivery Challan</button>
      </div>
      <input className="field mb-3" placeholder="Search number or customer…" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="mb-3 flex gap-2">
        {(['all', 'quotation', 'challan'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`btn ${tab === t ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 border border-slate-300'}`}>
            {t === 'all' ? 'All' : t === 'quotation' ? 'Quotations' : 'Challans'}
          </button>
        ))}
      </div>
      {err && <p className="mb-2 text-sm text-red-600">{err}</p>}
      <ul className="space-y-2">
        {shown.map((r) => (
          <li key={r.id} className="rounded-xl bg-white p-3 shadow-sm">
            <button className="w-full text-left" onClick={() => onOpen(r.id)}>
              <div className="flex justify-between">
                <span className="font-semibold">{r.number} <span className="text-xs font-normal text-slate-400">{r.type === 'quotation' ? 'Quotation' : 'Challan'}</span></span>
                <span className="text-sm text-slate-500">{fmtDate(r.doc_date)}</span>
              </div>
              <div className="text-sm text-slate-600">{r.customer_name || '—'}{r.type === 'quotation' && ` · ₹${inr(r.total)}`}</div>
            </button>
            <div className="mt-2 flex gap-3 text-xs font-semibold text-sky-800">
              <button onClick={() => onCopy(r)}>Duplicate</button>
              {r.type === 'quotation' && <button onClick={() => onConvert(r)}>→ Challan</button>}
              <button className="text-red-600" onClick={async () => { if (confirm(`Delete ${r.number}?`)) { await deleteDoc(r.id); load() } }}>Delete</button>
            </div>
          </li>
        ))}
        {!shown.length && <li className="py-8 text-center text-sm text-slate-400">No documents yet</li>}
      </ul>
    </div>
  )
}
