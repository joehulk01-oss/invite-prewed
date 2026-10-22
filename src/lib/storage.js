// Penyimpanan lokal (localStorage) + helper GAS untuk invite-generator.

const STORAGE_KEY_PREFIX = 'invite_form_data'
const GAS_URL_KEY = 'invite_gas_url'
const GAS_TOKEN_KEY = 'invite_gas_token'
const LAST_SLUG_KEY = 'invite_last_slug'

export const DESIGN_TEMPLATES = {
  'elegan-krem': {
    id: 'elegan-krem',
    label: 'Elegan Krem',
    desc: 'Nuansa hangat, klasik & mewah',
    swatch: 'linear-gradient(135deg, #f6f0e6 50%, #c9a87c 50%)',
    vars: {
      '--tpl-bg': '#f6f0e6',
      '--tpl-card': '#ffffff',
      '--tpl-ink': '#2c241c',
      '--tpl-muted': '#7c7165',
      '--tpl-line': '#e5dac9',
      '--tpl-accent': '#8a6240',
      '--tpl-accent2': '#b08a65',
      '--tpl-dark': '#241c14',
      '--tpl-gold1': '#f4d89a',
      '--tpl-gold2': '#b88a38',
    },
  },
  'sage-botanical': {
    id: 'sage-botanical',
    label: 'Sage Botanical',
    desc: 'Sejuk, natural, daun & floral',
    swatch: 'linear-gradient(135deg, #edf2ed 50%, #687f6b 50%)',
    vars: {
      '--tpl-bg': '#edf2ed',
      '--tpl-card': '#ffffff',
      '--tpl-ink': '#1c2820',
      '--tpl-muted': '#5c6b60',
      '--tpl-line': '#d5ded6',
      '--tpl-accent': '#445b48',
      '--tpl-accent2': '#6f8b74',
      '--tpl-dark': '#1a241e',
      '--tpl-gold1': '#e3d7a8',
      '--tpl-gold2': '#a8985c',
    },
  },
  'navy-gold': {
    id: 'navy-gold',
    label: 'Navy & Gold',
    desc: 'Malam berbintang, megah & formal',
    swatch: 'linear-gradient(135deg, #101928 50%, #d4af37 50%)',
    vars: {
      '--tpl-bg': '#0f172a',
      '--tpl-card': '#1b253b',
      '--tpl-ink': '#f1f5f9',
      '--tpl-muted': '#94a3b8',
      '--tpl-line': '#29354d',
      '--tpl-accent': '#d4af37',
      '--tpl-accent2': '#e6ca65',
      '--tpl-dark': '#080d19',
      '--tpl-gold1': '#ffd700',
      '--tpl-gold2': '#b8860b',
    },
  },
}

export function getDesignTemplate(id) {
  return DESIGN_TEMPLATES[id] || DESIGN_TEMPLATES['elegan-krem']
}

export function getGasUrl() {
  return localStorage.getItem(GAS_URL_KEY) || import.meta.env.VITE_GAS_URL || ''
}
export function setGasUrl(url) {
  localStorage.setItem(GAS_URL_KEY, (url || '').trim())
}
export function getGasToken() {
  return localStorage.getItem(GAS_TOKEN_KEY) || import.meta.env.VITE_GAS_TOKEN || ''
}
export function setGasToken(tok) {
  localStorage.setItem(GAS_TOKEN_KEY, (tok || '').trim())
}
export function getLastSlug() {
  return localStorage.getItem(LAST_SLUG_KEY) || ''
}
export function setLastSlug(slug) {
  if (slug) localStorage.setItem(LAST_SLUG_KEY, slug)
}

