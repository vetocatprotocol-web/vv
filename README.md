# ðŸš€ KARYO OS

## Sistem Operasi Kerja Berbasis AI dengan Mode Hibrida (Manual + Agen Otonom)

---

# ðŸ“– Daftar Isi

1. [ðŸ§ Deskripsi Inti](#-deskripsi-inti)
2. [✨ Fitur Inti](#-core-features)
3. [ðŸŽ¯ Core Experience (UI/UX)](#-core-experience-uiux)
4. [ðŸ — Arsitektur Sistem](#-system-architecture)
5. [ðŸ§ Lapisan AI (Kecerdasan Inti)](#-ai-layer-core-intelligence)
6. [ðŸ§© Sistem Memori](#-memory-system)
7. [ðŸ¤– Sistem Agen](#-agent-system)
8. Sistem Eksekusi [ðŸ”](#-execution-system)
9. [ðŸ” Sistem Acara (Inti Utama)](#-event-system-backbone)
10. [ðŸ”Œ Lapisan Integrasi](#-integration-layer)
11. [ðŸ“‚ Sistem Berkas (Brankas Digital)](#-file-system-digital-vault)
12. [ðŸ“Š Mesin Sesi](#-session-engine)
13. [ðŸ” Otentikasi & Otorisasi](#-authentication--authorization)
14. [ðŸ“¡ Sistem Waktu Nyata](#-real-time-system)
15. [ðŸ“Š Observabilitas](#-observabilitas)
16. [ðŸ§± Tumpukan Teknologi](#-tech-stack)
17. [ðŸ“¦ Struktur Monorepo](#-monorepo-structure)
18. [ðŸ”„ Alur Sistem Beton (Ujung-ke-Ujung)](#-concrete-system-flow-end-to-end)
19. [ðŸ“ Rincian Layanan Backend](#-backend-service-breakdown)
20. [ðŸ—„ Desain Basis Data](#-database-design)
21. [ðŸ›' Pasar Agen](#-agent-marketplace)
22. [✡¡ Positioning & Differentiators](#-positioning--differentiators)
23. [ðŸš€ Panduan Implementasi (Fase)](#-implementation-guide-phases)
24. [ðŸ”' Keamanan](#-keamanan)
25. [ðŸš€ Strategi Penskalaan](#-scaling-strategy)
26. [ðŸ”® Peta Jalan](#-roadmap)
27. [ðŸ“Š Daftar Periksa Akhir](#-daftar-periksa akhir)
28. [ðŸ”´ Gap Kritis](#-gap-kritis)
29. [ðŸŸ¡ Gap Signifikan](#-gap-signifikan)
30. [ðŸŸ¢ Rekomendasi Tambahan](#-rekomendasi-tambahan)
31. [□–□ Data Governance & Compliance](#□ -data-governance--compliance)
32. [ðŸ ¢ Arsitektur Multi-Tenancy](#-multi-tenancy-architecture)
33. [ðŸ'° Manajemen Biaya AI](#-ai-cost-management)
34. [ðŸ›¡ Strategi Penanganan Kesalahan](#-error-handling-strategy)
35. [ðŸ“‹ Sistem Jejak Audit](#-audit-trail-system)
36. [ðŸ“¡ Mode Offline & Terdegradasi](#-offline--degraded-mode)
37. [â™¿ Aksesibilitas & Internasionalisasi](#-aksesibilitas--internasionalisasi)
38. [ðŸŽ“ Alur Onboarding Pengguna](#-user-onboarding-flow)
39. [ðŸ · Strategi Pembuatan Versi](#-versioning-strategy)
40. [ðŸ¤– Mitigasi Halusinasi AI](#-ai-hallucination-mitigation)
41. [ðŸ'¥ Fitur Kolaborasi](#-collaboration-features)
42. [ðŸ“ˆ Analisis & Kecerdasan Bisnis](#-analytics--business-intelligence)
43. [ðŸ”Œ Plugin SDK & Sandbox](#-plugin-sdk--sandbox)
44. [ðŸ'¾ Backup & Disaster Recovery](#-backup--disaster-recovery)
45. [ðŸ“… Penilaian Kesiapan Produksi Akhir](#-final-production-readiness-assessment)

---

# ðŸ§ Deskripsi Inti

Karyo OS adalah sistem operasi kerja berbasis AI yang memungkinkan pengguna:

- **Bekerja secara manual** menggunakan alat
- **Mengotomatisasi pekerjaan** menggunakan AI Agent
- **Kombinasi keduanya** (Alur Kerja Hibrid)

Berbeda dengan platform AI lain, Karyo tidak memaksakan otomatisasi penuh. Karena realita user belum sepenuknya percaya AI, maka Karyo memberikan:

> ðŸ” **Kontrol penuh + otomatisasi fleksibel dalam satu ruang kerja**

Karyo OS adalah **Sistem Operasi AI** yang menggabungkan:
- ðŸ§ Mesin Pengambilan Keputusan AI
- ðŸ¤– Sistem Multi-Agen
- ðŸ§© Pemrosesan yang Memperhatikan Memori
- ⚡ Eksekusi Waktu Nyata
- ðŸ — Arsitektur yang Dapat Diperluas

Karyo OS bukan sekadar aplikasi AI â€” melainkan **fondasi untuk masa depan automasi kerja berbasis AI**.

---

# ✨ Fitur Utama

| Fitur | Deskripsi |
|---------|-------------|
| ðŸ§ Mesin Pengambilan Keputusan AI | Pemahaman & penalaran tugas, pemrosesan berbasis konteks, perutean model (murah vs cerdas) |
| ðŸ¤– Sistem Multi-Agen | Pemilihan agen dinamis, eksekusi tugas bersamaan, arsitektur agen yang dapat diperluas |
| ðŸ§© Sistem Memori | Memori jangka pendek & jangka panjang, pencarian semantik (basis data vektor), pengambilan konteks |
| ✓ Eksekusi Berbasis Peristiwa | Pemrosesan berbasis antrian (BullMQ), sistem peristiwa (Redis Pub/Sub), eksekusi toleransi kesalahan |
| ðŸ“¡ Sistem Waktu Nyata | Pembaruan tugas langsung, pelacakan status agen, WebSocket (Socket.IO) |
| ðŸ” Otentikasi & Akses | Auth.js (otentikasi aman), RBAC (pengguna / admin / super_admin) |
| ðŸ“Š Observabilitas | Pencatatan Log (Winston), Metrik (Prometheus), Dasbor (Grafana), Pelacakan (OpenTelemetry) |

---

# ðŸŽ¯ Pengalaman Inti (UI/UX)

## 1. ⚡ Antarmuka Kerja Berbasis Perintah

Di tengah dashboard:

> "Ketik perintah, buat dokumen, atau olah file..."

Ini adalah lapisan interaksi inti:

```
Bahasa Alami → Aksi
```

Pemicu Bisa:
- **Alat manual** â€” tindakan pengguna langsung
- **Agen AI** â€” AI eksekusi mandiri
- **Otomatisasi alur kerja** — rangkaian multi-langkah

ðŸ'‰ Ini menjadikan Karyo seperti:

> **Notion + Copilot + Zapier + AI Agent dalam satu sistem**

## 2. ðŸ”„ Sistem Mode Ganda (Pembeda Utama)

### ðŸ“ Mode Manual (Peralatan)
Pengguna bisa:
- Buat dokumen
- Analisis data
- Unggah & olah file
- Alat integrasi (Drive, Slack, dll)

**Kontrol penuh, tanpa ketergantungan AI**

### ðŸ¤– Mode Otonom (Agen)
Pengguna bisa:
- Jalankan agen AI untuk membuat laporan, analisis data, dokumen ringkas
- Pantau kemajuan (seperti di sidebar: 65%, 22%)

âž¡ **AI bekerja seperti asisten digital real-time**

### ðŸ”€ Mode Hybrid (Kunci Inovasi)
Pengguna bisa:
- Mulai manual â†' lanjutkan dengan AI
- AI mulai → pengambilalihan pengguna
- Kolaborasi waktu nyata

âž¡ Ini yang bikin:

> â — **Lebih realistis daripada "otomatisasi AI penuh"**

## 3. ðŸ§© Sistem Memori AI (Diferensiator Besar)

Dari UI:
- "Anda sering membuat laporan mingguan"
- "Lebih suka format PDF"
- "Produktif di pagi hari"

Artinya:
- Karyo punya **mesin pembelajaran perilaku**
- Fungsi: Personalisasi alur kerja, Saran otomatis, Memprediksi tindakan selanjutnya

âž¡ Ini bukan hanya alat AI â€” **ini AI yang belajar cara kerja pengguna**

## 4. ðŸ”Œ Pusat Integrasi (Ekosistem Alat)

Terintegrasi dengan:
- Google Drive
- Slack
- Gmail
- Airtable
- Garis
- dll

Fungsi:
- Sumber data untuk AI
- Lapisan eksekusi untuk otomatisasi

âž¡ Ini membuat Karyo jadi:

> **Otak pusat untuk semua pengguna alat**

## 5. ðŸ—‚ Brankas Digital (Sistem Berkas)

- Manajemen folder & file
- Metadata (ukuran, pemilik, dihasilkan AI)
- Menu konteks (Gunakan AI, Ganti Nama, dll)

ðŸ'‰ Ini bukan sekadar penyimpanan:
- Ini jadi **sumber konteks untuk AI**

âž¡ Semua file = bisa diproses AI langsung

## 6. ðŸ“Š Sistem Kerja Berbasis Sesi

- Pengatur waktu sesi aktif
- Pelacakan kemajuan AI
- Akhiri sesi

ðŸ'‰ Karyo pakai konsep:

> ðŸ§ **Kecerdasan Sesi Kerja**

Fungsi:
- Melacak Produktivitas
- Menghasilkan ringkasan harian
- Aktivitas berbasis wawasan

## 7. ðŸ“ˆ Ringkasan Cerdas & Saran AI

Contoh:
- "Lanjutkan laporan besok"
- "Ada file terlipat"

ðŸ'‰ AI bukan hanya eksekutor â€” tapi juga **advisor**

## 8. ðŸ›' Pasar Agen (Langkah Selanjutnya)

User bisa spesialis agen sewa:
- Agen keuangan
- Agen pemasaran
- Agen analis data

ðŸ'‰ Ini akan jadi:

> ðŸ'° **Mesin monetisasi utama**

---

# ðŸ — Arsitektur Sistem

## Alur Tingkat Tinggi

```
Pengguna → Tugas → Inti AI → Agen → Eksekusi → Memori → Penagihan → Antarmuka Pengguna Real-time
```

## Prinsip-prinsip Arsitektur

- **Arsitektur berbasis peristiwa** â€” bukan permintaan-respons biasa
- **Sistem monorepo modular** — skalabel & mudah dipelihara
- **API tanpa status + layanan dengan status** — penskalaan horizontal
- **AI sebagai mesin pengambilan keputusan** (bukan hanya fitur)
- **Skalabilitas horizontal**

## Filosofi Inti Backend

### ✅ AI-Native
Semua tindakan bisa:
- Manual → API
- AI → agen pemicu

### ✅ Berbasis Peristiwa
Bukan request-response doang:
- Gunakan antrean (eksekusi asinkron)

### ✅ Modular
Karena nanti:
- Pasar agen
- Pengembang AI multi-repo
- Multi penyewa

---

# ðŸ§ Lapisan AI (Kecerdasan Inti)

## Tumpukan

| Alat | Fungsi |
|------|----------|
| **LangChain** | Lapisan orkestrasi |
| **LangGraph** | Mesin alur kerja AI yang memiliki status |
| **OpenRouter** | Penyedia LLM multi-model |
| **LlamaIndex** | Pengindeksan & pengambilan data (RAG) |
| **Qdrant / Weaviate** | Basis data vektor untuk embedding |

## Kemampuan

- Pemahaman tugas
- Membangun konteks
- Pemilihan agen
- Dekomposisi tugas
- Pembuatan respons
- Ringkasan

## Alur Kerja AI

```
1. Tugas masukan
2. Membangun konteks:
   - memori (vektor DB)
   - riwayat eksekusi
   - metadata pengguna
3. Perutean model:
   - tugas sederhana → model murah
   - tugas kompleks → model canggih
4. Pemilihan agen
5. Perencanaan eksekusi (alur LangGraph)
6. Pembuatan hasil
7. Pembaruan memori
```

## Strategi Perutean Model

- **Perutean hemat biaya** â€” gunakan model murah untuk tugas sederhana
- **Optimasi latensi** â€” memprioritaskan kecepatan untuk tugas secara real-time
- **Mekanisme fallback** (multi-model) â€” jika satu model gagal, peralihan otomatis

## Sistem Prompt

- Prompt berversi
- Templat perintah modular
- Injeksi konteks dinamis

---

# ðŸ§© Sistem Memori

## Penyimpanan

| Penyimpanan | Fungsi |
|---------|----------|
| **Basis Data Vektor** (Qdrant / Weaviate) | Pencarian semantik & memori jangka panjang |
| **Redis** | Memori jangka pendek & cache |
| **PostgreSQL** | Penyimpanan data terstruktur |

## Fitur

- Pencarian semantik
- Pengambilan kontekstual
- Ketahanan memori jangka panjang
- Alur ringkasan

## Data yang Tersimpan

- Perilaku pengguna
- Pola kerja
- Format Preferensi
- Tugas sejarah

## Digunakan untuk

- Saran otomatis
- Agen personalisasi
- Otomatisasi cerdas

---

# ðŸ¤– Sistem Agen

## Siklus Hidup Agen

```
menganggur → ditugaskan → berjalan → selesai / gagal
```

## Kemampuan

- Eksekusi multi-agen
- Pemrosesan bersamaan
- Penugasan dinamis (didorong oleh AI)
- Penggantian manual

## Jenis Agen (Dapat Diperluas)

| Tipe | Deskripsi |
|------|-------------|
| **Agen Pelaksana** | Eksekusi tugas langsung |
| **Agen Analisis** | Analisis data & wawasan |
| **Agen Data** | Pengambilan & Pemrosesan Data |
| **Agen Plugin Kustom** | Domain spesifik agen (keuangan, pemasaran, dll.) |

## Alur Eksekusi Agen

```
1. Muat Konfigurasi Agen
2. Suntikkan Konteks (file, memori, integrasi)
3. Rencanakan Tugas
4. Lakukan Langkah-langkah
5. Kembalikan Output
```

## Contoh: Analis Keuangan Agen

```
1. Ambil file dari Google Drive
2. Mengurai CSV
3. Menganalisis tren
4. Menghasilkan wawasan
5. Buat laporan PDF
6. Simpan ke ruang kerja
```

---

# ðŸ” Sistem Eksekusi

## Mengalir

```
1. tugas.dibuat
2. agen.ditugaskan
3. tugas.dimulai
4. eksekusi.berjalan
5. tugas.selesai / gagal
```

## Fitur

- Eksekusi atomik
- Strategi mencoba lagi
- Antrian surat yang tidak terkirim
- Penanganan waktu habis

---

# ðŸ” Sistem Acara (Inti)

## Teknologi

- **Redis** (Pub/Sub) — perantara acara
- **BullMQ** (Sistem Antrian) — pemrosesan pekerjaan asinkron

## Konvensi Penamaan Acara

```
tugas.dibuat
tugas dimulai
tugas.selesai
tugas.gagal
agen.ditugaskan
agen.selesai
memori diperbarui
penagihan.diperbarui
```

## Persyaratan

- Validasi skema
- Peristiwa idempoten
- Pelacakan peristiwa

## Kasus Penggunaan

- Eksekusi tugas AI
- Pemrosesan berkas
- Orkestrasi alur kerja

---

# Lapisan Integrasi ðŸ”Œ

## Mengalir

```
Agen → SDK Integrasi → API Eksternal
```

## Contoh Konektor

| Layanan | Tujuan |
|---------|---------|
| **Google Drive** | Penyimpanan & sinkronisasi file |
| **Slack** | Komunikasi tim |
| **Gmail** | Integrasi email |
| **Airtable** | Manajemen data |
| **Stripe** | Pemrosesan pembayaran |
| **Dropbox** | Penyimpanan awan |

## Pola Integrasi

```
OAuth → Simpan Token → Sinkronkan Data
```

---

# ðŸ“‚ Sistem Berkas (Brankas Digital)

## Fitur

- Mengunggah
- Pengelolaan Versi
- Penandaan
- Pemrosesan AI

## Mengalir

```
Unggah → Simpan → Indeks → Siap AI
```

## Karena

Semua file = bisa diproses AI langsung

---

# ðŸ“Š Mesin Sesi

## Melacak

- Tugas aktif
- Kemajuan
- Status agen

## Sinkronisasi UI

- Bilah kemajuan
- Status: "Menganalisis..." / "Membuat laporan..."

## Akhiri Alur Sesi

```
1. Ringkaskan aktivitas
2. Menghasilkan wawasan
3. Hemat memori
4. Sarankan tindakan selanjutnya
```

---

# ðŸ” Otentikasi & Otorisasi

## Otentikasi

- **Auth.js** (JWT / berbasis sesi)
- OAuth (Google, dll)

## Otorisasi (RBAC)

| Peran | Deskripsi |
|------|-------------|
| **pengguna** | Akses pengguna standar |
| **admin** | Kelola pengguna & agen |
| **super_admin** | Kontrol sistem penuh |

## Fitur Keamanan

- Validasi token
- Manajemen sesi
- Pembatasan laju

---

# ðŸ“¡ Sistem Waktu Nyata

## Teknologi

- **Socket.IO**

## Fitur

- Pembaruan tugas secara real-time
- Streaming status agen
- Notifikasi sistem

## Mengalir

```
Agen → Antrian → Acara → WebSocket → UI
```

---

# ðŸ“Š Observabilitas

| Lapisan | Alat | Tujuan |
|-------|------|---------|
| **Pencatatan Log** | Winston | Log Terstruktur |
| **Metrik** | Prometheus | Metrik sistem |
| **Visualisasi** | Grafana | Pemantauan Dasbor |
| **Pelacakan** | OpenTelemetry | Permintaan pelacakan |

## Persyaratan

- Log terstruktur
- Permintaan pelacakan
- Pemantauan kesalahan

---

# Tumpukan Teknologi ðŸ§±

## Lapisan AI

| Teknologi | Tujuan |
|------------|---------|
| LangChain | Orkestrasi |
| LangGraph | Alur kerja AI yang memiliki status |
| OpenRouter | LLM Multi-model |
| LlamaIndex | RAG & pengindeksan data |
| Qdrant / Weaviate | Vector DB |

## Backend

| Teknologi | Tujuan |
|------------|---------|
| Node.js + NestJS/Express | Lapisan API |
| Turborepo | Arsitektur Monorepo |
| PostgreSQL | Basis data relasional |
| Redis | Cache & sesi |
| BullMQ | Antrian pekerjaan |
| Drizzle ORM | Akses basis data yang aman tipe |
| tRPC | API ujung-ke-ujung yang aman secara tipe |

## Frontend

| Teknologi | Tujuan |
|------------|---------|
| Next.js (App Router) | Framework React |
| React | Pustaka UI |
| Zustand | Pengelolaan negara |
| Kueri TanStack | Pengambilan Data |

## Waktu Nyata

| Teknologi | Tujuan |
|------------|---------|
| Socket.IO | Komunikasi WebSocket |

## Infrastruktur

| Teknologi | Tujuan |
|------------|---------|
| Docker | Kontainerisasi |
| Vercel | Implementasi frontend |
| Kereta Api / Render | Penerapan Backend |
| Cloudflare R2 | Penyimpanan objek |
| Kubernetes (EKS/GKE) | Orkestrasi (produksi) |

---

# ðŸ“¦ Struktur Monorepo

```
karyo-os/
aplikasi/
•‚ •œ••• web/ # Dasbor Pengguna (Next.js)
• • œ• • admin/ # Dasbor Admin (Menara Kontrol)
‚ ‚‚‚‚‚ api/ # API Backend
A",
paket/
•‚ •œ••• ai-core/ # Logika AI (LangChain + LangGraph)
â”‚ â”‚ â”œâ”€â”€ petunjuk/
rantai/
penyedia/
â”‚ â”‚ â”œâ”€â”€ router/
‚ ...
memori/
‚ ...
‚ ...
‚ ...
â”‚ â”œâ”€â”€ utils/ # Utilitas
‚ ‚‚‚‚‚ config/ # Sistem konfigurasi
A",
✔✔✔ infra/
â”‚ â”œâ”€â”€ buruh pelabuhan/
â”‚ â””â”€â”€ k8s/
A",
✔✔✔ .env.example
✔✔✔ turbo.json
â”œâ”€â”€ paket.json
â””â”€â”€ README.md
```

### Tanggung Jawab ai-core

- Integrasi LangChain
- Alur kerja LangGraph
- Penyedia OpenRouter
- Rute LLM
- Pembuat konteks
- Mesin pengambilan keputusan

---

# ðŸ”„ Alur Sistem Beton (Ujung ke Ujung)

## 1. ðŸ”¥ TITIK MASUK (Interaksi Pengguna)

### Skenario A — Mode Manual
Pengguna masuk ke dashboard, klik:
- Buat Dokumen
- Analisis Data
- Unggah File

Atau ketik di command bar:
> "Buat laporan penjualan dari file ini"

### Skenario B — Mode Agen
Pengguna pilih agen dari marketplace, klik "Jalankan Agen"
Atau: "Gunakan agen keuangan untuk analisis Q3"

## 2. âš™ PENERJEMAH PERINTAH (Router AI Inti)

Semua input masuk ke: `/core/ai/command-interpreter`

### Tugas:
- Penguraian NLP
- Klasifikasi maksud:
  - `tugas_manual`
  - `agent_task`
- Kesadaran konteks:
  - file yang dipilih
  - integrasi aktif (Drive, Slack, dll)
  - pengguna riwayat

### Output:
```json
{
  "mode": "agen",
  "maksud": "menganalisis_penjualan",
  "entitas": {
    "file": "sales_q3.csv",
    "format": "laporan"
  },
  "agen": "analis keuangan v1"
}
```

## 3. ðŸ§ ORCHESTRATOR (Otak Karyo OS)

Jalur: `/core/orchestrator`

### Peran:
- Tentukan alur kerja
- Menugaskan agen/alat
- Mengelola status eksekusi

### Pohon Keputusan:

```
Jika MODE MANUAL:
  Pengguna → Mesin Alat → Hasil

Jika MODE AGEN:
  Pengguna → Agen Pelaksana → Eksekusi Bertahap

Jika MODE HYBRID:
  Pengguna → Alat + Agen → Eksekusi Kolaboratif
```

## 4. ðŸ§° MESIN ALAT (Eksekusi Mode Manual)

Jalur: `/core/tools`

### Mengalir:
```
Perintah → Pemetaan Alat → Eksekusi → Kembalikan Hasil
```

### Contoh:
```
"Berkas Ringkas PDF" → alat: ringkas → jalankan → kembalikan hasil
```

## 5. ðŸ¤– SISTEM EKSEKUSI AGEN (Pembeda Utama)

Jalur: `/core/agents`

### Alur Agen:
```
1. Muat Konfigurasi Agen
2. Suntikkan Konteks (file, memori, integrasi)
3. Rencanakan Tugas
4. Lakukan Langkah-langkah
5. Kembalikan Output
```

## 6. ðŸ§ SISTEM MEMORI (Pusat Memori AI)

Jalur: `/core/memory`

Menyimpan: perilaku pengguna, pola kerja, format preferensi, riwayat tugas
Digunakan untuk: saran otomatis, agen personalisasi, otomatisasi cerdas

## 7. ðŸ”— LAPISAN INTEGRASI

Jalur: `/integrations`

```
Agen → SDK Integrasi → API Eksternal
```

## 8. ðŸ“‚ SISTEM FILE (Brankas Digital)

Jalur: `/core/files`

```
Unggah → Simpan → Indeks → Siap AI
```

## 9. ðŸ“Š MESIN SESI (Aktivitas Waktu Nyata)

Jalur: `/core/session`

Lacak: tugas aktif, kemajuan, status agen
Sinkronisasi UI: bilah kemajuan, pembaruan status

## 10. ðŸ“¦ PEMBANGKITAN OUTPUT

Output bisa berupa:
- Dokumen
- Laporan
- Wawasan
- Hasil otomatisasi

```
Agen → Pemformat → Generator File → Simpan → Kembali ke UI
```

## 11. ðŸ”„ SIMPAN OTOMATIS & RIWAYAT

Jalur: `/core/history`

Semua aktivitas disimpan. Bisa diputar ulang/audit.

## 12. ðŸ§¾ AKHIR ALUR SESI

Pengguna mengklik "Akhiri Sesi" → Sistem:
```
1. Ringkaskan aktivitas
2. Menghasilkan wawasan
3. Hemat memori
4. Sarankan tindakan selanjutnya
```

## Diagram Alur Lengkap

```
Masukan Pengguna
    A†"
Penerjemah Perintah (AI)
    A†"
Pengatur Orkestra
    A†"
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â ”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ â”‚ â”‚ â”‚
• Mode Manual • Mode Agen • Mode Hibrida
â”‚ â”‚ â”‚ â”‚
• Mesin Alat • Pelari Agen • Alat + Agen •
â”‚ â”‚ â”‚ â”‚
â””â”€â”€â”€â”€â”€â”€â”€â†' Output Generator â† â”€â”€â”€â”€â”€â”€â”€â”˜
                    A†"
              Sistem Berkas
                    A†"
                Pembaruan UI
                    A†"
              Pembaruan Memori
```

---

# ðŸ“ Rincian Layanan Backend

## Arsitektur Sistem Tingkat Tinggi

```
Klien (Web / Aplikasi)
        A†"
API Gateway (Otorisasi, Batasan Laju, Perutean)
        A†"
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
Layanan Inti (Lapisan Mikroservis)
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
Layanan Otorisasi ✔✔
Layanan Pengguna & Ruang Kerja
Layanan File & Penyimpanan
Layanan Orkestrator AI
Layanan Eksekusi Agen
Layanan Mesin Alur Kerja
Layanan Integrasi
Layanan Memori AI
Layanan Pemberitahuan
        A†"
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
Lapisan Infrastruktur
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
✔✔✔ Basis Data (PostgreSQL)
â”œâ”€â”€ Cache (Redis)
â”œâ”€â”€ Antrian (Kafka / BullMQ)
✔✔✔ Penyimpanan Objek (S3 / R2)
●●€●€ Vector DB (Pinecone / Weaviate)
```

## Detail Layanan

### ðŸ” Layanan Otorisasi
- **Fungsi**: Login/Daftar, JWT/Sesi, OAuth
- **Stack**: NestJS + PostgreSQL
- **Titik Akhir**:
  - `POST /auth/login`
  - `POST /auth/register`
  - `GET /auth/me`

### ðŸ'¤ Layanan Pengguna & Ruang Kerja
- **Fungsi**: Multi ruang kerja, Manajemen peran, Pengaturan pengguna
- **Skema**: `users`, `workspaces`, `workspace_members`

### ðŸ“ Layanan File & Penyimpanan
- **Fungsi**: Unggah file, Metadata, Pengait pemrosesan AI
- **Penyimpanan**: S3 / Cloudflare R2
- **Alur**: Unggah → Simpan → P
