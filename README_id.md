<p align="center">
  <img src="https://img.shields.io/badge/SolSniperX-Solana-9945FF?style=for-the-badge&logo=solana&logoColor=white" alt="SolSniperX">
  <img src="https://img.shields.io/badge/Versi-3.0.0-14F195?style=for-the-badge" alt="Versi">
  <img src="https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/Lisensi-MIT-green?style=for-the-badge" alt="Lisensi">
</p>

<p align="center">
  <a href="https://github.com/mulkymalikuldhrs/SolSniperX/blob/master/README.md">English</a> |
  <a href="https://github.com/mulkymalikuldhrs/SolSniperX/blob/master/README_id.md">Bahasa Indonesia</a> |
  <a href="https://github.com/mulkymalikuldhrs/SolSniperX/blob/master/README_zh.md">中文</a>
</p>

<p align="center">
  <img src="https://readme-typing-svg.herokuapp.com?font=JetBrains+Mono&weight=600&size=22&duration=3000&pause=1000&color=14F195&center=true&vCenter=true&width=600&lines=Bot+Sniper+Memecoin+Solana+Berbasis+AI;Trading+Otomatis+%2B+Proteksi+Anti-Rug;Integrasi+Jupiter+Aggregator;Monitoring+Mempool+Real-Time" alt="Typing SVG" />
</p>

---

## Gambaran Umum

SolSniperX adalah bot canggih berbasis AI yang dirancang untuk mendeteksi, menganalisis, dan mengeksekusi perdagangan pada memecoin baru di blockchain Solana secara otomatis. Platform ini menyediakan wawasan real-time, proteksi anti-rug, dan kemampuan trading otomatis, yang semuanya dapat diakses melalui antarmuka web modern dan intuitif. Platform ini menggabungkan pemantauan on-chain dengan analisis berbasis LLM untuk mengidentifikasi peluang trading berprobabilitas tinggi sebelum mencapai perhatian mainstream.