// Data default untuk form baru
export function defaultInvite() {
  return {
    template: 'elegan-krem',
    namaTamu: '',
    priaPanggilan: 'Andi',
    wanitaPanggilan: 'Sari',
    priaLengkap: 'Andi Pratama, S.T.',
    wanitaLengkap: 'Sari Wulandari, S.Pd.',
    ortuPria: 'Bpk. Budi Pratama & Ibu Ratna',
    ortuWanita: 'Bpk. H. Slamet Wulandari & Ibu Hj. Dewi Wulandari',
    tglAkad: '2026-12-19',
    jamAkad: '08.00 - 10.00 WIB',
    lokasiAkad: 'Masjid Agung Al-Azhar, Jakarta Selatan',
    mapsAkad: '',
    tglResepsi: '2026-12-19',
    jamResepsi: '11.00 - 13.00 WIB',
    lokasiResepsi: 'The Sultan Hotel & Residence, Jakarta',
    mapsResepsi: '',
    fotoCover: '',
    fotoPria: '',
    fotoWanita: '',
    galeri: [],
    musikMode: 'contoh',
    musikUrl: '',
    musikLabel: 'Piano Romantis – Royalty Free (contoh)',
    salamPembuka: 'Assalamu’alaikum warahmatullahi wabarakatuh',
    kutipan: 'Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu agar kamu merasa tenteram, dan Dia menjadikan di antaramu rasa kasih dan sayang. (QS. Ar-Rūm: 21)',
    cerita: [
      { judul: '2019 — Pertama Bertemu', isi: 'Takdir mempertemukan kami di sebuah acara keluarga. Dari perkenalan singkat, obrolan kami mengalir tanpa henti hingga tak terasa waktu berlalu.' },
      { judul: '2023 — Lamaran', isi: 'Dengan restu kedua keluarga, Andi datang melamar Sari. Air mata bahagia dan doa mengiringi langkah kami menuju jenjang yang lebih serius.' },
      { judul: '2026 — Hari Bahagia', isi: 'Kini saatnya kami mengikat janji suci. Kami mengundang Bapak/Ibu/Saudara/i untuk menjadi saksi dan memberikan doa restu di hari bahagia kami.' },
    ],
    bank: 'BCA',
    rekening: '1234 5678 90',
    pemilikRek: 'Andi Pratama',
    pesanWA: 'Assalamu’alaikum {nama}, dengan hormat kami mengundang Bapak/Ibu/Saudara/i ke acara pernikahan kami. Link undangan: {link}',
    pesanRSVP: 'Terima kasih atas konfirmasi kehadiran dan doanya!',
    show: { countdown: true, rsvp: true, loveStory: true, gift: true, galeri: true, musik: true },
  }
}
export const defaultFormData = defaultInvite

export function makeSlug(namaPria, namaWanita) {
  const base = `${namaPria || 'mempelai'}-${namaWanita || 'pasangan'}`
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'undangan'
  const suffix = Math.random().toString(36).slice(2, 6)
  return `${base}-${suffix}`
}

function lsSave(slug, data) {
  try {
    localStorage.setItem(`invite_${slug}`, JSON.stringify(data))
    return true
  } catch (e) { console.error('Gagal simpan localStorage', e); return false }
}
function lsLoad(slug) {
  try {
    const raw = localStorage.getItem(`invite_${slug}`)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export async function saveInvite(slug, data) {
  const payload = { ...data, slug, updatedAt: new Date().toISOString() }
  const localOk = lsSave(slug, payload)
  const gasUrl = getGasUrl()
  if (gasUrl) {
    try {
      const res = await fetch(gasUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        redirect: 'follow',
        body: JSON.stringify({ action: 'save', slug, token: getGasToken(), data: payload }),
      })
      let json = null
      try { json = await res.json() } catch {}
      if (json && json.ok === false) {
        return { ok: false, via: 'gas', error: json.error || 'Gagal menyimpan ke Google Sheets' }
      }
      if (!res.ok) {
        return { ok: false, via: 'gas', error: (json && json.error) || `GAS error ${res.status}` }
      }
      return { ok: true, via: 'gas' }
    } catch (e) {
      console.error('GAS save gagal, fallback lokal', e)
      return { ok: false, via: 'gas', error: String(e && e.message || e) }
    }
  }
  return { ok: localOk, via: 'local' }
}

export async function loadInvite(slug) {
  // 1. Ambil dari GAS DULU bila GAS URL terisi
  const gasUrl = getGasUrl()
  if (gasUrl) {
    try {
      const res = await fetch(`${gasUrl}?slug=${encodeURIComponent(slug)}`, { redirect: 'follow' })
      if (res.ok) {
        const json = await res.json()
        if (json && json.ok && json.data) {
          lsSave(slug, json.data)
          return json.data
        }
      }
    } catch (e) {
      console.error('GAS load gagal, fallback lokal', e)
    }
  }

  // 2. Fallback ke local storage bila GAS kosong/gagal
  return lsLoad(slug)
}

export function listInvites() {
  const out = []
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.startsWith('invite_')) {
        try { out.push({ slug: k.replace('invite_', ''), data: JSON.parse(localStorage.getItem(k)) }) } catch { }
      }
    }
  } catch { }
  return out.sort((a, b) => (b.data?.updatedAt || '').localeCompare(a.data?.updatedAt || ''))
}

