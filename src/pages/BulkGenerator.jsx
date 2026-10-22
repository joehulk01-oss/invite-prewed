import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { listInvitesRemote, loadInvite, saveInvite, getGasUrl } from '../lib/storage.js'

function slugifyGuest(nama) {
  const base = (nama || 'tamu').toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'tamu'
  const suffix = Math.random().toString(36).slice(2, 7)
  return `${base}-${suffix}`
}

function parseNames(text) {
  const seen = new Set()
  const out = []
  text.split(/\r?\n/).forEach(line => {
    // dukung CSV: ambil kolom pertama
    const first = line.split(/[,;|\t]/)[0] || ''
    const nama = first.trim().replace(/^["']|["']$/g, '').trim()
    if (!nama || seen.has(nama.toLowerCase())) return
    seen.add(nama.toLowerCase())
    out.push(nama)
  })
  return out
}

const sleep = ms => new Promise(r => setTimeout(r, ms))

export default function BulkGenerator() {
  const [gasOk, setGasOk] = useState(false)
  const [masters, setMasters] = useState([])
  const [masterSlug, setMasterSlug] = useState('')
  const [masterData, setMasterData] = useState(null)
  const [masterLoading, setMasterLoading] = useState(false)
  const [namesText, setNamesText] = useState('')
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState({ done: 0, failed: 0, total: 0 })
  const [log, setLog] = useState([])
  const [finished, setFinished] = useState(false)
  const cancelRef = useRef(false)
  const fileRef = useRef(null)

  const names = parseNames(namesText)

  useEffect(() => {
    const url = getGasUrl()
    setGasOk(!!url)
    if (!url) return
    listInvitesRemote().then(r => {
      if (r && r.ok && Array.isArray(r.items)) {
        setMasters(r.items)
        if (r.items.length && !masterSlug) setMasterSlug(r.items[0].slug)
      }
    }).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadMaster = async () => {
    if (!masterSlug) return
    setMasterLoading(true)
    try {
      const d = await loadInvite(masterSlug)
      setMasterData(d)
    } catch { setMasterData(null) }
    setMasterLoading(false)
  }

  const onFile = async (e) => {
    const f = e.target.files && e.target.files[0]
    if (!f) return
    const text = await f.text()
    const lines = text.split(/\r?\n/)
    // kalau CSV ber-header "nama", buang baris header
    const body = /^\s*"?nama"?\s*([,;]|$)/i.test(lines[0] || '') ? lines.slice(1) : lines
    setNamesText(prev => (prev ? prev.replace(/\s+$/, '') + '\n' : '') + body.join('\n'))
    e.target.value = ''
  }

  const startBulk = async () => {
    if (!masterData || !names.length || running) return
    if (!confirm(`Generate ${names.length} undangan dari master "${masterData.priaPanggilan} & ${masterData.wanitaPanggilan}"?`)) return
    cancelRef.current = false
    setRunning(true)
    setFinished(false)
    setLog([])
    setProgress({ done: 0, failed: 0, total: names.length })
    let template = null // data master yg fotonya sudah jadi link Drive (hemat upload)
    let failed = 0
    for (let i = 0; i < names.length; i++) {
      if (cancelRef.current) break
      const nama = names[i]
      const slug = slugifyGuest(nama)
      try {
        const src = template || masterData
        const data = { ...src, namaTamu: nama }
        delete data.slug
        const res = await saveInvite(slug, data)
        if (res && !res.ok) {
          throw new Error(res.error || 'Gagal simpan')
        }
        if (!template) {
          // simpan pertama: foto di-upload ke Drive, ambil balik versi link-nya
          const back = await loadInvite(slug).catch(() => null)
          template = back || { ...data }
        }
        setProgress(p => ({ ...p, done: p.done + 1 }))
      } catch (err) {
        failed++
        setProgress(p => ({ ...p, done: p.done + 1, failed: p.failed + 1 }))
        setLog(l => [...l.slice(-49), `Gagal: ${nama} (${String(err && err.message || err)})`])
      }
      await sleep(250)
    }
    setRunning(false)
    setFinished(true)
  }

  const pct = progress.total ? Math.round((progress.done / progress.total) * 100) : 0

  return (
    <div className="gen-wrap">
      <div className="hero">
        <div className="hero-kicker">Bulk Generator</div>
        <h1 className="hero-title">Generate Massal</h1>
        <p className="hero-sub">Satu undangan master → ratusan link personal, satu nama satu link.</p>
      </div>

      <div className="steps">
        <div className="step-pill active"><span>1</span> Pilih Master</div>
        <div className="step-pill active"><span>2</span> Daftar Nama</div>
        <div className="step-pill active"><span>3</span> Generate</div>
      </div>

      {!gasOk && (
        <div className="card" style={{ borderColor: '#e8a0a0', background: '#fdf3f3' }}>
          <b>⚠ GAS belum disambungkan.</b> Bulk generator butuh Google Sheets sebagai penyimpanan.
          Isi URL Web App + token di tab <Link to="/?tab=settings">Pengaturan</Link> dulu.
        </div>
      )}

      {/* STEP 1 */}
      <section className="card">
        <h2 className="card-title">1 · Undangan Master</h2>
        <p className="muted" style={{ marginTop: 0 }}>
          Semua link bulk akan jadi <b>duplikat</b> dari master ini — foto, musik, acara, template pesan WA —
          bedanya cuma <b>nama tamu</b> dan <b>link</b>-nya.
        </p>
        <div className="row" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <select className="input" value={masterSlug} onChange={e => { setMasterSlug(e.target.value); setMasterData(null) }} style={{ flex: 1, minWidth: 220 }}>
            {masters.length === 0 && <option value="">— belum ada undangan —</option>}
            {masters.map(m => <option key={m.slug} value={m.slug}>{m.nama} · /u/{m.slug}</option>)}
          </select>
          <button className="btn" onClick={loadMaster} disabled={!masterSlug || masterLoading}>
            {masterLoading ? '⏳ Memuat...' : '📥 Muat Master'}
          </button>
        </div>
        {masterData && (
          <div className="muted" style={{ marginTop: 10 }}>
            ✅ Master aktif: <b>{masterData.priaPanggilan} & {masterData.wanitaPanggilan}</b>
            {masterData.tglAkad ? ` · Akad ${masterData.tglAkad}` : ''}
          </div>
        )}
      </section>

      {/* STEP 2 */}
      <section className="card">
        <h2 className="card-title">2 · Daftar Nama Tamu</h2>
        <p className="muted" style={{ marginTop: 0 }}>
          Satu nama per baris. Bisa juga upload file <b>.txt / .csv</b> (kolom pertama = nama).
          Duplikat otomatis dibuang.
        </p>
        <textarea
          className="input"
          rows={8}
          placeholder={'Contoh:\nKeluarga Hartono\nBudi Santoso\nSiti & Andi'}
          value={namesText}
          onChange={e => setNamesText(e.target.value)}
          style={{ width: '100%', resize: 'vertical' }}
        />
        <div className="row" style={{ display: 'flex', gap: 10, marginTop: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-outline" onClick={() => fileRef.current && fileRef.current.click()}>
            📄 Upload .txt / .csv
          </button>
          <input ref={fileRef} type="file" accept=".txt,.csv" onChange={onFile} style={{ display: 'none' }} />
          <span className="muted"><b>{names.length}</b> nama terdeteksi</span>
          {names.length > 0 && (
            <span className="muted">· cth: {names.slice(0, 3).join(' · ')}{names.length > 3 ? ' …' : ''}</span>
          )}
        </div>
      </section>

      {/* STEP 3 */}
      <section className="card">
        <h2 className="card-title">3 · Generate</h2>
        {!running && !finished && (
          <button
            className="btn btn-primary"
            style={{ fontSize: 16, padding: '14px 28px' }}
            disabled={!masterData || !names.length || !gasOk}
            onClick={startBulk}
          >
            ⚡ Generate {names.length > 0 ? `${names.length} ` : ''}Undangan
          </button>
        )}
        {(running || finished) && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span><b>{progress.done}</b> / {progress.total} {progress.failed > 0 && <span style={{ color: '#c0392b' }}>({progress.failed} gagal)</span>}</span>
              <span>{pct}%</span>
            </div>
            <div style={{ height: 14, background: '#eee4d4', borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg,#b98a2f,#8a5a2b)', transition: 'width .3s' }} />
            </div>
            {running && (
              <div style={{ marginTop: 12 }}>
                <button className="btn btn-outline" onClick={() => { cancelRef.current = true }}>⏹ Berhenti</button>
                <span className="muted" style={{ marginLeft: 10 }}>Jangan tutup tab ini sampai selesai.</span>
              </div>
            )}
            {finished && !running && (
              <div style={{ marginTop: 12 }}>
                <div className="muted" style={{ marginBottom: 10 }}>
                  ✅ Selesai: <b>{progress.total - progress.failed}</b> berhasil{progress.failed > 0 && <>, <b style={{ color: '#c0392b' }}>{progress.failed} gagal</b> (yang gagal bisa di-generate ulang)</>}.
                </div>
                <Link className="btn btn-primary" to="/list">☰ Lihat di List Undangan</Link>
              </div>
            )}
            {log.length > 0 && (
              <div className="muted" style={{ marginTop: 10, fontSize: 13 }}>
                {log.map((l, i) => <div key={i}>{l}</div>)}
              </div>
            )}
          </div>
        )}
        <p className="muted" style={{ marginBottom: 0 }}>
          💡 Foto & musik cuma di-upload sekali (undangan pertama), sisanya pakai link yang sama — jadi cepat dan hemat Drive.
        </p>
      </section>
    </div>
  )
}
