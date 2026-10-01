<div align="center">

<img src="./docs/banner.svg" alt="RigForge: ubah data avatar Roblox jadi script Lua siap pakai" width="100%">

<br>

[![Live Demo](https://img.shields.io/badge/demo-live-2ea44f?style=flat-square)](https://rigforge-lemon.vercel.app)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Vitest](https://img.shields.io/badge/tested_with-Vitest-6E9F18?style=flat-square&logo=vitest&logoColor=white)
![Node](https://img.shields.io/badge/Node-22.x-339933?style=flat-square&logo=node.js&logoColor=white)
[![License: MIT](https://img.shields.io/badge/license-MIT-2ea44f?style=flat-square)](./LICENSE)

**[Demo Live](https://rigforge-lemon.vercel.app) · [Fitur](#fitur) · [Cara Pakai](#cara-pakai) · [Cara Kerja](#cara-kerja-konverter) · [Memulai](#memulai) · [Deploy](#deploy) · [Laporkan Bug](https://github.com/akndrn000/rigforge/issues)**

</div>

<br>

> Tempel data mentah avatar Roblox, dapatkan **script Lua siap tempel** untuk Roblox Studio. Semua diproses di browser: tanpa server, tanpa login, dan tidak ada data yang keluar dari perangkatmu.

<br>

<div align="center">
<img src="./docs/screenshot-light.png" alt="Tampilan RigForge tema terang dengan hasil konversi" width="49%">
<img src="./docs/screenshot-dark.png" alt="Tampilan RigForge tema gelap" width="49%">
<br>
<sub>Tema terang dan gelap, memakai tombol <b>Contoh Data</b> bawaan aplikasi.</sub>
</div>

<br>

## Ringkasan

RigForge mengubah data mentah avatar Roblox menjadi script Lua. Ditujukan untuk pembuat game dan avatar yang ingin memindahkan tampilan avatar ke dalam script tanpa menyalin ID satu per satu.

## Fitur

| | |
| --- | --- |
| **100% client-side dan privat** | Konversi sinkron di browser, tidak ada request jaringan untuk data. |
| **Deteksi otomatis** | Bagian tubuh (Head, Torso, lengan, kaki), warna kulit, pakaian klasik, pakaian berlapis, dan aksesori. |
| **Template slot universal** | Setiap tipe punya jumlah slot minimum; sisa slot diisi `AssetId = 0`. |
| **Aksi cepat** | **Contoh Data**, **Salin Kode**, **Unduh .lua** (`AvatarConfig.lua`), dan **Generate Paksa**. |
| **Status langsung** | Kosong, Siap, Gagal, atau Memproses, plus ringkasan hasil deteksi. |
| **Tema terang/gelap** | Tombol di header, pilihan tersimpan di `localStorage`. |

## Cara Pakai

Coba langsung di **<https://rigforge-lemon.vercel.app>**:

1. Tempel data mentah avatar ke panel kiri (atau klik **Contoh Data**).
2. Hasil Lua tersusun otomatis di panel kanan. Klik **Generate Paksa** untuk menghitung ulang.
3. Klik **Salin Kode** atau **Unduh .lua**, lalu tempel ke Roblox Studio.

<details>
<summary><b>Contoh input dan output</b></summary>

<br>

Input (dari `src/lib/__fixtures__/golden.json`, kasus "semua token badan + daftar + blob"):

```text
Head: 123
Torso: 456
LeftArm: 1
RightArm: 2
LeftLeg: 3
RightLeg: 4
T-Shirt: 999
Pants: 55
Shirt: 66
Body Color: 1,2,3 (#aabbcc)
Hat: 11, 12
FaceAccessory: 21, 22, 23
AccessoryBlob Data: [{"AssetId":777,"AccessoryType":"Sweater"},{"AssetId":888,"AccessoryType":"Cape"}]
```

Potongan output Lua:

```lua
Body = {
	Head = 123,
	Torso = 456,
	LeftArm = 1,
	RightArm = 2,
	LeftLeg = 3,
	RightLeg = 4,
},

SkinTone = "#AABBCC",
```

```lua
{ AssetId = 777, AccessoryType = "Sweater" },
{ AssetId = 0, AccessoryType = "Sweater" },
{ AssetId = 0, AccessoryType = "Sweater" },
```

```lua
{ AssetId = 11, AccessoryType = "Hat" },
{ AssetId = 12, AccessoryType = "Hat" },
{ AssetId = 0, AccessoryType = "Hat" },
```

```lua
{ AssetId = 888, AccessoryType = "Cape" },
```

`Cape` tidak ada di template, jadi dibuatkan bagian baru di akhir `Accessories`.

</details>

## Cara Kerja Konverter

Inti logika ada di `src/lib/converter.ts` (`convertAvatarData`).

```mermaid
flowchart LR
    A[Data mentah] --> B[Parser token]
    B --> C[Deteksi warna kulit & blob]
    C --> D[Generator template]
    D --> E[Script Lua]
```

**Aturan parser**

- Token dibaca case-insensitive dengan format `Nama: angka`, misalnya `Head: 123`, `Hat: 11, 12`.
- `DynamicHead` diutamakan; `Head` dipakai hanya jika `DynamicHead` bernilai 0 atau tidak ada.
- `TShirt` menerima varian `TShirt`, `T-Shirt`, dan `Tshirt`.
- Warna kulit: hex dalam tanda kurung (`(#F2D7CD)`) diutamakan, lalu teks `Body Color:`, lalu bawaan `Pastel orange`.
- `AccessoryBlob Data:` berisi JSON array item `{ AssetId, AccessoryType }`. Blob rusak dicatat ke console dan diabaikan.

**Aturan generator (template universal)**

- Setiap bagian punya jumlah slot minimum. ID mengisi slot dari atas ke bawah, sisa slot tetap `AssetId = 0`.
- Jika ID melebihi jumlah slot, baris baru otomatis ditambahkan di bagian yang sama.
- Tipe aksesori yang tidak ada di template dibuatkan bagian baru di akhir `Accessories`, sesuai urutan kemunculan.
- Item blob bertipe aksesori digabung dengan daftar token bertipe sama; ID identik dalam satu bagian hanya ditulis sekali.

<details>
<summary><b>Jumlah slot minimum per tipe</b></summary>

<br>

| Bagian `Layered` | Slot | Bagian `Accessories` | Slot |
| --- | ---: | --- | ---: |
| LeftShoe | 2 | Hat | 3 |
| RightShoe | 2 | Hair | 3 |
| TShirt | 3 | Face | 7 |
| Shirt | 3 | Front | 3 |
| Pants | 3 | Neck | 3 |
| Shorts | 3 | Back | 3 |
| DressSkirt | 3 | Shoulder | 3 |
| Sweater | 3 | Waist | 3 |
| Jacket | 4 | | |

Ubah jumlah slot di `LAYERED_GROUPS` / `ACCESSORY_GROUPS` bila template perlu disesuaikan.

</details>

## Teknologi

| Teknologi | Peran |
| --- | --- |
| Vite | Build dan dev server |
| React 19 + TypeScript | UI satu halaman (`src/App.tsx`) |
| CSS + design token (`src/styles/tokens.css`) | Styling neobrutalism (border tebal, hard shadow) |
| Fontsource (Archivo, IBM Plex Sans, JetBrains Mono) | Font yang di-host sendiri, tanpa Google Fonts |
| Vitest | Tes logika konverter |
| Vercel | Hosting demo |

## Memulai

Prasyarat: Node.js 22 (sesuai `engines` di `package.json`).

```bash
git clone https://github.com/akndrn000/rigforge.git
cd rigforge
npm install     # pasang dependensi
npm run dev     # dev server di http://localhost:5173
```

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Menjalankan dev server Vite |
| `npm run build` | Typecheck (`tsc --noEmit`) lalu build produksi ke `dist` |
| `npm run preview` | Mencoba hasil build di `http://localhost:4173` |
| `npm test` | Menjalankan tes sekali (`vitest run`) |
| `npm run typecheck` | Pemeriksaan tipe saja, tanpa build |

## Testing

Tes ada di `src/lib/converter.test.ts` dan memakai Vitest:

- **Tes snapshot (26 kasus)** di `src/lib/__fixtures__/golden.json`: setiap kasus berisi `input`, `lineStat`, `charStat`, dan `lua` yang diharapkan. Output `convertAvatarData` harus sama persis.
- **Tes perilaku template universal**: pengisian slot dari atas, baris tambahan saat ID melebihi slot, penggabungan token + blob, bagian baru untuk tipe tak dikenal, dan deduplikasi ID.
- **Tes ringkasan deteksi**: jumlah bagian tubuh, warna kulit, pakaian klasik/berlapis, dan aksesori dari `SAMPLE_DATA`.

```bash
npm test
```

> [!NOTE]
> Bila perilaku konverter sengaja diubah, perbarui entri yang relevan di `golden.json` (input dan output yang diharapkan), lalu jalankan `npm test` lagi sampai semua kasus lolos.

## Deploy

**Lewat GitHub (disarankan)**

1. Push repo ini ke GitHub.
2. Buka <https://vercel.com/new> dan impor repository tersebut.
3. Vercel mendeteksi Vite otomatis (`vercel.json` sudah mengatur build, output `dist`, dan header keamanan). Klik **Deploy**.

**Lewat Vercel CLI**

```bash
npx vercel          # deploy pratinjau
npx vercel --prod   # deploy produksi
```

<details>
<summary><b>Memakai domain sendiri</b></summary>

<br>

Tambahkan domain di **Project → Settings → Domains**, lalu atur environment variable agar canonical, Open Graph, `robots.txt`, dan `sitemap.xml` memakai domain itu:

```text
SITE_URL = https://domainkamu.com
```

Tanpa variable ini, build memakai URL produksi Vercel (`VERCEL_PROJECT_PRODUCTION_URL`), atau `http://localhost:5173` saat pengembangan lokal. `robots.txt` dan `sitemap.xml` dibuat saat build oleh plugin `siteMeta` di `vite.config.ts`.

</details>

<details>
<summary><b>Struktur proyek</b></summary>

<br>

```text
src/
  App.tsx                 # Susunan halaman tunggal: Header + Converter + Footer
  main.tsx                # Entry point React
  components/
    Converter.tsx         # Alat utama: input, output, tombol aksi, ringkasan
    Header.tsx            # Nama produk + tagline + tombol tema
    Footer.tsx            # Disclaimer merek dagang + catatan privasi
    Icon.tsx              # Set ikon SVG sendiri
  hooks/
    useTheme.ts           # Tema terang/gelap, tersimpan di localStorage
  lib/
    converter.ts          # Parser + generator Lua (inti konverter)
    converter.test.ts     # Tes snapshot + tes perilaku template
    __fixtures__/
      golden.json         # Snapshot 26 kasus uji (input, output Lua)
    sample.ts             # Data contoh untuk tombol "Contoh Data"
  styles/
    tokens.css            # Token warna dan font (terang + gelap)
    base.css              # Gaya dasar
    site.css              # Gaya halaman dan komponen
public/
  favicon.svg             # Favicon
  apple-touch-icon.png    # Ikon iOS
  og-image.png            # Gambar pratinjau tautan (Open Graph)
docs/
  DESIGN.md               # Dokumentasi desain
  banner.svg              # Banner README
  screenshot-*.png        # Tangkapan layar README
vite.config.ts            # Plugin React + siteMeta (SITE_URL, robots, sitemap)
vercel.json               # Konfigurasi build dan header keamanan di Vercel
LICENSE                   # Lisensi MIT
```

</details>

## Kustomisasi

- **Warna dan font:** `src/styles/tokens.css`. Ketebalan border (`--bw` / `--bw-strong`) dan hard shadow (`--shadow*`); varian terang dan gelap ada di blok `:root` dan `[data-theme='dark']`.
- **Teks halaman:** `src/components/Converter.tsx`, `Header.tsx`, `Footer.tsx`.
- **Nilai `Scaling`** (`BodyType`, `Depth`, `Height`, dst.) dan warna kulit bawaan (`Pastel orange`) ditulis tetap di `converter.ts` (konstanta `SCALING` dan `DEFAULT_SKIN_TONE`). Jika diubah, perbarui `golden.json` karena output ikut berubah.
- **Gambar pratinjau tautan** (`public/og-image.png`) bisa diganti dengan desain sendiri.

## Kontribusi

1. Fork repo ini dan buat branch dari `main`.
2. Lakukan perubahan, lalu jalankan `npm test` dan `npm run typecheck`.
3. Buka pull request dengan penjelasan singkat tentang perubahan dan alasannya.

Menemukan bug? Laporkan di [halaman issues](https://github.com/akndrn000/rigforge/issues).

## Lisensi dan Disclaimer

Dirilis di bawah **Lisensi MIT**. Lihat [LICENSE](./LICENSE).

"Roblox" adalah merek dagang Roblox Corporation. Proyek ini alat independen dan tidak berafiliasi dengan Roblox Corporation. Situs tidak memakai analytics atau pelacak apa pun; data yang ditempel diproses di browser saja dan tidak dikirim ke mana-mana.
