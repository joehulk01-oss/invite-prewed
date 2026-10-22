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
  'rose-blush': {
    id: 'rose-blush',
    label: 'Rose Blush',
    desc: 'Pink romantis, lembut & manis',
    swatch: 'linear-gradient(135deg, #fdf2f4 50%, #d4838f 50%)',
    vars: {
      '--tpl-bg': '#fdf2f4',
      '--tpl-card': '#ffffff',
      '--tpl-ink': '#3d2229',
      '--tpl-muted': '#9a7680',
      '--tpl-line': '#f0d9de',
      '--tpl-accent': '#b0526a',
      '--tpl-accent2': '#d4838f',
      '--tpl-dark': '#33191f',
      '--tpl-gold1': '#eec9a3',
      '--tpl-gold2': '#c99a5b',
    },
  },
  'lavender-ungu': {
    id: 'lavender-ungu',
    label: 'Lavender Ungu',
    desc: 'Ungu lembut, anggun & dreamy',
    swatch: 'linear-gradient(135deg, #f3f0fa 50%, #8b7bb8 50%)',
    vars: {
      '--tpl-bg': '#f3f0fa',
      '--tpl-card': '#ffffff',
      '--tpl-ink': '#2b2340',
      '--tpl-muted': '#7e739c',
      '--tpl-line': '#ddd5ee',
      '--tpl-accent': '#6a559e',
      '--tpl-accent2': '#9a86c8',
      '--tpl-dark': '#1f1933',
      '--tpl-gold1': '#e6d193',
      '--tpl-gold2': '#b3924a',
    },
  },
  'zamrud-emerald': {
    id: 'zamrud-emerald',
    label: 'Zamrud Emerald',
    desc: 'Hijau mewah, segar & berkelas',
    swatch: 'linear-gradient(135deg, #eef6f2 50%, #1f6f50 50%)',
    vars: {
      '--tpl-bg': '#eef6f2',
      '--tpl-card': '#ffffff',
      '--tpl-ink': '#12291e',
      '--tpl-muted': '#5f7d6e',
      '--tpl-line': '#d2e4da',
      '--tpl-accent': '#14604a',
      '--tpl-accent2': '#3f8f6d',
      '--tpl-dark': '#0c2017',
      '--tpl-gold1': '#ecd28a',
      '--tpl-gold2': '#b8912f',
    },
  },
  'terracotta-sunset': {
    id: 'terracotta-sunset',
    label: 'Terracotta Sunset',
    desc: 'Hangat membumi, senja & rustic',
    swatch: 'linear-gradient(135deg, #faf0e8 50%, #c96f4a 50%)',
    vars: {
      '--tpl-bg': '#faf0e8',
      '--tpl-card': '#ffffff',
      '--tpl-ink': '#38221a',
      '--tpl-muted': '#97755f',
      '--tpl-line': '#edd9c9',
      '--tpl-accent': '#b45a34',
      '--tpl-accent2': '#d98d63',
      '--tpl-dark': '#2a1710',
      '--tpl-gold1': '#f0cd8e',
      '--tpl-gold2': '#bd8a3e',
    },
  },
  'monokrom-hitam': {
    id: 'monokrom-hitam',
    label: 'Monokrom Hitam',
    desc: 'Hitam putih, tegas & modern',
    swatch: 'linear-gradient(135deg, #f5f5f5 50%, #1a1a1a 50%)',
    vars: {
      '--tpl-bg': '#f7f7f7',
      '--tpl-card': '#ffffff',
      '--tpl-ink': '#141414',
      '--tpl-muted': '#767676',
      '--tpl-line': '#e2e2e2',
      '--tpl-accent': '#262626',
      '--tpl-accent2': '#595959',
      '--tpl-dark': '#0a0a0a',
      '--tpl-gold1': '#d9d9d9',
      '--tpl-gold2': '#8c8c8c',
    },
  },
  'biru-langit': {
    id: 'biru-langit',
    label: 'Biru Langit',
    desc: 'Biru cerah, bersih & ceria',
    swatch: 'linear-gradient(135deg, #eef5fc 50%, #5b8dd9 50%)',
    vars: {
      '--tpl-bg': '#eef5fc',
      '--tpl-card': '#ffffff',
      '--tpl-ink': '#16283d',
      '--tpl-muted': '#64809e',
      '--tpl-line': '#d5e4f2',
      '--tpl-accent': '#2f5d94',
      '--tpl-accent2': '#6ea3dd',
      '--tpl-dark': '#101f31',
      '--tpl-gold1': '#f2d38a',
      '--tpl-gold2': '#bd943a',
    },
  },
}

export function getDesignTemplate(id) {
  return DESIGN_TEMPLATES[id] || DESIGN_TEMPLATES['elegan-krem']
}

