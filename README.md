# Invite Prewed Generator

Generator undangan pernikahan link — React + Vite. Desain elegan krem/cokelat/emas.

## Fitur

- `/` — Generator: form 2 kolom + **live preview** undangan di mockup HP (berubah saat mengetik)
  - Tab **Isi Data**: Data Mempelai, Detail Acara (Akad & Resepsi + link Google Maps), Foto (cover, pria, wanita, galeri maks 6 — dikompres otomatis), Template (3 pilihan visual: Elegan Krem, Putih Minimal, Sage Garden), Musik Latar (lagu contoh / upload MP3 ≤3 MB / link MP3 / tanpa musik + tombol Coba Putar), Salam & Kutipan, Cerita (3 timeline Love Story), Amplop Digital, Tamu & RSVP (nama tamu, template pesan WA dengan `{nama}` & `{link}`)
  - Tab **Pengaturan**: checkbox bagian yang tampil (countdown, RSVP, love story, amplop digital, galeri, musik) + kolom URL Web App GAS
  - Tombol: **Lihat Hasil** (simpan & buka undangan), **Salin Link Undangan**, **Download PDF / Cetak** (print CSS), **Kirim via WhatsApp**
  - Daftar undangan yang pernah dibuat + download JSON backup
- `/u/:slug` — Halaman undangan untuk tamu: cover (foto full + nama script + kartu tamu + tombol emas Buka Undangan), Save The Date, Mempelai (foto lingkaran), Countdown live, Akad & Resepsi (tombol Google Maps), Love Story timeline, Galeri, RSVP & Ucapan (tersimpan per-undangan), Amplop Digital (salin rekening), footer. Tombol musik melayang.
- Footer: **Powered by Kickman Apparel**

## Data & GAS

- Tanpa GAS: data di `localStorage` browser pembuat (`invite_<slug>`). Link hanya terbuka penuh di browser yang sama.
- Dengan GAS: isi **URL Web App GAS** di tab Pengaturan → simpan/baca via GAS (foto ke Drive, data ke Sheet). File `gas/Code.gs` sudah disiapkan — paste ke script.google.com, set Sheet ID + folder Drive + token, deploy sebagai Web App.

## Jalanin lokal

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # output dist/
```

## Deploy ke Vercel

1. Push folder ini ke GitHub (tanpa `node_modules`).
2. Vercel → New Project → Import repo → Framework: Vite → Deploy.
3. `vercel.json` sudah ada (rewrite SPA untuk `/u/:slug`).
