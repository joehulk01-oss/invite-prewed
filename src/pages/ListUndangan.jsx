import { useEffect, useMemo, useRef, useState } from 'react'
import {
  listInvitesRemote, updateInviteRemote, deleteInviteRemote,
  loadInvite, buildWaLink, getGasUrl,
} from '../lib/storage.js'

function csvEsc(v) {
  const s = String(v ?? '')
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export default function ListUndangan() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [q, setQ] = useState('')
  const [editing, setEditing] = useState(null) // { slug, nama }
  const [editName, setEditName] = useState('')
  const [saving, setSaving] = useState(false)
  const [confirmDel, setConfirmDel] = useState(null)
  const [busySlug, setBusySlug] = useState(null)
  const [checked, setChecked] = useState({}) // slug -> true
  const [bulkDel, setBulkDel] = useState(null) // null | 'confirm' | 'running'
  const [bulkProg, setBulkProg] = useState({ done: 0, failed: 0, total: 0 })
  const [delError, setDelError] = useState('')
  const dataCache = useRef({})

  const connected = !!getGasUrl()

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await listInvitesRemote()
      if (res.ok) setItems(res.items || [])
      else setError(res.error || 'Gagal memuat daftar.')
    } catch (e) {
      setError('Tidak bisa menghubungi GAS. Cek URL Web App di Pengaturan.')
    }
    setLoading(false)
  }

  useEffect(() => { if (connected) load() }, [])

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return items
    return items.filter(it => (it.nama || '').toLowerCase().includes(s) || (it.slug || '').toLowerCase().includes(s))
  }, [items, q])

  const linkFor = (slug) => `${window.location.origin}/u/${slug}`

  const copyLink = async (slug) => {
    try { await navigator.clipboard.writeText(linkFor(slug)) } catch {}
  }

  const fullData = async (slug) => {
    if (!dataCache.current[slug]) dataCache.current[slug] = await loadInvite(slug)
    return dataCache.current[slug]
  }

  const sendWA = async (slug, nama) => {
    setBusySlug(slug + ':wa')
    try {
      const d = await fullData(slug)
      const template = d?.pesanWA || 'Halo {nama}, ini link undangan kami: {link}'
      window.open(buildWaLink(template, nama, linkFor(slug)), '_blank')
    } finally { setBusySlug(null) }
  }

  const openEdit = (it) => { setEditing(it); setEditName(it.nama) }
  const saveEdit = async () => {
    if (!editing || !editName.trim()) return
    setSaving(true)
    try {
      const res = await updateInviteRemote(editing.slug, { namaTamu: editName.trim() })
      if (res && res.ok) {
        setEditing(null)
        delete dataCache.current[editing.slug]
        load()
      } else {
        alert('Gagal menyimpan: ' + (res?.error || 'unknown'))
      }
    } catch (e) {
      alert('Gagal menyimpan: ' + String(e && e.message || e))
    } finally {
      setSaving(false)
    }
  }

  const doDelete = async (slug) => {
    setBusySlug(slug + ':del')
    setDelError('')
    let res
    try {
      res = await deleteInviteRemote(slug)
    } catch (e) {
      res = { ok: false, error: 'Tidak bisa menghubungi GAS: ' + String(e && e.message || e) }
    }
    setBusySlug(null)
    setConfirmDel(null)
    if (res.ok) {
      delete dataCache.current[slug]
      setChecked(c => { const n = { ...c }; delete n[slug]; return n })
      load()
    } else {
      const msg = 'Gagal menghapus: ' + (res.error || 'unknown')
      setDelError(msg)
      alert(msg)
    }
  }

  const checkedSlugs = filtered.filter(it => checked[it.slug]).map(it => it.slug)

  const doBulkDelete = async () => {
    const slugs = checkedSlugs
    if (!slugs.length || bulkDel === 'running') return
    setBulkDel('running')
    setDelError('')
    setBulkProg({ done: 0, failed: 0, total: slugs.length })
    let failed = 0
    let lastErr = ''
    for (const slug of slugs) {
      try {
        const res = await deleteInviteRemote(slug)
        if (res && res.ok) {
          delete dataCache.current[slug]
        } else {
          failed++
          lastErr = res && res.error ? String(res.error) : 'unknown'
        }
      } catch (e) {
        failed++
        lastErr = String(e && e.message || e)
      }
      setBulkProg(p => ({ ...p, done: p.done + 1, failed }))
      await new Promise(r => setTimeout(r, 200))
    }
    if (failed > 0) setDelError(`Gagal menghapus ${failed} undangan. Error terakhir: ${lastErr}`)
    setChecked({})
    setBulkDel(null)
    load()
  }

  const [csvBusy, setCsvBusy] = useState(false)
  const downloadCSV = async () => {
    if (!filtered.length) return
    setCsvBusy(true)
    // Ambil template pesan WA dari 1 undangan penuh (pesanWA sama untuk semua tamu)
    let template = 'Halo {nama}, ini link undangan kami: {link}'
    try {
      const d = await loadInvite(filtered[0].slug)
      if (d?.pesanWA) template = d.pesanWA
    } catch {}
    const rows = [['No', 'Nama', 'Link Undangan', 'Link WA']]
    filtered.forEach((it, i) => {
      const link = linkFor(it.slug)
      rows.push([i + 1, it.nama, link, buildWaLink(template, it.nama, link)])
    })
    const csv = rows.map(r => r.map(csvEsc).join(',')).join('\n')
    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'list-undangan.csv'
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 2000)
    setCsvBusy(false)
  }

  return (
    <div className="list-page">
      <h1>List Undangan <span className="count-badge">{items.length}</span></h1>
      <p className="sub">Data diambil langsung dari spreadsheet via GAS — edit nama atau hapus undangan dari sini.</p>

      {!connected && (
        <div className="result-box">
          <b>GAS belum disambungkan.</b>
          <p className="hint">Isi URL Web App GAS di tab Pengaturan pada halaman Generator, lalu kembali ke sini.</p>
        </div>
      )}

      {connected && (
        <>
          <div className="toolbar">
            <input
              className="search-input"
              placeholder="🔍 Cari nama tamu..."
              value={q}
              onChange={e => setQ(e.target.value)}
            />
            <button className="btn btn-outline" style={{ padding: '10px 20px', fontSize: 14 }} onClick={load}>↻ Muat ulang</button>
            <button className="btn btn-outline" style={{ padding: '10px 20px', fontSize: 14 }} onClick={downloadCSV} disabled={!filtered.length || csvBusy}>{csvBusy ? '⏳ Menyiapkan...' : '⬇ Download CSV'}</button>
          </div>

          {loading && <p className="sub">Memuat dari spreadsheet...</p>}
          {error && <div className="result-box"><b>Gagal:</b> {error}</div>}
          {delError && <div className="result-box" style={{ borderColor: '#e8a0a0', background: '#fdf3f3' }}><b>⚠</b> {delError}</div>}

          {!loading && !error && filtered.length > 0 && checkedSlugs.length > 0 && (
            <div className="toolbar" style={{ background: '#fdf6ec', border: '1px solid #e8d5ae', borderRadius: 10, padding: 10 }}>
              <span><b>{checkedSlugs.length}</b> dipilih</span>
              {bulkDel === 'confirm' ? (
                <>
                  <span>Yakin hapus {checkedSlugs.length} undangan?</span>
                  <button className="btn btn-primary" style={{ background: '#c0392b' }} onClick={doBulkDelete}>Ya, hapus semua</button>
                  <button className="btn btn-outline" onClick={() => setBulkDel(null)}>Batal</button>
                </>
              ) : bulkDel === 'running' ? (
                <span>⏳ Menghapus... {bulkProg.done}/{bulkProg.total}{bulkProg.failed > 0 && ` (${bulkProg.failed} gagal)`}</span>
              ) : (
                <button className="btn btn-primary" style={{ background: '#c0392b' }} onClick={() => setBulkDel('confirm')}>
                  🗑 Hapus yang dipilih ({checkedSlugs.length})
                </button>
              )}
            </div>
          )}

          {!loading && !error && (
            filtered.length === 0 ? (
              <div className="result-box"><b>Belum ada undangan.</b><p className="hint">Buat undangan dulu di halaman Generator — otomatis masuk spreadsheet & tampil di sini.</p></div>
            ) : (
              <div className="dtable-wrap">
                <table className="dtable">
                  <thead>
                    <tr>
                      <th style={{ width: 40 }}>
                        <input
                          type="checkbox"
                          checked={filtered.length > 0 && checkedSlugs.length === filtered.length}
                          onChange={e => {
                            if (e.target.checked) {
                              const n = {}
                              filtered.forEach(it => { n[it.slug] = true })
                              setChecked(n)
                            } else setChecked({})
                          }}
                          title="Pilih semua"
                        />
                      </th>
                      <th style={{ width: 56 }}>No</th>
                      <th>Nama</th>
                      <th>Link</th>
                      <th style={{ width: 280 }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((it, i) => (
                      <tr key={it.slug}>
                        <td>
                          <input
                            type="checkbox"
                            checked={!!checked[it.slug]}
                            onChange={e => setChecked(c => {
                              const n = { ...c }
                              if (e.target.checked) n[it.slug] = true
                              else delete n[it.slug]
                              return n
                            })}
                          />
                        </td>
                        <td>{i + 1}</td>
                        <td><b>{it.nama}</b></td>
                        <td className="link-cell">
                          <a href={linkFor(it.slug)} target="_blank" rel="noreferrer">{linkFor(it.slug)}</a>
                        </td>
                        <td>
                          <div className="row-actions">
                            <a className="btn-xs" style={{ textDecoration: 'none', color: 'inherit' }} href={linkFor(it.slug)} target="_blank" rel="noreferrer">Buka</a>
                            <button className="btn-xs" onClick={() => copyLink(it.slug)}>Salin</button>
                            <button className="btn-xs" disabled={busySlug === it.slug + ':wa'} onClick={() => sendWA(it.slug, it.nama)}>WA</button>
                            <button className="btn-xs" onClick={() => openEdit(it)}>Edit</button>
                            {confirmDel === it.slug ? (
                              <>
                                <button className="btn-xs warn" disabled={busySlug === it.slug + ':del'} onClick={() => doDelete(it.slug)}>Ya, hapus</button>
                                <button className="btn-xs" onClick={() => setConfirmDel(null)}>Batal</button>
                              </>
                            ) : (
                              <button className="btn-xs danger" onClick={() => setConfirmDel(it.slug)}>Hapus</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </>
      )}

      {editing && (
        <div className="modal-backdrop" onClick={() => !saving && setEditing(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Edit Nama Tamu</h3>
            <div className="field">
              <label>Nama tamu</label>
              <input type="text" value={editName} onChange={e => setEditName(e.target.value)} autoFocus />
            </div>
            <p className="hint">Link undangan tidak berubah — hanya nama di cover yang diganti.</p>
            <div className="modal-actions">
              <button className="btn btn-primary" disabled={saving || !editName.trim()} onClick={saveEdit} style={{ flex: 1 }}>
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
              <button className="btn btn-outline" disabled={saving} onClick={() => setEditing(null)}>Batal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
