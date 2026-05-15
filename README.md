# 🎬 NontonGratis - Website Streaming Film Gratis

Website streaming film gratis dengan subtitle Bahasa Indonesia. Dibangun dengan Next.js, Tailwind CSS, dan berbagai API publik.

## Fitur

- 🎥 **Streaming film gratis** dari multiple server (VidSrc Pro, VidSrc, VidSrc CC, AutoEmbed)
- 📝 **Subtitle Bahasa Indonesia** — overlay otomatis dari SubDL.com + download manual
- 🔍 **Pencarian film** dengan data dari TMDB
- 📂 **Kategori genre** lengkap (Action, Comedy, Horror, dll)
- 🔥 **Trending, Popular, Top Rated** — film dikelompokkan per kategori
- 📱 **Responsive** — tampilan optimal di desktop & mobile
- ⚡ **Server-side rendering** untuk performa optimal
- 🔄 **Multi-server** dengan status indicator (loading/ready/error)
- 🎛️ **Subtitle sync controls** — play/pause, ±5s offset adjustment

## Tech Stack

- **Framework**: Next.js 16 (App Router, TypeScript)
- **Styling**: Tailwind CSS
- **Data Film**: [TMDB API](https://www.themoviedb.org/documentation/api)
- **Streaming**: [VidSrc Pro](https://vidsrc.mov/) · [VidSrc](https://vidsrc.icu/) · [VidSrc CC](https://vidsrc.cc/) · [AutoEmbed](https://autoembed.co/)
- **Subtitle**: [SubDL API](https://subdl.com/api-doc)
- **Icons**: Lucide React

## Setup Lokal

### 1. Install dependencies

```bash
cd nonton-gratis
npm install
```

### 2. Dapatkan API Keys

#### TMDB API Key (Wajib)
1. Buat akun di [themoviedb.org](https://www.themoviedb.org/signup)
2. Pergi ke [Settings > API](https://www.themoviedb.org/settings/api)
3. Request API key (pilih "Developer")
4. Copy API Key (v3 auth)

#### SubDL API Key (Opsional — untuk subtitle overlay & download)
1. Buat akun di [subdl.com](https://subdl.com)
2. Pergi ke Settings/API
3. Copy API key

### 3. Konfigurasi environment

Buat/edit file `.env.local`:

```env
NEXT_PUBLIC_TMDB_API_KEY=paste_tmdb_api_key_disini
NEXT_PUBLIC_SUBDL_API_KEY=paste_subdl_api_key_disini
```

### 4. Jalankan development server

```bash
npm run dev
```

Buka [http://localhost:3002](http://localhost:3002)

## Struktur Halaman

| Route | Deskripsi |
|-------|-----------|
| `/` | Beranda — Hero + film trending, populer, top rated |
| `/movie/[id]` | Detail film + player + subtitle + cast |
| `/genre` | Daftar semua genre |
| `/genre/[id]` | Film per genre dengan pagination |
| `/trending` | Film trending minggu ini |
| `/top-rated` | Film rating tertinggi |
| `/search?q=...` | Hasil pencarian |

## Server Streaming

Website menggunakan multiple server untuk reliabilitas:

1. **VidSrc Pro** (vidsrc.mov) — Server utama, 1080p, multi-language subtitle
2. **VidSrc** (vidsrc.icu) — Fallback pertama
3. **VidSrc CC** (vidsrc.cc) — Fallback kedua, reliable dengan TMDB ID langsung
4. **AutoEmbed** (autoembed.co) — Fallback ketiga

User bisa switch antar server jika salah satu tidak berfungsi. Status setiap server ditampilkan (loading/ready/error).

---

## 🚀 Deployment

App ini butuh **Node.js runtime** karena menggunakan API routes (subtitle proxy, download proxy). Berikut opsi deployment:

### Opsi 1: Vercel (Rekomendasi — Gratis)

Cara paling mudah karena Next.js dibuat oleh Vercel. Gratis untuk project personal.

1. Buka [vercel.com](https://vercel.com), login dengan GitHub
2. Klik **"Add New Project"** → Import repo `saiful-aziz/nonton-gratis`
3. Di halaman konfigurasi, tambahkan **Environment Variables**:
   - `NEXT_PUBLIC_TMDB_API_KEY` = key kamu
   - `NEXT_PUBLIC_SUBDL_API_KEY` = key kamu
4. Klik **Deploy** — tunggu beberapa menit
5. Dapat URL gratis: `nonton-gratis.vercel.app`

**Custom domain (misal `nonton.saifulaziz.id`):**
1. Di Vercel dashboard → project → **Settings → Domains**
2. Tambahkan `nonton.saifulaziz.id`
3. Di panel DNS Hostinger, tambahkan record:
   - **Type**: CNAME
   - **Name**: `nonton`
   - **Target**: `cname.vercel-dns.com`
4. Tunggu propagasi DNS (5-30 menit)
5. SSL otomatis aktif

**Keuntungan Vercel:**
- ✅ Gratis (hobby plan)
- ✅ Auto-deploy setiap push ke GitHub
- ✅ Node.js + API routes semua jalan
- ✅ SSL otomatis
- ✅ CDN global (cepat dari mana saja)
- ✅ Custom domain support

---

### Opsi 2: Hostinger Node.js Hosting

Tersedia di paket **Business** atau **Cloud** Hostinger. Paket Premium/Single tidak support Node.js.

#### Langkah 1: Buat subdomain
1. **hPanel → Domains → Subdomains**
2. Buat `nonton.saifulaziz.id`
3. Document root: `public_html/nonton`

#### Langkah 2: Upload project
Upload semua file (kecuali `node_modules/` dan `.next/`) ke `public_html/nonton/` via File Manager atau Git.

Struktur di server:
```
public_html/nonton/
├── package.json
├── next.config.ts
├── server.js          ← entry point (buat baru, lihat di bawah)
├── .env.local         ← buat manual di server
├── src/
├── public/
└── ...
```

#### Langkah 3: Buat file `server.js`
Buat file `server.js` di root project sebagai entry point:

```js
const { execSync } = require("child_process");
const port = process.env.PORT || 3000;
execSync(`npx next start -p ${port}`, { stdio: "inherit" });
```

#### Langkah 4: Setup Node.js di hPanel
1. **hPanel → Advanced → Node.js**
2. Klik **Create Application**
3. Setting:
   - **Node.js version**: 18 atau 20
   - **Application root**: `public_html/nonton`
   - **Application startup file**: `server.js`
   - **Application URL**: pilih `nonton.saifulaziz.id`

#### Langkah 5: Install & Build
Di hPanel Node.js panel, jalankan NPM commands:
```
install
```
```
run build
```

#### Langkah 6: Environment Variables
Di hPanel Node.js panel, tambahkan:
- `NEXT_PUBLIC_TMDB_API_KEY` = key kamu
- `NEXT_PUBLIC_SUBDL_API_KEY` = key kamu
- `NODE_ENV` = `production`

Lalu klik **Restart Application**.

**Catatan Hostinger Node.js:**
- ⚠️ RAM terbatas (~512MB-1GB). Jika `npm run build` gagal di server, build di lokal lalu upload folder `.next/` juga.
- ⚠️ Hanya tersedia di paket Business/Cloud.
- ⚠️ Cold start bisa lambat (app sleep setelah idle).

---

### Opsi 3: Hostinger Shared Hosting (Static Export)

Jika hanya punya shared hosting biasa (tanpa Node.js), app perlu di-convert ke **static site**. Ini menghilangkan API routes (subtitle proxy) tapi fitur utama tetap jalan.

Perlu modifikasi kode — hubungi developer untuk convert.

---

### Perbandingan Opsi Deployment

| Fitur | Vercel (Gratis) | Hostinger Node.js | Hostinger Static |
|-------|----------------|-------------------|-----------------|
| Harga | Gratis | Business/Cloud plan | Shared plan |
| Node.js / API routes | ✅ | ✅ | ❌ |
| Subtitle overlay | ✅ | ✅ | ✅ (client-side) |
| Subtitle download | ✅ (proxy) | ✅ (proxy) | ⚠️ (direct link) |
| Auto-deploy dari GitHub | ✅ | ❌ | ❌ |
| Custom domain | ✅ | ✅ | ✅ |
| SSL | ✅ Otomatis | ✅ | ✅ |
| Performa | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| Kemudahan setup | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |

**Rekomendasi:** Gunakan **Vercel** dengan custom domain `nonton.saifulaziz.id`. Gratis, paling mudah, dan semua fitur jalan sempurna.

---

## Disclaimer

Website ini dibuat untuk tujuan edukasi. Tidak menyimpan file film di server sendiri. Semua konten streaming disediakan oleh pihak ketiga. Data film disediakan oleh [TMDB](https://www.themoviedb.org/).
