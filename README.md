# 🎬 NontonGratis - Website Streaming Film Gratis

Website streaming film gratis dengan subtitle Bahasa Indonesia. Dibangun dengan Next.js, Tailwind CSS, dan berbagai API publik.

## Fitur

- 🎥 **Streaming film gratis** dari multiple server (StreamIMDB, VidSrc)
- 📝 **Subtitle Bahasa Indonesia** dari SubDL.com
- 🔍 **Pencarian film** dengan data dari TMDB
- 📂 **Kategori genre** lengkap (Action, Comedy, Horror, dll)
- 🔥 **Trending, Popular, Top Rated** - film dikelompokkan per kategori
- 📱 **Responsive** - tampilan optimal di desktop & mobile
- ⚡ **Server-side rendering** untuk performa optimal

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS
- **Data Film**: [TMDB API](https://www.themoviedb.org/documentation/api)
- **Streaming**: [StreamIMDB](https://streamimdb.ru/) + [VidSrc](https://vidsrc.icu/)
- **Subtitle**: [SubDL API](https://subdl.com/api-doc)
- **Icons**: Lucide React

## Setup

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

#### SubDL API Key (Opsional - untuk download subtitle)
1. Buat akun di [subdl.com](https://subdl.com)
2. Pergi ke Settings/API
3. Copy API key

### 3. Konfigurasi environment

Edit file `.env.local`:

```env
NEXT_PUBLIC_TMDB_API_KEY=paste_tmdb_api_key_disini
NEXT_PUBLIC_SUBDL_API_KEY=paste_subdl_api_key_disini
```

### 4. Jalankan development server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## Struktur Halaman

| Route | Deskripsi |
|-------|-----------|
| `/` | Beranda - Hero + film trending, populer, top rated |
| `/movie/[id]` | Detail film + player + subtitle + cast |
| `/genre` | Daftar semua genre |
| `/genre/[id]` | Film per genre dengan pagination |
| `/trending` | Film trending minggu ini |
| `/top-rated` | Film rating tertinggi |
| `/search?q=...` | Hasil pencarian |

## Server Streaming

Website menggunakan multiple server untuk reliabilitas:

1. **StreamIMDB** (streamimdb.ru) - Server utama, menggunakan IMDB ID
2. **VidSrc** (vidsrc.icu) - Fallback, menggunakan TMDB ID
3. **VidSrc ME** (vidsrc.me) - Fallback kedua, menggunakan IMDB ID

User bisa switch antar server jika salah satu tidak berfungsi.

## Disclaimer

Website ini dibuat untuk tujuan edukasi. Tidak menyimpan file film di server sendiri. Semua konten streaming disediakan oleh pihak ketiga.
