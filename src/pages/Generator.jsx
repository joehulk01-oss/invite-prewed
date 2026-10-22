import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import InvitationView from '../components/InvitationView.jsx'
import {
  DESIGN_TEMPLATES, defaultInvite, makeSlug, saveInvite,
  fileToDataUrlCompressed, getGasUrl, setGasUrl,
  getGasToken, setGasToken, setLastSlug, buildWaLink,
} from '../lib/storage.js'

function Field({ label, opt, children }) {
  return (
    <div className="field">
      <label>{label} {opt && <span className="opt">({opt})</span>}</label>
      {children}
    </div>
  )
}

function PhotoCard({ label, value, onPick }) {
  return (
    <label className="photo-card">
      <div className="ph-img">
        {value ? <img src={value} alt={label} /> : <span className="ph-empty">🖼</span>}
      </div>
      <div className="ph-label">{label}</div>
      {value && <div className="ph-status">Aktif — klik untuk ganti foto</div>}
      <input type="file" accept="image/*" onChange={e => onPick(e.target.files?.[0])} />
    </label>
  )
}

export default function Generator() {
  const nav = useNavigate()
  const [form, setForm] = useState(() => ({ ...defaultInvite(), cerita: defaultInvite().cerita.map(c => ({ ...c })) }))
  const [tab, setTab] = useState('data')
  const [lastLink, setLastLink] = useState('')
  const [gasUrl, setGasUrlState] = useState(() => getGasUrl())
  const [gasToken, setGasTokenState] = useState(() => getGasToken())
  const [msg, setMsg] = useState('')
  const audioRef = useRef(null)
  const [testPlaying, setTestPlaying] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const setShow = (k, v) => setForm(f => ({ ...f, show: { ...f.show, [k]: v } }))
  const setCerita = (i, k, v) => setForm(f => {
    const cerita = f.cerita.map((c, j) => (j === i ? { ...c, [k]: v } : c))
    return { ...f, cerita }
  })

  const pickPhoto = async (key, file) => {
    if (!file) return
    try {
      const url = await fileToDataUrlCompressed(file)
      set(key, url)
    } catch { setMsg('File harus gambar ya.') }
  }
  const addGallery = async (file) => {
    if (!file || form.galeri.length >= 6) return
    try {
      const url = await fileToDataUrlCompressed(file)
      setForm(f => ({ ...f, galeri: [...f.galeri, url] }))
    } catch {}
  }

  const musicPreviewUrl = form.musikMode === 'contoh'
    ? 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3'
    : (form.musikUrl || '')
  const toggleTest = async () => {
    const a = audioRef.current
    if (!a || !musicPreviewUrl) return
    try {
      if (testPlaying) { a.pause(); setTestPlaying(false) }
      else { await a.play(); setTestPlaying(true) }
    } catch { setMsg('Browser memblokir autoplay — coba lagi.') }
  }

  const doSave = async () => {
    const slug = makeSlug(form.priaPanggilan, form.wanitaPanggilan)
    const res = await saveInvite(slug, form)
    if (res.ok) {
      setLastSlug(slug)
      return slug
    }
    setMsg(res.error ? `Gagal menyimpan: ${res.error}` : 'Gagal menyimpan undangan.')
    return null
  }

  const onLihatHasil = async () => {
    const slug = await doSave()
    if (slug) nav(`/u/${slug}`)
  }
  const onSalinLink = async () => {
    const slug = await doSave()
    if (!slug) return
    const link = `${window.location.origin}/u/${slug}`
    setLastLink(link)
    try { await navigator.clipboard.writeText(link); setMsg('Link undangan tersalin!') }
    catch { setMsg('Link dibuat — salin manual dari kotak di bawah.') }
  }
  const onCetak = async () => {
    const slug = await doSave()
    if (slug) { setLastSlug(slug); window.print() }
  }
  const onKirimWA = async () => {
    const slug = await doSave()
    if (!slug) return
    const link = `${window.location.origin}/u/${slug}`
    window.open(buildWaLink(form.pesanWA, form.namaTamu, link), '_blank')
  }

  const saveGasUrl = () => {
    setGasUrl(gasUrl)
    setGasToken(gasToken)
    setMsg(gasUrl ? 'URL GAS + token tersimpan.' : 'URL GAS dikosongkan — pakai localStorage.')
  }

  return (
    <>
      <section className="hero">
        <div className="kicker">CONTOH • TANPA GAS DULU</div>
        <h1>Isi form, klik generate, <em>langsung jadi<br />link undangan.</em></h1>
        <p className="lead">
          Ini tampilan yang kemarin kita diskusikan: Vite + Vercel di depan, nanti GAS + Drive + Sheet
          di belakang. Untuk preview ini, semua perubahan langsung kelihatan di HP di samping — coba ganti namanya.
        </p>
        <div className="steps">
          <span className="step-pill"><b>1</b> Isi data &amp; foto</span>
          <span className="step-pill"><b>2</b> Pilih template &amp; musik</span>
          <span className="step-pill"><b>3</b> Generate link</span>
          <span className="step-pill"><b>4</b> Kirim ke tamu</span>
        </div>
      </section>

      <div className="gen-wrap">
        {/* ============ FORM ============ */}
        <div className="panel">
          <h2>Form Generator</h2>
          <p className="panel-sub">Semua field ini nanti dikirim ke GAS untuk disimpan ke Sheet + Drive.</p>
          <div className="inner-tabs">
            <button className={tab === 'data' ? 'active' : ''} onClick={() => setTab('data')}>✏ Isi Data</button>
            <button className={tab === 'set' ? 'active' : ''} onClick={() => setTab('set')}>⚙ Pengaturan</button>
          </div>

          {tab === 'data' && (
            <>
              <div className="fgroup">
                <h3>Data Mempelai</h3>
                <div className="frow">
                  <Field label="Nama panggilan pria"><input type="text" value={form.priaPanggilan} onChange={e => set('priaPanggilan', e.target.value)} placeholder="Andi" /></Field>
                  <Field label="Nama panggilan wanita"><input type="text" value={form.wanitaPanggilan} onChange={e => set('wanitaPanggilan', e.target.value)} placeholder="Sari" /></Field>
                </div>
                <div className="frow">
                  <Field label="Nama lengkap pria"><input type="text" value={form.priaLengkap} onChange={e => set('priaLengkap', e.target.value)} placeholder="Andi Pratama, S.T." /></Field>
                  <Field label="Nama lengkap wanita"><input type="text" value={form.wanitaLengkap} onChange={e => set('wanitaLengkap', e.target.value)} placeholder="Sari Wulandari, S.Pd." /></Field>
                </div>
                <div className="frow">
                  <Field label="Orang tua pria" opt="opsional"><input type="text" value={form.ortuPria} onChange={e => set('ortuPria', e.target.value)} placeholder="Bpk. Budi Pratama & Ibu Ratna" /></Field>
                  <Field label="Orang tua wanita" opt="opsional"><input type="text" value={form.ortuWanita} onChange={e => set('ortuWanita', e.target.value)} placeholder="Bpk. H. Slamet & Ibu Hj. Dewi" /></Field>
                </div>
              </div>

              <div className="fgroup">
                <h3>Detail Acara</h3>
                <div className="frow">
                  <Field label="Tanggal Akad"><input type="date" value={form.tglAkad} onChange={e => set('tglAkad', e.target.value)} /></Field>
                  <Field label="Jam Akad"><input type="text" value={form.jamAkad} onChange={e => set('jamAkad', e.target.value)} placeholder="08.00 - 10.00 WIB" /></Field>
                </div>
                <Field label="Lokasi Akad"><input type="text" value={form.lokasiAkad} onChange={e => set('lokasiAkad', e.target.value)} placeholder="Masjid Agung Al-Azhar, Jakarta Selatan" /></Field>
                <Field label="Link Google Maps Akad" opt="opsional"><input type="url" value={form.mapsAkad} onChange={e => set('mapsAkad', e.target.value)} placeholder="https://maps.google.com/..." /></Field>
                <div className="frow">
                  <Field label="Tanggal Resepsi"><input type="date" value={form.tglResepsi} onChange={e => set('tglResepsi', e.target.value)} /></Field>
                  <Field label="Jam Resepsi"><input type="text" value={form.jamResepsi} onChange={e => set('jamResepsi', e.target.value)} placeholder="11.00 - 13.00 WIB" /></Field>
                </div>
                <Field label="Lokasi Resepsi"><input type="text" value={form.lokasiResepsi} onChange={e => set('lokasiResepsi', e.target.value)} placeholder="The Sultan Hotel & Residence, Jakarta" /></Field>
                <Field label="Link Google Maps Resepsi" opt="opsional"><input type="url" value={form.mapsResepsi} onChange={e => set('mapsResepsi', e.target.value)} placeholder="https://maps.google.com/..." /></Field>
              </div>

              <div className="fgroup">
                <h3>Foto</h3>
                <p className="hint">Klik kartu untuk ganti dengan foto kamu &amp; pasangan. Foto dikompres otomatis di browser.</p>
                <div className="photo-grid">
                  <PhotoCard label="Cover" value={form.fotoCover} onPick={f => pickPhoto('fotoCover', f)} />
                  <PhotoCard label="Foto Pria" value={form.fotoPria} onPick={f => pickPhoto('fotoPria', f)} />
                  <PhotoCard label="Foto Wanita" value={form.fotoWanita} onPick={f => pickPhoto('fotoWanita', f)} />
                </div>
                <p className="hint" style={{ marginTop: 14 }}>Foto galeri (maks 6)</p>
                <div className="gallery-row">
                  {form.galeri.map((g, i) => (
                    <div className="gallery-thumb" key={i}>
                      <img src={g} alt={`Galeri ${i + 1}`} />
                      <button onClick={() => setForm(f => ({ ...f, galeri: f.galeri.filter((_, j) => j !== i) }))}>×</button>
                    </div>
                  ))}
                  {form.galeri.length < 6 && (
                    <label className="gallery-add">+<input type="file" accept="image/*" onChange={e => addGallery(e.target.files?.[0])} /></label>
                  )}
                </div>
              </div>

              <div className="fgroup">
                <h3>Template</h3>
                <div className="tpl-grid">
                  {Object.values(DESIGN_TEMPLATES).map(t => (
                    <div key={t.id} className={`tpl-card${form.template === t.id ? ' selected' : ''}`} onClick={() => set('template', t.id)}>
                      <div className="tpl-swatch" style={{ background: t.swatch }} />
                      <div className="tpl-name">{form.template === t.id ? '✓ ' : ''}{t.label}</div>
                      <div className="tpl-desc">{t.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="fgroup">
                <h3>Musik Latar</h3>
                <audio ref={audioRef} src={musicPreviewUrl} loop preload="none" />
                <div className="music-row">
                  <button className="btn btn-outline" onClick={toggleTest} style={{ padding: '10px 20px', fontSize: 14 }}>
                    {testPlaying ? '⏸ Berhenti' : '🎵 Coba Putar'}
                  </button>
                  <span className="music-label">
                    Lagu: {form.musikMode === 'contoh' ? form.musikLabel
                      : form.musikMode === 'none' ? 'Tanpa musik'
                      : (form.musikLabel || 'MP3 custom')} • Format MP3
                  </span>
                </div>
                <div className="frow" style={{ marginTop: 12 }}>
                  <Field label="Sumber musik">
                    <select value={form.musikMode} onChange={e => set('musikMode', e.target.value)}>
                      <option value="contoh">Lagu contoh</option>
                      <option value="upload">Upload MP3 (maks 3 MB)</option>
                      <option value="link">Link MP3</option>
                      <option value="none">Tanpa musik</option>
                    </select>
                  </Field>
                  <Field label="Nama lagu" opt="opsional">
                    <input type="text" value={form.musikLabel} onChange={e => set('musikLabel', e.target.value)} placeholder="Judul — Artis" />
                  </Field>
                </div>
                {form.musikMode === 'upload' && (
                  <Field label="File MP3">
                    <input type="file" accept="audio/mpeg,audio/mp3" onChange={e => {
                      const f = e.target.files?.[0]
                      if (!f) return
                      if (f.size > 3 * 1024 * 1024) { setMsg('MP3 maksimal 3 MB ya.'); return }
                      const r = new FileReader()
                      r.onload = () => setForm(s => ({ ...s, musikUrl: r.result }))
                      r.readAsDataURL(f)
                    }} />
                  </Field>
                )}
                {form.musikMode === 'link' && (
                  <Field label="URL MP3 langsung">
                    <input type="url" value={form.musikUrl} onChange={e => set('musikUrl', e.target.value)} placeholder="https://.../lagu.mp3" />
                  </Field>
                )}
                <p className="hint">⚠️ Pakai musik bebas copyright / milik sendiri untuk undangan asli.</p>
              </div>

              <div className="fgroup">
                <h3>Salam &amp; Kutipan</h3>
                <Field label="Salam pembuka"><input type="text" value={form.salamPembuka} onChange={e => set('salamPembuka', e.target.value)} /></Field>
                <Field label="Kutipan / ayat" opt="opsional"><textarea value={form.kutipan} onChange={e => set('kutipan', e.target.value)} /></Field>
              </div>

              <div className="fgroup">
                <h3>Cerita</h3>
                <p className="hint">Tampil sebagai timeline Love Story di undangan.</p>
                {form.cerita.map((c, i) => (
                  <div key={i} style={{ marginBottom: 12 }}>
                    <div className="frow">
                      <Field label={`Judul Cerita ${i + 1}`}><input type="text" value={c.judul} onChange={e => setCerita(i, 'judul', e.target.value)} placeholder={`Cerita ${i + 1}`} /></Field>
                    </div>
                    <Field label={`Isi Cerita ${i + 1}`}><textarea value={c.isi} onChange={e => setCerita(i, 'isi', e.target.value)} placeholder="Tulis ceritanya..." /></Field>
                  </div>
                ))}
              </div>

              <div className="fgroup">
                <h3>Amplop Digital</h3>
                <div className="frow">
                  <Field label="Nama Bank"><input type="text" value={form.bank} onChange={e => set('bank', e.target.value)} placeholder="BCA" /></Field>
                  <Field label="Nomor Rekening"><input type="text" value={form.rekening} onChange={e => set('rekening', e.target.value)} placeholder="1234 5678 90" /></Field>
                </div>
                <Field label="Nama pemilik rekening"><input type="text" value={form.pemilikRek} onChange={e => set('pemilikRek', e.target.value)} placeholder="Andi Pratama" /></Field>
              </div>

              <div className="fgroup">
                <h3>Tamu &amp; RSVP</h3>
                <Field label="Nama tamu" opt="tampil di cover"><input type="text" value={form.namaTamu} onChange={e => set('namaTamu', e.target.value)} placeholder="Keluarga Besar Hartono" /></Field>
                <Field label="Pesan WhatsApp" opt="gunakan {nama} dan {link}"><textarea value={form.pesanWA} onChange={e => set('pesanWA', e.target.value)} /></Field>
                <Field label="Pesan RSVP terkirim"><input type="text" value={form.pesanRSVP} onChange={e => set('pesanRSVP', e.target.value)} /></Field>
                <button className="btn btn-outline" onClick={onKirimWA} style={{ padding: '10px 20px', fontSize: 14 }}>💬 Kirim via WhatsApp</button>
              </div>
            </>
          )}

          {tab === 'set' && (
            <>
              <div className="fgroup">
                <h3>Bagian yang ditampilkan</h3>
                {[
                  ['countdown', 'Tampilkan Countdown'],
                  ['rsvp', 'Tampilkan RSVP'],
                  ['loveStory', 'Tampilkan Love Story'],
                  ['gift', 'Tampilkan Amplop Digital'],
                  ['galeri', 'Tampilkan Galeri Foto'],
                  ['musik', 'Tampilkan Musik Latar'],
                ].map(([k, label]) => (
                  <label className="checkrow" key={k}>
                    <input type="checkbox" checked={!!form.show[k]} onChange={e => setShow(k, e.target.checked)} />
                    {label}
                  </label>
                ))}
              </div>
              <div className="fgroup">
                <h3>Koneksi GAS</h3>
                <p className="hint">Tempel URL Web App GAS di sini kalau sudah deploy — undangan tersimpan ke Drive + Sheet dan bisa dibuka siapa saja.</p>
                <Field label="URL Web App GAS" opt="opsional">
                  <input type="url" value={gasUrl} onChange={e => setGasUrlState(e.target.value)} placeholder="https://script.google.com/macros/s/.../exec" />
                </Field>
                <Field label="Token GAS" opt="samakan dengan Script Properties">
                  <input type="text" value={gasToken} onChange={e => setGasTokenState(e.target.value)} placeholder="k1ckm4n-2026-und4ngan" />
                </Field>
                <button className="btn btn-outline" onClick={saveGasUrl} style={{ padding: '10px 20px', fontSize: 14 }}>Simpan Koneksi GAS</button>
              </div>
            </>
          )}

          <div className="actions">
            <button className="btn btn-primary" onClick={onLihatHasil}>Lihat Hasil</button>
            <button className="btn btn-outline" onClick={onSalinLink}>Salin Link Undangan</button>
            <button className="btn btn-outline" onClick={onCetak}>Download PDF / Cetak</button>
          </div>
          {msg && <p className="music-label" style={{ marginTop: 12 }}>{msg}</p>}
          {lastLink && (
            <div className="result-box">
              <b>Link undangan:</b>
              <div className="link-row">
                <input readOnly value={lastLink} onFocus={e => e.target.select()} />
                <button className="btn btn-outline" style={{ padding: '9px 16px', fontSize: 13 }} onClick={() => { navigator.clipboard.writeText(lastLink).catch(() => {}); setMsg('Tersalin!') }}>Salin</button>
              </div>
              <p className="hint" style={{ marginTop: 8 }}>Tanpa GAS, link hanya terbuka penuh di browser ini.</p>
            </div>
          )}

        </div>

        {/* ============ LIVE PREVIEW ============ */}
        <div className="preview-col">
          <div className="preview-head">
            <h3>Live Preview</h3>
            <span>Berubah saat kamu mengetik</span>
          </div>
          <div className="phone">
            <div className="phone-screen" style={DESIGN_TEMPLATES[form.template]?.vars}>
              <InvitationView data={form} interactive={false} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
