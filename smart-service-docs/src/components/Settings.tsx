import { useEffect, useState } from 'react'
import { loadCompany, saveCompany } from '../lib/db'
import { DEFAULT_COMPANY, type Company } from '../lib/types'

export function Settings({ onBack }: { onBack: () => void }) {
  const [c, setC] = useState<Company>(DEFAULT_COMPANY)
  const [msg, setMsg] = useState('')
  useEffect(() => { loadCompany().then(setC) }, [])

  const set = (k: keyof Company) => (e: React.ChangeEvent<HTMLInputElement>) => setC({ ...c, [k]: e.target.value })
  const bank = (k: keyof Company['bank']) => (e: React.ChangeEvent<HTMLInputElement>) => setC({ ...c, bank: { ...c.bank, [k]: e.target.value } })
  const text: [keyof Company, string][] = [
    ['name', 'Company name'], ['iso', 'ISO line'], ['distributor', 'Distributor line'], ['mobile', 'Mobile 1'], ['mobile2', 'Mobile 2'],
    ['service', 'Service no.'], ['email', 'E-mail'], ['headOffice', 'Head office'], ['branches', 'Branch offices'],
    ['gstin', 'GST ID'], ['pan', 'PAN'], ['esi', 'ESI no.'], ['pf', 'PF no.'], ['quotationPrefix', 'Quotation prefix'], ['challanPrefix', 'Challan prefix'],
  ]

  async function save() {
    try { await saveCompany(c); setMsg('Saved ✓') } catch (e) { setMsg((e as Error).message) }
  }

  return (
    <div className="mx-auto max-w-2xl p-4">
      <button className="btn-ghost mb-3" onClick={onBack}>← Back</button>
      <h2 className="mb-3 text-lg font-bold">Company details (printed on every document)</h2>
      <div className="space-y-3 rounded-xl bg-white p-4">
        {text.map(([k, label]) => (
          <div key={k}><label className="lbl">{label}</label><input className="field" value={c[k] as string} onChange={set(k)} /></div>
        ))}
        {(['bank', 'account', 'branch', 'rtgs', 'micr'] as const).map((k) => (
          <div key={k}><label className="lbl">Bank – {k}</label><input className="field" value={c.bank[k]} onChange={bank(k)} /></div>
        ))}
        <div>
          <label className="lbl">Default terms (one per line)</label>
          <textarea className="field" rows={5} value={c.defaultTerms.join('\n')} onChange={(e) => setC({ ...c, defaultTerms: e.target.value.split('\n') })} />
        </div>
        <button className="btn-primary w-full" onClick={save}>Save settings</button>
        {msg && <p className="text-center text-sm">{msg}</p>}
      </div>
    </div>
  )
}
