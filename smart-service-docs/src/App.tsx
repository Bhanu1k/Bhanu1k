import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { configured, supabase } from './lib/supabase'
import { getDoc, loadCompany, nextNumber } from './lib/db'
import { today } from './lib/format'
import { DEFAULT_COMPANY, type Company, type DocData, type DocRow, type DocType } from './lib/types'
import { Login } from './components/Login'
import { Home } from './components/Home'
import { Editor } from './components/Editor'
import { Settings } from './components/Settings'

type Screen = { name: 'home' } | { name: 'settings' } | { name: 'edit'; doc: DocData; id?: string }

function blank(type: DocType, number: string, company: Company): DocData {
  return {
    type, number, date: today(),
    customerName: '', customerAddress: '', customerPhone: '', attention: 'The Manager', subject: '',
    items: [{ desc: '', qty: 1, uom: type === 'quotation' ? 'NOS' : 'PCS', rate: 0 }],
    gstMode: 'none', gstPercent: 18, terms: [...company.defaultTerms], poNo: '', poDate: '',
  }
}

export default function App() {
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const [screen, setScreen] = useState<Screen>({ name: 'home' })
  const [company, setCompany] = useState<Company>(DEFAULT_COMPANY)
  const [homeKey, setHomeKey] = useState(0)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])
  useEffect(() => { if (session) loadCompany().then(setCompany) }, [session, screen.name])

  if (!configured) return <p className="p-6 text-red-700">Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env (see .env.example).</p>
  if (session === undefined) return <p className="p-6 text-slate-500">Loading…</p>
  if (!session) return <Login />

  const home = () => { setHomeKey((k) => k + 1); setScreen({ name: 'home' }) }

  async function create(type: DocType, seed?: Partial<DocData>) {
    const number = await nextNumber(type, company)
    setScreen({ name: 'edit', doc: { ...blank(type, number, company), ...seed, type, number, date: today() } })
  }

  switch (screen.name) {
    case 'settings': return <Settings onBack={home} />
    case 'edit': return <Editor key={screen.doc.number + (screen.id ?? '')} initial={screen.doc} id={screen.id} company={company} onBack={home}
      onSaved={(id) => setScreen((s) => (s.name === 'edit' ? { ...s, id } : s))} />
    default: return <Home key={homeKey}
      onNew={(t) => create(t)}
      onOpen={async (id) => { const r = await getDoc(id); setScreen({ name: 'edit', doc: r.data, id }) }}
      onCopy={(r: DocRow) => create(r.type, r.data)}
      onConvert={(r: DocRow) => create('challan', { ...r.data, poNo: '', poDate: '' })}
      onSettings={() => setScreen({ name: 'settings' })}
      onLogout={() => supabase.auth.signOut()} />
  }
}
