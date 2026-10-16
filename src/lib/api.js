// Jembatan frontend ↔ Google Apps Script (GAS).
// Kalau VITE_GAS_URL tidak diisi, mode "lokal" (localStorage) tetap dipakai.

const GAS_URL = (import.meta.env.VITE_GAS_URL || '').trim()
const GAS_TOKEN = (import.meta.env.VITE_GAS_TOKEN || '').trim()

export const gasEnabled = GAS_URL.length > 0

// GET ?slug=xxx → { ok, slug, data }
export async function gasGet(slug) {
    if (!gasEnabled) return null
    const url = `${GAS_URL}?slug=${encodeURIComponent(slug)}`
    const res = await fetch(url, { method: 'GET', redirect: 'follow' })
    if (!res.ok) throw new Error(`GAS GET gagal (${res.status})`)
    return res.json()
}

// POST { token, action, ... } → { ok, ... }
export async function gasPost(payload) {
    if (!gasEnabled) return null
    const res = await fetch(GAS_URL, {
        method: 'POST',
        // text/plain menghindari preflight CORS yang tidak didukung GAS Web App
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        redirect: 'follow',
        body: JSON.stringify({ token: GAS_TOKEN, ...payload }),
    })
    if (!res.ok) throw new Error(`GAS POST gagal (${res.status})`)
    return res.json()
}
