import { supabase } from './supabase'
import { calcTotals, DEFAULT_COMPANY, type Company, type DocData, type DocRow, type DocType } from './types'

export async function loadCompany(): Promise<Company> {
  const { data } = await supabase.from('sd_settings').select('company').maybeSingle()
  return { ...DEFAULT_COMPANY, ...(data?.company ?? {}) }
}

export async function saveCompany(company: Company) {
  const { data: u } = await supabase.auth.getUser()
  const { error } = await supabase
    .from('sd_settings')
    .upsert({ owner: u.user!.id, company, updated_at: new Date().toISOString() })
  if (error) throw error
}

export async function listDocs(): Promise<DocRow[]> {
  const { data, error } = await supabase
    .from('sd_documents')
    .select('*')
    .order('doc_date', { ascending: false })
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as DocRow[]
}

export async function getDoc(id: string): Promise<DocRow> {
  const { data, error } = await supabase.from('sd_documents').select('*').eq('id', id).single()
  if (error) throw error
  return data as DocRow
}

export async function deleteDoc(id: string) {
  const { error } = await supabase.from('sd_documents').delete().eq('id', id)
  if (error) throw error
}

/** Next number = highest existing numeric suffix for that type + 1 (SS/1006 -> SS/1007). */
export async function nextNumber(type: DocType, company: Company): Promise<string> {
  const prefix = type === 'quotation' ? company.quotationPrefix : company.challanPrefix
  const { data } = await supabase.from('sd_documents').select('number').eq('type', type)
  let max = type === 'quotation' ? 1000 : 10049
  for (const r of data ?? []) {
    const m = /(\d+)\s*$/.exec(r.number)
    if (m) max = Math.max(max, parseInt(m[1], 10))
  }
  return `${prefix}${max + 1}`
}

export async function saveDoc(data: DocData, id?: string): Promise<string> {
  const { total } = calcTotals(data)
  const row = {
    type: data.type,
    number: data.number,
    doc_date: data.date,
    customer_name: data.customerName,
    total,
    data,
    updated_at: new Date().toISOString(),
  }
  const q = id
    ? supabase.from('sd_documents').update(row).eq('id', id).select('id').single()
    : supabase.from('sd_documents').insert(row).select('id').single()
  const { data: saved, error } = await q
  if (error) throw error

  // remember customer + items for autofill (best-effort)
  const { data: u } = await supabase.auth.getUser()
  const owner = u.user!.id
  if (data.customerName.trim()) {
    await supabase.from('sd_customers').upsert(
      { owner, name: data.customerName.trim(), address: data.customerAddress, phone: data.customerPhone },
      { onConflict: 'owner,name' },
    )
  }
  const items = data.items.filter((i) => i.desc.trim()).map((i) => ({ owner, description: i.desc.trim(), uom: i.uom, rate: i.rate }))
  if (items.length) await supabase.from('sd_items').upsert(items, { onConflict: 'owner,description' })
  return saved.id as string
}

export async function loadMemory() {
  const [c, i] = await Promise.all([
    supabase.from('sd_customers').select('name,address,phone').order('name'),
    supabase.from('sd_items').select('description,uom,rate').order('description'),
  ])
  return {
    customers: (c.data ?? []) as { name: string; address: string; phone: string }[],
    items: (i.data ?? []) as { description: string; uom: string; rate: number }[],
  }
}
