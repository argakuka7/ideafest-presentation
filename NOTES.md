# Catatan Desain — IDEATALKS SUB 2027 (Aplikasi Pengunjung + Assistant)

## Tugas
Mockup untuk aplikasi pengunjung IdeaFest: onboarding + autentikasi, pencatatan data pengunjung, dan **1 agentic AI** yang menjawab pertanyaan serta merekomendasikan speaker yang harus-watch. Basis data: `ideafestsub` (Next.js statis, 225 speaker / 109 sesi / 3 hari / 8 track).

## Keputusan arsitektur (dari percakapan sebelumnya, bukan dari mockup)
- **Auth**: Better Auth + Convex
- **Agent**: opsi ini — eve (Vercel) atau `@convex-dev/agent` (native Convex)
- **Model**: DeepSeek terbaru
- **Hosting**: Vercel serverless (bukan VPS) — event sekali pakai, ~20rb pengunjung
- **Biaya terbesar**: token AI, bukan hosting

## Kategori produk & tolok ukur
- **Kategori**: event companion app (bukan landing page, bukan chat app murni)
- **Tolok ukur nyata yang dibongkar** (screenshot diambil, bukan dari ingatan):
  - **X-CD Conference Agent** — chat assistant dengan grounding data acara, kartu sesi di dalam jawaban, prompt chips
  - **Sessionize** — event app: agenda, speaker, filter
  - **Website IDEATALKS existing** — silk background navy/cream/pink, Anton + Inter, schedule list per hari
- **Baseline yang dipertahankan**: jadwal per hari, kartu sesi, filter track, bookmark, identitas visual navy/cream/pink + Anton/Inter
- **Formula bawaan yang dipecah**: "chat bubble di bawah dengan kartu-kartu sesi seragam" — semua app acara punya ini; Arah 1 dan 3 memecahkannya

## Ronde 01 — tiga arah (semua dibangun sebagai aplikasi utuh, bukan layar pertama saja)

| # | Arah | North Star | Tipografi | Palet | Interaksi utama |
|---|---|---|---|---|---|
| 01 | **Kursi & Peta Panggung** | Rekomendasi adalah protagonist; jadwal personal digambar sebagai peta hari yang dibaca, bukan chat bubble | Instrument Serif + Inter | navy, krem, pink tua | "Peta harimu" (timeline 5 slot), 4 kartu rekomendasi bertanda alasan, sheet chat untuk agent |
| 02 | **Poster Festival** | Acara dilihat sebagai line-up festival: kartu berwarna penuh, padat, dipindai sambil berdiri | Anton + Inter | navy, krem, 8 warna track | Grid 2 kolom, strip "sekarang berlangsung", askbar menempel di bawah |
| 03 | **Percakapan Personal** | Agent terasa seperti panutan personal, bukan software: ngobrol dulu, rekomendasi menyusul | Instrument Serif + Inter | navy, krem hangat, pink tua | Thread chat penuh, kartu rekomendasi besar berisi alasan, chips pertanyaan |

## Yang berubah dari kondisi sekarang (IDEATALKS existing)
- Static export → butuh server (auth + data + agent)
- Schedule list sebagai halaman utama → **beranda = rekomendasi personal**
- Chat tidak ada → 1 agentic AI (bukan "1 agent" per kalimat: satu identitas, satu persona: Mira / si-Mira)
- Bookmark lokalStorage → butuh sinkron ke akun (Convex)

## Temuan keterbacaan yang diperbaiki
- Arah 1: pink teks `#E91E8C` → `#C4157A` (kontras 3.7:1 → di atas ambang); garis warna satu sisi pada kartu diganti badge track berwarna penuh
- Arah 2: 8 warna track digelapkan agar teks putih ≥ 4.5:1; label ruangan diberi latar semi transparan; line-height judul 1.2 → 1.3
- Arah 3: label "MIRA" pink digelapkan; baris warna kartu digelapkan; teks Mandarin & nama perusahaan aneh dibersihkan

## Peringatan "default practices" yang tersisa
- **Arah 1**: 3 label eyebrow kapital di atas judul (`JADWAL PRIBADI`, `PETA HARIMU`, `ASSISTANT ACARA`) — dipertahankan karena jadi penanda bagian di halaman editorial, bukan di atas tiap kartu. Alasan: di layout majalah, label kapital adalah konvensi isi, bukan hiasan.
- **Arah 1**: "kartu di dalam kartu" di sheet chat — dipertahankan: kartu di dalam sheet adalah satu pesan, bukan layering kartu.
- **Halaman perbandingan**: nomor kandidat 01/02/03 di atas judul — itu alat perbandingan, bukan bagian produk.

## Verifikasi
- Screenshot tiap app (mobile 390×844): semua lolos pemeriksaan console error, overflow horizontal, dan gambar gagal load
- Interaksi diuji: simpan ke jadwal (A1), buka sheet chat (A1), filter track (A2), tambah ke jadwal (A3)
- Font nyata ter-render (Anton, Inter, Instrument Serif) — bukan fallback