// URL Web App GAS bawaan, ditanam di kode (keputusan user 2026-10-22:
// full otomatis — browser mana pun langsung konek tanpa isi apa pun).
// Tetap bisa ditimpa per-browser lewat localStorage / env VITE_GAS_URL.
const DEFAULT_GAS_URL = 'https://script.google.com/macros/s/AKfycbyZ6jh74LLvdCnI-4Y49EeSfzs1f1MdIEpQlvYTK8QgH6SmspiZVyJM0RytJ-J96cYM/exec'

export function getGasUrl() {
  return localStorage.getItem(GAS_URL_KEY) || import.meta.env.VITE_GAS_URL || DEFAULT_GAS_URL
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

// --- Bootstrap otomatis (keputusan user 2026-10-22: full otomatis) ---
// Token diambil sendiri dari sheet "settings" di spreadsheet lewat action
// 'bootstrap' di GAS, lalu disimpan ke localStorage browser ini. Berkat ini
// browser/perangkat baru langsung aktif tanpa mengisi URL/PIN/token.
// Token tetap bisa diganti lewat /admin-gas (PIN); token yang basi
// terdeteksi dari pesan error GAS dan otomatis diperbarui satu kali.
let bootstrapPromise_ = null
export async function ensureBootstrap(force = false) {
  if (!force && getGasToken()) return true
  if (!force && bootstrapPromise_) return bootstrapPromise_
  const url = getGasUrl()
  if (!url) return false
  bootstrapPromise_ = (async () => {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        redirect: 'follow',
        body: JSON.stringify({ action: 'bootstrap' }),
      })
      const json = await res.json().catch(() => null)
      if (json && json.ok && json.token) { setGasToken(json.token); return true }
    } catch (e) { /* abaikan — pemanggil menampilkan error GAS aslinya */ }
    return false
  })()
  const ok = await bootstrapPromise_
  if (!ok || force) bootstrapPromise_ = null
  return ok
}

async function refreshToken_() {
  setGasToken('')
  return ensureBootstrap(true)
}

function isTokenError_(json) {
  return !!(json && json.ok === false && /token/i.test(json.error || ''))
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
      await ensureBootstrap()
      const doSave = () => fetch(gasUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        redirect: 'follow',
        body: JSON.stringify({ action: 'save', slug, token: getGasToken(), data: payload }),
      })
      let res = await doSave()
      let json = null
      try { json = await res.json() } catch {}
      if (isTokenError_(json) && await refreshToken_()) {
        res = await doSave()
        json = null
        try { json = await res.json() } catch {}
      }
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
  await ensureBootstrap()
  const doList = () => fetch(`${gasUrl}?action=list&token=${encodeURIComponent(getGasToken())}`, { redirect: 'follow' })
  let res = await doList()
  if (!res.ok) return { ok: false, error: `GAS error ${res.status}` }
  let json = await res.json()
  if (isTokenError_(json) && await refreshToken_()) {
    res = await doList()
    if (!res.ok) return { ok: false, error: `GAS error ${res.status}` }
    json = await res.json()
  }
  return json
}

export async function updateInviteRemote(slug, patch) {
  const gasUrl = getGasUrl()
  if (!gasUrl) return { ok: false, error: 'GAS belum disambungkan.' }
  await ensureBootstrap()
  const attempt = async () => {
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
  let out = await attempt()
  if (isTokenError_(out) && await refreshToken_()) out = await attempt()
  return out
}

export async function deleteInviteRemote(slug) {
  const gasUrl = getGasUrl()
  if (!gasUrl) return { ok: false, error: 'GAS belum disambungkan.' }
  await ensureBootstrap()
  const attempt = async () => {
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
  let out = await attempt()
  if (isTokenError_(out) && await refreshToken_()) out = await attempt()
  return out
}

// --- Settings via GAS (spreadsheet sheet "settings", dikunci PIN admin) ---
export async function getSettingsRemote(pin, overrideGasUrl) {
  const gasUrl = (overrideGasUrl || getGasUrl()).trim()
  if (!gasUrl) return { ok: false, error: 'URL Web App GAS belum diisi.' }
  try {
    const res = await fetch(gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      redirect: 'follow',
      body: JSON.stringify({ action: 'getSettings', pin }),
    })
    if (!res.ok) return { ok: false, error: `GAS error ${res.status}` }
    return res.json()
  } catch (e) {
    return { ok: false, error: 'Gagal menghubungi GAS: ' + String(e && e.message || e) }
  }
}

export async function saveSettingsRemote(pin, settings, overrideGasUrl) {
  const gasUrl = (overrideGasUrl || getGasUrl()).trim()
  if (!gasUrl) return { ok: false, error: 'URL Web App GAS belum diisi.' }
  try {
    const res = await fetch(gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      redirect: 'follow',
      body: JSON.stringify({ action: 'saveSettings', pin, settings }),
    })
    if (!res.ok) return { ok: false, error: `GAS error ${res.status}` }
    return res.json()
  } catch (e) {
    return { ok: false, error: 'Gagal menghubungi GAS: ' + String(e && e.message || e) }
  }
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
