import { Routes, Route, Link, NavLink, useNavigate } from 'react-router-dom'
import Generator from './pages/Generator.jsx'
import Invite from './pages/Invite.jsx'
import ListUndangan from './pages/ListUndangan.jsx'
import BulkGenerator from './pages/BulkGenerator.jsx'
import { getLastSlug } from './lib/storage.js'

function TopTabs() {
  const nav = useNavigate()
  const goInvite = () => {
    const slug = getLastSlug()
    if (slug) nav(`/u/${slug}`)
    else nav('/')
  }
  return (
    <nav className="pill-tabs">
      <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>✒ Generator</NavLink>
      <NavLink to="/list" className={({ isActive }) => (isActive ? 'active' : '')}>☰ List Undangan</NavLink>
      <NavLink to="/bulk" className={({ isActive }) => (isActive ? 'active' : '')}>⚡ Bulk</NavLink>
      <button onClick={goInvite}>♡ Lihat Undangan</button>
    </nav>
  )
}

export default function App() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="brand">
          <span className="brand-badge">A&S</span>
          <span>
            <span className="brand-title">Invite Prewed Generator</span>
          </span>
        </Link>
        <TopTabs />
      </header>
      <Routes>
        <Route path="/" element={<Generator />} />
        <Route path="/list" element={<ListUndangan />} />
        <Route path="/bulk" element={<BulkGenerator />} />
        <Route path="/u/:slug" element={<Invite />} />
        <Route path="*" element={<div className="notfound"><h1>Halaman tidak ditemukan</h1><p><Link to="/">Kembali ke Generator</Link></p></div>} />
      </Routes>
      <footer className="footer">
        <p className="kickman">Powered by Kickman Apparel</p>
        <p>© 2026 Invite Prewed Generator</p>
      </footer>
    </div>
  )
}
