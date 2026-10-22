import { useState } from 'react'
import { getGasUrl, setGasUrl, setGasToken, getSettingsRemote, saveSettingsRemote } from '../lib/storage.js'

export default function AdminGas() {
  const [gasUrl, setGasUrlState] = useState(() => getGasUrl())
  const [pin, setPin] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [settings, setSettings] = useState({ token: '' })

  const handleUnlock = async (e) => {
    e?.preventDefault()
    if (!gasUrl.trim()) {
      setError('URL Web App GAS wajib diisi.')
      return
    }
    if (!pin.trim()) {
      setError('PIN super admin wajib diisi.')
      return
    }

    setLoading(true)
    setError('')
    setSuccessMsg('')

    try {
      const res = await getSettingsRemote(pin, gasUrl)
      if (res && res.ok) {
        setUnlocked(true)
        setGasUrl(gasUrl)
        const loadedSettings = res.settings || {}
        setSettings(loadedSettings)
        if (loadedSettings.token !== undefined) {
          setGasToken(loadedSettings.token)
        }
        setSuccessMsg('Koneksi berhasil dibuka dari spreadsheet.')
      } else {
        setError(res?.error || 'PIN salah atau gagal menghubungi endpoint settings.')
      }
    } catch (err) {
      setError('Gagal menghubungi GAS: ' + String(err && err.message || err))
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e) => {
    e?.preventDefault()
    setSaving(true)
    setError('')
    setSuccessMsg('')

    try {
      const res = await saveSettingsRemote(pin, settings, gasUrl)
      if (res && res.ok) {
        setGasUrl(gasUrl)
        if (settings.token !== undefined) {
          setGasToken(settings.token)
        }
        setSuccessMsg('✅ Setting berhasil disimpan ke sheet "settings" di spreadsheet!')
      } else {
        setError('Gagal menyimpan: ' + (res?.error || 'Unknown error'))
      }
    } catch (err) {
      setError('Gagal menyimpan: ' + String(err && err.message || err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="gen-wrap" style={{ maxWidth: 640, margin: '40px auto', padding: '0 20px' }}>
      <div className="hero" style={{ padding: '20px 0 30px' }}>
        <div className="hero-kicker" style={{ color: '#b3261e' }}>Super Admin</div>
        <h1 className="hero-title" style={{ fontSize: 28 }}>Pengaturan GAS Tersembunyi</h1>
        <p className="hero-sub">
          Konfigurasi koneksi Google Apps Script disimpan langsung ke sheet <code>settings</code> di spreadsheet dan dilindungi PIN super admin.
        </p>
      </div>

      <div className="card" style={{ padding: 24 }}>
        {!unlocked ? (
          <form onSubmit={handleUnlock}>
            <h2 className="card-title" style={{ marginTop: 0, fontSize: 18 }}>🔐 Autentikasi Admin</h2>
            <p className="hint">
              Masukkan URL Web App GAS dan PIN admin (sesuai Script Property <code>ADMIN_PIN</code> di Apps Script).
            </p>

            <div className="field">
              <label>URL Web App GAS</label>
              <input
                type="url"
                value={gasUrl}
                onChange={e => setGasUrlState(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                required
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
            </div>

            <div className="field" style={{ marginTop: 14 }}>
              <label>PIN Admin</label>
              <input
                type="password"
                value={pin}
                onChange={e => setPin(e.target.value)}
                placeholder="Masukkan PIN rahasia..."
                required
                autoFocus
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
            </div>

            {error && (
              <div className="result-box" style={{ borderColor: '#e8a0a0', background: '#fdf3f3', marginTop: 16 }}>
                <b style={{ color: '#b3261e' }}>❌ {error}</b>
              </div>
            )}

            <div style={{ marginTop: 20 }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ width: '100%', padding: '12px 20px', fontSize: 15 }}
              >
                {loading ? '⏳ Memeriksa PIN...' : '🔓 Buka Setting'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSave}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="card-title" style={{ margin: 0, fontSize: 18 }}>⚙ Pengaturan Tersimpan</h2>
              <button
                type="button"
                className="btn-xs"
                onClick={() => { setUnlocked(false); setPin(''); setError(''); setSuccessMsg('') }}
              >
                🔒 Kunci Kembali
              </button>
            </div>
            <p className="hint">
              Koneksi aktif ke spreadsheet: <b>{gasUrl}</b>
            </p>

            <div className="field" style={{ marginTop: 16 }}>
              <label>Token GAS (disimpan di sheet "settings")</label>
              <input
                type="text"
                value={settings.token || ''}
                onChange={e => setSettings(s => ({ ...s, token: e.target.value }))}
                placeholder="k1ckm4n-2026-und4ngan"
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
              <p className="hint" style={{ marginTop: 4 }}>
                Token ini akan diverifikasi oleh Apps Script untuk setiap aksi simpan/update/hapus undangan.
              </p>
            </div>

            {error && (
              <div className="result-box" style={{ borderColor: '#e8a0a0', background: '#fdf3f3', marginTop: 16 }}>
                <b style={{ color: '#b3261e' }}>❌ {error}</b>
              </div>
            )}

            {successMsg && (
              <div className="result-box" style={{ borderColor: '#7bc88f', background: '#f0fdf4', marginTop: 16 }}>
                <b style={{ color: '#1b5e20' }}>{successMsg}</b>
              </div>
            )}

            <div style={{ marginTop: 22, display: 'flex', gap: 10 }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
                style={{ flex: 1, padding: '12px 20px', fontSize: 15 }}
              >
                {saving ? '⏳ Menyimpan...' : '💾 Simpan ke Spreadsheet'}
              </button>
              <button
                type="button"
                className="btn btn-outline"
                disabled={loading}
                onClick={handleUnlock}
                style={{ padding: '12px 18px', fontSize: 14 }}
              >
                ↻ Muat Ulang
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
