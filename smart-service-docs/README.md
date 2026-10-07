# Smart Service Docs

Standalone mobile-first app to create **Quotations** and **Delivery Challans** in the Smart Service format, save them in Supabase, and download/share them as PDF (WhatsApp) from a phone. Not connected to the Smart Service marketing website.

## Setup
1. Create a Supabase project; run `supabase/schema.sql` in the SQL editor.
2. Authentication → add your user (email + password); turn off public sign-ups.
3. `cp .env.example .env` and fill `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`.
4. `npm install && npm run dev` (open on phone, "Add to Home Screen").
5. Deploy `dist/` (`npm run build`) to Vercel/Netlify as its own project.

## Use
New Quotation / Challan → number & date auto-filled → pick customer/items (remembered) → Preview → Save → PDF or Share.
Duplicate any old document, or convert a quotation to a challan. Company details/bank/terms: Settings.

`npm test` checks the amount-in-words logic (Indian lakh/crore).
