import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true); setErr('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setErr(error.message)
    setBusy(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-6 shadow">
        <h1 className="text-xl font-bold text-sky-900">Smart Service Docs</h1>
        <p className="text-sm text-slate-500">Quotation &amp; Delivery Challan</p>
        <div><label className="lbl">Email</label><input className="field" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div><label className="lbl">Password</label><input className="field" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        {err && <p className="text-sm text-red-600">{err}</p>}
        <button className="btn-primary w-full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </div>
  )
}
