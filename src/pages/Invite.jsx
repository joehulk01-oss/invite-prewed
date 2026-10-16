import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import InvitationView from '../components/InvitationView.jsx'
import { loadInvite } from '../lib/storage.js'

export default function Invite() {
  const { slug } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    loadInvite(slug).then(d => { if (alive) { setData(d); setLoading(false) } })
    return () => { alive = false }
  }, [slug])

  if (loading) {
    return <div className="notfound"><p>Membuka undangan...</p></div>
  }

  if (!data) {
    return (
      <div className="notfound">
        <h1>Undangan tidak ditemukan</h1>
        <p className="sec-body">
          Link ini dibuat di browser lain / data belum tersambung ke GAS.
          Minta pembuat undangan untuk mengirim ulang linknya, atau hubungkan GAS
          di menu Pengaturan agar undangan bisa dibuka dari mana saja.
        </p>
        <p><Link to="/">Kembali ke Generator</Link></p>
      </div>
    )
  }

  return (
    <div className="guest-page">
      <div className="guest-col">
        <InvitationView data={data} slug={slug} interactive />
      </div>
    </div>
  )
}
