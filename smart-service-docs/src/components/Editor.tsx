import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { loadMemory, saveDoc } from '../lib/db'
import { downloadBlob, elementToPdf, sharePdf } from '../lib/pdf'
import { calcTotals, type Company, type DocData, type Item } from '../lib/types'
import { ChallanSheet, QuotationSheet } from './Sheets'

interface Props { initial: DocData; id?: string; company: Company; onBack: () => void; onSaved: (id: string) => void }

export function Editor({ initial, id, company, onBack, onSaved }: Props) {
  const [doc, setDoc] = useState<DocData>(initial)
  const [docId, setDocId] = useState(id)
  const [view, setView] = useState<'form' | 'preview'>('form')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const [mem, setMem] = useState<Awaited<ReturnType<typeof loadMemory>>>({ customers: [], items: [] })
  const captureRef = useRef<HTMLDivElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const isQ = doc.type === 'quotation'
  const Sheet = isQ ? QuotationSheet : ChallanSheet
  const totals = calcTotals(doc)

  useEffect(() => { loadMemory().then(setMem) }, [])
  useLayoutEffect(() => {
    const el = boxRef.current
    if (!el) return
    const fit = () => setScale(Math.min(1, el.clientWidth / 794))
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [view])

  const set = <K extends keyof DocData>(k: K, v: DocData[K]) => setDoc((d) => ({ ...d, [k]: v }))
  const setItem = (i: number, patch: Partial<Item>) => set('items', doc.items.map((it, n) => (n === i ? { ...it, ...patch } : it)))

  function pickCustomer(name: string) {
    set('customerName', name)
    const c = mem.customers.find((x) => x.name === name)
    if (c) setDoc((d) => ({ ...d, customerName: name, customerAddress: c.address, customerPhone: c.phone }))
  }
  function pickItem(i: number, desc: string) {
    const m = mem.items.find((x) => x.description === desc)
    setItem(i, m ? { desc, uom: m.uom, rate: Number(m.rate) } : { desc })
  }

  async function save() {
    setBusy(true); setMsg('')
    try {
      const sid = await saveDoc(doc, docId)
      setDocId(sid); setMsg('Saved ✓'); onSaved(sid)
    } catch (e) {
      const m = (e as Error).message
      setMsg(m.includes('duplicate') ? `Number ${doc.number} already exists – change it.` : m)
    }
    setBusy(false)
  }

  const fileName = `${isQ ? 'Quotation' : 'Delivery_Challan'}_${doc.number.replace(/[^\w]+/g, '_')}_${doc.customerName.replace(/[^\w]+/g, '_').slice(0, 24)}.pdf`
  async function pdf(action: 'download' | 'share') {
    if (!captureRef.current) return
    setBusy(true)
    try {
      const blob = await elementToPdf(captureRef.current)
      if (action === 'download') downloadBlob(blob, fileName)
      else {
        const r = await sharePdf(blob, fileName, `${isQ ? 'Quotation' : 'Delivery Challan'} ${doc.number} – ${company.name}`)
        if (r === 'downloaded') setMsg('PDF downloaded – attach it in WhatsApp.')
      }
    } catch (e) { setMsg((e as Error).message) }
    setBusy(false)
  }

  return (
    <div className="mx-auto max-w-3xl pb-28">
      <div className="sticky top-0 z-10 flex items-center justify-between gap-2 bg-slate-100/95 p-3 backdrop-blur">
        <button className="btn-ghost" onClick={onBack}>← Back</button>
        <div className="flex rounded-lg bg-white p-1 shadow-sm">
          {(['form', 'preview'] as const).map((v) => (
            <button key={v} onClick={() => setView(v)} className={`btn px-4 py-1.5 ${view === v ? 'bg-sky-800 text-white' : 'text-slate-600'}`}>{v === 'form' ? 'Edit' : 'Preview'}</button>
          ))}
        </div>
      </div>

      {view === 'form' ? (
        <div className="space-y-4 p-3">
          <section className="grid grid-cols-2 gap-3 rounded-xl bg-white p-4">
            <div><label className="lbl">{isQ ? 'Ref. No.' : 'Challan No.'}</label><input className="field" value={doc.number} onChange={(e) => set('number', e.target.value)} /></div>
            <div><label className="lbl">Date</label><input className="field" type="date" value={doc.date} onChange={(e) => set('date', e.target.value)} /></div>
          </section>

          <section className="space-y-3 rounded-xl bg-white p-4">
            <div>
              <label className="lbl">Customer / Company</label>
              <input className="field" list="customers" value={doc.customerName} onChange={(e) => pickCustomer(e.target.value)} placeholder="Type to search saved customers" />
              <datalist id="customers">{mem.customers.map((c) => <option key={c.name} value={c.name} />)}</datalist>
            </div>
            {isQ && <div><label className="lbl">Attention (e.g. The Manager)</label><input className="field" value={doc.attention} onChange={(e) => set('attention', e.target.value)} /></div>}
            <div><label className="lbl">Address</label><textarea className="field" rows={3} value={doc.customerAddress} onChange={(e) => set('customerAddress', e.target.value)} /></div>
            {isQ ? (
              <div><label className="lbl">Subject</label><input className="field" value={doc.subject} onChange={(e) => set('subject', e.target.value)} placeholder="Quotation for …" /></div>
            ) : (
              <>
                <div><label className="lbl">Phone(s)</label><textarea className="field" rows={2} value={doc.customerPhone} onChange={(e) => set('customerPhone', e.target.value)} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="lbl">P.O. No.</label><input className="field" value={doc.poNo} onChange={(e) => set('poNo', e.target.value)} /></div>
                  <div><label className="lbl">P.O. Date</label><input className="field" type="date" value={doc.poDate} onChange={(e) => set('poDate', e.target.value)} /></div>
                </div>
              </>
            )}
          </section>

          <section className="space-y-3 rounded-xl bg-white p-4">
            <h3 className="font-bold text-slate-700">Items</h3>
            {doc.items.map((it, i) => (
              <div key={i} className="space-y-2 rounded-lg border border-slate-200 p-3">
                <div className="flex items-center justify-between"><span className="text-xs font-bold text-slate-400">#{i + 1}</span>
                  {doc.items.length > 1 && <button className="text-xs font-semibold text-red-600" onClick={() => set('items', doc.items.filter((_, n) => n !== i))}>Remove</button>}</div>
                <textarea className="field" rows={2} placeholder="Description" value={it.desc} onChange={(e) => setItem(i, { desc: e.target.value })} />
                {it.desc.trim().length > 1 && (
                  <div className="flex flex-wrap gap-1">
                    {mem.items.filter((m) => m.description !== it.desc && m.description.toLowerCase().includes(it.desc.trim().toLowerCase())).slice(0, 3).map((m) => (
                      <button key={m.description} type="button" className="rounded-full bg-sky-50 px-3 py-1 text-xs text-sky-800" onClick={() => pickItem(i, m.description)}>{m.description.split('\n')[0].slice(0, 40)}</button>
                    ))}
                  </div>
                )}
                <div className={`grid gap-2 ${isQ ? 'grid-cols-3' : 'grid-cols-2'}`}>
                  <div><label className="lbl">Qty</label><input className="field" type="number" inputMode="decimal" min={0} value={it.qty} onChange={(e) => setItem(i, { qty: Number(e.target.value) })} /></div>
                  <div><label className="lbl">Unit</label><input className="field" value={it.uom} onChange={(e) => setItem(i, { uom: e.target.value })} /></div>
                  {isQ && <div><label className="lbl">Rate ₹</label><input className="field" type="number" inputMode="decimal" min={0} value={it.rate} onChange={(e) => setItem(i, { rate: Number(e.target.value) })} /></div>}
                </div>
              </div>
            ))}
            <button className="btn-ghost w-full" onClick={() => set('items', [...doc.items, { desc: '', qty: 1, uom: isQ ? 'NOS' : 'PCS', rate: 0 }])}>+ Add item</button>
          </section>

          {isQ && (
            <section className="space-y-3 rounded-xl bg-white p-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="lbl">GST</label>
                  <select className="field" value={doc.gstMode} onChange={(e) => set('gstMode', e.target.value as 'extra' | 'none')}>
                    <option value="none">Extra as applicable (not added)</option><option value="extra">Add GST to total</option>
                  </select></div>
                <div><label className="lbl">GST %</label><input className="field" type="number" value={doc.gstPercent} onChange={(e) => set('gstPercent', Number(e.target.value))} /></div>
              </div>
              <div><label className="lbl">Terms &amp; Conditions (one per line)</label>
                <textarea className="field" rows={5} value={doc.terms.join('\n')} onChange={(e) => set('terms', e.target.value.split('\n'))} /></div>
              <div className="text-right text-lg font-bold">Total ₹ {totals.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            </section>
          )}
        </div>
      ) : (
        <div ref={boxRef} className="p-3">
          <div style={{ height: 1123 * scale }}>
            <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: 794 }} className="shadow-lg">
              <Sheet doc={doc} company={company} />
            </div>
          </div>
        </div>
      )}

      {/* off-screen full-size copy used only for PDF capture */}
      <div style={{ position: 'fixed', left: -10000, top: 0 }} aria-hidden><Sheet ref={captureRef} doc={doc} company={company} /></div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white p-3">
        {msg && <p className="mb-2 text-center text-sm text-slate-600">{msg}</p>}
        <div className="mx-auto grid max-w-3xl grid-cols-3 gap-2">
          <button className="btn-primary" disabled={busy} onClick={save}>Save</button>
          <button className="btn-ghost" disabled={busy} onClick={() => pdf('download')}>PDF</button>
          <button className="btn bg-green-600 text-white hover:bg-green-700" disabled={busy} onClick={() => pdf('share')}>Share</button>
        </div>
      </div>
    </div>
  )
}