Proyek ini merupakan bagian dari ekosistem [HermesQuantOS](https://github.com/mulkymalikuldhrs/HermesQuantOS), inisiatif untuk membangun sistem intelijensi keuangan berbasis AI kelas sovereign di pasar tradisional maupun terdesentralisasi.

## Fitur Utama

### Deteksi Token Real-Time
Memantau Pump.fun, Birdeye, Dexscreener, dan Solana Mempool untuk listing token baru dan peluncuran awal. Monitor mempool terhubung langsung ke endpoint WebSocket Solana untuk mem-parsing transaksi yang masuk dan mengidentifikasi mint token baru secara real-time, memberikan keunggulan kecepatan yang kritis.

### Analisis Berbasis AI
Memanfaatkan AI (LLM7 Pi) untuk menilai potensi token di berbagai dimensi termasuk kedalaman likuiditas, trajektori market cap, pola distribusi holder, aktivitas dompet dev, dan red flag kontrak (deteksi honeypot, batas transaksi maksimum, fungsi blacklist). LLM menghasilkan rekomendasi beli/jual terstruktur dengan skor probabilitas yang menginformasikan keputusan trading otomatis.

### Eksekusi Trading Otomatis
Mengeksekusi order beli secara otomatis berdasarkan parameter yang telah ditentukan (jumlah, slippage) dan terintegrasi dengan Jupiter Aggregator v6 untuk swap on-chain nyata. Auto-trader dapat mengeksekusi order jual pada target profit (2x, 3x, trailing stop) dengan persentase stop-loss yang dapat dikonfigurasi untuk melindungi modal.

### Proteksi Anti-Rug
Mengimplementasikan mekanisme cut-loss otomatis yang dipicu oleh indikator rug on-chain: penjualan dompet dev, penghapusan liquidity pool, dan penurunan harga signifikan. Monitor mempool menganalisis log transaksi dan instruksi program token secara real-time, dan auto-trader mengeksekusi order jual darurat dengan slippage maksimum untuk keluar dari posisi secepat mungkin saat aktivitas rug terdeteksi.

### Manajemen Dompet Aman
Terhubung langsung ke dompet Solana menggunakan kunci privat yang disediakan melalui variabel lingkungan. Tidak diperlukan login atau registrasi tradisional. Kunci privat hanya dimuat ke memori saat startup dan tidak pernah disimpan ke disk. Frontend tidak pernah menangani kunci privat secara langsung; semua operasi dompet diproksikan melalui backend.

### Dashboard Web Intuitif
Antarmuka pengguna yang elegan, responsif, dan interaktif dibangun dengan React, Tailwind CSS, dan komponen shadcn/ui, menampilkan:
- **Watchlist Langsung** dengan pembaruan harga real-time melalui WebSocket
- **Tampilan Detail Token** dengan metrik on-chain komprehensif
- **Performa Dompet & PnL** pelacakan
- **Mode Snipe Manual** untuk trading diskresioner
- **Panel Analisis AI** dengan wawasan yang dihasilkan LLM
- **Panel Sinyal Trading** dengan skor probabilitas
- **Kontrol Auto-Trader** dengan parameter yang dapat dikonfigurasi
- **Pengaturan** untuk kustomisasi strategi trading

### Notifikasi
Peringatan Telegram untuk peristiwa kritis termasuk deteksi token baru, trade yang dieksekusi, peringatan rugpull, dan perubahan status auto-trader.

### Analitik Lanjutan
Melacak metrik performa trading komprehensif termasuk tingkat kemenangan, rata-rata PnL per trade, pengembalian kumulatif, dan grafik performa historis.

## Struktur Proyek

```
SolSniperX/
├── backend/                      # Python Flask API
│   ├── src/
│   │   ├── main.py               # Entry point Flask & orkestrasi layanan
│   │   ├── config.py             # Kunci API, URL RPC, konfigurasi lingkungan
│   │   ├── routes/               # Blueprint rute API
│   │   ├── services/             # Logika bisnis inti
│   │   │   ├── ai_analysis.py          # Integrasi LLM7 untuk analisis token
│   │   │   ├── data_fetcher.py         # Integrasi API Dexscreener & Birdeye
│   │   │   ├── mempool_monitor.py      # Pemantauan WebSocket mempool Solana
│   │   │   ├── trading_service.py      # Eksekusi swap Jupiter Aggregator
│   │   │   ├── wallet_service.py       # Manajemen dompet Solana
│   │   │   └── auto_trader.py          # Mesin strategi trading otomatis
│   │   ├── utils/                # Utilitas bersama
│   │   └── database/             # Penyimpanan database SQLite
│   └── requirements.txt          # Dependensi Python
├── frontend/                     # Aplikasi web React
│   ├── src/
│   │   ├── App.jsx               # Komponen utama & routing
│   │   ├── pages/                # Halaman aplikasi
│   │   ├── components/           # Komponen UI yang dapat digunakan kembali
│   │   ├── contexts/             # Konteks React
│   │   ├── hooks/                # Custom React hooks
│   │   └── utils/                # Penyimpanan lokal & pembantu
│   ├── package.json              # Dependensi Node.js
│   └── vite.config.js            # Konfigurasi build Vite
├── start_dev.sh                  # Skrip peluncur pengembangan
├── blueprint.md                  # Blueprint proyek & catatan arsitektur
└── TODO.md                       # Peta jalan pengembangan
```

## Instalasi & Pengaturan

### Prasyarat

- Python 3.11+
- Node.js 18+ (untuk pnpm)
- pnpm 10+

### Variabel Lingkungan

Buat file `.env` di direktori `backend` (atau atur langsung di shell Anda):

```env
DEXSCREENER_API_KEY="KUNCI_API_DEXSCREENER_ANDA"
BIRDEYE_API_KEY="KUNCI_API_BIRDEYE_ANDA"
LLM7_API_KEY="KUNCI_API_LLM7_ANDA"
SOLANA_PRIVATE_KEY="KUNCI_PRIVAT_DOMPET_SOLANA_ANDA_BASE58_ENCODED"
SOLANA_RPC_URL="https://api.mainnet-beta.solana.com"
SOLANA_WS_URL="wss://api.mainnet-beta.solana.com/"
```

**PERINGATAN:** Jangan pernah menyimpan kunci privat atau kunci API ke version control. Gunakan variabel lingkungan atau sistem manajemen rahasia yang aman.

### Pengaturan Backend

```bash
cd backend
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python src/main.py
```

Server backend dimulai di `http://0.0.0.0:5000`.

### Pengaturan Frontend

```bash
cd frontend
pnpm install
pnpm run dev
```

Server pengembangan frontend dimulai di `http://localhost:5173`.

### Mulai Cepat (Kedua Server)

```bash
./start_dev.sh
```

## Konfigurasi Auto-Trader

Auto-trader dapat dikonfigurasi melalui halaman Pengaturan atau dengan memodifikasi `auto_trader_config.json`:

| Parameter | Default | Deskripsi |
|-----------|---------|-----------|
| `min_liquidity` | 10000 | Likuiditas minimum (USD) untuk pertimbangan token |
| `max_age_hours` | 24 | Usia token maksimum (jam) untuk pertimbangan |
| `min_volume_24h` | 50000 | Volume 24 jam minimum (USD) |
| `min_ai_probability_score` | 70 | Skor probabilitas AI minimum untuk membeli (0-100) |
| `buy_amount_sol` | 0.01 | Jumlah SOL per order beli |
| `slippage` | 1.0 | Toleransi slippage default (%) |
| `profit_target_x` | 2.0 | Pengganda target profit (2x = keuntungan 100%) |
| `stop_loss_percentage` | 0.20 | Ambang batas stop-loss (20% = jual pada 80% harga beli) |
| `max_risk_score` | 30 | Skor risiko AI maksimum untuk mempertimbangkan pembelian |

## Dokumentasi

- [Panduan Arsitektur](./ARCHITECTURE.md) - Arsitektur sistem detail dan interaksi komponen
- [Panduan Kontribusi](./CONTRIBUTING.md) - Cara berkontribusi ke SolSniperX
- [Catatan Perubahan](./CHANGELOG.md) - Riwayat rilis dan perubahan penting
- [Blueprint](./blueprint.md) - Blueprint proyek dan catatan transformasi
- [TODO](./TODO.md) - Peta jalan pengembangan dan peningkatan masa depan

## Proyek Terkait

- [HermesQuantOS](https://github.com/mulkymalikuldhrs/HermesQuantOS) - Ekosistem intelijensi keuangan berbasis AI yang lebih luas
- [Misi-Screener](https://github.com/mulkymalikuldhrs/Misi-Screener) - Platform hedge fund berbasis AI untuk pasar tradisional

## Lisensi

Proyek ini dilisensikan di bawah Lisensi MIT. Lihat [LICENSE](./LICENSE) untuk detailnya.

## Penulis

**Mulky Malikul Dhaher**

- Email: mulkymalikuldhaher@email.com
- GitHub: [@mulkymalikuldhrs](https://github.com/mulkymalikuldhrs)

## Penyanggahan

Perangkat lunak ini disediakan untuk tujuan pendidikan dan penelitian saja. Trading cryptocurrency, terutama memecoin, melibatkan risiko signifikan dan dapat mengakibatkan kerugian finansial yang substansial. Penulis tidak bertanggung jawab atas keputusan finansial yang dibuat menggunakan alat ini. Selalu lakukan riset Anda sendiri dan jangan pernah menginvestasikan lebih dari yang Anda mampu untuk kehilangan.

<p align="center">
  <img src="https://img.shields.io/github/stars/mulkymalikuldhrs/SolSniperX?style=social" alt="Stars">
  <img src="https://img.shields.io/github/forks/mulkymalikuldhrs/SolSniperX?style=social" alt="Forks">
  <img src="https://img.shields.io/github/watchers/mulkymalikuldhrs/SolSniperX?style=social" alt="Watchers">
</p>