## Berkas bukti
- `apps/a1-kursi.html`, `apps/a2-festival.html`, `apps/a3-obrol.html` — tiga aplikasi lengkap
- `explore/style-explorer.html` — halaman perbandingan
- `shots/` — screenshot tiap app + aksi
- `bench/` — screenshot tolok ukur (X-CD, Sessionize)
- `apps/dummy-data.json` — 80 sesi, 132 speaker, 3 hari, 8 track

## Tambahan: aplikasi lengkap (`app/`)
Setelah tiga arah statis, satu flagship dibangun penuh sebagai prototipe jalan (Arah 1 "Kursi & Peta Panggung"):

| Layar | Isi |
|---|---|
| Onboarding | 3 langkah: nama+email → minat & peran → perkenalan Mira + kode tiket. Disimpan ke localStorage (simulasi sesi) |
| Beranda | Sapaan personal, peta hari (timeline), 4 rekomendasi dengan alasan, catatan Mira |
| Jadwal | 80 sesi, cari, filter 8 track, grouped per hari |
| Tersimpan | Bookmark sesi (bisa dihapus) |
| Speaker | 132 pembicara, cari, detail + sesi-nya |
| Profil | Data minat, jumlah tersimpan, kode tiket, keluar |
| Chat | Mira menjawab Q&A (ringkasan, track, kantin, jam) + memberi kartu rekomendasi |
| Admin | Dashboard: KPI, minat pengunjung, pertanyaan terpopuler, daftar pengunjung (buka: klik avatar 4×) |
| Overlay | Cari global (sesi + pembicara), notifikasi |

**Rekomendasi** memakai mesin aturan sederhana (bukan LLM): skor track sesuai minat + bobot role, lalu alasan ditulis per track. Nanti diganti panggilan DeepSeek — antarmukanya sudah siap.

**Yang belum ada** (butuh backend): Better Auth, Convex, panggilan DeepSeek, dashboard admin sungguhan, email, sinkron lintas perangkat.

## Tambahan 2: ctxbar, fitur acara, dan dashboard admin (v2)

### Header
Awalnya header cuma logo + 3 ikon, dan tidak menjawab pertanyaan paling penting saat di acara: **sekarang jam berapa & sesi apa yang jalan**. Ditambah **context bar** (baris kedua, navy) yang selalu terlihat:
- kiri: nama halaman + status ("Sedang progressing: <judul sesi>")
- kanan: hari acara + jam acara (`DAY 1 · 10.42`)

### Fitur acara yang ditambahkan
| Fitur | Isi |
|---|---|
| Strip "sedang berlangsung" | Di beranda: sesi yang jalan sekarang + tombol Lihat → |
| Deteksi bentrok | Di Tersimpan: dua sesi jam sama ditandai,_ui merah, disebut judulnya |
| Ekspor kalender | `.ics` sungguhan (VCALENDAR) — bisa diimpor ke Google Calendar/Apple |
| Bagikan jadwal | Web Share API, atau salin ke clipboard |
| Toast | Umpan balik singkat (terunduh / disalin) |
| Desktop | Di ≥760px jadi dua kolom: peta hari di kiri, rekomendasi di kanan |

### Dashboard admin (dulu tersembunyi di klik avatar 4×)
Sekarang ada di **Profil → PENYELENGGARA → Dashboard admin**, dengan 4 tab:
1. **Ringkasan** — KPI, minat pengunjung (bar chart per track), pertanyaan terpopuler, sesi paling disimpan
2. **Pengunjung** — daftar + pencarian; user yang sedang pakai ditandai "KAMU"
3. **Pertanyaan** — pertanyaan terpopuler + tema yang belum terjawab (tiket, reimbursement, parkir)
4. **Materi** — rekap per hari, jumlah pembicara & sesi

Data pengunjung memakai user yang benar-benar daftar di app itu (dari localStorage), jadi angkanya konsisten dengan apa yang_USER impatient.

## Tambahan 3: profil speaker yang kaya (v3)

Klik nama pembicara (dari daftar Speaker, dari detail sesi, atau dari kartu rekomendasi) → **profil lengkap**:
- Avatar besar, nama, peran, dan tag: track · kota · pengalaman (__ tahun di bidangnya)
- **Kutipan** (pengenalan singkat di atas)
- **Tentang**: bio 2 kalimat + catatan arah pembicara
- **Statistik**: jumlah sesi di acara · bidang fokus · perusahaan
- **Sesi di IDEATALKS** — bisa langsung disimpan dari sana
- **Aksi**: "Ikuti pembicara" (state tersimpan) dan "Tanya Mira soal dia" (membuka chat dengan pertanyaan terisi)
- **Pembicara lain di track yang sama** — untuk navigasi silang

Data pembicara diperkaya di `app/data.js`: tiap orang punya kota, pengalaman, bidang fokus, kutipan, dan catatan — 132 orang, semuanya konsisten dengan sesi yang mereka bawani.

**Perbaikan teknis sekalian**: sheet detail (sesi & pembicara) dipindahkan keluar dari `<main class="scroll">` supaya bisa full-screen dan tidak ikut ter-scroll bersama halaman.
