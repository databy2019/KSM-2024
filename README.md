# KSM/OMI Smart Prep — Static HTML + JavaScript

Versi ini **tidak memakai React, Node.js, npm, Vite, bundler, atau proses build**.

## File utama
- `index.html` — halaman utama
- `styles.css` — desain responsive
- `data.js` — 75 soal + metadata + sumber
- `app.js` — seluruh interaksi aplikasi
- `.nojekyll` — memastikan GitHub Pages menyajikan file apa adanya

## Cara menjalankan di komputer
Cukup klik dua kali `index.html` dan buka di browser modern.

## Deploy ke GitHub Pages tanpa Node.js
1. Buat repository GitHub baru.
2. Upload semua file dalam folder ini **ke root repository**.
3. Commit ke branch `main`.
4. Buka **Settings → Pages**.
5. Pada **Build and deployment**, pilih **Deploy from a branch**.
6. Pilih branch `main` dan folder `/ (root)`.
7. Klik **Save**.
8. Tunggu GitHub Pages menerbitkan URL website.

Tidak perlu `npm install`, tidak perlu GitHub Actions, dan tidak perlu server backend.

## Fitur
- 75 soal latihan (2024, 2025, prediksi 2026)
- Pembahasan setiap soal
- Filter tahun, kategori, tingkat kesulitan, dan pencarian
- Progres bank soal disimpan di `localStorage`
- Tryout 25 soal / 45 menit
- Timer dan navigasi nomor
- Nilai + review pembahasan setelah tryout
- Peta prioritas prediksi 2026
- Peta materi dan rencana belajar
- Halaman sumber/metodologi
- Responsive desktop/tablet/HP

## Catatan
Bank 2024–2025 dalam proyek ini adalah rekonstruksi latihan orisinal berbasis pola/kisi-kisi publik, bukan klaim salinan naskah resmi. Prediksi 2026 adalah model latihan, bukan bocoran.