// --- CRUD via GAS (spreadsheet) ---
export async function listInvitesRemote() {
  const gasUrl = getGasUrl()
  if (!gasUrl) return { ok: false, error: 'GAS belum disambungkan. Isi URL Web App di tab Pengaturan.' }
  const res = await fetch(`${gasUrl}?action=list&token=${encodeURIComponent(getGasToken())}`, { redirect: 'follow' })
  if (!res.ok) return { ok: false, error: `GAS error ${res.status}` }
  return res.json()
}

export async function updateInviteRemote(slug, patch) {
  const gasUrl = getGasUrl()
  if (!gasUrl) return { ok: false, error: 'GAS belum disambungkan.' }
  try {
    const res = await fetch(gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      redirect: 'follow',
      body: JSON.stringify({ action: 'update', slug, token: getGasToken(), patch }),
    })
    if (res.ok) return res.json()
  } catch (e) { }

  // Fallback GET jika POST terhalang CORS
  const url = `${gasUrl}?action=update&slug=${encodeURIComponent(slug)}&namaTamu=${encodeURIComponent(patch.namaTamu || '')}&token=${encodeURIComponent(getGasToken())}`
  const resGet = await fetch(url, { redirect: 'follow' })
  if (!resGet.ok) return { ok: false, error: `GAS error ${resGet.status}` }
  return resGet.json()
}

export async function deleteInviteRemote(slug) {
  const gasUrl = getGasUrl()
  if (!gasUrl) return { ok: false, error: 'GAS belum disambungkan.' }
  try {
    const res = await fetch(gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      redirect: 'follow',
      body: JSON.stringify({ action: 'delete', slug, token: getGasToken() }),
    })
    if (res.ok) return res.json()
  } catch (e) { }

  // Fallback GET jika POST terhalang CORS
  const url = `${gasUrl}?action=delete&slug=${encodeURIComponent(slug)}&token=${encodeURIComponent(getGasToken())}`
  const resGet = await fetch(url, { redirect: 'follow' })
  if (!resGet.ok) return { ok: false, error: `GAS error ${resGet.status}` }
  return resGet.json()
}

// --- RSVP & ucapan ---
function rsvpKey(slug, kind) { return `${kind}_${slug}` }
export function saveRsvp(slug, entry) {
  try {
    const arr = loadRsvp(slug)
    arr.push({ ...entry, at: new Date().toISOString() })
    localStorage.setItem(rsvpKey(slug, 'rsvp'), JSON.stringify(arr))
  } catch { }
}
export function loadRsvp(slug) {
  try { return JSON.parse(localStorage.getItem(rsvpKey(slug, 'rsvp')) || '[]') } catch { return [] }
}
export function saveWish(slug, entry) {
  try {
    const arr = loadWishes(slug)
    arr.push({ ...entry, at: new Date().toISOString() })
    localStorage.setItem(rsvpKey(slug, 'wishes'), JSON.stringify(arr))
  } catch { }
}
export function loadWishes(slug) {
  try { return JSON.parse(localStorage.getItem(rsvpKey(slug, 'wishes')) || '[]') } catch { return [] }
}

// --- Foto: compress via canvas, max 1200px, JPEG 0.8 → Data URL ---
export function fileToDataUrlCompressed(file, maxDim = 1200, quality = 0.8) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve('')
    if (!file.type.startsWith('image/')) return reject(new Error('File harus gambar'))
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        let { width, height } = img
        const scale = Math.min(1, maxDim / Math.max(width, height))
        width = Math.round(width * scale)
        height = Math.round(height * scale)
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        ctx.globalCompositeOperation = 'destination-over'
        ctx.fillStyle = '#fff'
        ctx.fillRect(0, 0, width, height)
        try { resolve(canvas.toDataURL('image/jpeg', quality)) }
        catch (e) { reject(e) }
      }
      img.onerror = reject
      img.src = reader.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function downloadJson(filename, obj) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

export function formatTanggal(isoDate) {
  if (!isoDate) return '-'
  try {
    const d = new Date(isoDate + 'T00:00:00')
    return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  } catch { return isoDate }
}

export function buildWaLink(pesanTemplate, nama, link) {
  const text = (pesanTemplate || 'Halo {nama}, ini undangan pernikahan kami: {link}')
    .replace(/\{nama\}/g, nama || 'Bapak/Ibu/Saudara/i')
    .replace(/\{link\}/g, link || '')
  return `https://wa.me/?text=${encodeURIComponent(text)}`
}
