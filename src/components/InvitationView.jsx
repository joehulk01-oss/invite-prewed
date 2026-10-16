import { useEffect, useRef, useState } from 'react'
import { getDesignTemplate, formatTanggal, saveRsvp, loadRsvp, saveWish, loadWishes } from '../lib/storage.js'

// Hitung mundur ke tanggal akad (00:00 hari H)
function useCountdown(isoDate) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  let diff = 0
  try { diff = Math.max(0, new Date(isoDate + 'T00:00:00').getTime() - now) } catch {}
  const d = Math.floor(diff / 86400000)
  const h = Math.floor((diff % 86400000) / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  return { d, h, m, s }
}

function initials(nama) {
  return (nama || '?').trim().charAt(0).toUpperCase()
}

export default function InvitationView({ data, slug, interactive = true, onOpenMusic }) {
  const d = data || {}
  const tpl = getDesignTemplate(d.template)
  const show = d.show || {}
  const { d: cdD, h: cdH, m: cdM, s: cdS } = useCountdown(d.tglAkad)
  const contentRef = useRef(null)
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [rsvpList, setRsvpList] = useState(() => (slug ? loadRsvp(slug) : []))
  const [wishList, setWishList] = useState(() => (slug ? loadWishes(slug) : []))
  const [f, setF] = useState({ nama: '', hadir: 'Hadir, insya Allah', ucapan: '' })
  const [sentMsg, setSentMsg] = useState('')

  const musicUrl = d.musikMode === 'contoh'
    ? 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3'
    : (d.musikUrl || '')
  const musicOn = show.musik && d.musikMode !== 'none' && musicUrl

  const toggleMusic = async () => {
    const a = audioRef.current
    if (!a) return
    try {
      if (playing) { a.pause(); setPlaying(false) }
      else { await a.play(); setPlaying(true) }
    } catch {}
  }

  const openInvite = () => {
    contentRef.current?.scrollIntoView({ behavior: 'smooth' })
    if (musicOn && onOpenMusic !== false && interactive) {
      // Coba putar musik setelah tamu menekan tombol (lolos aturan autoplay)
      setTimeout(() => {
        audioRef.current?.play().then(() => setPlaying(true)).catch(() => {})
      }, 600)
    }
  }

  const submitRsvp = (e) => {
    e.preventDefault()
    if (!f.nama.trim()) { setSentMsg('Isi namanya dulu ya.'); return }
    const entry = { nama: f.nama.trim(), hadir: f.hadir, ucapan: f.ucapan.trim() }
    if (slug) {
      saveRsvp(slug, { nama: entry.nama, hadir: entry.hadir })
      saveWish(slug, { nama: entry.nama, hadir: entry.hadir, ucapan: entry.ucapan })
      setRsvpList(loadRsvp(slug))
      setWishList(loadWishes(slug))
    }
    setSentMsg(d.pesanRSVP || 'Terima kasih atas konfirmasi kehadiran dan doanya!')
    setF({ nama: '', hadir: 'Hadir, insya Allah', ucapan: '' })
  }

  const copyRek = async () => {
    try {
      await navigator.clipboard.writeText((d.rekening || '').replace(/\s/g, ''))
      setSentMsg('Nomor rekening tersalin!')
      setTimeout(() => setSentMsg(''), 2500)
    } catch { setSentMsg('Gagal menyalin, catat manual ya.') }
  }

  const sampleWishes = [
    { nama: 'Rina', hadir: 'Hadir, Insya Allah', ucapan: 'Barakallah! Selamat menempuh hidup baru, semoga menjadi keluarga yang sakinah, mawaddah, warahmah.' },
    { nama: 'Dimas', hadir: 'Hadir, Insya Allah', ucapan: 'Akhirnya! Ikut bahagia banget. Sampai ketemu di hari H!' },
  ]
  const wishes = [...wishList].reverse().slice(0, 10)
  const shownWishes = wishes.length ? wishes : sampleWishes

  return (
    <div className="invite" style={tpl.vars}>
      {musicOn && <audio ref={audioRef} src={musicUrl} loop preload="none" />}

      {/* COVER */}
      <section className="invite-cover">
        <div className="cover-bg">
          {d.fotoCover
            ? <img src={d.fotoCover} alt="Foto pasangan" />
            : <div className="cover-fallback"><span className="mono">{initials(d.priaPanggilan)}&{initials(d.wanitaPanggilan)}</span></div>}
        </div>
        <div className="cover-shade" />
        <div className="cover-content">
          <div className="cover-kicker">THE WEDDING OF</div>
          <h1 className="cover-names">{d.priaPanggilan} &amp; {d.wanitaPanggilan}</h1>
          <div className="cover-date">{formatTanggal(d.tglAkad)}</div>
          <div className="guest-card">
            <div className="gk">KEPADA YTH.</div>
            <div className="gn">{d.namaTamu || 'Bapak/Ibu/Saudara/i'}</div>
          </div>
          <button className="btn btn-gold btn-block" onClick={openInvite}>✉ Buka Undangan</button>
        </div>
      </section>

      <div ref={contentRef}>
        {/* SAVE THE DATE */}
        <section className="invite-section">
          <div className="sec-kicker">SAVE THE DATE</div>
          <h2 className="sec-title">Save The Date</h2>
          <p className="sec-body">{formatTanggal(d.tglAkad)}</p>
        </section>

        {/* MEMPELAI */}
        <section className="invite-section">
          <div className="sec-kicker">MEMPELAI</div>
          <h2 className="sec-title">Mempelai</h2>
          <p className="sec-body">{d.salamPembuka}</p>
          <p className="sec-body" style={{ marginTop: 12 }}>
            Dengan penuh syukur, kami bermaksud menyatukan dua hati dalam ikatan suci pernikahan:
          </p>
          <div className="couple">
            <div>
              <div className="person-photo">
                {d.fotoPria ? <img src={d.fotoPria} alt={d.priaPanggilan} /> : <span>{initials(d.priaPanggilan)}</span>}
              </div>
              <h3 className="person-name">{d.priaPanggilan}</h3>
              <div className="person-full">{d.priaLengkap}</div>
              <div className="person-parents">Putra dari {d.ortuPria}</div>
            </div>
            <div>
              <div className="person-photo">
                {d.fotoWanita ? <img src={d.fotoWanita} alt={d.wanitaPanggilan} /> : <span>{initials(d.wanitaPanggilan)}</span>}
              </div>
              <h3 className="person-name">{d.wanitaPanggilan}</h3>
              <div className="person-full">{d.wanitaLengkap}</div>
              <div className="person-parents">Putri dari {d.ortuWanita}</div>
            </div>
          </div>
          {d.kutipan && <p className="sec-body verse" style={{ marginTop: 26 }}>“{d.kutipan}”</p>}
        </section>

        {/* COUNTDOWN */}
        {show.countdown && (
          <section className="invite-section">
            <div className="sec-kicker">COUNTDOWN</div>
            <h2 className="sec-title">Menuju Hari Bahagia</h2>
            <div className="countdown">
              <div className="cd-card"><div className="cd-num">{cdD}</div><div className="cd-lab">HARI</div></div>
              <div className="cd-card"><div className="cd-num">{cdH}</div><div className="cd-lab">JAM</div></div>
              <div className="cd-card"><div className="cd-num">{cdM}</div><div className="cd-lab">MENIT</div></div>
              <div className="cd-card"><div className="cd-num">{cdS}</div><div className="cd-lab">DETIK</div></div>
            </div>
          </section>
        )}

        {/* WAKTU & TEMPAT */}
        <section className="invite-section">
          <div className="sec-kicker">WAKTU &amp; TEMPAT</div>
          <h2 className="sec-title">Akad &amp; Resepsi</h2>
          <div className="event-cards">
            <div className="event-card">
              <h4>Akad Nikah</h4>
              <div className="ev-when">{formatTanggal(d.tglAkad)} • {d.jamAkad}</div>
              <div className="ev-where">{d.lokasiAkad}</div>
              {d.mapsAkad && <a className="btn-maps" href={d.mapsAkad} target="_blank" rel="noreferrer">📍 Buka Google Maps</a>}
            </div>
            <div className="event-card">
              <h4>Resepsi</h4>
              <div className="ev-when">{formatTanggal(d.tglResepsi)} • {d.jamResepsi}</div>
              <div className="ev-where">{d.lokasiResepsi}</div>
              {d.mapsResepsi && <a className="btn-maps" href={d.mapsResepsi} target="_blank" rel="noreferrer">📍 Buka Google Maps</a>}
            </div>
          </div>
        </section>

        {/* LOVE STORY */}
        {show.loveStory && d.cerita?.some(c => c.judul || c.isi) && (
          <section className="invite-section">
            <div className="sec-kicker">LOVE STORY</div>
            <h2 className="sec-title">Cerita Kami</h2>
            <div className="timeline">
              {d.cerita.filter(c => c.judul || c.isi).map((c, i) => (
                <div className="tl-item" key={i}>
                  <h4>{c.judul}</h4>
                  <p>{c.isi}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* GALERI */}
        {show.galeri && d.galeri?.length > 0 && (
          <section className="invite-section">
            <div className="sec-kicker">GALLERY</div>
            <h2 className="sec-title">Momen Kami</h2>
            <div className="gal-grid">
              {d.galeri.map((g, i) => <img key={i} src={g} alt={`Galeri ${i + 1}`} loading="lazy" />)}
            </div>
          </section>
        )}

        {/* RSVP */}
        {show.rsvp && (
          <section className="invite-section">
            <div className="sec-kicker">RSVP &amp; UCAPAN</div>
            <h2 className="sec-title">Konfirmasi Kehadiran</h2>
            <p className="sec-body">Merupakan suatu kehormatan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.</p>
            <form className="rsvp-form" onSubmit={submitRsvp}>
              <div className="field">
                <label>Nama kamu</label>
                <input type="text" placeholder="Tulis namamu" value={f.nama} onChange={e => setF({ ...f, nama: e.target.value })} />
              </div>
              <div className="field">
                <label>Kehadiran</label>
                <select value={f.hadir} onChange={e => setF({ ...f, hadir: e.target.value })}>
                  <option>Hadir, insya Allah</option>
                  <option>Belum bisa hadir</option>
                  <option>Masih ragu</option>
                </select>
              </div>
              <div className="field">
                <label>Ucapan &amp; doa</label>
                <textarea placeholder="Selamat ya! Semoga lancar sampai hari H..." value={f.ucapan} onChange={e => setF({ ...f, ucapan: e.target.value })} />
              </div>
              <button className="btn btn-primary btn-block" type="submit">Kirim RSVP &amp; Ucapan</button>
              {sentMsg && <p className="sec-body" style={{ marginTop: 12 }}>{sentMsg}</p>}
            </form>
            <div className="wish-sample">
              <div className="wish-label">{wishes.length ? 'UCAPAN TAMU' : 'CONTOH UCAPAN'}</div>
              {shownWishes.map((w, i) => (
                <div className="wish-card" key={i}>
                  <b>{w.nama} <span className="wh">— {w.hadir}</span></b>
                  {w.ucapan}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* GIFT */}
        {show.gift && (
          <section className="invite-section">
            <div className="sec-kicker">WEDDING GIFT</div>
            <h2 className="sec-title">Tanda Kasih</h2>
            <div className="gift-box">
              <p className="sec-body">Doa restu Anda adalah hadiah terindah. Jika ingin memberi tanda kasih:</p>
              <div className="bank">{d.bank}</div>
              <div className="rek">{d.rekening}</div>
              <div className="pemilik">a.n. {d.pemilikRek}</div>
              <button className="btn btn-outline" onClick={copyRek}>Salin Nomor Rekening</button>
              {sentMsg && <p className="sec-body" style={{ marginTop: 10 }}>{sentMsg}</p>}
            </div>
          </section>
        )}
      </div>

      {/* FOOTER */}
      <footer className="invite-footer">
        <p className="f-thanks">Merupakan kehormatan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu kepada kedua mempelai.</p>
        <h3 className="f-names">{d.priaPanggilan} &amp; {d.wanitaPanggilan}</h3>
        <p className="f-made">Powered by Kickman Apparel</p>
      </footer>

      {musicOn && interactive && (
        <button className={`music-fab${playing ? ' playing' : ''}`} onClick={toggleMusic} aria-label="Putar/jeda musik">
          {playing ? '⏸' : '♪'}
        </button>
      )}
    </div>
  )
}
